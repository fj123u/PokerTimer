import { useTournamentStore } from '../../store/tournamentStore';
import { formatChips } from '../../utils/blinds';
import { formatTime } from '../../hooks/useTimer';
import { Coffee } from 'lucide-react';

export function BlindsStructure() {
  const tournament = useTournamentStore(s => s.tournament);

  if (!tournament) return null;

  return (
    <div className="glass-card overflow-hidden">
      <div className="overflow-x-auto">
        <table className="w-full">
          <thead>
            <tr className="border-b border-gray-800">
              <th className="text-left px-5 py-3 text-xs font-medium text-gray-400 uppercase">Niveau</th>
              <th className="text-left px-5 py-3 text-xs font-medium text-gray-400 uppercase">Small Blind</th>
              <th className="text-left px-5 py-3 text-xs font-medium text-gray-400 uppercase">Big Blind</th>
              <th className="text-left px-5 py-3 text-xs font-medium text-gray-400 uppercase">Ante</th>
              <th className="text-left px-5 py-3 text-xs font-medium text-gray-400 uppercase">Durée</th>
            </tr>
          </thead>
          <tbody>
            {tournament.blindStructure.map((level, index) => {
              const isCurrent = index === tournament.currentLevel - 1;
              const isPast = index < tournament.currentLevel - 1;

              if (level.isBreak) {
                return (
                  <tr
                    key={level.id}
                    className={`border-b border-gray-800/50 ${
                      isCurrent ? 'bg-amber-500/10' : ''
                    }`}
                  >
                    <td colSpan={5} className="px-5 py-3">
                      <div className="flex items-center gap-2 text-amber-400">
                        <Coffee size={16} />
                        <span className="font-medium">Pause</span>
                        <span className="text-sm text-gray-400">
                          ({formatTime(level.breakDuration ?? 600)})
                        </span>
                      </div>
                    </td>
                  </tr>
                );
              }

              return (
                <tr
                  key={level.id}
                  className={`border-b border-gray-800/50 transition-colors ${
                    isCurrent
                      ? 'bg-emerald-500/10 border-l-2 border-l-emerald-500'
                      : isPast
                      ? 'opacity-50'
                      : 'hover:bg-gray-800/30'
                  }`}
                >
                  <td className="px-5 py-3">
                    <span className={`font-mono font-bold ${isCurrent ? 'text-emerald-400' : 'text-white'}`}>
                      {level.level}
                    </span>
                  </td>
                  <td className="px-5 py-3 text-gray-300">{formatChips(level.smallBlind)}</td>
                  <td className="px-5 py-3 text-gray-300">{formatChips(level.bigBlind)}</td>
                  <td className="px-5 py-3 text-gray-400">{level.ante > 0 ? formatChips(level.ante) : '-'}</td>
                  <td className="px-5 py-3 text-gray-400">{formatTime(level.duration)}</td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}
