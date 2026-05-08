import type {
    Formation,
    Player,
    PlayerStats,
    Position,
    StatKey,
    Team,
} from "@/types/team";

export const STAT_KEYS: StatKey[] = ["pac", "sho", "pas", "dri", "def", "phy"];

export const STAT_LABELS: Record<StatKey, string> = {
    pac: "PAC",
    sho: "SHO",
    pas: "PAS",
    dri: "DRI",
    def: "DEF",
    phy: "PHY",
};

export const STAT_FULL_LABELS: Record<StatKey, string> = {
    pac: "Hız",
    sho: "Şut",
    pas: "Pas",
    dri: "Top Sürme",
    def: "Defans",
    phy: "Fizik",
};

export const DEFAULT_STAT_VALUE = 70;

export const DEFAULT_STATS: PlayerStats = {
    pac: DEFAULT_STAT_VALUE,
    sho: DEFAULT_STAT_VALUE,
    pas: DEFAULT_STAT_VALUE,
    dri: DEFAULT_STAT_VALUE,
    def: DEFAULT_STAT_VALUE,
    phy: DEFAULT_STAT_VALUE,
};

export const STAT_MIN = 1;
export const STAT_MAX = 99;

// FIFA-inspired position weights. We don't track GK-specific stats (diving,
// reflexes, handling), so the GK weighting leans on PHY/DEF as a proxy for
// shot-stopping presence and PAS for distribution.
const POSITION_WEIGHTS: Record<Position, PlayerStats> = {
    GK: { pac: 0.5, sho: 0, pas: 1, dri: 0.5, def: 2, phy: 2 },
    DEF: { pac: 2, sho: 0.5, pas: 1.5, dri: 1, def: 4, phy: 3 },
    MID: { pac: 1.5, sho: 1.5, pas: 2.5, dri: 2, def: 1.5, phy: 1 },
    FWD: { pac: 2.5, sho: 3, pas: 1, dri: 2.5, def: 0.3, phy: 1 },
};

export const clampStat = (n: number): number =>
    Math.max(STAT_MIN, Math.min(STAT_MAX, Math.round(n)));

export const computeOverall = (stats: PlayerStats, position: Position): number => {
    const weights = POSITION_WEIGHTS[position];
    let total = 0;
    let weightSum = 0;
    for (const k of STAT_KEYS) {
        total += stats[k] * weights[k];
        weightSum += weights[k];
    }
    return weightSum === 0 ? 0 : Math.round(total / weightSum);
};

const POSITIONS: Position[] = ["GK", "DEF", "MID", "FWD"];

// Returns the position that yields the highest OVR for these stats. Used as
// the player's "natural" position when they aren't slotted on the pitch.
export const bestPosition = (
    stats: PlayerStats,
): { position: Position; overall: number } => {
    let best: Position = "MID";
    let bestOvr = -1;
    for (const pos of POSITIONS) {
        const ovr = computeOverall(stats, pos);
        if (ovr > bestOvr) {
            bestOvr = ovr;
            best = pos;
        }
    }
    return { position: best, overall: bestOvr };
};

// Card OVR — what shows on the player's primary card. Uses their best
// position so a player isn't penalised for not having a slot yet.
export const playerCardOverall = (player: Player): number =>
    bestPosition(player.stats).overall;

// Position-specific OVR — what they'd actually rate at in this slot. Used
// to flag mismatches (e.g. a striker being played at center-back).
export const playerSlotOverall = (player: Player, position: Position): number =>
    computeOverall(player.stats, position);

const averageStats = (players: Player[]): PlayerStats | null => {
    if (players.length === 0) return null;
    const sum: PlayerStats = { pac: 0, sho: 0, pas: 0, dri: 0, def: 0, phy: 0 };
    for (const p of players) {
        for (const k of STAT_KEYS) sum[k] += p.stats[k];
    }
    const out: PlayerStats = { ...sum };
    for (const k of STAT_KEYS) out[k] = Math.round(sum[k] / players.length);
    return out;
};

export type TeamRating = {
    overall: number;
    stats: PlayerStats;
    starters: number;
    requiredStarters: number;
};

// Team OVR is the average of the slot-specific OVRs of the eleven starters.
// Empty slots count as zero so a half-filled team rates honestly.
export const computeTeamRating = (team: Team, formation: Formation): TeamRating => {
    const playerById: Record<string, Player> = {};
    for (const p of team.roster) playerById[p.id] = p;

    const starters: Player[] = [];
    let ovrSum = 0;
    for (const slot of formation.slots) {
        const id = team.assignments[slot.id];
        if (!id) continue;
        const player = playerById[id];
        if (!player) continue;
        starters.push(player);
        ovrSum += computeOverall(player.stats, slot.role);
    }

    const requiredStarters = formation.slots.length;
    const overall =
        requiredStarters === 0 ? 0 : Math.round(ovrSum / requiredStarters);
    const stats = averageStats(starters) ?? { ...DEFAULT_STATS };

    return {
        overall,
        stats,
        starters: starters.length,
        requiredStarters,
    };
};

// FIFA-style tier coloring for stat values.
export type StatTier = "elite" | "great" | "good" | "ok" | "weak";

export const statTier = (value: number): StatTier => {
    if (value >= 90) return "elite";
    if (value >= 80) return "great";
    if (value >= 70) return "good";
    if (value >= 60) return "ok";
    return "weak";
};
