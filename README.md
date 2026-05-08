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

Push/pull the match JSON between users via a single object in a public S3 bucket. No backend code, no Cognito, no IAM role on the build pipeline — the browser does plain `fetch(PUT)` against an S3 URL set via `NEXT_PUBLIC_CLOUD_SYNC_URL`.

### One-time S3 setup

1. **Create a bucket** in any region (e.g. `loom-football-sync`).
2. **Disable "Block all public access"** on the bucket.
3. **Bucket policy** — allow `GetObject` and `PutObject` on a known prefix:
    ```json
    {
      "Version": "2012-10-17",
      "Statement": [
        {
          "Effect": "Allow",
          "Principal": "*",
          "Action": ["s3:GetObject", "s3:PutObject"],
          "Resource": "arn:aws:s3:::loom-football-sync/shared/*"
        }
      ]
    }
    ```
4. **CORS** — allow `GET` and `PUT` from your Amplify domain:
    ```json
    [
      {
        "AllowedOrigins": ["https://your-app.amplifyapp.com", "http://localhost:3001"],
        "AllowedMethods": ["GET", "PUT"],
        "AllowedHeaders": ["*"],
        "ExposeHeaders": ["ETag"]
      }
    ]
    ```
5. Pick a hard-to-guess key under the prefix, e.g. `shared/<random-uuid>/match.json`. The full URL is `https://loom-football-sync.s3.<region>.amazonaws.com/shared/<random-uuid>/match.json`.

### Wire into the app

Set `NEXT_PUBLIC_CLOUD_SYNC_URL` to the full S3 object URL — locally in `.env.local`, in production via Amplify Hosting → App settings → Environment variables. The Push/Pull buttons in the Export/Import modals start working immediately.

Tradeoffs: anyone with the URL can read **and** clobber the file. The "obscure path" approach is good enough for an office team. Last-write-wins; if two people push within seconds, the second wins.

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
