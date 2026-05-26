import { useEffect, useState } from 'react';
import { Trophy, TrendingUp, Award, Users, Target, BarChart3 } from 'lucide-react';
import { loadAllTournaments } from '../utils/storage';
import type { Tournament, PlayerStats } from '../types/tournament';

function computePlayerStats(tournaments: Tournament[]): PlayerStats[] {
  const finishedTournaments = tournaments.filter(t => t.status === 'finished');
  const statsMap = new Map<string, PlayerStats>();

  for (const tournament of finishedTournaments) {
    const totalPlayers = tournament.players.length;
    const itmThreshold = Math.max(1, Math.floor(totalPlayers * 0.3));

    for (const player of tournament.players) {
      const existing = statsMap.get(player.name) ?? {
        name: player.name,
        tournamentsPlayed: 0,
        wins: 0,
        podiums: 0,
        itm: 0,
        totalBuyIns: 0,
        bestPosition: Infinity,
        averagePosition: 0,
        eliminationPositions: [],
      };

      existing.tournamentsPlayed++;
      existing.totalBuyIns += tournament.config.buyIn;

      const position = player.eliminatedPosition ?? totalPlayers;
      existing.eliminationPositions.push(position);

      if (position === 1) existing.wins++;
      if (position <= 3) existing.podiums++;
      if (position <= itmThreshold) existing.itm++;
      if (position < existing.bestPosition) existing.bestPosition = position;

      statsMap.set(player.name, existing);
    }
  }

  const result: PlayerStats[] = [];
  for (const stats of statsMap.values()) {
    const sum = stats.eliminationPositions.reduce((a, b) => a + b, 0);
    stats.averagePosition = stats.eliminationPositions.length > 0
      ? Math.round((sum / stats.eliminationPositions.length) * 10) / 10
      : 0;
    if (stats.bestPosition === Infinity) stats.bestPosition = 0;
    result.push(stats);
  }

  return result.sort((a, b) => {
    const winRateA = a.tournamentsPlayed > 0 ? a.wins / a.tournamentsPlayed : 0;
    const winRateB = b.tournamentsPlayed > 0 ? b.wins / b.tournamentsPlayed : 0;
    if (winRateB !== winRateA) return winRateB - winRateA;
    return b.tournamentsPlayed - a.tournamentsPlayed;
  });
}

export function PlayerStatsPage() {
  const [playerStats, setPlayerStats] = useState<PlayerStats[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedPlayer, setSelectedPlayer] = useState<PlayerStats | null>(null);

  useEffect(() => {
    loadAllTournaments().then(tournaments => {
      setPlayerStats(computePlayerStats(tournaments));
      setLoading(false);
    });
  }, []);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="w-8 h-8 border-2 border-emerald-500 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  const itmRate = (player: PlayerStats) =>
    player.tournamentsPlayed > 0
      ? Math.round((player.itm / player.tournamentsPlayed) * 100)
      : 0;

  const winRate = (player: PlayerStats) =>
    player.tournamentsPlayed > 0
      ? Math.round((player.wins / player.tournamentsPlayed) * 100)
      : 0;

  return (
    <div className="animate-slide-up">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-white">Statistiques Joueurs</h1>
        <p className="text-gray-400 mt-2">Performance de chaque joueur sur tous les tournois</p>
      </div>

      {playerStats.length === 0 ? (
        <div className="glass-card p-12 text-center">
          <BarChart3 className="w-12 h-12 text-gray-600 mx-auto mb-4" />
          <p className="text-gray-400">Aucune donnée disponible</p>
          <p className="text-gray-500 text-sm mt-2">Les stats apparaîtront après votre premier tournoi terminé</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Player list */}
          <div className="lg:col-span-2">
            <div className="glass-card overflow-hidden">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-gray-800">
                    <th className="text-left px-5 py-3 text-xs font-medium text-gray-400 uppercase">#</th>
                    <th className="text-left px-5 py-3 text-xs font-medium text-gray-400 uppercase">Joueur</th>
                    <th className="text-center px-5 py-3 text-xs font-medium text-gray-400 uppercase">Tournois</th>
                    <th className="text-center px-5 py-3 text-xs font-medium text-gray-400 uppercase">Victoires</th>
                    <th className="text-center px-5 py-3 text-xs font-medium text-gray-400 uppercase">Podiums</th>
                    <th className="text-center px-5 py-3 text-xs font-medium text-gray-400 uppercase">ITM%</th>
                    <th className="text-center px-5 py-3 text-xs font-medium text-gray-400 uppercase">Pos. moy.</th>
                  </tr>
                </thead>
                <tbody>
                  {playerStats.map((player, index) => (
                    <tr
                      key={player.name}
                      onClick={() => setSelectedPlayer(player)}
                      className={`border-b border-gray-800/50 cursor-pointer transition-colors ${
                        selectedPlayer?.name === player.name
                          ? 'bg-emerald-500/10'
                          : 'hover:bg-gray-800/30'
                      }`}
                    >
                      <td className="px-5 py-3">
                        <span className={`font-bold ${
                          index === 0 ? 'text-amber-400' :
                          index === 1 ? 'text-gray-300' :
                          index === 2 ? 'text-orange-400' :
                          'text-gray-500'
                        }`}>
                          {index + 1}
                        </span>
                      </td>
                      <td className="px-5 py-3">
                        <div className="flex items-center gap-2">
                          <div className="w-8 h-8 rounded-full bg-gradient-to-br from-emerald-500 to-emerald-700 flex items-center justify-center">
                            <span className="text-xs font-bold text-white">{player.name.charAt(0)}</span>
                          </div>
                          <span className="font-medium text-white">{player.name}</span>
                        </div>
                      </td>
                      <td className="px-5 py-3 text-center text-gray-300">{player.tournamentsPlayed}</td>
                      <td className="px-5 py-3 text-center text-amber-400 font-semibold">{player.wins}</td>
                      <td className="px-5 py-3 text-center text-purple-400">{player.podiums}</td>
                      <td className="px-5 py-3 text-center">
                        <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${
                          itmRate(player) >= 50 ? 'bg-emerald-500/20 text-emerald-400' :
                          itmRate(player) >= 30 ? 'bg-blue-500/20 text-blue-400' :
                          'bg-gray-700 text-gray-400'
                        }`}>
                          {itmRate(player)}%
                        </span>
                      </td>
                      <td className="px-5 py-3 text-center text-gray-300">{player.averagePosition}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* Player detail card */}
          <div>
            {selectedPlayer ? (
              <div className="glass-card p-6 space-y-5 animate-fade-in sticky top-24">
                <div className="text-center">
                  <div className="w-16 h-16 rounded-full bg-gradient-to-br from-emerald-500 to-emerald-700 flex items-center justify-center mx-auto mb-3">
                    <span className="text-2xl font-bold text-white">{selectedPlayer.name.charAt(0)}</span>
                  </div>
                  <h3 className="text-xl font-bold text-white">{selectedPlayer.name}</h3>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div className="bg-gray-800/50 rounded-xl p-3 text-center">
                    <Trophy size={16} className="text-amber-400 mx-auto mb-1" />
                    <p className="text-lg font-bold text-white">{selectedPlayer.wins}</p>
                    <p className="text-xs text-gray-500">Victoires</p>
                  </div>
                  <div className="bg-gray-800/50 rounded-xl p-3 text-center">
                    <Award size={16} className="text-purple-400 mx-auto mb-1" />
                    <p className="text-lg font-bold text-white">{selectedPlayer.podiums}</p>
                    <p className="text-xs text-gray-500">Podiums</p>
                  </div>
                  <div className="bg-gray-800/50 rounded-xl p-3 text-center">
                    <Users size={16} className="text-blue-400 mx-auto mb-1" />
                    <p className="text-lg font-bold text-white">{selectedPlayer.tournamentsPlayed}</p>
                    <p className="text-xs text-gray-500">Tournois</p>
                  </div>
                  <div className="bg-gray-800/50 rounded-xl p-3 text-center">
                    <Target size={16} className="text-emerald-400 mx-auto mb-1" />
                    <p className="text-lg font-bold text-white">{itmRate(selectedPlayer)}%</p>
                    <p className="text-xs text-gray-500">ITM</p>
                  </div>
                </div>

                <div className="space-y-3">
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-400">Win rate</span>
                    <span className="text-white font-medium">{winRate(selectedPlayer)}%</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-400">Meilleure position</span>
                    <span className="text-white font-medium">{selectedPlayer.bestPosition}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-400">Position moyenne</span>
                    <span className="text-white font-medium">{selectedPlayer.averagePosition}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-400">Total buy-ins</span>
                    <span className="text-white font-medium">{selectedPlayer.totalBuyIns}€</span>
                  </div>
                </div>

                {/* Position history mini chart */}
                <div>
                  <p className="text-xs text-gray-400 mb-2">Historique des positions</p>
                  <div className="flex items-end gap-1 h-16">
                    {selectedPlayer.eliminationPositions.slice(-15).map((pos, i) => {
                      const maxPos = Math.max(...selectedPlayer.eliminationPositions);
                      const height = maxPos > 0 ? ((maxPos - pos + 1) / maxPos) * 100 : 50;
                      return (
                        <div
                          key={i}
                          className={`flex-1 rounded-t transition-all ${
                            pos === 1 ? 'bg-amber-400' :
                            pos <= 3 ? 'bg-emerald-400' :
                            'bg-gray-600'
                          }`}
                          style={{ height: `${Math.max(10, height)}%` }}
                          title={`Position ${pos}`}
                        />
                      );
                    })}
                  </div>
                </div>
              </div>
            ) : (
              <div className="glass-card p-8 text-center">
                <TrendingUp className="w-10 h-10 text-gray-600 mx-auto mb-3" />
                <p className="text-gray-400 text-sm">Sélectionnez un joueur pour voir ses stats détaillées</p>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
