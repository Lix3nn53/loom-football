# Loom Football

Single-page **Team Management** / lineup editor for office football. Pick a formation, drop players on the pitch, save your XI. State persists in `localStorage` — no backend.

Built with Next.js 15, Tailwind v4, DaisyUI 5, and Iconify Lucide icons.

## Quick start

```bash
npm install
npm run dev    # → http://localhost:3001
```

## Scripts

| Command | What it does |
|---------|--------------|
| `npm run dev` | Start the dev server on port 3001 |
| `npm run build` | Production build |
| `npm start` | Run the production build |
| `npm run lint` | Lint with ESLint |
| `npm run format` | Format with Prettier |

## How it works

- The lineup state (squad, formation, assignments, team name/color) lives entirely in the browser under the localStorage key `__OFFICE_FOOTBALL_TEAM_v1__`.
- Theme preferences live under `__LOOM_FB_THEME_v1__`.
- Six formations are supported: 4-4-2, 4-3-3, 4-2-3-1, 3-5-2, 3-4-3, 5-3-2.
- Click a bench player → click an empty pitch slot to assign. Click a placed player to send them back to the bench.

## Project layout

```
src/
├── app/              # Next.js App Router (single page)
├── components/
│   ├── lineup/       # Pitch, RosterPanel, ControlsPanel
│   ├── Logo.tsx
│   ├── ThemeToggle.tsx
│   └── Toaster.tsx
├── contexts/         # Theme/config provider
├── hooks/            # use-local-storage
├── lib/              # Formations data + defaults
├── styles/           # Tailwind + DaisyUI + pitch styling
└── types/            # Team, Player, Formation
```
