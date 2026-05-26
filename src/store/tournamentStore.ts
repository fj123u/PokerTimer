import { create } from 'zustand';
import { v4 as uuid } from 'uuid';
import type { Tournament, TournamentConfig, Player, TournamentStats, TournamentStatus } from '../types/tournament';
import { generateBlindStructure } from '../utils/blinds';
import { generateTables, rebalanceTables } from '../utils/tables';
import { saveTournament } from '../utils/storage';

interface TournamentState {
  tournament: Tournament | null;
  isTimerRunning: boolean;

  createTournament: (config: TournamentConfig, playerNames: string[]) => void;
  startTournament: () => void;
  pauseTournament: () => void;
  resumeTournament: () => void;
  nextLevel: () => void;
  previousLevel: () => void;
  eliminatePlayer: (playerId: string) => void;
  tick: () => void;
  getStats: () => TournamentStats | null;
  setStatus: (status: TournamentStatus) => void;
  updatePlayerChips: (playerId: string, chips: number) => void;
  save: () => Promise<void>;
  loadTournament: (tournament: Tournament) => void;
  resetTournament: () => void;
}

export const useTournamentStore = create<TournamentState>((set, get) => ({
  tournament: null,
  isTimerRunning: false,

  createTournament: (config: TournamentConfig, playerNames: string[]) => {
    const players: Player[] = playerNames.map((name, i) => ({
      id: uuid(),
      name,
      tableId: null,
      seatIndex: i,
      isEliminated: false,
      eliminatedAt: null,
      eliminatedPosition: null,
      chips: config.startingStack,
      reentries: 0,
      addons: 0,
      bountyCount: 0,
    }));

    const blindStructure = generateBlindStructure(
      config.startingStack,
      config.totalDuration,
      players.length,
      config.enableAntes
    );

    const tables = generateTables(players, config.maxPlayersPerTable);

    tables.forEach(table => {
      table.players.forEach(playerId => {
        const player = players.find(p => p.id === playerId);
        if (player) player.tableId = table.id;
      });
    });

    const tournament: Tournament = {
      id: uuid(),
      config,
      status: 'setup',
      players,
      tables,
      blindStructure,
      currentLevel: 0,
      timeRemaining: blindStructure[0]?.duration ?? 900,
      startedAt: null,
      finishedAt: null,
      totalPrizePool: config.buyIn * players.length,
      eliminationHistory: [],
      createdAt: Date.now(),
      updatedAt: Date.now(),
    };

    set({ tournament });
  },

  startTournament: () => {
    set(state => {
      if (!state.tournament) return state;
      return {
        tournament: {
          ...state.tournament,
          status: 'running',
          currentLevel: state.tournament.currentLevel === 0 ? 1 : state.tournament.currentLevel,
          startedAt: state.tournament.startedAt ?? Date.now(),
        },
        isTimerRunning: true,
      };
    });
  },

  pauseTournament: () => {
    set(state => {
      if (!state.tournament) return state;
      return {
        tournament: { ...state.tournament, status: 'paused' },
        isTimerRunning: false,
      };
    });
  },

  resumeTournament: () => {
    set(state => {
      if (!state.tournament) return state;
      return {
        tournament: { ...state.tournament, status: 'running' },
        isTimerRunning: true,
      };
    });
  },

  nextLevel: () => {
    set(state => {
      if (!state.tournament) return state;
      const nextLvl = state.tournament.currentLevel + 1;
      if (nextLvl > state.tournament.blindStructure.length) return state;
      const level = state.tournament.blindStructure[nextLvl - 1];
      return {
        tournament: {
          ...state.tournament,
          currentLevel: nextLvl,
          timeRemaining: level?.isBreak ? (level.breakDuration ?? 600) : (level?.duration ?? 900),
          status: level?.isBreak ? 'break' : state.tournament.status === 'break' ? 'running' : state.tournament.status,
        },
      };
    });
  },

  previousLevel: () => {
    set(state => {
      if (!state.tournament) return state;
      const prevLvl = Math.max(1, state.tournament.currentLevel - 1);
      const level = state.tournament.blindStructure[prevLvl - 1];
      return {
        tournament: {
          ...state.tournament,
          currentLevel: prevLvl,
          timeRemaining: level?.duration ?? 900,
        },
      };
    });
  },

  eliminatePlayer: (playerId: string) => {
    set(state => {
      if (!state.tournament) return state;
      const t = { ...state.tournament };
      const players = [...t.players];
      const playerIndex = players.findIndex(p => p.id === playerId);
      if (playerIndex === -1) return state;

      const remainingBefore = players.filter(p => !p.isEliminated).length;
      const position = remainingBefore;

      players[playerIndex] = {
        ...players[playerIndex],
        isEliminated: true,
        eliminatedAt: Date.now(),
        eliminatedPosition: position,
      };

      const tables = [...t.tables].map(table => ({
        ...table,
        players: table.players.filter(id => id !== playerId),
      }));

      const rebalanced = rebalanceTables(tables, players);

      const eliminationHistory = [...t.eliminationHistory, {
        playerId,
        playerName: players[playerIndex].name,
        position,
        eliminatedAt: Date.now(),
        level: t.currentLevel,
      }];

      const remaining = players.filter(p => !p.isEliminated).length;
      const isFinished = remaining <= 1;

      if (isFinished) {
        const winner = players.find(p => !p.isEliminated);
        if (winner) {
          const winnerIdx = players.findIndex(p => p.id === winner.id);
          players[winnerIdx] = { ...players[winnerIdx], eliminatedPosition: 1 };
        }
      }

      return {
        tournament: {
          ...t,
          players,
          tables: rebalanced,
          eliminationHistory,
          status: isFinished ? 'finished' : t.status,
          finishedAt: isFinished ? Date.now() : null,
        },
        isTimerRunning: isFinished ? false : state.isTimerRunning,
      };
    });
  },

  tick: () => {
    set(state => {
      if (!state.tournament || !state.isTimerRunning) return state;
      const newTime = state.tournament.timeRemaining - 1;
      if (newTime <= 0) {
        const nextLvl = state.tournament.currentLevel + 1;
        if (nextLvl > state.tournament.blindStructure.length) {
          return {
            tournament: { ...state.tournament, timeRemaining: 0, status: 'finished' },
            isTimerRunning: false,
          };
        }
        const level = state.tournament.blindStructure[nextLvl - 1];
        return {
          tournament: {
            ...state.tournament,
            currentLevel: nextLvl,
            timeRemaining: level?.isBreak ? (level.breakDuration ?? 600) : (level?.duration ?? 900),
            status: level?.isBreak ? 'break' : 'running',
          },
        };
      }
      return {
        tournament: { ...state.tournament, timeRemaining: newTime },
      };
    });
  },

  getStats: () => {
    const { tournament } = get();
    if (!tournament) return null;

    const activePlayers = tournament.players.filter(p => !p.isEliminated);
    const totalChips = activePlayers.reduce((sum, p) => sum + p.chips, 0);
    const activeTables = tournament.tables.filter(t => t.isActive).length;
    const levelElims = tournament.eliminationHistory.filter(
      e => e.level === tournament.currentLevel
    ).length;

    const levelsRemaining = tournament.blindStructure.length - tournament.currentLevel;
    const currentLevelData = tournament.blindStructure[tournament.currentLevel - 1];
    const estimatedTime = tournament.timeRemaining +
      levelsRemaining * (currentLevelData?.duration ?? 900);

    return {
      playersRemaining: activePlayers.length,
      totalPlayers: tournament.players.length,
      totalChips,
      averageStack: activePlayers.length > 0 ? Math.round(totalChips / activePlayers.length) : 0,
      largestStack: activePlayers.length > 0 ? Math.max(...activePlayers.map(p => p.chips)) : 0,
      smallestStack: activePlayers.length > 0 ? Math.min(...activePlayers.map(p => p.chips)) : 0,
      activeTables,
      currentLevel: tournament.currentLevel,
      estimatedTimeRemaining: estimatedTime,
      eliminationsThisLevel: levelElims,
    };
  },

  setStatus: (status: TournamentStatus) => {
    set(state => {
      if (!state.tournament) return state;
      return { tournament: { ...state.tournament, status } };
    });
  },

  updatePlayerChips: (playerId: string, chips: number) => {
    set(state => {
      if (!state.tournament) return state;
      const players = state.tournament.players.map(p =>
        p.id === playerId ? { ...p, chips } : p
      );
      return { tournament: { ...state.tournament, players } };
    });
  },

  save: async () => {
    const { tournament } = get();
    if (tournament) {
      await saveTournament(tournament);
    }
  },

  loadTournament: (tournament: Tournament) => {
    set({ tournament, isTimerRunning: false });
  },

  resetTournament: () => {
    set({ tournament: null, isTimerRunning: false });
  },
}));
