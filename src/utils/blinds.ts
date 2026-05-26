import { v4 as uuid } from 'uuid';
import type { BlindLevel } from '../types/tournament';

function roundBlind(value: number): number {
  if (value <= 25) return Math.max(5, Math.round(value / 5) * 5);
  if (value <= 100) return Math.round(value / 5) * 5;
  if (value <= 500) return Math.round(value / 25) * 25;
  if (value <= 1000) return Math.round(value / 50) * 50;
  if (value <= 5000) return Math.round(value / 100) * 100;
  if (value <= 20000) return Math.round(value / 500) * 500;
  if (value <= 100000) return Math.round(value / 1000) * 1000;
  return Math.round(value / 5000) * 5000;
}

export function generateBlindStructure(
  startingStack: number,
  totalDurationMinutes: number,
  playerCount: number,
  enableAntes: boolean
): BlindLevel[] {
  // Calcul automatique de la durée des niveaux et du nombre de niveaux
  // Vise entre 10 et 20 niveaux selon la durée totale
  const targetLevels = Math.max(8, Math.min(20, Math.round(totalDurationMinutes / 12)));
  const breakInterval = Math.max(4, Math.min(8, Math.round(targetLevels / 3)));
  const numBreaks = Math.floor((targetLevels - 1) / breakInterval);
  const breakDuration = 5; // 5 min per break
  const playableMinutes = totalDurationMinutes - (numBreaks * breakDuration);
  const levelDurationMinutes = Math.max(3, Math.round(playableMinutes / targetLevels));
  const levelDurationSeconds = levelDurationMinutes * 60;

  // Structure de blindes réaliste
  // Le big blind final devrait représenter ~1/10 à 1/5 du total chips en jeu
  const totalChips = startingStack * playerCount;
  const targetFinalBB = totalChips / 8;
  const startBB = Math.max(10, roundBlind(startingStack / 50));

  // Calcul du facteur de croissance
  const growthFactor = Math.pow(targetFinalBB / startBB, 1 / (targetLevels - 1));

  const levels: BlindLevel[] = [];
  let levelNumber = 0;

  for (let i = 0; i < targetLevels; i++) {
    // Pause avant ce niveau ?
    if (i > 0 && i % breakInterval === 0) {
      levels.push({
        id: uuid(),
        level: levelNumber,
        smallBlind: 0,
        bigBlind: 0,
        ante: 0,
        duration: levelDurationSeconds,
        isBreak: true,
        breakDuration: breakDuration * 60,
      });
    }

    levelNumber++;
    const multiplier = Math.pow(growthFactor, i);
    const bigBlind = roundBlind(startBB * multiplier);
    const smallBlind = roundBlind(bigBlind / 2);
    const ante = enableAntes && i >= Math.floor(targetLevels * 0.3)
      ? roundBlind(bigBlind * 0.15)
      : 0;

    levels.push({
      id: uuid(),
      level: levelNumber,
      smallBlind,
      bigBlind,
      ante,
      duration: levelDurationSeconds,
      isBreak: false,
    });
  }

  return levels;
}

export function formatChips(amount: number): string {
  if (amount >= 1000000) return `${(amount / 1000000).toFixed(1)}M`;
  if (amount >= 1000) return `${(amount / 1000).toFixed(amount >= 10000 ? 0 : 1)}K`;
  return amount.toString();
}
