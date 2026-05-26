import { useTournamentStore } from '../../store/tournamentStore';
import { Trophy, Medal } from 'lucide-react';
import { format } from 'date-fns';

export function RankingPanel() {
  const tournament = useTournamentStore(s => s.tournament);

  if (!tournament) return null;

  const eliminatedPlayers = [...tournament.players]
    .filter(p => p.isEliminated)
    .sort((a, b) => (a.eliminatedPosition ?? 999) - (b.eliminatedPosition ?? 999));

  const activePlayers = tournament.players.filter(p => !p.isEliminated);

  const podiumColors: Record<number, string> = {
    1: 'from-amber-400 to-amber-600',
    2: 'from-gray-300 to-gray-500',
    3: 'from-orange-400 to-orange-600',
  };

  return (
    <div className="space-y-6">
      {/* Podium */}
      {tournament.status === 'finished' && eliminatedPlayers.length > 0 && (
        <div className="glass-card p-8">
          <h3 className="text-lg font-semibold text-white mb-6 flex items-center gap-2">
            <Trophy className="text-amber-400" size={20} />
            Podium
          </h3>
          <div className="flex items-end justify-center gap-4">
            {eliminatedPlayers.slice(0, 3).map(player => {
              const pos = player.eliminatedPosition ?? 0;
              const height = pos === 1 ? 'h-32' : pos === 2 ? 'h-24' : 'h-20';
              return (
                <div key={player.id} className="flex flex-col items-center gap-2">
                  <div className="w-12 h-12 rounded-full bg-gradient-to-br flex items-center justify-center shadow-lg"
                    style={{ background: pos <= 3 ? undefined : undefined }}
                  >
                    <div className={`w-12 h-12 rounded-full bg-gradient-to-br ${podiumColors[pos] ?? 'from-gray-500 to-gray-700'} flex items-center justify-center`}>
                      <Medal size={20} className="text-white" />
                    </div>
                  </div>
                  <span className="text-sm font-bold text-white">{player.name}</span>
                  <div className={`${height} w-20 rounded-t-xl bg-gradient-to-t ${podiumColors[pos] ?? 'from-gray-500 to-gray-700'} flex items-center justify-center`}>
                    <span className="text-2xl font-bold text-white">{pos}</span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Active players */}
      {activePlayers.length > 0 && (
        <div className="glass-card p-5">
          <h3 className="text-lg font-semibold text-white mb-4">
            En jeu ({activePlayers.length})
          </h3>
          <div className="space-y-2">
            {activePlayers.map(player => (
              <div key={player.id} className="flex items-center gap-3 bg-gray-800/50 rounded-xl px-4 py-3">
                <div className="w-8 h-8 rounded-full bg-gradient-to-br from-emerald-500 to-emerald-700 flex items-center justify-center">
                  <span className="text-xs font-bold text-white">{player.name.charAt(0)}</span>
                </div>
                <span className="font-medium text-white">{player.name}</span>
                <span className="ml-auto text-sm text-gray-400">{player.chips.toLocaleString()} jetons</span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Eliminated */}
      {eliminatedPlayers.length > 0 && (
        <div className="glass-card p-5">
          <h3 className="text-lg font-semibold text-white mb-4">
            Classement ({eliminatedPlayers.length} éliminés)
          </h3>
          <div className="space-y-2">
            {eliminatedPlayers.map(player => (
              <div key={player.id} className="flex items-center gap-3 bg-gray-800/30 rounded-xl px-4 py-3 opacity-75">
                <span className={`w-8 h-8 rounded-full flex items-center justify-center font-bold text-sm ${
                  (player.eliminatedPosition ?? 0) <= 3
                    ? `bg-gradient-to-br ${podiumColors[player.eliminatedPosition ?? 0] ?? 'from-gray-600 to-gray-700'} text-white`
                    : 'bg-gray-700 text-gray-300'
                }`}>
                  {player.eliminatedPosition}
                </span>
                <div>
                  <span className="font-medium text-gray-300">{player.name}</span>
                  {player.eliminatedAt && (
                    <p className="text-xs text-gray-500">
                      {format(new Date(player.eliminatedAt), 'HH:mm:ss')}
                    </p>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
