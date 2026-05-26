import { useCallback, useRef } from 'react';

export function useSound() {
  const audioContextRef = useRef<AudioContext | null>(null);

  const getContext = useCallback(() => {
    if (!audioContextRef.current) {
      audioContextRef.current = new AudioContext();
    }
    return audioContextRef.current;
  }, []);

  const playBeep = useCallback((frequency = 800, duration = 200) => {
    try {
      const ctx = getContext();
      const oscillator = ctx.createOscillator();
      const gainNode = ctx.createGain();

      oscillator.connect(gainNode);
      gainNode.connect(ctx.destination);

      oscillator.frequency.value = frequency;
      oscillator.type = 'sine';
      gainNode.gain.value = 0.3;

      oscillator.start();
      gainNode.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + duration / 1000);
      oscillator.stop(ctx.currentTime + duration / 1000);
    } catch {
      // Audio not available
    }
  }, [getContext]);

  const playLevelChange = useCallback(() => {
    playBeep(600, 150);
    setTimeout(() => playBeep(800, 150), 200);
    setTimeout(() => playBeep(1000, 300), 400);
  }, [playBeep]);

  const playWarning = useCallback(() => {
    playBeep(440, 500);
  }, [playBeep]);

  const playEnd = useCallback(() => {
    playBeep(1200, 100);
    setTimeout(() => playBeep(1200, 100), 150);
    setTimeout(() => playBeep(1600, 400), 350);
  }, [playBeep]);

  return { playBeep, playLevelChange, playWarning, playEnd };
}
