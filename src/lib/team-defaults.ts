import type { Player, Position, Team } from "@/types/team";

export const ROLE_COLORS: Record<Position, string> = {
    GK: "#fde047",
    DEF: "#60a5fa",
    MID: "#34d399",
    FWD: "#f87171",
};

const samplePlayer = (id: string, name: string, number: number, role: Position): Player => ({
    id,
    name,
    number,
    role,
    color: ROLE_COLORS[role],
});

export const DEFAULT_ROSTER: Player[] = [
    samplePlayer("p1", "Ahmet K.", 1, "GK"),
    samplePlayer("p2", "Mehmet S.", 2, "DEF"),
    samplePlayer("p3", "Burak T.", 4, "DEF"),
    samplePlayer("p4", "Emre Y.", 5, "DEF"),
    samplePlayer("p5", "Hakan A.", 3, "DEF"),
    samplePlayer("p6", "Cem D.", 6, "MID"),
    samplePlayer("p7", "Onur B.", 8, "MID"),
    samplePlayer("p8", "Kaan O.", 10, "MID"),
    samplePlayer("p9", "Selim Z.", 7, "MID"),
    samplePlayer("p10", "Volkan E.", 9, "FWD"),
    samplePlayer("p11", "Tolga M.", 11, "FWD"),
    samplePlayer("p12", "Deniz P.", 12, "MID"),
    samplePlayer("p13", "Furkan H.", 13, "DEF"),
    samplePlayer("p14", "Berk N.", 14, "FWD"),
];

export const DEFAULT_TEAM: Team = {
    name: "Office FC",
    color: "#a78bfa",
    formation: "4-3-3",
    roster: DEFAULT_ROSTER,
    assignments: {},
};

export const POSITION_LABEL: Record<Position, string> = {
    GK: "Goalkeeper",
    DEF: "Defender",
    MID: "Midfielder",
    FWD: "Forward",
};
