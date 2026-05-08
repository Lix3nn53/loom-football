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
            <div
                className="pitch relative w-full h-full overflow-hidden rounded-lg shadow-lg ring-1 ring-black/20"
                role="region"
                aria-label="Football pitch">
                <PitchMarkings />
                {formation.slots.map((s) => {
                    const playerId = assignments[s.id];
                    const player = playerId ? playerById[playerId] : undefined;
                    const filled = !!player;
                    const ready = !!selectedPlayerId && !filled;
                    return (
                        <button
                            key={s.id}
                            type="button"
                            className="pitch-slot"
                            data-ready={ready ? "" : undefined}
                            data-filled={filled ? "" : undefined}
                            style={{ left: `${s.x}%`, top: `${s.y}%` }}
                            onClick={() =>
                                filled ? onSlotPlayerClick(s.id) : onSlotClick(s.id)
                            }
                            aria-label={
                                filled
                                    ? `${player!.name}, ${s.role}, click to remove`
                                    : `Empty ${s.role} slot`
                            }>
                            {filled ? (
                                <span
                                    className="player-token"
                                    style={{ backgroundColor: teamColor }}>
                                    <span className="player-token-num">
                                        {player!.number}
                                    </span>
                                    <span className="player-token-name">
                                        {player!.name}
                                    </span>
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
        className="pitch-markings absolute inset-0 w-full h-full pointer-events-none"
        viewBox="0 0 68 105"
        preserveAspectRatio="xMidYMid meet"
        aria-hidden="true">
        {/* Outer touchline */}
        <rect x="0" y="0" width="68" height="105" className="pitch-line" />
        {/* Halfway line */}
        <line x1="0" y1="52.5" x2="68" y2="52.5" className="pitch-line" />
        {/* Center circle + spot */}
        <circle cx="34" cy="52.5" r="9.15" className="pitch-line" />
        <circle cx="34" cy="52.5" r="0.3" className="pitch-dot" />

        {/* Top half (away goal at y=0) */}
        <rect x="13.84" y="0" width="40.32" height="16.5" className="pitch-line" />
        <rect x="24.84" y="0" width="18.32" height="5.5" className="pitch-line" />
        <circle cx="34" cy="11" r="0.3" className="pitch-dot" />
        <path
            d="M 26.687 16.5 A 9.15 9.15 0 0 0 41.313 16.5"
            className="pitch-line"
            fill="none"
        />
        {/* Top corner arcs */}
        <path d="M 0 1 A 1 1 0 0 0 1 0" className="pitch-line" fill="none" />
        <path d="M 67 0 A 1 1 0 0 0 68 1" className="pitch-line" fill="none" />
        {/* Top goal */}
        <rect
            x="30.34"
            y="-1.6"
            width="7.32"
            height="1.6"
            className="pitch-line"
        />

        {/* Bottom half (home goal at y=105) */}
        <rect x="13.84" y="88.5" width="40.32" height="16.5" className="pitch-line" />
        <rect x="24.84" y="99.5" width="18.32" height="5.5" className="pitch-line" />
        <circle cx="34" cy="94" r="0.3" className="pitch-dot" />
        <path
            d="M 26.687 88.5 A 9.15 9.15 0 0 0 41.313 88.5"
            className="pitch-line"
            fill="none"
        />
        {/* Bottom corner arcs */}
        <path d="M 1 105 A 1 1 0 0 0 0 104" className="pitch-line" fill="none" />
        <path d="M 68 104 A 1 1 0 0 0 67 105" className="pitch-line" fill="none" />
        {/* Bottom goal */}
        <rect
            x="30.34"
            y="105"
            width="7.32"
            height="1.6"
            className="pitch-line"
        />
    </svg>
);
