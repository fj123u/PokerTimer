import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Plus, Trash2, Users, Play, Shuffle } from 'lucide-react';
import { useTournamentStore } from '../store/tournamentStore';
import type { TournamentConfig } from '../types/tournament';

const DEMO_NAMES = [
  'Julien', 'Marc', 'Théo', 'Lucas', 'Emma', 'Nathan',
  'Sarah', 'Hugo', 'Léa', 'Antoine', 'Camille', 'Raphaël',
  'Chloé', 'Maxime', 'Alice', 'Thomas', 'Julie', 'Alexandre',
  'Marie', 'Pierre',
];

export function SetupPage() {
  const navigate = useNavigate();
  const createTournament = useTournamentStore(s => s.createTournament);

  const [config, setConfig] = useState<TournamentConfig>({
    name: 'Tournoi du soir',
    maxPlayersPerTable: 9,
    startingStack: 10000,
    totalDuration: 180,
    levelDuration: 15,
    enableAntes: true,
    enableBounty: false,
    enableReentry: false,
    enableAddon: false,
    reentryMaxLevel: 6,
    addonChips: 5000,
    buyIn: 20,
    payoutPercentages: [50, 30, 20],
  });

  const [playerNames, setPlayerNames] = useState<string[]>(['']);
  const [newPlayerName, setNewPlayerName] = useState('');

  const addPlayer = () => {
    const name = newPlayerName.trim();
    if (name && !playerNames.includes(name)) {
      setPlayerNames([...playerNames.filter(n => n !== ''), name, '']);
      setNewPlayerName('');
    }
  };

  const removePlayer = (index: number) => {
    setPlayerNames(playerNames.filter((_, i) => i !== index));
  };

  const loadDemo = () => {
    const count = Math.min(12, DEMO_NAMES.length);
    const shuffled = [...DEMO_NAMES].sort(() => Math.random() - 0.5);
    setPlayerNames([...shuffled.slice(0, count), '']);
  };

  const handleSubmit = () => {
    const validPlayers = playerNames.filter(n => n.trim() !== '');
    if (validPlayers.length < 2) return;
    createTournament(config, validPlayers);
    navigate('/tournament');
  };

  const validPlayerCount = playerNames.filter(n => n.trim() !== '').length;

  return (
    <div className="max-w-4xl mx-auto animate-slide-up">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-white">Nouveau Tournoi</h1>
        <p className="text-gray-400 mt-2">Configurez les paramètres de votre tournoi</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Configuration */}
        <div className="glass-card p-6 space-y-5">
          <h2 className="text-lg font-semibold text-white flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-emerald-500/20 flex items-center justify-center">
              <Play size={16} className="text-emerald-400" />
            </div>
            Configuration
          </h2>

          <div>
            <label className="block text-sm font-medium text-gray-300 mb-1.5">Nom du tournoi</label>
            <input
              type="text"
              value={config.name}
              onChange={e => setConfig({ ...config, name: e.target.value })}
              className="w-full bg-gray-800 border border-gray-700 rounded-xl px-4 py-2.5 text-white focus:outline-none focus:border-emerald-500 transition-colors"
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-1.5">Joueurs / table</label>
              <select
                value={config.maxPlayersPerTable}
                onChange={e => setConfig({ ...config, maxPlayersPerTable: Number(e.target.value) })}
                className="w-full bg-gray-800 border border-gray-700 rounded-xl px-4 py-2.5 text-white focus:outline-none focus:border-emerald-500"
              >
                {[2, 3, 4, 5, 6, 7, 8, 9, 10].map(n => (
                  <option key={n} value={n}>{n} joueurs</option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-1.5">Stack de départ</label>
              <select
                value={config.startingStack}
                onChange={e => setConfig({ ...config, startingStack: Number(e.target.value) })}
                className="w-full bg-gray-800 border border-gray-700 rounded-xl px-4 py-2.5 text-white focus:outline-none focus:border-emerald-500"
              >
                {[1000, 2000, 3000, 5000, 10000, 15000, 20000, 25000, 50000].map(n => (
                  <option key={n} value={n}>{n.toLocaleString()}</option>
                ))}
              </select>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-1.5">Durée totale (min)</label>
              <select
                value={config.totalDuration}
                onChange={e => setConfig({ ...config, totalDuration: Number(e.target.value) })}
                className="w-full bg-gray-800 border border-gray-700 rounded-xl px-4 py-2.5 text-white focus:outline-none focus:border-emerald-500"
              >
                {[60, 90, 120, 150, 180, 240, 300, 360].map(n => (
                  <option key={n} value={n}>{n} min ({Math.floor(n / 60)}h{n % 60 > 0 ? n % 60 : ''})</option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-1.5">Durée niveaux (min)</label>
              <select
                value={config.levelDuration}
                onChange={e => setConfig({ ...config, levelDuration: Number(e.target.value) })}
                className="w-full bg-gray-800 border border-gray-700 rounded-xl px-4 py-2.5 text-white focus:outline-none focus:border-emerald-500"
              >
                {[5, 8, 10, 12, 15, 20, 25, 30].map(n => (
                  <option key={n} value={n}>{n} minutes</option>
                ))}
              </select>
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-300 mb-1.5">Buy-in (€)</label>
            <input
              type="number"
              value={config.buyIn}
              onChange={e => setConfig({ ...config, buyIn: Number(e.target.value) })}
              className="w-full bg-gray-800 border border-gray-700 rounded-xl px-4 py-2.5 text-white focus:outline-none focus:border-emerald-500"
            />
          </div>

          <div className="space-y-3">
            <label className="block text-sm font-medium text-gray-300">Options</label>
            {[
              { key: 'enableAntes' as const, label: 'Activer les antes' },
              { key: 'enableBounty' as const, label: 'Mode bounty' },
              { key: 'enableReentry' as const, label: 'Re-entry autorisé' },
              { key: 'enableAddon' as const, label: 'Add-on disponible' },
            ].map(opt => (
              <label key={opt.key} className="flex items-center gap-3 cursor-pointer">
                <div className="relative">
                  <input
                    type="checkbox"
                    checked={config[opt.key]}
                    onChange={e => setConfig({ ...config, [opt.key]: e.target.checked })}
                    className="sr-only peer"
                  />
                  <div className="w-10 h-5 bg-gray-700 rounded-full peer-checked:bg-emerald-500 transition-colors" />
                  <div className="absolute top-0.5 left-0.5 w-4 h-4 bg-white rounded-full peer-checked:translate-x-5 transition-transform" />
                </div>
                <span className="text-sm text-gray-300">{opt.label}</span>
              </label>
            ))}
          </div>
        </div>

        {/* Players */}
        <div className="glass-card p-6 space-y-5">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-semibold text-white flex items-center gap-2">
              <div className="w-8 h-8 rounded-lg bg-blue-500/20 flex items-center justify-center">
                <Users size={16} className="text-blue-400" />
              </div>
              Joueurs ({validPlayerCount})
            </h2>
            <button
              onClick={loadDemo}
              className="flex items-center gap-1.5 text-sm text-gray-400 hover:text-white px-3 py-1.5 rounded-lg hover:bg-gray-800 transition-colors"
            >
              <Shuffle size={14} />
              Démo
            </button>
          </div>

          <div className="flex gap-2">
            <input
              type="text"
              value={newPlayerName}
              onChange={e => setNewPlayerName(e.target.value)}
              onKeyDown={e => e.key === 'Enter' && addPlayer()}
              placeholder="Nom du joueur..."
              className="flex-1 bg-gray-800 border border-gray-700 rounded-xl px-4 py-2.5 text-white placeholder-gray-500 focus:outline-none focus:border-emerald-500 transition-colors"
            />
            <button
              onClick={addPlayer}
              className="px-4 py-2.5 bg-emerald-600 hover:bg-emerald-500 rounded-xl text-white transition-colors"
            >
              <Plus size={20} />
            </button>
          </div>

          <div className="space-y-2 max-h-[400px] overflow-y-auto pr-2">
            {playerNames.filter(n => n.trim() !== '').map((name, index) => (
              <div
                key={index}
                className="flex items-center justify-between bg-gray-800/50 rounded-xl px-4 py-2.5 group animate-fade-in"
              >
                <div className="flex items-center gap-3">
                  <span className="w-7 h-7 rounded-full bg-gray-700 flex items-center justify-center text-xs font-bold text-gray-300">
                    {index + 1}
                  </span>
                  <span className="text-white">{name}</span>
                </div>
                <button
                  onClick={() => removePlayer(index)}
                  className="opacity-0 group-hover:opacity-100 text-gray-500 hover:text-red-400 transition-all"
                >
                  <Trash2 size={16} />
                </button>
              </div>
            ))}
          </div>

          {validPlayerCount < 2 && (
            <p className="text-sm text-amber-400">Ajoutez au moins 2 joueurs pour commencer</p>
          )}
        </div>
      </div>

      {/* Launch button */}
      <div className="mt-8 flex justify-center">
        <button
          onClick={handleSubmit}
          disabled={validPlayerCount < 2}
          className="px-8 py-4 bg-gradient-to-r from-emerald-600 to-emerald-500 hover:from-emerald-500 hover:to-emerald-400 disabled:from-gray-700 disabled:to-gray-600 disabled:cursor-not-allowed rounded-2xl text-white font-semibold text-lg transition-all duration-300 shadow-lg shadow-emerald-500/25 hover:shadow-emerald-500/40 disabled:shadow-none flex items-center gap-3"
        >
          <Play size={24} />
          Lancer le Tournoi ({validPlayerCount} joueurs)
        </button>
      </div>
    </div>
  );
}
