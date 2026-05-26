import { useEffect, useRef } from 'react';
import { useTournamentStore } from '../store/tournamentStore';

export function useAutoSave(intervalMs = 30000) {
  const tournament = useTournamentStore(s => s.tournament);
  const save = useTournamentStore(s => s.save);
  const lastSaved = useRef<number>(0);

  useEffect(() => {
    if (!tournament) return;

    const timer = setInterval(() => {
      if (Date.now() - lastSaved.current >= intervalMs) {
        save();
        lastSaved.current = Date.now();
      }
    }, intervalMs);

    return () => clearInterval(timer);
  }, [tournament, save, intervalMs]);

  return { saveNow: save };
}
