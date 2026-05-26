import { Navigate } from 'react-router';
import { useTournamentStore } from '../store/tournamentStore';
import { TimerDisplay } from '../components/timer/TimerDisplay';
import { TablesView } from '../components/tables/TablesView';
import { StatsPanel } from '../components/stats/StatsPanel';
import { PlayersPanel } from '../components/players/PlayersPanel';
import { BlindsStructure } from '../components/tournament/BlindsStructure';
import { RankingPanel } from '../components/tournament/RankingPanel';
import { useState } from 'react';
import { LayoutGrid, Users, Trophy, List } from 'lucide-react';

type Tab = 'tables' | 'players' | 'ranking' | 'blinds';

export function TournamentPage() {
  const tournament = useTournamentStore(s => s.tournament);
  const [activeTab, setActiveTab] = useState<Tab>('tables');

  if (!tournament) {
    return <Navigate to="/setup" replace />;
  }

  const tabs: { id: Tab; label: string; icon: typeof LayoutGrid }[] = [
    { id: 'tables', label: 'Tables', icon: LayoutGrid },
    { id: 'players', label: 'Joueurs', icon: Users },
    { id: 'ranking', label: 'Classement', icon: Trophy },
    { id: 'blinds', label: 'Structure', icon: List },
  ];

  return (
    <div className="space-y-6 animate-fade-in">
      <TimerDisplay />
      <StatsPanel />

      <div className="flex gap-2 border-b border-gray-800 pb-0">
        {tabs.map(tab => {
          const Icon = tab.icon;
          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`flex items-center gap-2 px-4 py-3 text-sm font-medium border-b-2 transition-all -mb-px ${
                activeTab === tab.id
                  ? 'border-emerald-500 text-emerald-400'
                  : 'border-transparent text-gray-400 hover:text-white'
              }`}
            >
              <Icon size={16} />
              {tab.label}
            </button>
          );
        })}
      </div>

      <div className="animate-fade-in">
        {activeTab === 'tables' && <TablesView />}
        {activeTab === 'players' && <PlayersPanel />}
        {activeTab === 'ranking' && <RankingPanel />}
        {activeTab === 'blinds' && <BlindsStructure />}
      </div>
    </div>
  );
}
