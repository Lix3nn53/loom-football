"use client";

import { useState } from "react";

import { OvrBadge } from "@/components/lineup/PlayerCard";
import { getActiveDrag, setActiveDrag } from "@/lib/drag-state";
import { bestPosition } from "@/lib/player-stats";
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

type RosterRowProps = {
    player: Player;
    selected: boolean;
    selectable: boolean;
    rowsDraggable: boolean;
    slotByPlayerId?: Record<string, string>;
    teamColor?: string;
    onSelect: (id: string | null) => void;
    onRemove: (id: string) => void;
    removeIcon: string;
    getRemoveLabel: (name: string) => string;
    onEdit?: (player: Player) => void;
};

const RosterRow = ({
    player: p,
    selected,
    selectable,
    rowsDraggable,
    slotByPlayerId,
    teamColor,
    onSelect,
    onRemove,
    removeIcon,
    getRemoveLabel,
    onEdit,
}: RosterRowProps) => {
    const { position, overall } = bestPosition(p.stats);

    return (
        <li
            className={`flex items-center gap-2 py-1.5 px-2 rounded-box transition-colors min-w-0 ${
                selected
                    ? "bg-primary/10 outline outline-primary"
                    : "hover:bg-base-200"
            } ${selectable ? "cursor-pointer group" : "group"}`}
            draggable={rowsDraggable}
            onDragStart={(e) => {
                if (!rowsDraggable) return;
                setActiveDrag({
                    playerId: p.id,
                    sourceSlot: slotByPlayerId?.[p.id] ?? null,
                });
                e.dataTransfer.effectAllowed = "move";
                e.dataTransfer.setData("text/plain", p.id);
            }}
            onDragEnd={() => setActiveDrag(null)}
            onClick={() => selectable && onSelect(selected ? null : p.id)}
            role={selectable ? "button" : undefined}
            tabIndex={selectable ? 0 : -1}
            onKeyDown={(e) => {
                if (selectable && (e.key === "Enter" || e.key === " ")) {
                    e.preventDefault();
                    onSelect(selected ? null : p.id);
                }
            }}>
            <div
                className={`size-9 shrink-0 rounded-full overflow-hidden ${
                    p.photoUrl ? "" : "poster-photo"
                }`}
                style={{
                    backgroundColor: teamColor ?? "#888",
                    backgroundImage: p.photoUrl ? `url(${p.photoUrl})` : undefined,
                    backgroundSize: "cover",
                    backgroundPosition: "center",
                }}
            />
            <OvrBadge value={overall} size="xs" label={position} showLabel />
            <div className="grow min-w-0">
                <div className="flex items-center gap-1.5 min-w-0">
                    <span className="truncate text-sm font-medium">{p.name}</span>
                    <span className="text-[11px] text-base-content/50 font-normal shrink-0">
                        #{p.number}
                    </span>
                </div>
            </div>
            {onEdit && (
                <button
                    type="button"
                    onClick={(e) => {
                        e.stopPropagation();
                        onEdit(p);
                    }}
                    className="btn btn-ghost btn-sm btn-square shrink-0"
                    aria-label={`${p.name} oyuncusunu düzenle`}
                    title="Düzenle">
                    <span className="iconify lucide--pencil size-4" />
                </button>
            )}
            <button
                type="button"
                onClick={(e) => {
                    e.stopPropagation();
                    onRemove(p.id);
                }}
                className="btn btn-ghost btn-sm btn-square shrink-0"
                aria-label={getRemoveLabel(p.name)}
                title={getRemoveLabel(p.name)}>
                <span className={`iconify ${removeIcon} size-4`} />
            </button>
        </li>
    );
};
