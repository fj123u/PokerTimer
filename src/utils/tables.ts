import { v4 as uuid } from 'uuid';
import type { Player, Table } from '../types/tournament';

export function generateTables(players: Player[], maxPerTable: number): Table[] {
  const tableCount = Math.ceil(players.length / maxPerTable);
  const tables: Table[] = [];

  for (let i = 0; i < tableCount; i++) {
    tables.push({
      id: uuid(),
      number: i + 1,
      players: [],
      maxPlayers: maxPerTable,
      isActive: true,
    });
  }

  const shuffled = [...players].sort(() => Math.random() - 0.5);

  shuffled.forEach((player, index) => {
    const tableIndex = index % tableCount;
    tables[tableIndex].players.push(player.id);
  });

  return tables;
}

export function rebalanceTables(tables: Table[], players: Player[]): Table[] {
  const activeTables = tables.filter(t => t.isActive);
  const activePlayers = players.filter(p => !p.isEliminated);
  const maxPerTable = activeTables[0]?.maxPlayers ?? 9;

  const minTablesNeeded = Math.ceil(activePlayers.length / maxPerTable);

  if (minTablesNeeded < activeTables.length) {
    const sorted = [...activeTables].sort((a, b) => a.players.length - b.players.length);
    const tableToClose = sorted[0];
    tableToClose.isActive = false;

    const playersToMove = [...tableToClose.players];
    tableToClose.players = [];

    const remaining = activeTables.filter(t => t.id !== tableToClose.id);
    remaining.sort((a, b) => a.players.length - b.players.length);

    for (const playerId of playersToMove) {
      remaining.sort((a, b) => a.players.length - b.players.length);
      const target = remaining[0];
      if (target && target.players.length < maxPerTable) {
        target.players.push(playerId);
      }
    }

    return tables;
  }

  const avg = Math.floor(activePlayers.length / activeTables.length);
  const excess: string[] = [];

  for (const table of activeTables) {
    while (table.players.length > avg + 1) {
      const player = table.players.pop();
      if (player) excess.push(player);
    }
  }

  for (const playerId of excess) {
    const target = activeTables
      .filter(t => t.players.length < avg + 1)
      .sort((a, b) => a.players.length - b.players.length)[0];
    if (target) {
      target.players.push(playerId);
    }
  }

  return tables;
}

export function getTableForPlayer(tables: Table[], playerId: string): Table | undefined {
  return tables.find(t => t.players.includes(playerId));
}
