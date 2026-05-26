import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router';
import { Clock, Users, Trash2, Download, Play } from 'lucide-react';
import { loadAllTournaments, deleteTournament, exportTournamentJSON } from '../utils/storage';
import { useTournamentStore } from '../store/tournamentStore';
import type { Tournament } from '../types/tournament';
import { format } from 'date-fns';
import { fr } from 'date-fns/locale';

export function HistoryPage() {
  const [tournaments, setTournaments] = useState<Tournament[]>([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();
  const loadTournament = useTournamentStore(s => s.loadTournament);

  useEffect(() => {
    loadAllTournaments().then(t => {
      setTournaments(t);
      setLoading(false);
    });
  }, []);

  const handleDelete = async (id: string) => {
    await deleteTournament(id);
    setTournaments(prev => prev.filter(t => t.id !== id));
  };

  const handleExport = (tournament: Tournament) => {
    const json = exportTournamentJSON(tournament);
    const blob = new Blob([json], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${tournament.config.name.replace(/\s+/g, '_')}.json`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const handleResume = (tournament: Tournament) => {
    loadTournament(tournament);
    navigate('/tournament');
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="w-8 h-8 border-2 border-emerald-500 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div className="animate-slide-up">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-white">Historique</h1>
        <p className="text-gray-400 mt-2">Vos tournois précédents</p>
      </div>

      {tournaments.length === 0 ? (
        <div className="glass-card p-12 text-center">
          <Clock className="w-12 h-12 text-gray-600 mx-auto mb-4" />
          <p className="text-gray-400">Aucun tournoi sauvegardé</p>
        </div>
      ) : (
        <div className="space-y-4">
          {tournaments.map(t => (
            <div key={t.id} className="glass-card p-5 flex items-center justify-between group">
              <div className="flex items-center gap-4">
                <div className={`w-3 h-3 rounded-full ${
                  t.status === 'finished' ? 'bg-gray-500' :
                  t.status === 'running' ? 'bg-emerald-500 animate-pulse' :
                  'bg-amber-500'
                }`} />
                <div>
                  <h3 className="font-semibold text-white">{t.config.name}</h3>
                  <div className="flex items-center gap-4 text-sm text-gray-400 mt-1">
                    <span className="flex items-center gap-1">
                      <Users size={14} />
                      {t.players.length} joueurs
                    </span>
                    <span>
                      {format(new Date(t.createdAt), "d MMM yyyy 'à' HH:mm", { locale: fr })}
                    </span>
                    <span className={`px-2 py-0.5 rounded-full text-xs ${
                      t.status === 'finished' ? 'bg-gray-700 text-gray-300' :
                      t.status === 'running' ? 'bg-emerald-500/20 text-emerald-400' :
                      'bg-amber-500/20 text-amber-400'
                    }`}>
                      {t.status === 'finished' ? 'Terminé' :
                       t.status === 'running' ? 'En cours' : 'En pause'}
                    </span>
                  </div>
                </div>
              </div>

              <div className="flex items-center gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                {t.status !== 'finished' && (
                  <button
                    onClick={() => handleResume(t)}
                    className="p-2 rounded-lg hover:bg-emerald-500/20 text-emerald-400 transition-colors"
                    title="Reprendre"
                  >
                    <Play size={18} />
                  </button>
                )}
                <button
                  onClick={() => handleExport(t)}
                  className="p-2 rounded-lg hover:bg-blue-500/20 text-blue-400 transition-colors"
                  title="Exporter"
                >
                  <Download size={18} />
                </button>
                <button
                  onClick={() => handleDelete(t.id)}
                  className="p-2 rounded-lg hover:bg-red-500/20 text-red-400 transition-colors"
                  title="Supprimer"
                >
                  <Trash2 size={18} />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
