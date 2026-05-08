export type Position = "GK" | "DEF" | "MID" | "FWD";

export type Player = {
    id: string;
    name: string;
    number: number;
    photoUrl?: string;
};

export type FormationKey = "4-4-2" | "4-3-3" | "4-2-3-1" | "3-5-2" | "3-4-3" | "5-3-2";

export type SlotPosition = {
    id: string;
    role: Position;
    x: number;
    y: number;
};

export type Formation = {
    key: FormationKey;
    label: string;
    slots: SlotPosition[];
};

export type Team = {
    name: string;
    color: string;
    formation: FormationKey;
    roster: Player[];
    assignments: Record<string, string | null>;
};

export type Side = "red" | "blue";

export type Match = {
    red: Team;
    blue: Team;
    activeSide: Side;
};
