"use client";

import { useState } from "react";

import { RosterRow } from "@/components/lineup/RosterRow";
import { getActiveDrag, setActiveDrag } from "@/lib/drag-state";
import type { Player } from "@/types/team";

export type RosterListProps = {
    title: string;
    icon: string;
    players: Player[];
    selectedId: string | null;
    emptyHint: string;
    onSelect: (id: string | null) => void;
    onRemove: (id: string) => void;
    removeIcon?: string;
    getRemoveLabel?: (name: string) => string;
    onEdit?: (player: Player) => void;
    onPlacePlayer?: (
        playerId: string,
        targetSlot: string | null,
        sourceSlot: string | null,
    ) => void;
    slotByPlayerId?: Record<string, string>;
    teamColor?: string;
    selectable: boolean;
    draggable?: boolean;
    droppable?: boolean;
};

export const RosterList = ({
    title,
    icon,
    players,
    selectedId,
    emptyHint,
    onSelect,
    onRemove,
    removeIcon = "lucide--x",
    getRemoveLabel = (name) => `${name} oyuncusunu sil`,
    onEdit,
    onPlacePlayer,
    slotByPlayerId,
    teamColor,
    selectable,
    draggable: rowsDraggable = false,
    droppable = false,
}: RosterListProps) => {
    const [dragHover, setDragHover] = useState(false);

    const isFromSlot = () => {
        const drag = getActiveDrag();
        return !!drag && drag.sourceSlot !== null;
    };

    return (
        <ul
            className={`list bg-base-100 rounded-box transition-colors ${
                dragHover
                    ? "outline outline-2 outline-dashed outline-primary/60 bg-primary/5"
                    : ""
            }`}
            onDragEnter={(e) => {
                if (!droppable || !onPlacePlayer) return;
                if (!isFromSlot()) return;
                e.preventDefault();
            }}
            onDragOver={(e) => {
                if (!droppable || !onPlacePlayer) return;
                if (!isFromSlot()) return;
                e.preventDefault();
                e.dataTransfer.dropEffect = "move";
                if (!dragHover) setDragHover(true);
            }}
            onDragLeave={() => {
                if (dragHover) setDragHover(false);
            }}
            onDrop={(e) => {
                if (!droppable || !onPlacePlayer) return;
                const drag = getActiveDrag();
                if (!drag || !drag.sourceSlot) return;
                e.preventDefault();
                e.stopPropagation();
                setDragHover(false);
                onPlacePlayer(drag.playerId, null, drag.sourceSlot);
                setActiveDrag(null);
            }}>
            <li className="p-1 pb-2 text-xs uppercase tracking-wide text-base-content/60 flex items-center justify-between border-b border-base-200">
                <span className="inline-flex items-center gap-1">
                    <span className={`iconify ${icon} size-3.5`} />
                    {title}
                </span>
                <span className="text-base-content/50 normal-case tracking-normal">
                    {players.length}
                </span>
            </li>
            {players.length === 0 ? (
                <li className="text-xs text-base-content/50 py-2 px-1">{emptyHint}</li>
            ) : (
                players.map((p) => (
                    <RosterRow
                        key={p.id}
                        player={p}
                        selected={selectable && selectedId === p.id}
                        selectable={selectable}
                        rowsDraggable={rowsDraggable}
                        slotByPlayerId={slotByPlayerId}
                        teamColor={teamColor}
                        onSelect={onSelect}
                        onRemove={onRemove}
                        removeIcon={removeIcon}
                        getRemoveLabel={getRemoveLabel}
                        onEdit={onEdit}
                    />
                ))
            )}
        </ul>
    );
};
