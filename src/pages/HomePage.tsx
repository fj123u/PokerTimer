import { Link } from 'react-router-dom';
import { Plus, Clock, Trophy, Users, BarChart3 } from 'lucide-react';
import { useTournamentStore } from '../store/tournamentStore';

export function HomePage() {
  const tournament = useTournamentStore(s => s.tournament);

  return (
    <div className="flex flex-col items-center justify-center min-h-[80vh] gap-12">
      <div className="text-center animate-fade-in">
        <div className="w-24 h-24 rounded-3xl bg-gradient-to-br from-emerald-500 to-emerald-700 flex items-center justify-center mx-auto mb-6 glow-green">
          <Trophy className="w-12 h-12 text-white" />
        </div>
        <h1 className="text-5xl font-bold text-white mb-4">
          Poker<span className="text-emerald-400">Timer</span>
        </h1>
        <p className="text-gray-400 text-lg max-w-md mx-auto">
          Gestion professionnelle de tournois de poker.
          Timer, blindes, tables et classement automatiques.
        </p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 w-full max-w-lg animate-slide-up">
        <Link
          to="/setup"
          className="glass-card p-6 flex flex-col items-center gap-3 hover:border-emerald-500/50 transition-all duration-300 group"
        >
          <div className="w-14 h-14 rounded-2xl bg-emerald-500/10 flex items-center justify-center group-hover:bg-emerald-500/20 transition-colors">
            <Plus className="w-7 h-7 text-emerald-400" />
          </div>
          <span className="font-semibold text-white">Nouveau Tournoi</span>
          <span className="text-sm text-gray-400 text-center">Créer et configurer un tournoi</span>
        </Link>

        {tournament && (
          <Link
            to="/tournament"
            className="glass-card p-6 flex flex-col items-center gap-3 hover:border-amber-500/50 transition-all duration-300 group"
          >
            <div className="w-14 h-14 rounded-2xl bg-amber-500/10 flex items-center justify-center group-hover:bg-amber-500/20 transition-colors">
              <Clock className="w-7 h-7 text-amber-400" />
            </div>
            <span className="font-semibold text-white">Reprendre</span>
            <span className="text-sm text-gray-400 text-center">{tournament.config.name}</span>
          </Link>
        )}

        <Link
          to="/history"
          className="glass-card p-6 flex flex-col items-center gap-3 hover:border-purple-500/50 transition-all duration-300 group"
        >
          <div className="w-14 h-14 rounded-2xl bg-purple-500/10 flex items-center justify-center group-hover:bg-purple-500/20 transition-colors">
            <BarChart3 className="w-7 h-7 text-purple-400" />
          </div>
          <span className="font-semibold text-white">Historique</span>
          <span className="text-sm text-gray-400 text-center">Tournois précédents</span>
        </Link>
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-4 gap-6 text-center mt-8 animate-fade-in">
        {[
          { icon: Clock, label: 'Timer Pro', desc: 'Gestion des niveaux' },
          { icon: Users, label: 'Tables Auto', desc: 'Rééquilibrage' },
          { icon: Trophy, label: 'Classement', desc: 'Temps réel' },
          { icon: BarChart3, label: 'Statistiques', desc: 'Suivi complet' },
        ].map(feature => (
          <div key={feature.label} className="flex flex-col items-center gap-2">
            <feature.icon className="w-6 h-6 text-gray-500" />
            <span className="text-sm font-medium text-gray-300">{feature.label}</span>
            <span className="text-xs text-gray-500">{feature.desc}</span>
          </div>
        ))}
      </div>
    </div>
  );
}
