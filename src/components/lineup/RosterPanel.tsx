"use client";

import { useState } from "react";

import type { Player } from "@/types/team";

type RosterPanelProps = {
    roster: Player[];
    benchIds: string[];
    selectedPlayerId: string | null;
    onSelectPlayer: (id: string | null) => void;
    onAddPlayer: (data: { name: string; number: number }) => void;
    onRemovePlayer: (id: string) => void;
    onUpdatePlayer: (id: string, changes: Partial<Player>) => void;
    onMoveToOtherTeam?: (id: string) => void;
    teamName?: string;
    teamColor?: string;
    otherTeamName?: string;
};

export const RosterPanel = ({
    roster,
    benchIds,
    selectedPlayerId,
    onSelectPlayer,
    onAddPlayer,
    onRemovePlayer,
    onMoveToOtherTeam,
    teamName,
    teamColor,
    otherTeamName,
}: RosterPanelProps) => {
    const [name, setName] = useState("");
    const [number, setNumber] = useState<number>(15);

    const benchSet = new Set(benchIds);
    const benchPlayers = roster.filter((p) => benchSet.has(p.id));
    const onPitchPlayers = roster.filter((p) => !benchSet.has(p.id));

    const submit = () => {
        const trimmed = name.trim();
        if (!trimmed) return;
        const clamped = Math.max(1, Math.min(99, number || 1));
        onAddPlayer({ name: trimmed, number: clamped });
        setName("");
        setNumber((n) => Math.min(99, (n || 0) + 1));
    };

    return (
        <div className="card card-border bg-base-100 h-full overflow-hidden">
            <div className="card-body p-4 gap-3 flex flex-col h-full">
                <div className="flex items-center justify-between">
                    <h2 className="card-title text-lg">
                        <span className="iconify lucide--users size-5" />
                        {teamName ? `${teamName} squad` : "Squad"}
                    </h2>
                    <span className="badge badge-ghost badge-sm">
                        {roster.length} players
                    </span>
                </div>

                <fieldset className="fieldset bg-base-200 rounded-box p-3">
                    <legend className="fieldset-legend">Add player</legend>
                    <div className="join w-full">
                        <input
                            type="text"
                            placeholder="Player name"
                            value={name}
                            onChange={(e) => setName(e.target.value)}
                            onKeyDown={(e) => {
                                if (e.key === "Enter") submit();
                            }}
                            className="input input-sm join-item flex-1"
                        />
                        <input
                            type="number"
                            min={1}
                            max={99}
                            value={number}
                            onChange={(e) => setNumber(Number(e.target.value) || 0)}
                            className="input input-sm join-item w-16 no-spinner"
                            aria-label="Jersey number"
                        />
                        <button
                            type="button"
                            onClick={submit}
                            disabled={!name.trim()}
                            className="btn btn-sm btn-primary join-item"
                            aria-label="Add player">
                            <span className="iconify lucide--plus size-4" />
                        </button>
                    </div>
                </fieldset>

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
                        onMoveToOtherTeam={onMoveToOtherTeam}
                        otherTeamName={otherTeamName}
                        teamColor={teamColor}
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
                        onMoveToOtherTeam={onMoveToOtherTeam}
                        otherTeamName={otherTeamName}
                        teamColor={teamColor}
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
    onMoveToOtherTeam?: (id: string) => void;
    otherTeamName?: string;
    teamColor?: string;
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
    onMoveToOtherTeam,
    otherTeamName,
    teamColor,
    selectable,
}: RosterListProps) => (
    <ul className="list bg-base-100">
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
            players.map((p) => {
                const selected = selectable && selectedId === p.id;
                return (
                    <li
                        key={p.id}
                        className={`list-row group items-center py-1.5 px-2 rounded-box transition-colors ${
                            selected
                                ? "bg-primary/10 outline outline-primary"
                                : "hover:bg-base-200"
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
                        <div className="avatar avatar-placeholder">
                            <div
                                className="size-7 rounded-full text-xs font-bold text-white"
                                style={{ backgroundColor: teamColor ?? "#888" }}>
                                {p.number}
                            </div>
                        </div>
                        <div className="list-col-grow min-w-0">
                            <div className="truncate text-sm font-medium">{p.name}</div>
                        </div>
                        {selected && onMoveToOtherTeam && otherTeamName && (
                            <button
                                type="button"
                                onClick={(e) => {
                                    e.stopPropagation();
                                    onMoveToOtherTeam(p.id);
                                }}
                                className="btn btn-ghost btn-xs gap-1"
                                aria-label={`Move ${p.name} to ${otherTeamName}`}
                                title={`Move to ${otherTeamName}`}>
                                <span className="iconify lucide--arrow-right-left size-3.5" />
                                <span className="hidden xl:inline">{otherTeamName}</span>
                            </button>
                        )}
                        <button
                            type="button"
                            onClick={(e) => {
                                e.stopPropagation();
                                onRemove(p.id);
                            }}
                            className={`btn btn-ghost btn-xs btn-square ${
                                selected ? "" : "opacity-0 group-hover:opacity-100 focus:opacity-100"
                            }`}
                            aria-label={`Remove ${p.name}`}>
                            <span className="iconify lucide--x size-3.5" />
                        </button>
                    </li>
                );
            })
        )}
    </ul>
);
