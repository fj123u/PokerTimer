export interface Player {
  id: string;
  name: string;
  tableId: string | null;
  seatIndex: number;
  isEliminated: boolean;
  eliminatedAt: number | null;
  eliminatedPosition: number | null;
  chips: number;
  reentries: number;
  addons: number;
  bountyCount: number;
}

export interface Table {
  id: string;
  number: number;
  players: string[];
  maxPlayers: number;
  isActive: boolean;
}

export interface BlindLevel {
  id: string;
  level: number;
  smallBlind: number;
  bigBlind: number;
  ante: number;
  duration: number; // in seconds
  isBreak: boolean;
  breakDuration?: number;
}

export interface TournamentConfig {
  name: string;
  maxPlayersPerTable: number;
  startingStack: number;
  totalDuration: number; // in minutes
  levelDuration: number; // in minutes
  enableAntes: boolean;
  enableBounty: boolean;
  enableReentry: boolean;
  enableAddon: boolean;
  reentryMaxLevel: number;
  addonChips: number;
  buyIn: number;
  buyInLabel: string; // "Buy-in" ou "Gage"
  payoutPercentages: number[];
}

export interface SavedConfig {
  id: string;
  name: string;
  config: TournamentConfig;
  playerNames: string[];
  createdAt: number;
}

export interface PlayerStats {
  name: string;
  tournamentsPlayed: number;
  wins: number;
  podiums: number; // top 3
  itm: number; // in the money (top payé)
  totalBuyIns: number;
  bestPosition: number;
  averagePosition: number;
  eliminationPositions: number[];
}

export type TournamentStatus = 'setup' | 'running' | 'paused' | 'break' | 'finished';

export interface Tournament {
  id: string;
  config: TournamentConfig;
  status: TournamentStatus;
  players: Player[];
  tables: Table[];
  blindStructure: BlindLevel[];
  currentLevel: number;
  timeRemaining: number; // seconds remaining in current level
  startedAt: number | null;
  finishedAt: number | null;
  totalPrizePool: number;
  eliminationHistory: EliminationRecord[];
  createdAt: number;
  updatedAt: number;
}

export interface EliminationRecord {
  playerId: string;
  playerName: string;
  position: number;
  eliminatedAt: number;
  level: number;
  eliminatedBy?: string;
}

export interface TournamentStats {
  playersRemaining: number;
  totalPlayers: number;
  totalChips: number;
  averageStack: number;
  largestStack: number;
  smallestStack: number;
  activeTables: number;
  currentLevel: number;
  estimatedTimeRemaining: number;
  eliminationsThisLevel: number;
}
