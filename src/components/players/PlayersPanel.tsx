import { useState } from 'react';
import { Search, X, UserCheck, UserX } from 'lucide-react';
import { useTournamentStore } from '../../store/tournamentStore';

export function PlayersPanel() {
  const tournament = useTournamentStore(s => s.tournament);
  const eliminatePlayer = useTournamentStore(s => s.eliminatePlayer);
  const [search, setSearch] = useState('');
  const [showEliminated, setShowEliminated] = useState(false);

  if (!tournament) return null;

  const filtered = tournament.players
    .filter(p => showEliminated ? p.isEliminated : !p.isEliminated)
    .filter(p => p.name.toLowerCase().includes(search.toLowerCase()));

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-3">
        <div className="relative flex-1">
          <Search size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500" />
          <input
            type="text"
            value={search}
            onChange={e => setSearch(e.target.value)}
            placeholder="Rechercher un joueur..."
            className="w-full bg-gray-800 border border-gray-700 rounded-xl pl-10 pr-4 py-2.5 text-white placeholder-gray-500 focus:outline-none focus:border-emerald-500 transition-colors"
          />
        </div>
        <div className="flex rounded-xl overflow-hidden border border-gray-700">
          <button
            onClick={() => setShowEliminated(false)}
            className={`px-4 py-2.5 text-sm font-medium flex items-center gap-1.5 transition-colors ${
              !showEliminated ? 'bg-emerald-500/20 text-emerald-400' : 'bg-gray-800 text-gray-400 hover:text-white'
            }`}
          >
            <UserCheck size={16} />
            En jeu
          </button>
          <button
            onClick={() => setShowEliminated(true)}
            className={`px-4 py-2.5 text-sm font-medium flex items-center gap-1.5 transition-colors ${
              showEliminated ? 'bg-red-500/20 text-red-400' : 'bg-gray-800 text-gray-400 hover:text-white'
            }`}
          >
            <UserX size={16} />
            Éliminés
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
        {filtered.map(player => {
          const table = tournament.tables.find(t => t.players.includes(player.id));
          return (
            <div
              key={player.id}
              className={`glass-card p-4 flex items-center justify-between group animate-fade-in ${
                player.isEliminated ? 'opacity-60' : ''
              }`}
            >
              <div className="flex items-center gap-3">
                <div className={`w-10 h-10 rounded-full flex items-center justify-center ${
                  player.isEliminated
                    ? 'bg-gray-700'
                    : 'bg-gradient-to-br from-emerald-500 to-emerald-700'
                }`}>
                  <span className="text-sm font-bold text-white">
                    {player.name.charAt(0).toUpperCase()}
                  </span>
                </div>
                <div>
                  <p className="font-medium text-white">{player.name}</p>
                  <p className="text-xs text-gray-500">
                    {player.isEliminated
                      ? `Position: ${player.eliminatedPosition}`
                      : `Table ${table?.number ?? '?'} • ${player.chips.toLocaleString()}`
                    }
                  </p>
                </div>
              </div>

              {!player.isEliminated && (
                <button
                  onClick={() => eliminatePlayer(player.id)}
                  className="opacity-0 group-hover:opacity-100 p-2 rounded-lg hover:bg-red-500/20 text-gray-500 hover:text-red-400 transition-all"
                  title="Éliminer"
                >
                  <X size={18} />
                </button>
              )}
            </div>
          );
        })}
      </div>

      {filtered.length === 0 && (
        <div className="text-center py-8 text-gray-500">
          Aucun joueur trouvé
        </div>
      )}
    </div>
  );
}
