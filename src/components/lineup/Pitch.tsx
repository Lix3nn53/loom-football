"use client";

import { useState } from "react";

import {
    getActiveDrag,
    isPlayerDragActive,
    setActiveDrag,
} from "@/lib/drag-state";
import type { Formation, Player } from "@/types/team";

type PitchProps = {
    formation: Formation;
    assignments: Record<string, string | null>;
    playerById: Record<string, Player | undefined>;
    selectedPlayerId: string | null;
    onSlotClick: (slotId: string) => void;
    onSlotPlayerClick: (slotId: string) => void;
    onSlotPlayerRemove?: (slotId: string) => void;
    onSlotDrop?: (
        playerId: string,
        targetSlot: string,
        sourceSlot: string | null,
    ) => void;
    teamColor: string;
};

export const Pitch = ({
    formation,
    assignments,
    playerById,
    selectedPlayerId,
    onSlotClick,
    onSlotPlayerClick,
    onSlotPlayerRemove,
    onSlotDrop,
    teamColor,
}: PitchProps) => {
    const [dragOverSlot, setDragOverSlot] = useState<string | null>(null);

    return (
        <div className="pitch-wrapper">
            <div
                className="pitch relative w-full h-full overflow-hidden rounded-lg shadow-lg ring-1 ring-black/20"
                role="region"
                aria-label="Futbol sahası">
                <PitchMarkings />
                {formation.slots.map((s) => {
                    const playerId = assignments[s.id];
                    const player = playerId ? playerById[playerId] : undefined;
                    const filled = !!player;
                    const ready =
                        (!!selectedPlayerId && !filled) ||
                        dragOverSlot === s.id;
                    const isPicked =
                        filled && selectedPlayerId === playerId;
                    const activate = () =>
                        filled ? onSlotPlayerClick(s.id) : onSlotClick(s.id);
                    return (
                        <div
                            key={s.id}
                            role="button"
                            tabIndex={0}
                            className="pitch-slot"
                            data-ready={ready ? "" : undefined}
                            data-filled={filled ? "" : undefined}
                            data-picked={isPicked ? "" : undefined}
                            style={{ left: `${s.x}%`, top: `${s.y}%` }}
                            draggable={filled && !!onSlotDrop}
                            onDragStart={(e) => {
                                if (!filled || !player || !onSlotDrop) return;
                                setActiveDrag({
                                    playerId: player.id,
                                    sourceSlot: s.id,
                                });
                                e.dataTransfer.effectAllowed = "move";
                                e.dataTransfer.setData("text/plain", player.id);
                            }}
                            onDragEnd={() => setActiveDrag(null)}
                            onDragEnter={(e) => {
                                if (!onSlotDrop || !isPlayerDragActive()) return;
                                e.preventDefault();
                            }}
                            onDragOver={(e) => {
                                if (!onSlotDrop || !isPlayerDragActive()) return;
                                e.preventDefault();
                                e.dataTransfer.dropEffect = "move";
                                if (dragOverSlot !== s.id) setDragOverSlot(s.id);
                            }}
                            onDragLeave={() => {
                                if (dragOverSlot === s.id) setDragOverSlot(null);
                            }}
                            onDrop={(e) => {
                                if (!onSlotDrop) return;
                                const drag = getActiveDrag();
                                if (!drag) return;
                                e.preventDefault();
                                e.stopPropagation();
                                setDragOverSlot(null);
                                onSlotDrop(drag.playerId, s.id, drag.sourceSlot);
                                setActiveDrag(null);
                            }}
                            onClick={activate}
                            onKeyDown={(e) => {
                                if (e.key === "Enter" || e.key === " ") {
                                    e.preventDefault();
                                    activate();
                                }
                            }}
                            aria-label={
                                filled
                                    ? isPicked
                                        ? `${player!.name}, ${s.role}, seçili — iptal için tıkla`
                                        : selectedPlayerId
                                          ? `${player!.name}, ${s.role}, takas için tıkla`
                                          : `${player!.name}, ${s.role}, almak için tıkla`
                                    : selectedPlayerId
                                      ? `Boş ${s.role} pozisyonu, yerleştirmek için tıkla`
                                      : `Boş ${s.role} pozisyonu`
                            }>
                            {filled ? (
                                <span
                                    className={`player-token ${player!.photoUrl ? "has-photo" : ""} ${isPicked ? "selected" : ""}`}
                                    style={{
                                        backgroundColor: teamColor,
                                        backgroundImage: player!.photoUrl
                                            ? `url(${player!.photoUrl})`
                                            : undefined,
                                    }}>
                                    <span className="player-token-num">
                                        {player!.number}
                                    </span>
                                    <span className="player-token-name">
                                        {player!.name}
                                    </span>
                                    {onSlotPlayerRemove && (
                                        <span
                                            role="button"
                                            tabIndex={0}
                                            className="player-token-remove"
                                            aria-label={`${player!.name} oyuncusunu kaldır`}
                                            title="Sahadan kaldır"
                                            onClick={(e) => {
                                                e.stopPropagation();
                                                onSlotPlayerRemove(s.id);
                                            }}
                                            onKeyDown={(e) => {
                                                if (e.key === "Enter" || e.key === " ") {
                                                    e.preventDefault();
                                                    e.stopPropagation();
                                                    onSlotPlayerRemove(s.id);
                                                }
                                            }}
                                            onMouseDown={(e) => e.stopPropagation()}
                                            draggable={false}>
                                            <span className="iconify lucide--x size-3" />
                                        </span>
                                    )}
                                </span>
                            ) : (
                                <span className="empty-slot">
                                    <span className="empty-slot-role">{s.role}</span>
                                </span>
                            )}
                        </div>
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
        <rect x="0" y="0" width="68" height="105" className="pitch-line" />
        <line x1="0" y1="52.5" x2="68" y2="52.5" className="pitch-line" />
        <circle cx="34" cy="52.5" r="9.15" className="pitch-line" />
        <circle cx="34" cy="52.5" r="0.3" className="pitch-dot" />

        <rect x="13.84" y="0" width="40.32" height="16.5" className="pitch-line" />
        <rect x="24.84" y="0" width="18.32" height="5.5" className="pitch-line" />
        <circle cx="34" cy="11" r="0.3" className="pitch-dot" />
        <path
            d="M 26.687 16.5 A 9.15 9.15 0 0 0 41.313 16.5"
            className="pitch-line"
            fill="none"
        />
        <path d="M 0 1 A 1 1 0 0 0 1 0" className="pitch-line" fill="none" />
        <path d="M 67 0 A 1 1 0 0 0 68 1" className="pitch-line" fill="none" />
        <rect
            x="30.34"
            y="-1.6"
            width="7.32"
            height="1.6"
            className="pitch-line"
        />

        <rect x="13.84" y="88.5" width="40.32" height="16.5" className="pitch-line" />
        <rect x="24.84" y="99.5" width="18.32" height="5.5" className="pitch-line" />
        <circle cx="34" cy="94" r="0.3" className="pitch-dot" />
        <path
            d="M 26.687 88.5 A 9.15 9.15 0 0 0 41.313 88.5"
            className="pitch-line"
            fill="none"
        />
        <path d="M 1 105 A 1 1 0 0 0 0 104" className="pitch-line" fill="none" />
        <path d="M 68 104 A 1 1 0 0 0 67 105" className="pitch-line" fill="none" />
        <rect
            x="30.34"
            y="105"
            width="7.32"
            height="1.6"
            className="pitch-line"
        />
    </svg>
);
