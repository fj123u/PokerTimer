# PokerTimer

Application professionnelle de gestion de tournois de poker. Timer, blindes automatiques, gestion des tables, classement en temps réel.

## Fonctionnalités

- **Création de tournoi** : configuration complète (joueurs, stack, durée, blindes)
- **Timer professionnel** : affichage grand format, notifications sonores, fullscreen
- **Génération automatique des blindes** : structure réaliste basée sur la durée et les stacks
- **Gestion des tables** : répartition et rééquilibrage automatiques
- **Éliminations** : classement automatique, podium, historique
- **Statistiques temps réel** : average stack, joueurs restants, temps estimé
- **Sauvegarde** : auto-save IndexedDB, export JSON, reprise de tournoi
- **Interface** : dark mode, animations fluides, responsive

## Stack technique

- React 19 + TypeScript
- Vite
- TailwindCSS v4
- Zustand (state management)
- IndexedDB (persistance)
- Lucide React (icônes)

## Installation

```bash
npm install
npm run dev
```

## Build

```bash
npm run build
npm run preview
```

## Structure du projet

```
src/
├── components/       # Composants UI
│   ├── layout/       # Layout principal
│   ├── timer/        # Timer du tournoi
│   ├── tables/       # Vue des tables
│   ├── players/      # Gestion des joueurs
│   ├── stats/        # Statistiques
│   └── tournament/   # Blindes, classement
├── hooks/            # Hooks personnalisés
├── pages/            # Pages de l'application
├── store/            # State management (Zustand)
├── types/            # Types TypeScript
└── utils/            # Utilitaires (blindes, tables, storage)
```

## Licence

MIT
