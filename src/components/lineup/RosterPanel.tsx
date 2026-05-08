"use client";

import { useState } from "react";

import type { Player, Position } from "@/types/team";
import { POSITION_LABEL, ROLE_COLORS } from "@/lib/team-defaults";

type RosterPanelProps = {
    roster: Player[];
    benchIds: string[];
    selectedPlayerId: string | null;
    onSelectPlayer: (id: string | null) => void;
    onAddPlayer: (data: { name: string; number: number; role: Position }) => void;
    onRemovePlayer: (id: string) => void;
    onUpdatePlayer: (id: string, changes: Partial<Player>) => void;
};

const ROLES: Position[] = ["GK", "DEF", "MID", "FWD"];

export const RosterPanel = ({
    roster,
    benchIds,
    selectedPlayerId,
    onSelectPlayer,
    onAddPlayer,
    onRemovePlayer,
}: RosterPanelProps) => {
    const [name, setName] = useState("");
    const [number, setNumber] = useState<number>(15);
    const [role, setRole] = useState<Position>("MID");

    const benchSet = new Set(benchIds);
    const benchPlayers = roster.filter((p) => benchSet.has(p.id));
    const onPitchPlayers = roster.filter((p) => !benchSet.has(p.id));

    const submit = () => {
        const trimmed = name.trim();
        if (!trimmed) return;
        onAddPlayer({ name: trimmed, number, role });
        setName("");
        setNumber((n) => n + 1);
    };

    return (
        <div className="card bg-base-100 border border-base-300 h-full overflow-hidden">
            <div className="card-body p-4 gap-3 flex flex-col h-full">
                <div className="flex items-center justify-between">
                    <h2 className="card-title text-lg">
                        <span className="iconify lucide--users size-5" />
                        Squad
                    </h2>
                    <span className="badge badge-ghost text-xs">
                        {roster.length} players
                    </span>
                </div>

                <div className="flex flex-col gap-2 rounded-box bg-base-200 p-3">
                    <div className="text-xs font-medium text-base-content/70">Add player</div>
                    <input
                        type="text"
                        placeholder="Player name"
                        value={name}
                        onChange={(e) => setName(e.target.value)}
                        onKeyDown={(e) => {
                            if (e.key === "Enter") submit();
                        }}
                        className="input input-sm w-full"
                    />
                    <div className="flex gap-2">
                        <input
                            type="number"
                            min={1}
                            max={99}
                            value={number}
                            onChange={(e) => setNumber(Number(e.target.value) || 0)}
                            className="input input-sm w-20 no-spinner"
                            aria-label="Jersey number"
                        />
                        <select
                            value={role}
                            onChange={(e) => setRole(e.target.value as Position)}
                            className="select select-sm flex-1">
                            {ROLES.map((r) => (
                                <option key={r} value={r}>
                                    {POSITION_LABEL[r]}
                                </option>
                            ))}
                        </select>
                        <button
                            type="button"
                            onClick={submit}
                            disabled={!name.trim()}
                            className="btn btn-sm btn-primary"
                            aria-label="Add player">
                            <span className="iconify lucide--plus size-4" />
                        </button>
                    </div>
                </div>

                <div className="flex flex-col gap-3 grow overflow-auto">
                    <RosterList
                        title="Bench"
                        icon="lucide--armchair"
                        players={benchPlayers}
                        selectedId={selectedPlayerId}
                        emptyHint={
                            roster.length === 0
                                ? "Add a player to get started."
                                : "Everyone is on the pitch."
                        }
                        onSelect={onSelectPlayer}
                        onRemove={onRemovePlayer}
                        selectable
                    />
                    <RosterList
                        title="On the pitch"
                        icon="lucide--circle-check"
                        players={onPitchPlayers}
                        selectedId={null}
                        emptyHint="No one assigned yet."
                        onSelect={() => {}}
                        onRemove={onRemovePlayer}
                        selectable={false}
                    />
                </div>
            </div>
        </div>
    );
};

type RosterListProps = {
    title: string;
    icon: string;
    players: Player[];
    selectedId: string | null;
    emptyHint: string;
    onSelect: (id: string | null) => void;
    onRemove: (id: string) => void;
    selectable: boolean;
};

const RosterList = ({
    title,
    icon,
    players,
    selectedId,
    emptyHint,
    onSelect,
    onRemove,
    selectable,
}: RosterListProps) => (
    <div className="flex flex-col gap-1">
        <div className="flex items-center justify-between px-1 pb-1 border-b border-base-200">
            <span className="text-xs uppercase tracking-wide text-base-content/60 inline-flex items-center gap-1">
                <span className={`iconify ${icon} size-3.5`} />
                {title}
            </span>
            <span className="text-xs text-base-content/50">{players.length}</span>
        </div>
        {players.length === 0 ? (
            <div className="text-xs text-base-content/50 py-2 px-1">{emptyHint}</div>
        ) : (
            <ul className="flex flex-col gap-1">
                {players.map((p) => {
                    const selected = selectable && selectedId === p.id;
                    return (
                        <li key={p.id}>
                            <div
                                className={`group flex items-center gap-2 rounded-box border px-2 py-1.5 transition-colors ${
                                    selected
                                        ? "border-primary bg-primary/10"
                                        : "border-base-200 hover:bg-base-200"
                                } ${selectable ? "cursor-pointer" : ""}`}
                                onClick={() =>
                                    selectable && onSelect(selected ? null : p.id)
                                }
                                role={selectable ? "button" : undefined}
                                tabIndex={selectable ? 0 : -1}
                                onKeyDown={(e) => {
                                    if (selectable && (e.key === "Enter" || e.key === " ")) {
                                        e.preventDefault();
                                        onSelect(selected ? null : p.id);
                                    }
                                }}>
                                <span
                                    className="flex size-7 shrink-0 items-center justify-center rounded-full text-xs font-bold text-black"
                                    style={{ backgroundColor: ROLE_COLORS[p.role] }}>
                                    {p.number}
                                </span>
                                <div className="flex-1 min-w-0">
                                    <div className="truncate text-sm font-medium">
                                        {p.name}
                                    </div>
                                    <div className="text-[10px] text-base-content/60">
                                        {POSITION_LABEL[p.role]}
                                    </div>
                                </div>
                                <button
                                    type="button"
                                    onClick={(e) => {
                                        e.stopPropagation();
                                        onRemove(p.id);
                                    }}
                                    className="btn btn-ghost btn-xs btn-square opacity-0 group-hover:opacity-100 focus:opacity-100"
                                    aria-label={`Remove ${p.name}`}>
                                    <span className="iconify lucide--x size-3.5" />
                                </button>
                            </div>
                        </li>
                    );
                })}
            </ul>
        )}
    </div>
);
