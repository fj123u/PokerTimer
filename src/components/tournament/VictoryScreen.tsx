import { Trophy, Medal, Clock, Users, X, Coins } from 'lucide-react';
import { useTournamentStore } from '../../store/tournamentStore';
import { format } from 'date-fns';
import { fr } from 'date-fns/locale';

function calculatePayouts(prizePool: number, itmPlaces: number): number[] {
  if (prizePool <= 0 || itmPlaces <= 0) return [];
  if (itmPlaces === 1) return [prizePool];
  if (itmPlaces === 2) return [Math.round(prizePool * 0.65), Math.round(prizePool * 0.35)];
  if (itmPlaces === 3) return [Math.round(prizePool * 0.50), Math.round(prizePool * 0.30), Math.round(prizePool * 0.20)];

  // Pour plus de places : distribution dégressive
  const percentages: number[] = [];
  let remaining = 100;
  for (let i = 0; i < itmPlaces; i++) {
    const share = i === 0 ? 35 : i === 1 ? 22 : i === 2 ? 15 : Math.max(2, remaining / (itmPlaces - i));
    const actual = Math.min(share, remaining);
    percentages.push(actual);
    remaining -= actual;
  }
  // Distribuer le reste au premier
  if (remaining > 0) percentages[0] += remaining;

  return percentages.map(p => Math.round(prizePool * p / 100));
}

export function VictoryScreen() {
  const tournament = useTournamentStore(s => s.tournament);
  const resetTournament = useTournamentStore(s => s.resetTournament);
  const save = useTournamentStore(s => s.save);

  if (!tournament || tournament.status !== 'finished') return null;

  const itmPlaces = tournament.config.itmPlaces || 3;
  const isBuyIn = tournament.config.buyInLabel === 'Buy-in';
  const prizePool = isBuyIn ? tournament.config.buyIn * tournament.players.length : 0;

  // Calcul des gains par position ITM
  const payouts = calculatePayouts(prizePool, itmPlaces);

  const allPlayers = [...tournament.players].sort(
    (a, b) => (a.eliminatedPosition ?? 0) - (b.eliminatedPosition ?? 0)
  );

  const itmPlayers = allPlayers.filter(p => (p.eliminatedPosition ?? 999) <= itmPlaces);
  const outPlayers = allPlayers.filter(p => (p.eliminatedPosition ?? 999) > itmPlaces);

  const duration = tournament.finishedAt && tournament.startedAt
    ? Math.round((tournament.finishedAt - tournament.startedAt) / 60000)
    : 0;

  const handleClose = () => {
    save();
    resetTournament();
  };

  const podiumColors: Record<number, string> = {
    1: 'from-amber-400 to-amber-600',
    2: 'from-gray-300 to-gray-500',
    3: 'from-orange-400 to-orange-600',
  };

  return (
    <div className="fixed inset-0 z-50 bg-gray-950/95 backdrop-blur-sm overflow-y-auto">
      <div className="max-w-3xl mx-auto px-4 py-12 animate-slide-up">
        {/* Header */}
        <div className="text-center mb-10">
          <div className="w-20 h-20 rounded-full bg-gradient-to-br from-amber-400 to-amber-600 flex items-center justify-center mx-auto mb-4 glow-gold">
            <Trophy className="w-10 h-10 text-white" />
          </div>
          <h1 className="text-4xl font-bold text-white mb-2">Tournoi terminé !</h1>
          <p className="text-gray-400">{tournament.config.name}</p>
          <div className="flex items-center justify-center gap-6 mt-4 text-sm text-gray-500">
            <span className="flex items-center gap-1.5">
              <Users size={14} />
              {tournament.players.length} joueurs
            </span>
            <span className="flex items-center gap-1.5">
              <Clock size={14} />
              {duration} min
            </span>
            {tournament.finishedAt && (
              <span>
                {format(new Date(tournament.finishedAt), "d MMM yyyy 'à' HH:mm", { locale: fr })}
              </span>
            )}
          </div>
        </div>

        {/* Podium */}
        <div className="glass-card p-8 mb-6">
          <div className="flex items-end justify-center gap-4 mb-8">
            {allPlayers.slice(0, 3).map(player => {
              const pos = player.eliminatedPosition ?? 0;
              const height = pos === 1 ? 'h-28' : pos === 2 ? 'h-20' : 'h-16';
              const order = pos === 1 ? 'order-2' : pos === 2 ? 'order-1' : 'order-3';
              return (
                <div key={player.id} className={`flex flex-col items-center gap-2 ${order}`}>
                  <div className={`w-14 h-14 rounded-full bg-gradient-to-br ${podiumColors[pos] ?? 'from-gray-600 to-gray-700'} flex items-center justify-center shadow-lg`}>
                    <Medal size={24} className="text-white" />
                  </div>
                  <span className="text-sm font-bold text-white">{player.name}</span>
                  <div className={`${height} w-24 rounded-t-xl bg-gradient-to-t ${podiumColors[pos] ?? 'from-gray-600 to-gray-700'} flex items-center justify-center`}>
                    <span className="text-2xl font-bold text-white">{pos}</span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Prize Pool */}
        {isBuyIn && prizePool > 0 && (
          <div className="glass-card p-6 mb-6">
            <div className="flex items-center justify-between">
              <h2 className="text-lg font-semibold text-white flex items-center gap-2">
                <Coins size={18} className="text-amber-400" />
                Prize Pool
              </h2>
              <span className="text-2xl font-bold text-amber-400">{prizePool}€</span>
            </div>
            <p className="text-sm text-gray-400 mt-1">
              {tournament.players.length} joueurs × {tournament.config.buyIn}€
            </p>
          </div>
        )}

        {/* ITM Players */}
        <div className="glass-card p-6 mb-6">
          <h2 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
            <div className="w-6 h-6 rounded-full bg-emerald-500/20 flex items-center justify-center">
              <Trophy size={12} className="text-emerald-400" />
            </div>
            Dans les places ({itmPlaces} ITM)
          </h2>
          <div className="space-y-2">
            {itmPlayers.map(player => {
              const pos = (player.eliminatedPosition ?? 1) - 1;
              const payout = payouts[pos] ?? 0;
              return (
                <div key={player.id} className="flex items-center justify-between bg-emerald-500/5 border border-emerald-500/20 rounded-xl px-4 py-3">
                  <div className="flex items-center gap-3">
                    <span className={`w-8 h-8 rounded-full flex items-center justify-center font-bold text-sm bg-gradient-to-br ${podiumColors[player.eliminatedPosition ?? 0] ?? 'from-emerald-500 to-emerald-700'} text-white`}>
                      {player.eliminatedPosition}
                    </span>
                    <span className="font-medium text-white">{player.name}</span>
                  </div>
                  <div className="text-right">
                    {isBuyIn && payout > 0 && (
                      <span className="text-lg font-bold text-emerald-400">{payout}€</span>
                    )}
                    {!isBuyIn && (
                      <span className="text-sm text-emerald-400 font-medium">ITM</span>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Out Players */}
        {outPlayers.length > 0 && (
          <div className="glass-card p-6 mb-6">
            <h2 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
              <div className="w-6 h-6 rounded-full bg-red-500/20 flex items-center justify-center">
                <X size={12} className="text-red-400" />
              </div>
              Hors des places
            </h2>
            <div className="space-y-2">
              {outPlayers.map(player => (
                <div key={player.id} className="flex items-center justify-between bg-gray-800/30 rounded-xl px-4 py-3">
                  <div className="flex items-center gap-3">
                    <span className="w-8 h-8 rounded-full bg-gray-700 flex items-center justify-center font-bold text-sm text-gray-400">
                      {player.eliminatedPosition}
                    </span>
                    <span className="font-medium text-gray-400">{player.name}</span>
                  </div>
                  {player.eliminatedAt && (
                    <span className="text-xs text-gray-500">
                      {format(new Date(player.eliminatedAt), 'HH:mm')}
                    </span>
                  )}
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Gage display */}
        {tournament.config.buyInLabel === 'Gage' && tournament.config.gageDescription && (
          <div className="glass-card p-6 mb-6 border-amber-500/30">
            <h2 className="text-lg font-semibold text-amber-400 mb-2">Gage</h2>
            <p className="text-white">{tournament.config.gageDescription}</p>
            <p className="text-sm text-gray-400 mt-2">
              Concerne les positions {itmPlaces + 1} à {tournament.players.length}
            </p>
          </div>
        )}

        {/* Close button */}
        <div className="text-center mt-8">
          <button
            onClick={handleClose}
            className="px-8 py-3 bg-gray-800 hover:bg-gray-700 rounded-xl text-white font-medium transition-colors"
          >
            Fermer et sauvegarder
          </button>
        </div>
      </div>
    </div>
  );
}
