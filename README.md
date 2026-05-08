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

- The match state (both teams: squad, formation, assignments, name/color) lives entirely in the browser under the localStorage key `__OFFICE_FOOTBALL_MATCH_v1__`.
- Theme preferences live under `__LOOM_FB_THEME_v1__`.
- Six formations are supported: 4-4-2, 4-3-3, 4-2-3-1, 3-5-2, 3-4-3, 5-3-2.
- Click a bench player → click an empty pitch slot to assign. Click a placed player to send them back to the bench.

## Cloud sync (optional)

Push/pull the match JSON between users via an Amplify Gen 2 backend (Cognito guest identity pool + S3). The app falls back gracefully if the backend isn't deployed — sync just won't work and shows "not configured".

### Local sandbox

```bash
npx ampx sandbox
```

This deploys a personal sandbox stack (auth + storage), generates `amplify_outputs.json` at the repo root, and watches `amplify/` for changes. Leave it running; in another terminal start `npm run dev`. The dev server reads `/amplify_outputs.json` from `public/`, so copy it over once the sandbox produces it:

```bash
cp amplify_outputs.json public/amplify_outputs.json
```

### Production deploy (Amplify Hosting)

`amplify.yml` already runs `npx ampx pipeline-deploy` in the backend phase. The frontend phase copies `amplify_outputs.json` into `public/` before `next build`. First deploy will provision the Cognito identity pool and the S3 bucket.

### Sync from the UI

- **Export modal → Push to cloud** writes to `shared/match.json` in S3.
- **Import modal → Pull from cloud** reads it and replaces the local match.
- It's last-write-wins; no conflict resolution.

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
