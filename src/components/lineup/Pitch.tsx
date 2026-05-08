"use client";

import type { Formation, Player } from "@/types/team";

type PitchProps = {
    formation: Formation;
    assignments: Record<string, string | null>;
    playerById: Record<string, Player | undefined>;
    selectedPlayerId: string | null;
    onSlotClick: (slotId: string) => void;
    onSlotPlayerClick: (slotId: string) => void;
    teamColor: string;
};

export const Pitch = ({
    formation,
    assignments,
    playerById,
    selectedPlayerId,
    onSlotClick,
    onSlotPlayerClick,
    teamColor,
}: PitchProps) => {
    return (
        <div className="pitch-wrapper">
            <div className="pitch" role="region" aria-label="Football pitch">
                <PitchMarkings />
                {formation.slots.map((s) => {
                    const playerId = assignments[s.id];
                    const player = playerId ? playerById[playerId] : undefined;
                    const filled = !!player;
                    return (
                        <button
                            key={s.id}
                            type="button"
                            className={`pitch-slot ${filled ? "filled" : ""} ${
                                selectedPlayerId && !filled ? "ready" : ""
                            }`}
                            style={{ left: `${s.x}%`, top: `${s.y}%` }}
                            onClick={() => (filled ? onSlotPlayerClick(s.id) : onSlotClick(s.id))}
                            aria-label={
                                filled
                                    ? `${player!.name}, ${s.role}, click to remove`
                                    : `Empty ${s.role} slot`
                            }>
                            {filled ? (
                                <span
                                    className="player-token"
                                    style={{ backgroundColor: teamColor }}>
                                    <span className="player-token-num">{player!.number}</span>
                                    <span className="player-token-name">{player!.name}</span>
                                </span>
                            ) : (
                                <span className="empty-slot">
                                    <span className="empty-slot-role">{s.role}</span>
                                </span>
                            )}
                        </button>
                    );
                })}
            </div>
        </div>
    );
};

const PitchMarkings = () => (
    <svg
        className="pitch-markings"
        viewBox="0 0 100 100"
        preserveAspectRatio="none"
        aria-hidden="true">
        <rect x="1" y="1" width="98" height="98" className="pitch-line" />
        <line x1="1" y1="50" x2="99" y2="50" className="pitch-line" />
        <circle cx="50" cy="50" r="9" className="pitch-line" />
        <circle cx="50" cy="50" r="0.7" className="pitch-dot" />
        <rect x="28" y="1" width="44" height="14" className="pitch-line" />
        <rect x="38" y="1" width="24" height="6" className="pitch-line" />
        <circle cx="50" cy="11" r="0.7" className="pitch-dot" />
        <path d="M 38 15 A 12 12 0 0 0 62 15" className="pitch-line" fill="none" />
        <rect x="28" y="85" width="44" height="14" className="pitch-line" />
        <rect x="38" y="93" width="24" height="6" className="pitch-line" />
        <circle cx="50" cy="89" r="0.7" className="pitch-dot" />
        <path d="M 38 85 A 12 12 0 0 1 62 85" className="pitch-line" fill="none" />
    </svg>
);
