import type { ReactNode } from 'react';
import { Link, useLocation } from 'react-router';
import { Home, Clock, History, Trophy, BarChart3 } from 'lucide-react';
import { useTournamentStore } from '../../store/tournamentStore';

interface LayoutProps {
  children: ReactNode;
}

export function Layout({ children }: LayoutProps) {
  const location = useLocation();
  const tournament = useTournamentStore(s => s.tournament);

  const navItems = [
    { path: '/', icon: Home, label: 'Accueil' },
    { path: '/setup', icon: Trophy, label: 'Nouveau' },
    ...(tournament ? [{ path: '/tournament', icon: Clock, label: 'Tournoi' }] : []),
    { path: '/stats', icon: BarChart3, label: 'Stats' },
    { path: '/history', icon: History, label: 'Historique' },
  ];

  return (
    <div className="min-h-screen bg-gray-950 flex flex-col">
      <nav className="fixed top-0 left-0 right-0 z-50 bg-gray-900/95 backdrop-blur-md border-b border-gray-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6">
          <div className="flex items-center justify-between h-16">
            <Link to="/" className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-emerald-500 to-emerald-700 flex items-center justify-center">
                <span className="text-white font-bold text-lg">P</span>
              </div>
              <span className="text-xl font-bold text-white">PokerTimer</span>
            </Link>

            <div className="flex items-center gap-1">
              {navItems.map(item => {
                const Icon = item.icon;
                const isActive = location.pathname === item.path;
                return (
                  <Link
                    key={item.path}
                    to={item.path}
                    className={`flex items-center gap-2 px-4 py-2 rounded-lg transition-all duration-200 ${
                      isActive
                        ? 'bg-emerald-500/20 text-emerald-400'
                        : 'text-gray-400 hover:text-white hover:bg-gray-800'
                    }`}
                  >
                    <Icon size={18} />
                    <span className="hidden sm:inline text-sm font-medium">{item.label}</span>
                  </Link>
                );
              })}
            </div>
          </div>
        </div>
      </nav>

      <main className="flex-1 pt-20 pb-8">
        <div className="max-w-7xl mx-auto px-4 sm:px-6">
          {children}
        </div>
      </main>
    </div>
  );
}
