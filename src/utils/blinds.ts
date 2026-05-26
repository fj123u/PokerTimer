import { v4 as uuid } from 'uuid';
import type { BlindLevel } from '../types/tournament';

const BLIND_MULTIPLIERS = [
  1, 1.5, 2, 2.5, 3, 4, 5, 6, 8, 10,
  12, 15, 20, 25, 30, 40, 50, 60, 80, 100,
  120, 150, 200, 250, 300, 400, 500, 600, 800, 1000
];

function roundBlind(value: number): number {
  if (value <= 100) return Math.round(value / 5) * 5;
  if (value <= 1000) return Math.round(value / 25) * 25;
  if (value <= 10000) return Math.round(value / 100) * 100;
  if (value <= 100000) return Math.round(value / 500) * 500;
  return Math.round(value / 1000) * 1000;
}

export function generateBlindStructure(
  startingStack: number,
  totalDurationMinutes: number,
  levelDurationMinutes: number,
  playerCount: number,
  enableAntes: boolean
): BlindLevel[] {
  const totalLevels = Math.ceil(totalDurationMinutes / levelDurationMinutes);
  const targetEndBigBlind = (startingStack * playerCount) / 10;

  const baseSmallBlind = Math.max(5, roundBlind(startingStack / 200));
  const growthFactor = Math.pow(targetEndBigBlind / (baseSmallBlind * 2), 1 / totalLevels);

  const levels: BlindLevel[] = [];
  const breakInterval = 6;

  let levelCount = 0;
  for (let i = 0; i < totalLevels + 5; i++) {
    if (levelCount > 0 && levelCount % breakInterval === 0) {
      levels.push({
        id: uuid(),
        level: levelCount,
        smallBlind: 0,
        bigBlind: 0,
        ante: 0,
        duration: levelDurationMinutes * 60,
        isBreak: true,
        breakDuration: 10 * 60,
      });
    }

    levelCount++;
    const multiplier = Math.pow(growthFactor, i);
    const smallBlind = roundBlind(baseSmallBlind * multiplier);
    const bigBlind = smallBlind * 2;
    const ante = enableAntes && i >= 3 ? roundBlind(bigBlind * 0.125) : 0;

    levels.push({
      id: uuid(),
      level: levelCount,
      smallBlind,
      bigBlind,
      ante,
      duration: levelDurationMinutes * 60,
      isBreak: false,
    });
  }

  return levels;
}

export function getStandardStructure(startingStack: number): BlindLevel[] {
  const baseBB = Math.max(10, roundBlind(startingStack / 100));

  return BLIND_MULTIPLIERS.slice(0, 20).map((mult, i) => ({
    id: uuid(),
    level: i + 1,
    smallBlind: roundBlind(baseBB * mult / 2),
    bigBlind: roundBlind(baseBB * mult),
    ante: i >= 4 ? roundBlind(baseBB * mult * 0.125) : 0,
    duration: 15 * 60,
    isBreak: false,
  }));
}

export function formatChips(amount: number): string {
  if (amount >= 1000000) return `${(amount / 1000000).toFixed(1)}M`;
  if (amount >= 1000) return `${(amount / 1000).toFixed(amount >= 10000 ? 0 : 1)}K`;
  return amount.toString();
}
