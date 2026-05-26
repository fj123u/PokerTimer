import { openDB, type IDBPDatabase } from 'idb';
import type { Tournament } from '../types/tournament';

const DB_NAME = 'poker-timer-db';
const DB_VERSION = 1;
const STORE_NAME = 'tournaments';

async function getDB(): Promise<IDBPDatabase> {
  return openDB(DB_NAME, DB_VERSION, {
    upgrade(db) {
      if (!db.objectStoreNames.contains(STORE_NAME)) {
        db.createObjectStore(STORE_NAME, { keyPath: 'id' });
      }
    },
  });
}

export async function saveTournament(tournament: Tournament): Promise<void> {
  const db = await getDB();
  await db.put(STORE_NAME, { ...tournament, updatedAt: Date.now() });
}

export async function loadTournament(id: string): Promise<Tournament | undefined> {
  const db = await getDB();
  return db.get(STORE_NAME, id);
}

export async function loadAllTournaments(): Promise<Tournament[]> {
  const db = await getDB();
  const all = await db.getAll(STORE_NAME);
  return all.sort((a, b) => b.updatedAt - a.updatedAt);
}

export async function deleteTournament(id: string): Promise<void> {
  const db = await getDB();
  await db.delete(STORE_NAME, id);
}

export function exportTournamentJSON(tournament: Tournament): string {
  return JSON.stringify(tournament, null, 2);
}

export function importTournamentJSON(json: string): Tournament {
  return JSON.parse(json) as Tournament;
}
