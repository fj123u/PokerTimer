import { useEffect, useRef } from 'react';
import { Play, Pause, SkipForward, SkipBack, Maximize } from 'lucide-react';
import { useTournamentStore } from '../../store/tournamentStore';
import { formatTime } from '../../hooks/useTimer';
import { formatChips } from '../../utils/blinds';
import { useSound } from '../../hooks/useSound';

export function TimerDisplay() {
  const tournament = useTournamentStore(s => s.tournament);
  const isTimerRunning = useTournamentStore(s => s.isTimerRunning);
  const startTournament = useTournamentStore(s => s.startTournament);
  const pauseTournament = useTournamentStore(s => s.pauseTournament);
  const resumeTournament = useTournamentStore(s => s.resumeTournament);
  const nextLevel = useTournamentStore(s => s.nextLevel);
  const previousLevel = useTournamentStore(s => s.previousLevel);
  const { playLevelChange, playWarning } = useSound();

  const prevLevelRef = useRef(tournament?.currentLevel);
  const warnedRef = useRef(false);

  useEffect(() => {
    if (!tournament) return;
    if (tournament.currentLevel !== prevLevelRef.current) {
      playLevelChange();
      prevLevelRef.current = tournament.currentLevel;
      warnedRef.current = false;
    }
    if (tournament.timeRemaining <= 30 && tournament.timeRemaining > 0 && !warnedRef.current && isTimerRunning) {
      playWarning();
      warnedRef.current = true;
    }
  }, [tournament?.currentLevel, tournament?.timeRemaining, isTimerRunning, playLevelChange, playWarning]);

  if (!tournament) return null;

  const currentBlind = tournament.blindStructure[tournament.currentLevel - 1];
  const nextBlind = tournament.blindStructure[tournament.currentLevel];
  const isBreak = currentBlind?.isBreak ?? false;
  const isLow = tournament.timeRemaining <= 60 && !isBreak;

  const toggleFullscreen = () => {
    if (!document.fullscreenElement) {
      document.documentElement.requestFullscreen();
    } else {
      document.exitFullscreen();
    }
  };

  return (
    <div className={`glass-card p-6 sm:p-8 relative overflow-hidden ${isBreak ? 'glow-gold' : isLow ? 'glow-red' : 'glow-green'}`}>
      {isBreak && (
        <div className="absolute inset-0 bg-gradient-to-br from-amber-500/5 to-transparent pointer-events-none" />
      )}

      <div className="relative z-10">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <div>
            <h2 className="text-sm font-medium text-gray-400 uppercase tracking-wider">
              {isBreak ? 'Pause' : `Niveau ${tournament.currentLevel}`}
            </h2>
            <p className="text-gray-500 text-sm mt-0.5">{tournament.config.name}</p>
          </div>
          <button
            onClick={toggleFullscreen}
            className="p-2 rounded-lg hover:bg-gray-800 text-gray-400 hover:text-white transition-colors"
          >
            <Maximize size={20} />
          </button>
        </div>

        {/* Timer */}
        <div className="text-center mb-6">
          <div className={`timer-display text-7xl sm:text-8xl lg:text-9xl font-bold ${
            isBreak ? 'text-amber-400' : isLow ? 'text-red-400 animate-pulse' : 'text-white'
          }`}>
            {formatTime(tournament.timeRemaining)}
          </div>
        </div>

        {/* Blinds */}
        {!isBreak && currentBlind && (
          <div className="text-center mb-6">
            <div className="text-3xl sm:text-4xl font-bold text-emerald-400">
              {formatChips(currentBlind.smallBlind)} / {formatChips(currentBlind.bigBlind)}
              {currentBlind.ante > 0 && (
                <span className="text-lg text-gray-400 ml-2">
                  (ante {formatChips(currentBlind.ante)})
                </span>
              )}
            </div>
          </div>
        )}

        {/* Next level */}
        {nextBlind && (
          <div className="text-center mb-8">
            <span className="text-sm text-gray-500">
              Prochain : {nextBlind.isBreak ? 'Pause' : `${formatChips(nextBlind.smallBlind)} / ${formatChips(nextBlind.bigBlind)}`}
            </span>
          </div>
        )}

        {/* Controls */}
        <div className="flex items-center justify-center gap-3">
          <button
            onClick={previousLevel}
            className="p-3 rounded-xl bg-gray-800 hover:bg-gray-700 text-gray-300 hover:text-white transition-colors"
          >
            <SkipBack size={20} />
          </button>

          {tournament.status === 'setup' ? (
            <button
              onClick={startTournament}
              className="px-8 py-3 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-semibold flex items-center gap-2 transition-colors shadow-lg shadow-emerald-500/25"
            >
              <Play size={20} />
              Démarrer
            </button>
          ) : isTimerRunning ? (
            <button
              onClick={pauseTournament}
              className="px-8 py-3 rounded-xl bg-amber-600 hover:bg-amber-500 text-white font-semibold flex items-center gap-2 transition-colors"
            >
              <Pause size={20} />
              Pause
            </button>
          ) : (
            <button
              onClick={resumeTournament}
              className="px-8 py-3 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-semibold flex items-center gap-2 transition-colors shadow-lg shadow-emerald-500/25"
            >
              <Play size={20} />
              Reprendre
            </button>
          )}

          <button
            onClick={nextLevel}
            className="p-3 rounded-xl bg-gray-800 hover:bg-gray-700 text-gray-300 hover:text-white transition-colors"
          >
            <SkipForward size={20} />
          </button>
        </div>
      </div>
    </div>
  );
}
