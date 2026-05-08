import type { Match, Player, Team } from "@/types/team";

const samplePlayer = (
    id: string,
    name: string,
    number: number,
    photoUrl?: string,
): Player => ({
    id,
    name,
    number,
    ...(photoUrl ? { photoUrl } : {}),
});

const RED_ROSTER: Player[] = [
    samplePlayer("r1", "Ahmet K.", 1),
    samplePlayer("r2", "Mehmet S.", 2),
    samplePlayer("r3", "Burak T.", 4),
    samplePlayer("r4", "Emre Y.", 5),
    samplePlayer("r5", "Hakan A.", 3),
    samplePlayer("r6", "Cem D.", 6),
    samplePlayer("r7", "Onur B.", 8),
    samplePlayer("r8", "Kaan O.", 10),
    samplePlayer("r9", "Selim Z.", 7),
    samplePlayer("r10", "Volkan E.", 9),
    samplePlayer("r11", "Tolga M.", 11),
    samplePlayer("r12", "Deniz P.", 12),
    samplePlayer("r13", "Furkan H.", 13),
    samplePlayer("r14", "Berk N.", 14),
];

const BLUE_ROSTER: Player[] = [
    samplePlayer("b1", "Alex", 1),
    samplePlayer("b2", "Sam", 2),
    samplePlayer("b3", "Jordan", 4),
    samplePlayer("b4", "Casey", 5),
    samplePlayer("b5", "Pat", 3),
    samplePlayer("b6", "Riley", 6),
    samplePlayer("b7", "Robin", 8),
    samplePlayer("b8", "Jamie", 10),
    samplePlayer("b9", "Morgan", 7),
    samplePlayer("b10", "Drew", 9),
    samplePlayer("b11", "Quinn", 11),
    samplePlayer("b12", "Avery", 12),
    samplePlayer("b13", "Reese", 13),
    samplePlayer("b14", "Harper", 14),
];

export const DEFAULT_RED_TEAM: Team = {
    name: "Kırmızılar",
    color: "#ef4444",
    formation: "4-3-3",
    roster: RED_ROSTER,
    assignments: {},
};

export const DEFAULT_BLUE_TEAM: Team = {
    name: "Maviler",
    color: "#3b82f6",
    formation: "4-3-3",
    roster: BLUE_ROSTER,
    assignments: {},
};

export const DEFAULT_MATCH: Match = {
    red: DEFAULT_RED_TEAM,
    blue: DEFAULT_BLUE_TEAM,
    activeSide: "red",
};
