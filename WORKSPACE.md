# loom-football — workspace map

Single-page Next.js app for picking the office football lineup.

## Main folders

| Area | Path | Notes |
|------|------|--------|
| Page entry | `src/app/page.tsx` | The whole app — wires roster/pitch/controls together |
| Lineup UI | `src/components/lineup/` | `Pitch`, `RosterPanel`, `ControlsPanel` |
| Formations | `src/lib/formations.ts` | Slot positions for each formation |
| Defaults | `src/lib/team-defaults.ts` | Default squad and role colors |
| Types | `src/types/team.ts` | `Team`, `Player`, `Formation`, `Position` |
| Theme | `src/contexts/config.tsx` | DaisyUI theme switching, persisted in localStorage |
| Styles | `src/styles/` | Tailwind v4 + DaisyUI themes; pitch CSS in `pages/pitch.css` |

## If you change X, also check Y

- **Add a formation** → edit `src/lib/formations.ts` and add the key to the `FormationKey` union in `src/types/team.ts`.
- **Add a player attribute** → update `Player` in `src/types/team.ts`, the form in `RosterPanel.tsx`, and the token in `Pitch.tsx`.
- **Bump localStorage shape** → change the `STORAGE_KEY` constant in `src/app/page.tsx` so old data doesn't deserialize wrong.
