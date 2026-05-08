"use client";

import { useEffect, useState } from "react";

import { getActiveDrag, setActiveDrag } from "@/lib/drag-state";
import type { Player } from "@/types/team";

type RosterPanelProps = {
    roster: Player[];
    benchIds: string[];
    slotByPlayerId?: Record<string, string>;
    selectedPlayerId: string | null;
    onSelectPlayer: (id: string | null) => void;
    onAddPlayer: (data: {
        name: string;
        number: number;
        photoUrl?: string;
    }) => void;
    onRemovePlayer: (id: string) => void;
    onUpdatePlayer: (id: string, changes: Partial<Player>) => void;
    onMoveToOtherTeam?: (id: string) => void;
    onPlacePlayer?: (
        playerId: string,
        targetSlot: string | null,
        sourceSlot: string | null,
    ) => void;
    teamName?: string;
    teamColor?: string;
    otherTeamName?: string;
};

export const RosterPanel = ({
    roster,
    benchIds,
    slotByPlayerId,
    selectedPlayerId,
    onSelectPlayer,
    onAddPlayer,
    onRemovePlayer,
    onUpdatePlayer,
    onMoveToOtherTeam,
    onPlacePlayer,
    teamName,
    teamColor,
    otherTeamName,
}: RosterPanelProps) => {
    const [name, setName] = useState("");
    const [number, setNumber] = useState<number>(15);
    const [photoUrl, setPhotoUrl] = useState("");
    const [editingPlayer, setEditingPlayer] = useState<Player | null>(null);

    const benchSet = new Set(benchIds);
    const benchPlayers = roster.filter((p) => benchSet.has(p.id));
    const onPitchPlayers = roster.filter((p) => !benchSet.has(p.id));

    const submit = () => {
        const trimmed = name.trim();
        if (!trimmed) return;
        const clamped = Math.max(1, Math.min(99, number || 1));
        const url = photoUrl.trim();
        onAddPlayer({
            name: trimmed,
            number: clamped,
            ...(url ? { photoUrl: url } : {}),
        });
        setName("");
        setPhotoUrl("");
        setNumber((n) => Math.min(99, (n || 0) + 1));
    };

    const onSavePlayer = (id: string, changes: Partial<Player>) => {
        onUpdatePlayer(id, changes);
        setEditingPlayer(null);
    };

    return (
        <div className="card card-border bg-base-100 h-full overflow-hidden">
            <div className="card-body p-4 gap-3 flex flex-col h-full">
                <div className="flex items-center justify-between">
                    <h2 className="card-title text-lg">
                        <span className="iconify lucide--users size-5" />
                        {teamName ? `${teamName} kadrosu` : "Kadro"}
                    </h2>
                    <span className="badge badge-ghost badge-sm">
                        {roster.length} oyuncu
                    </span>
                </div>

                <fieldset className="fieldset bg-base-200 rounded-box p-3">
                    <legend className="fieldset-legend">Oyuncu ekle</legend>
                    <div className="join w-full">
                        <input
                            type="text"
                            placeholder="Oyuncu adı"
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
                            aria-label="Forma numarası"
                        />
                        <button
                            type="button"
                            onClick={submit}
                            disabled={!name.trim()}
                            className="btn btn-sm btn-primary join-item"
                            aria-label="Oyuncu ekle">
                            <span className="iconify lucide--plus size-4" />
                        </button>
                    </div>
                    <input
                        type="url"
                        placeholder="Fotoğraf URL (opsiyonel)"
                        value={photoUrl}
                        onChange={(e) => setPhotoUrl(e.target.value)}
                        onKeyDown={(e) => {
                            if (e.key === "Enter") submit();
                        }}
                        className="input input-sm w-full mt-2"
                    />
                </fieldset>

                <div className="flex flex-col gap-3 grow overflow-auto">
                    <RosterList
                        title="Yedek"
                        icon="lucide--armchair"
                        players={benchPlayers}
                        selectedId={selectedPlayerId}
                        emptyHint={
                            roster.length === 0
                                ? "Başlamak için bir oyuncu ekleyin."
                                : "Herkes sahada."
                        }
                        onSelect={onSelectPlayer}
                        onRemove={onRemovePlayer}
                        onEdit={setEditingPlayer}
                        onMoveToOtherTeam={onMoveToOtherTeam}
                        onPlacePlayer={onPlacePlayer}
                        slotByPlayerId={slotByPlayerId}
                        otherTeamName={otherTeamName}
                        teamColor={teamColor}
                        selectable
                        draggable
                        droppable
                    />
                    <RosterList
                        title="Sahada"
                        icon="lucide--circle-check"
                        players={onPitchPlayers}
                        selectedId={null}
                        emptyHint="Henüz oyuncu atanmadı."
                        onSelect={() => {}}
                        onRemove={onRemovePlayer}
                        onEdit={setEditingPlayer}
                        onMoveToOtherTeam={onMoveToOtherTeam}
                        onPlacePlayer={onPlacePlayer}
                        slotByPlayerId={slotByPlayerId}
                        otherTeamName={otherTeamName}
                        teamColor={teamColor}
                        selectable={false}
                        draggable
                        droppable
                    />
                </div>
            </div>

            <EditPlayerModal
                player={editingPlayer}
                onClose={() => setEditingPlayer(null)}
                onSave={onSavePlayer}
            />
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
    onEdit?: (player: Player) => void;
    onMoveToOtherTeam?: (id: string) => void;
    onPlacePlayer?: (
        playerId: string,
        targetSlot: string | null,
        sourceSlot: string | null,
    ) => void;
    slotByPlayerId?: Record<string, string>;
    otherTeamName?: string;
    teamColor?: string;
    selectable: boolean;
    draggable?: boolean;
    droppable?: boolean;
};

const RosterList = ({
    title,
    icon,
    players,
    selectedId,
    emptyHint,
    onSelect,
    onRemove,
    onEdit,
    onMoveToOtherTeam,
    onPlacePlayer,
    slotByPlayerId,
    otherTeamName,
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
            dragHover ? "outline outline-2 outline-dashed outline-primary/60 bg-primary/5" : ""
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
                                className="size-8 rounded-full overflow-hidden text-xs font-bold text-white"
                                style={{
                                    backgroundColor: teamColor ?? "#888",
                                    backgroundImage: p.photoUrl
                                        ? `url(${p.photoUrl})`
                                        : undefined,
                                    backgroundSize: "cover",
                                    backgroundPosition: "center",
                                }}>
                                {!p.photoUrl && p.number}
                            </div>
                        </div>
                        <div className="list-col-grow min-w-0">
                            <div className="flex items-center gap-1.5 min-w-0">
                                <span className="truncate text-sm font-medium">
                                    {p.name}
                                </span>
                                {p.photoUrl && (
                                    <span className="text-[11px] text-base-content/50 font-normal shrink-0">
                                        #{p.number}
                                    </span>
                                )}
                            </div>
                        </div>
                        {selected && onMoveToOtherTeam && otherTeamName && (
                            <button
                                type="button"
                                onClick={(e) => {
                                    e.stopPropagation();
                                    onMoveToOtherTeam(p.id);
                                }}
                                className="btn btn-ghost btn-xs gap-1"
                                aria-label={`${p.name}, ${otherTeamName} takımına taşı`}
                                title={`${otherTeamName} takımına taşı`}>
                                <span className="iconify lucide--arrow-right-left size-3.5" />
                                <span className="hidden xl:inline">{otherTeamName}</span>
                            </button>
                        )}
                        {onEdit && (
                            <button
                                type="button"
                                onClick={(e) => {
                                    e.stopPropagation();
                                    onEdit(p);
                                }}
                                className={`btn btn-ghost btn-xs btn-square ${
                                    selected
                                        ? ""
                                        : "opacity-0 group-hover:opacity-100 focus:opacity-100"
                                }`}
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
                            className={`btn btn-ghost btn-xs btn-square ${
                                selected ? "" : "opacity-0 group-hover:opacity-100 focus:opacity-100"
                            }`}
                            aria-label={`${p.name} oyuncusunu sil`}>
                            <span className="iconify lucide--x size-3.5" />
                        </button>
                    </li>
                );
            })
        )}
    </ul>
    );
};

type EditPlayerModalProps = {
    player: Player | null;
    onClose: () => void;
    onSave: (id: string, changes: Partial<Player>) => void;
};

const EditPlayerModal = ({ player, onClose, onSave }: EditPlayerModalProps) => {
    const [name, setName] = useState("");
    const [number, setNumber] = useState<number>(1);
    const [photoUrl, setPhotoUrl] = useState("");

    useEffect(() => {
        if (player) {
            setName(player.name);
            setNumber(player.number);
            setPhotoUrl(player.photoUrl ?? "");
        }
    }, [player]);

    useEffect(() => {
        if (!player) return;
        const onKey = (e: KeyboardEvent) => {
            if (e.key === "Escape") onClose();
        };
        document.addEventListener("keydown", onKey);
        return () => document.removeEventListener("keydown", onKey);
    }, [player, onClose]);

    const submit = () => {
        if (!player) return;
        const trimmed = name.trim();
        if (!trimmed) return;
        const clamped = Math.max(1, Math.min(99, number || 1));
        const url = photoUrl.trim();
        onSave(player.id, {
            name: trimmed,
            number: clamped,
            photoUrl: url ? url : undefined,
        });
    };

    return (
        <dialog className={`modal ${player ? "modal-open" : ""}`}>
            <div className="modal-box max-w-md">
                <div className="flex items-center justify-between mb-3">
                    <h3 className="font-semibold inline-flex items-center gap-2">
                        <span className="iconify lucide--pencil size-5" />
                        Oyuncuyu düzenle
                    </h3>
                    <button
                        type="button"
                        onClick={onClose}
                        className="btn btn-ghost btn-sm btn-square"
                        aria-label="Kapat">
                        <span className="iconify lucide--x size-4" />
                    </button>
                </div>

                <div className="flex flex-col gap-2">
                    <div className="flex items-center gap-3">
                        <div
                            className="size-14 rounded-full shrink-0 ring-2 ring-base-300"
                            style={{
                                backgroundColor: "#888",
                                backgroundImage: photoUrl.trim()
                                    ? `url(${photoUrl.trim()})`
                                    : undefined,
                                backgroundSize: "cover",
                                backgroundPosition: "center",
                            }}
                        />
                        <div className="join flex-1">
                            <input
                                type="text"
                                placeholder="Oyuncu adı"
                                value={name}
                                onChange={(e) => setName(e.target.value)}
                                className="input input-sm join-item flex-1"
                                autoFocus
                            />
                            <input
                                type="number"
                                min={1}
                                max={99}
                                value={number}
                                onChange={(e) =>
                                    setNumber(Number(e.target.value) || 0)
                                }
                                className="input input-sm join-item w-16 no-spinner"
                                aria-label="Forma numarası"
                            />
                        </div>
                    </div>
                    <input
                        type="url"
                        placeholder="Fotoğraf URL (opsiyonel)"
                        value={photoUrl}
                        onChange={(e) => setPhotoUrl(e.target.value)}
                        className="input input-sm w-full"
                    />
                </div>

                <div className="modal-action mt-3">
                    <button
                        type="button"
                        onClick={onClose}
                        className="btn btn-sm btn-ghost">
                        İptal
                    </button>
                    <button
                        type="button"
                        onClick={submit}
                        disabled={!name.trim()}
                        className="btn btn-sm btn-primary">
                        <span className="iconify lucide--check size-4" />
                        Kaydet
                    </button>
                </div>
            </div>
            <button
                type="button"
                onClick={onClose}
                aria-label="Kapat"
                className="modal-backdrop"
            />
        </dialog>
    );
};
