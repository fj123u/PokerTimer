import { useMemo } from 'react';
import { Users, Coins, Trophy, LayoutGrid, Clock, Target } from 'lucide-react';
import { useTournamentStore } from '../../store/tournamentStore';
import { formatChips } from '../../utils/blinds';
import { formatTimeLong } from '../../hooks/useTimer';
import type { TournamentStats } from '../../types/tournament';

export function StatsPanel() {
  const tournament = useTournamentStore(s => s.tournament);

  const stats: TournamentStats | null = useMemo(() => {
    if (!tournament) return null;

    const activePlayers = tournament.players.filter(p => !p.isEliminated);
    const totalChips = tournament.players.length * tournament.config.startingStack;
    const activeTables = tournament.tables.filter(t => t.isActive).length;
    const levelElims = tournament.eliminationHistory.filter(
      e => e.level === tournament.currentLevel
    ).length;

    // Temps estimé = temps écoulé soustrait de la durée totale configurée
    let estimatedTime: number;
    if (tournament.startedAt) {
      const elapsed = (Date.now() - tournament.startedAt) / 1000;
      estimatedTime = Math.max(0, tournament.config.totalDuration * 60 - elapsed);
    } else {
      estimatedTime = tournament.config.totalDuration * 60;
    }

    return {
      playersRemaining: activePlayers.length,
      totalPlayers: tournament.players.length,
      totalChips,
      averageStack: activePlayers.length > 0 ? Math.round(totalChips / activePlayers.length) : 0,
      largestStack: activePlayers.length > 0 ? Math.max(...activePlayers.map(p => p.chips)) : 0,
      smallestStack: activePlayers.length > 0 ? Math.min(...activePlayers.map(p => p.chips)) : 0,
      activeTables,
      currentLevel: tournament.currentLevel,
      estimatedTimeRemaining: estimatedTime,
      eliminationsThisLevel: levelElims,
    };
  }, [tournament]);

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
      icon: Trophy,
      label: 'Prize Pool',
      value: tournament!.config.buyInLabel === 'Buy-in'
        ? `${tournament!.config.buyIn * stats.totalPlayers}€`
        : '—',
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
