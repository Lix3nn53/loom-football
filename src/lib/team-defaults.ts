import { DEFAULT_STATS } from "@/lib/player-stats";
import type { Match, Player, PlayerStats, Side, Team } from "@/types/team";

// Team colors are fixed per side and not user-editable.
export const SIDE_COLORS: Record<Side, string> = {
    red: "#ef4444",
    blue: "#3b82f6",
};

const stats = (
    pac: number,
    sho: number,
    pas: number,
    dri: number,
    def: number,
    phy: number,
): PlayerStats => ({ pac, sho, pas, dri, def, phy });

// Archetype presets keyed off jersey number conventions: 1 = GK, 2-5 = back
// line, 6-8 = midfield, 7/9-11 = attack. Numbers are illustrative and tuned
// to feel like a balanced amateur side rather than peak FIFA cards.
const samplePlayer = (
    id: string,
    name: string,
    number: number,
    statset?: PlayerStats,
    photoUrl?: string,
): Player => ({
    id,
    name,
    number,
    stats: statset ?? { ...DEFAULT_STATS },
    ...(photoUrl ? { photoUrl } : {}),
});

const RED_ROSTER: Player[] = [
    samplePlayer("r1", "Ahmet K.", 1, stats(58, 30, 62, 55, 78, 80)),
    samplePlayer("r2", "Mehmet S.", 2, stats(78, 55, 70, 72, 80, 75)),
    samplePlayer("r3", "Burak T.", 4, stats(62, 48, 68, 64, 84, 82)),
    samplePlayer("r4", "Emre Y.", 5, stats(65, 50, 72, 68, 82, 80)),
    samplePlayer("r5", "Hakan A.", 3, stats(76, 52, 70, 71, 78, 74)),
    samplePlayer("r6", "Cem D.", 6, stats(70, 65, 80, 76, 76, 78)),
    samplePlayer("r7", "Onur B.", 8, stats(78, 72, 82, 80, 60, 70)),
    samplePlayer("r8", "Kaan O.", 10, stats(75, 84, 86, 88, 50, 65)),
    samplePlayer("r9", "Selim Z.", 7, stats(88, 78, 74, 84, 40, 64)),
    samplePlayer("r10", "Volkan E.", 9, stats(82, 88, 70, 80, 35, 78)),
    samplePlayer("r11", "Tolga M.", 11, stats(86, 76, 72, 82, 38, 62)),
    samplePlayer("r12", "Deniz P.", 12, stats(60, 35, 58, 55, 70, 72)),
    samplePlayer("r13", "Furkan H.", 13, stats(70, 60, 65, 68, 72, 70)),
    samplePlayer("r14", "Berk N.", 14, stats(74, 68, 70, 72, 60, 68)),
];

const BLUE_ROSTER: Player[] = [
    samplePlayer("b1", "Alex", 1, stats(60, 32, 64, 58, 80, 82)),
    samplePlayer("b2", "Sam", 2, stats(80, 56, 72, 74, 78, 74)),
    samplePlayer("b3", "Jordan", 4, stats(60, 45, 66, 62, 86, 84)),
    samplePlayer("b4", "Casey", 5, stats(64, 48, 70, 66, 84, 82)),
    samplePlayer("b5", "Pat", 3, stats(78, 54, 72, 73, 80, 72)),
    samplePlayer("b6", "Riley", 6, stats(72, 66, 82, 78, 78, 76)),
    samplePlayer("b7", "Robin", 8, stats(80, 74, 84, 82, 58, 68)),
    samplePlayer("b8", "Jamie", 10, stats(76, 86, 88, 90, 48, 62)),
    samplePlayer("b9", "Morgan", 7, stats(90, 80, 76, 86, 38, 62)),
    samplePlayer("b10", "Drew", 9, stats(80, 90, 72, 82, 32, 80)),
    samplePlayer("b11", "Quinn", 11, stats(88, 78, 74, 84, 36, 60)),
    samplePlayer("b12", "Avery", 12, stats(58, 33, 60, 56, 72, 74)),
    samplePlayer("b13", "Reese", 13, stats(72, 62, 66, 70, 70, 72)),
    samplePlayer("b14", "Harper", 14, stats(76, 70, 72, 74, 58, 66)),
];

export const DEFAULT_RED_TEAM: Team = {
    name: "Kırmızılar",
    formation: "4-3-3",
    roster: RED_ROSTER,
    assignments: {},
};

export const DEFAULT_BLUE_TEAM: Team = {
    name: "Maviler",
    formation: "4-3-3",
    roster: BLUE_ROSTER,
    assignments: {},
};

export const DEFAULT_MATCH: Match = {
    red: DEFAULT_RED_TEAM,
    blue: DEFAULT_BLUE_TEAM,
    activeSide: "red",
};
