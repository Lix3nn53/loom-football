"use client";

import { OvrBadge } from "@/components/lineup/PlayerCard";
import { setActiveDrag } from "@/lib/drag-state";
import { bestPosition } from "@/lib/player-stats";
import type { Player } from "@/types/team";

export type RosterRowProps = {
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

export const RosterRow = ({
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
            className={`flex items-center gap-1.5 py-1.5 px-2 rounded-box transition-colors min-w-0 ${
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
            <OvrBadge value={overall} size="xs" label={position} />
            <div className="grow min-w-0">
                <div className="flex items-center gap-1.5 min-w-0">
                    <span className="truncate text-sm font-medium" title={`${p.name} · ${position}`}>
                        {p.name}
                    </span>
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
                    className="btn btn-ghost btn-xs btn-square shrink-0"
                    aria-label={`${p.name} oyuncusunu düzenle`}
                    title="Düzenle">
                    <span className="iconify lucide--pencil size-3.5" />
                </button>
            )}
            <button
                type="button"
                onClick={(e) => {
                    e.stopPropagation();
                    onRemove(p.id);
                }}
                className="btn btn-ghost btn-xs btn-square shrink-0"
                aria-label={getRemoveLabel(p.name)}
                title={getRemoveLabel(p.name)}>
                <span className={`iconify ${removeIcon} size-3.5`} />
            </button>
        </li>
    );
};
