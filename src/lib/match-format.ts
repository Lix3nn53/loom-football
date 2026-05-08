import { FORMATIONS } from "@/lib/formations";
import type { FormationKey, Match, Player, Team } from "@/types/team";

const FORMATION_KEYS = new Set(Object.keys(FORMATIONS));

const isPlayer = (x: unknown): x is Player => {
    if (!x || typeof x !== "object") return false;
    const p = x as Record<string, unknown>;
    if (typeof p.id !== "string") return false;
    if (typeof p.name !== "string") return false;
    if (typeof p.number !== "number") return false;
    if (p.photoUrl !== undefined && typeof p.photoUrl !== "string") return false;
    return true;
};

export type ExportTeam = {
    name: string;
    color: string;
    formation: FormationKey;
    lineup: Record<string, Player | null>;
    bench: Player[];
};

export type ExportFile = {
    red: ExportTeam;
    blue: ExportTeam;
};

export type ImportedTeams = {
    red: Team;
    blue: Team;
};

const isExportTeam = (x: unknown): x is ExportTeam => {
    if (!x || typeof x !== "object") return false;
    const t = x as Record<string, unknown>;
    if (typeof t.name !== "string") return false;
    if (typeof t.color !== "string") return false;
    if (typeof t.formation !== "string" || !FORMATION_KEYS.has(t.formation))
        return false;
    if (!t.lineup || typeof t.lineup !== "object") return false;
    if (!Array.isArray(t.bench) || !t.bench.every(isPlayer)) return false;
    for (const v of Object.values(t.lineup as Record<string, unknown>)) {
        if (v !== null && !isPlayer(v)) return false;
    }
    return true;
};

const isExportFile = (x: unknown): x is ExportFile => {
    if (!x || typeof x !== "object") return false;
    const f = x as Record<string, unknown>;
    return isExportTeam(f.red) && isExportTeam(f.blue);
};

const teamToExport = (team: Team): ExportTeam => {
    const formation = FORMATIONS[team.formation];
    const playerById: Record<string, Player> = {};
    for (const p of team.roster) playerById[p.id] = p;

    const lineup: Record<string, Player | null> = {};
    const onPitchIds = new Set<string>();
    for (const slot of formation.slots) {
        const playerId = team.assignments[slot.id];
        const player = playerId ? (playerById[playerId] ?? null) : null;
        lineup[slot.id] = player;
        if (player) onPitchIds.add(player.id);
    }
    const bench = team.roster.filter((p) => !onPitchIds.has(p.id));
    return {
        name: team.name,
        color: team.color,
        formation: team.formation,
        lineup,
        bench,
    };
};

const exportToTeam = (et: ExportTeam): Team => {
    const roster: Player[] = [];
    const seen = new Set<string>();
    const assignments: Record<string, string | null> = {};

    for (const [slotId, player] of Object.entries(et.lineup)) {
        if (player) {
            assignments[slotId] = player.id;
            if (!seen.has(player.id)) {
                roster.push(player);
                seen.add(player.id);
            }
        } else {
            assignments[slotId] = null;
        }
    }
    for (const p of et.bench) {
        if (!seen.has(p.id)) {
            roster.push(p);
            seen.add(p.id);
        }
    }
    return {
        name: et.name,
        color: et.color,
        formation: et.formation,
        roster,
        assignments,
    };
};

// activeSide is intentionally NOT serialized — it's a per-client view
// preference. Including it would (1) cause a cloud push every time the user
// switches tabs and (2) force every other connected client to switch sides
// when one user toggles.
export const matchToExport = (match: Pick<Match, "red" | "blue">): ExportFile => ({
    red: teamToExport(match.red),
    blue: teamToExport(match.blue),
});

export const parseImport = (raw: unknown): ImportedTeams | null => {
    if (!isExportFile(raw)) return null;
    return {
        red: exportToTeam(raw.red),
        blue: exportToTeam(raw.blue),
    };
};
