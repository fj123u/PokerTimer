import { useTournamentStore } from '../../store/tournamentStore';
import { Users, X } from 'lucide-react';

export function TablesView() {
  const tournament = useTournamentStore(s => s.tournament);
  const eliminatePlayer = useTournamentStore(s => s.eliminatePlayer);

  if (!tournament) return null;

  const activeTables = tournament.tables.filter(t => t.isActive);

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
      {activeTables.map(table => {
        const tablePlayers = table.players
          .map(id => tournament.players.find(p => p.id === id))
          .filter(Boolean);

        return (
          <div key={table.id} className="glass-card overflow-hidden animate-fade-in">
            <div className="px-5 py-3 border-b border-gray-800 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-lg bg-emerald-500/20 flex items-center justify-center">
                  <span className="text-sm font-bold text-emerald-400">{table.number}</span>
                </div>
                <span className="font-semibold text-white">Table {table.number}</span>
              </div>
              <div className="flex items-center gap-1.5 text-sm text-gray-400">
                <Users size={14} />
                <span>{tablePlayers.length}/{table.maxPlayers}</span>
              </div>
            </div>

            <div className="p-4 space-y-2">
              {tablePlayers.map(player => {
                if (!player) return null;
                return (
                  <div
                    key={player.id}
                    className="flex items-center justify-between bg-gray-800/50 rounded-xl px-4 py-2.5 group"
                  >
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-full bg-gradient-to-br from-gray-600 to-gray-700 flex items-center justify-center">
                        <span className="text-xs font-bold text-white">
                          {player.name.charAt(0).toUpperCase()}
                        </span>
                      </div>
                      <span className="text-sm font-medium text-white">{player.name}</span>
                    </div>
                    <button
                      onClick={() => eliminatePlayer(player.id)}
                      className="opacity-0 group-hover:opacity-100 p-1.5 rounded-lg hover:bg-red-500/20 text-gray-500 hover:text-red-400 transition-all"
                      title="Éliminer"
                    >
                      <X size={16} />
                    </button>
                  </div>
                );
              })}

              {tablePlayers.length === 0 && (
                <p className="text-center text-gray-500 text-sm py-4">Table vide</p>
              )}
            </div>
          </div>
        );
      })}
    </div>
  );
}
