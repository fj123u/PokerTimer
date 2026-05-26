import { openDB, type IDBPDatabase } from 'idb';
import type { Tournament, SavedConfig } from '../types/tournament';

const DB_NAME = 'poker-timer-db';
const DB_VERSION = 2;
const STORE_NAME = 'tournaments';
const CONFIGS_STORE = 'saved-configs';

let dbPromise: Promise<IDBPDatabase> | null = null;

function getDB(): Promise<IDBPDatabase> {
  if (!dbPromise) {
    dbPromise = openDB(DB_NAME, DB_VERSION, {
      upgrade(db) {
        if (!db.objectStoreNames.contains(STORE_NAME)) {
          db.createObjectStore(STORE_NAME, { keyPath: 'id' });
        }
        if (!db.objectStoreNames.contains(CONFIGS_STORE)) {
          db.createObjectStore(CONFIGS_STORE, { keyPath: 'id' });
        }
      },
      blocked() {
        dbPromise = null;
      },
    }).catch((err) => {
      console.warn('IndexedDB error, falling back to memory:', err);
      dbPromise = null;
      throw err;
    });
  }
  return dbPromise;
}

export async function saveTournament(tournament: Tournament): Promise<void> {
  try {
    const db = await getDB();
    await db.put(STORE_NAME, { ...tournament, updatedAt: Date.now() });
  } catch {
    // Non-blocking: tournament runs fine without persistence
  }
}

export async function loadTournament(id: string): Promise<Tournament | undefined> {
  try {
    const db = await getDB();
    return db.get(STORE_NAME, id);
  } catch {
    return undefined;
  }
}

export async function loadAllTournaments(): Promise<Tournament[]> {
  try {
    const db = await getDB();
    const all = await db.getAll(STORE_NAME);
    return all.sort((a, b) => b.updatedAt - a.updatedAt);
  } catch {
    return [];
  }
}

export async function deleteTournament(id: string): Promise<void> {
  try {
    const db = await getDB();
    await db.delete(STORE_NAME, id);
  } catch {
    // ignore
  }
}

export function exportTournamentJSON(tournament: Tournament): string {
  return JSON.stringify(tournament, null, 2);
}

export function importTournamentJSON(json: string): Tournament {
  return JSON.parse(json) as Tournament;
}

export async function saveConfig(config: SavedConfig): Promise<void> {
  try {
    const db = await getDB();
    await db.put(CONFIGS_STORE, config);
  } catch {
    // ignore
  }
}

export async function loadAllConfigs(): Promise<SavedConfig[]> {
  try {
    const db = await getDB();
    const all = await db.getAll(CONFIGS_STORE);
    return all.sort((a, b) => b.createdAt - a.createdAt);
  } catch {
    return [];
  }
}

export async function deleteConfig(id: string): Promise<void> {
  try {
    const db = await getDB();
    await db.delete(CONFIGS_STORE, id);
  } catch {
    // ignore
  }
}
