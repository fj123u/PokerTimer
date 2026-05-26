import { Users, Coins, TrendingUp, LayoutGrid, Clock, Target } from 'lucide-react';
import { useTournamentStore } from '../../store/tournamentStore';
import { formatChips } from '../../utils/blinds';
import { formatTimeLong } from '../../hooks/useTimer';

export function StatsPanel() {
  const stats = useTournamentStore(s => s.getStats());

  if (!stats) return null;

  const items = [
    {
      icon: Users,
      label: 'Joueurs',
      value: `${stats.playersRemaining} / ${stats.totalPlayers}`,
      color: 'text-blue-400',
      bg: 'bg-blue-500/10',
    },
    {
      icon: Coins,
      label: 'Average Stack',
      value: formatChips(stats.averageStack),
      color: 'text-emerald-400',
      bg: 'bg-emerald-500/10',
    },
    {
      icon: TrendingUp,
      label: 'Plus gros stack',
      value: formatChips(stats.largestStack),
      color: 'text-amber-400',
      bg: 'bg-amber-500/10',
    },
    {
      icon: LayoutGrid,
      label: 'Tables actives',
      value: stats.activeTables.toString(),
      color: 'text-purple-400',
      bg: 'bg-purple-500/10',
    },
    {
      icon: Target,
      label: 'Éliminations (niveau)',
      value: stats.eliminationsThisLevel.toString(),
      color: 'text-red-400',
      bg: 'bg-red-500/10',
    },
    {
      icon: Clock,
      label: 'Temps estimé',
      value: formatTimeLong(stats.estimatedTimeRemaining),
      color: 'text-cyan-400',
      bg: 'bg-cyan-500/10',
    },
  ];

  return (
    <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
      {items.map(item => {
        const Icon = item.icon;
        return (
          <div key={item.label} className="glass-card p-4">
            <div className="flex items-center gap-2 mb-2">
              <div className={`w-7 h-7 rounded-lg ${item.bg} flex items-center justify-center`}>
                <Icon size={14} className={item.color} />
              </div>
            </div>
            <p className={`text-lg font-bold ${item.color}`}>{item.value}</p>
            <p className="text-xs text-gray-500 mt-0.5">{item.label}</p>
          </div>
        );
      })}
    </div>
  );
}
