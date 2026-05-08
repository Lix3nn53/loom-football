"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { toast } from "sonner";

import { Logo } from "@/components/Logo";
import { ThemeToggle } from "@/components/ThemeToggle";
import { ControlsPanel } from "@/components/lineup/ControlsPanel";
import { Pitch } from "@/components/lineup/Pitch";
import { RosterPanel } from "@/components/lineup/RosterPanel";
import { useCloudSync, type CloudSyncStatus } from "@/hooks/use-cloud-sync";
import { useLocalStorage } from "@/hooks/use-local-storage";
import { FORMATIONS } from "@/lib/formations";
import { parseImport } from "@/lib/match-format";
import { DEFAULT_MATCH, DEFAULT_BLUE_TEAM, DEFAULT_RED_TEAM } from "@/lib/team-defaults";
import type { FormationKey, Match, Player, Side, Team } from "@/types/team";

const STORAGE_KEY = "__OFFICE_FOOTBALL_MATCH_v1__";
const SIDES: Side[] = ["red", "blue"];

const HomePage = () => {
    const [match, setMatch, matchLoaded] = useLocalStorage<Match>(
        STORAGE_KEY,
        DEFAULT_MATCH,
    );
    const [selectedPlayerId, setSelectedPlayerId] = useState<string | null>(null);
    const [dragActive, setDragActive] = useState(false);
    const [rosterOpen, setRosterOpen] = useState(false);
    const [controlsOpen, setControlsOpen] = useState(false);
    const dragDepthRef = useRef(0);
    const cloudStatus = useCloudSync(match, setMatch, matchLoaded);

    const closeDrawers = () => {
        setRosterOpen(false);
        setControlsOpen(false);
    };
    const openRoster = () => {
        setControlsOpen(false);
        setRosterOpen(true);
    };
    const openControls = () => {
        setRosterOpen(false);
        setControlsOpen(true);
    };

    useEffect(() => {
        if (!rosterOpen && !controlsOpen) return;
        const onKey = (e: KeyboardEvent) => {
            if (e.key === "Escape") closeDrawers();
        };
        document.addEventListener("keydown", onKey);
        return () => document.removeEventListener("keydown", onKey);
    }, [rosterOpen, controlsOpen]);

    const activeSide = match.activeSide;
    const activeTeam = match[activeSide];
    const formation = FORMATIONS[activeTeam.formation];

    const playersBySide = useMemo(() => {
        const result: Record<Side, Record<string, Player | undefined>> = {
            red: {},
            blue: {},
        };
        for (const side of SIDES) {
            for (const p of match[side].roster) result[side][p.id] = p;
        }
        return result;
    }, [match]);

    const benchIds = useMemo(() => {
        const assigned = new Set(
            Object.values(activeTeam.assignments).filter((v): v is string => !!v),
        );
        return activeTeam.roster.filter((p) => !assigned.has(p.id)).map((p) => p.id);
    }, [activeTeam.assignments, activeTeam.roster]);

    const slotByPlayerId = useMemo(() => {
        const map: Record<string, string> = {};
        for (const [slotId, playerId] of Object.entries(activeTeam.assignments)) {
            if (playerId) map[playerId] = slotId;
        }
        return map;
    }, [activeTeam.assignments]);

    const assignedCount = formation.slots.reduce(
        (acc, s) => acc + (activeTeam.assignments[s.id] ? 1 : 0),
        0,
    );

    const updateActiveTeam = (changes: Partial<Team>) => {
        setMatch((m) => ({
            ...m,
            [m.activeSide]: { ...m[m.activeSide], ...changes },
        }));
    };

    const switchSide = (side: Side) => {
        if (side === activeSide) return;
        setMatch({ ...match, activeSide: side });
        setSelectedPlayerId(null);
    };

    const onSlotClick = (slotId: string) => {
        if (!selectedPlayerId) return;
        const cleaned: Record<string, string | null> = { ...activeTeam.assignments };
        for (const k of Object.keys(cleaned)) {
            if (cleaned[k] === selectedPlayerId) cleaned[k] = null;
        }
        cleaned[slotId] = selectedPlayerId;
        updateActiveTeam({ assignments: cleaned });
        setSelectedPlayerId(null);
    };

    const onSlotPlayerClick = (slotId: string) => {
        const next = { ...activeTeam.assignments, [slotId]: null };
        updateActiveTeam({ assignments: next });
    };

    // Unified placement handler used by drag-and-drop:
    // - bench → slot:           targetSlot=X, sourceSlot=null  (displaced player goes to bench)
    // - slot A → slot B (empty): targetSlot=B, sourceSlot=A    (A cleared, B filled)
    // - slot A → slot B (full):  targetSlot=B, sourceSlot=A    (swap A and B)
    // - slot A → bench:          targetSlot=null, sourceSlot=A (clear A)
    const onPlacePlayer = (
        playerId: string,
        targetSlot: string | null,
        sourceSlot: string | null,
    ) => {
        setMatch((m) => {
            const side = m.activeSide;
            const team = m[side];
            const next: Record<string, string | null> = {
                ...team.assignments,
            };
            const displaced =
                targetSlot && next[targetSlot] != null ? next[targetSlot] : null;

            // 1) Clear every slot that currently holds this player
            for (const k of Object.keys(next)) {
                if (next[k] === playerId) next[k] = null;
            }
            // 2) Slot→slot swap: send displaced player back into the source
            if (sourceSlot && displaced && displaced !== playerId) {
                next[sourceSlot] = displaced;
            }
            // 3) Place the dragged player into the target slot
            if (targetSlot) {
                next[targetSlot] = playerId;
            }

            return { ...m, [side]: { ...team, assignments: next } };
        });
        setSelectedPlayerId(null);
    };

    const onAddPlayer = ({
        name,
        number,
        photoUrl,
    }: {
        name: string;
        number: number;
        photoUrl?: string;
    }) => {
        const id = `p_${Date.now().toString(36)}_${Math.random().toString(36).slice(2, 6)}`;
        const player: Player = {
            id,
            name,
            number,
            ...(photoUrl ? { photoUrl } : {}),
        };
        updateActiveTeam({ roster: [...activeTeam.roster, player] });
    };

    const onRemovePlayer = (id: string) => {
        const cleaned: Record<string, string | null> = { ...activeTeam.assignments };
        for (const k of Object.keys(cleaned)) {
            if (cleaned[k] === id) cleaned[k] = null;
        }
        updateActiveTeam({
            roster: activeTeam.roster.filter((p) => p.id !== id),
            assignments: cleaned,
        });
        if (selectedPlayerId === id) setSelectedPlayerId(null);
    };

    const onUpdatePlayer = (id: string, changes: Partial<Player>) => {
        updateActiveTeam({
            roster: activeTeam.roster.map((p) => (p.id === id ? { ...p, ...changes } : p)),
        });
    };

    const onMovePlayerToOtherTeam = (id: string) => {
        const player = activeTeam.roster.find((p) => p.id === id);
        if (!player) return;
        const otherSide: Side = activeSide === "red" ? "blue" : "red";
        const otherTeam = match[otherSide];

        const newCurrentRoster = activeTeam.roster.filter((p) => p.id !== id);
        const newCurrentAssignments: Record<string, string | null> = {
            ...activeTeam.assignments,
        };
        for (const k of Object.keys(newCurrentAssignments)) {
            if (newCurrentAssignments[k] === id) newCurrentAssignments[k] = null;
        }

        setMatch({
            ...match,
            [activeSide]: {
                ...activeTeam,
                roster: newCurrentRoster,
                assignments: newCurrentAssignments,
            },
            [otherSide]: {
                ...otherTeam,
                roster: [...otherTeam.roster, player],
            },
        });
        if (selectedPlayerId === id) setSelectedPlayerId(null);
    };

    const onFormationChange = (key: FormationKey) => {
        if (key === activeTeam.formation) return;
        updateActiveTeam({ formation: key, assignments: {} });
    };

    const onClearLineup = () => {
        updateActiveTeam({ assignments: {} });
        setSelectedPlayerId(null);
    };

    const onResetActiveTeam = () => {
        const fresh = activeSide === "red" ? DEFAULT_RED_TEAM : DEFAULT_BLUE_TEAM;
        setMatch({ ...match, [activeSide]: fresh });
        setSelectedPlayerId(null);
    };

    const selectedPlayer = selectedPlayerId
        ? playersBySide[activeSide][selectedPlayerId]
        : undefined;

    const handleDroppedFile = async (file: File) => {
        try {
            const text = await file.text();
            const parsed = JSON.parse(text);
            const next = parseImport(parsed);
            if (!next) {
                toast.error("Geçersiz maç dosyası", {
                    description:
                        "red, blue ve activeSide alanları gerekli (lineup ve bench içermeli).",
                });
                return;
            }
            setMatch(next);
            setSelectedPlayerId(null);
            toast.success("Maç içe aktarıldı");
        } catch {
            toast.error("Dosya okunamadı");
        }
    };

    const isFileDrag = (e: React.DragEvent) =>
        Array.from(e.dataTransfer.types).includes("Files");

    const onDragEnter = (e: React.DragEvent) => {
        if (!isFileDrag(e)) return;
        e.preventDefault();
        dragDepthRef.current += 1;
        setDragActive(true);
    };

    const onDragOver = (e: React.DragEvent) => {
        if (!isFileDrag(e)) return;
        e.preventDefault();
        e.dataTransfer.dropEffect = "copy";
    };

    const onDragLeave = () => {
        dragDepthRef.current = Math.max(0, dragDepthRef.current - 1);
        if (dragDepthRef.current === 0) setDragActive(false);
    };

    const onDrop = (e: React.DragEvent) => {
        if (!isFileDrag(e)) return;
        e.preventDefault();
        dragDepthRef.current = 0;
        setDragActive(false);
        const file = e.dataTransfer.files?.[0];
        if (file) handleDroppedFile(file);
    };

    return (
        <div
            className="flex h-screen flex-col bg-base-200"
            onDragEnter={onDragEnter}
            onDragOver={onDragOver}
            onDragLeave={onDragLeave}
            onDrop={onDrop}>
            <header className="z-50 flex items-center justify-between gap-2 border-b border-base-300 bg-base-100 px-3 py-2">
                <div className="flex items-center gap-2 min-w-0">
                    <button
                        type="button"
                        onClick={openRoster}
                        aria-label="Kadroyu aç"
                        title="Kadro"
                        className="btn btn-square btn-ghost btn-sm lg:hidden">
                        <span className="iconify lucide--users size-5" />
                    </button>
                    <Logo className="hidden sm:flex" />
                    <div className="hidden sm:flex flex-col leading-tight min-w-0">
                        <span className="text-base font-semibold truncate">
                            Loom Football
                        </span>
                        <span className="text-[11px] text-base-content/60">
                            Takım Yönetimi
                        </span>
                    </div>
                </div>

                <div role="tablist" className="tabs tabs-box tabs-sm bg-base-200">
                    {SIDES.map((side) => {
                        const t = match[side];
                        const active = side === activeSide;
                        return (
                            <button
                                key={side}
                                role="tab"
                                aria-selected={active}
                                onClick={() => switchSide(side)}
                                className={`tab gap-2 ${active ? "tab-active" : ""}`}>
                                <span
                                    className="size-3 rounded-full ring-1 ring-base-content/20"
                                    style={{ backgroundColor: t.color }}
                                />
                                {t.name}
                            </button>
                        );
                    })}
                </div>

                <div className="flex items-center gap-2">
                    {selectedPlayer && (
                        <div className="badge badge-primary badge-soft badge-lg gap-2 hidden md:inline-flex">
                            <span className="iconify lucide--mouse-pointer-click size-4" />
                            <span>
                                <span className="font-semibold">{selectedPlayer.name}</span>{" "}
                                yerleştir
                            </span>
                            <button
                                type="button"
                                onClick={() =>
                                    onMovePlayerToOtherTeam(selectedPlayer.id)
                                }
                                className="btn btn-ghost btn-xs gap-1"
                                title={`${match[activeSide === "red" ? "blue" : "red"].name} takımına taşı`}>
                                <span className="iconify lucide--arrow-right-left size-3.5" />
                                <span className="hidden lg:inline">
                                    {match[activeSide === "red" ? "blue" : "red"].name}{" "}
                                    takımına
                                </span>
                            </button>
                            <button
                                type="button"
                                onClick={() => setSelectedPlayerId(null)}
                                className="btn btn-ghost btn-xs btn-square"
                                aria-label="Seçimi iptal et">
                                <span className="iconify lucide--x size-3.5" />
                            </button>
                        </div>
                    )}
                    <SyncIndicator status={cloudStatus} />
                    <button
                        type="button"
                        onClick={openControls}
                        aria-label="Takım ayarlarını aç"
                        title="Takım ayarları"
                        className="btn btn-square btn-ghost btn-sm lg:hidden">
                        <span className="iconify lucide--sliders-horizontal size-5" />
                    </button>
                    <ThemeToggle className="btn btn-circle btn-ghost btn-sm" />
                </div>
            </header>

            <main className="relative grid grow grid-cols-1 gap-3 overflow-hidden p-3 lg:grid-cols-[260px_1fr_260px] xl:grid-cols-[260px_1fr_1fr_260px]">
                {(rosterOpen || controlsOpen) && (
                    <button
                        type="button"
                        aria-label="Paneli kapat"
                        onClick={closeDrawers}
                        className="absolute inset-0 z-30 bg-black/40 lg:hidden"
                    />
                )}

                <aside
                    className={`order-2 lg:order-1 min-h-0 absolute inset-y-0 left-0 z-40 w-80 max-w-[85vw] transform transition-transform duration-200 ease-out bg-base-200 shadow-2xl lg:static lg:inset-auto lg:w-auto lg:max-w-none lg:bg-transparent lg:shadow-none lg:translate-x-0 ${
                        rosterOpen ? "translate-x-0" : "-translate-x-full lg:translate-x-0"
                    }`}>
                    <RosterPanel
                        roster={activeTeam.roster}
                        benchIds={benchIds}
                        slotByPlayerId={slotByPlayerId}
                        selectedPlayerId={selectedPlayerId}
                        onSelectPlayer={(id) => {
                            setSelectedPlayerId(id);
                            if (id) setRosterOpen(false);
                        }}
                        onAddPlayer={onAddPlayer}
                        onRemovePlayer={onRemovePlayer}
                        onUpdatePlayer={onUpdatePlayer}
                        onMoveToOtherTeam={onMovePlayerToOtherTeam}
                        onPlacePlayer={onPlacePlayer}
                        teamName={activeTeam.name}
                        teamColor={activeTeam.color}
                        otherTeamName={
                            match[activeSide === "red" ? "blue" : "red"].name
                        }
                    />
                </aside>

                {SIDES.map((side) => {
                    const team = match[side];
                    const teamFormation = FORMATIONS[team.formation];
                    const isActive = side === activeSide;
                    const onSideSlotClick = isActive
                        ? onSlotClick
                        : () => switchSide(side);
                    const onSideSlotPlayerClick = isActive
                        ? onSlotPlayerClick
                        : () => switchSide(side);
                    const onSideSlotDrop = isActive ? onPlacePlayer : undefined;

                    return (
                        <div
                            key={side}
                            className={`order-1 lg:order-2 min-h-0 flex-col items-center justify-center gap-2 ${
                                isActive ? "flex" : "hidden xl:flex"
                            }`}>
                            <div className="flex items-center gap-2 text-sm">
                                <span
                                    className="size-3 rounded-full ring-1 ring-base-content/20"
                                    style={{ backgroundColor: team.color }}
                                />
                                <span className="font-semibold">{team.name}</span>
                                <span
                                    className={`badge badge-xs hidden xl:inline-flex ${
                                        isActive ? "badge-primary" : "badge-ghost"
                                    }`}>
                                    {isActive ? "Aktif" : "Düzenlemek için tıkla"}
                                </span>
                            </div>
                            <div
                                className={`w-full max-w-[420px] rounded-lg transition ${
                                    isActive
                                        ? "xl:ring-2 xl:ring-primary/50 xl:ring-offset-2 xl:ring-offset-base-200"
                                        : "xl:opacity-60 xl:hover:opacity-100 xl:cursor-pointer"
                                }`}>
                                <Pitch
                                    formation={teamFormation}
                                    assignments={team.assignments}
                                    playerById={playersBySide[side]}
                                    selectedPlayerId={isActive ? selectedPlayerId : null}
                                    onSlotClick={onSideSlotClick}
                                    onSlotPlayerClick={onSideSlotPlayerClick}
                                    onSlotDrop={onSideSlotDrop}
                                    teamColor={team.color}
                                />
                            </div>
                        </div>
                    );
                })}

                <aside
                    className={`order-3 min-h-0 absolute inset-y-0 right-0 z-40 w-80 max-w-[85vw] transform transition-transform duration-200 ease-out bg-base-200 shadow-2xl lg:static lg:inset-auto lg:w-auto lg:max-w-none lg:bg-transparent lg:shadow-none lg:translate-x-0 ${
                        controlsOpen ? "translate-x-0" : "translate-x-full lg:translate-x-0"
                    }`}>
                    <ControlsPanel
                        team={activeTeam}
                        onTeamNameChange={(name) => updateActiveTeam({ name })}
                        onTeamColorChange={(color) => updateActiveTeam({ color })}
                        onFormationChange={onFormationChange}
                        onClearLineup={onClearLineup}
                        onResetAll={onResetActiveTeam}
                        assignedCount={assignedCount}
                        slotsCount={formation.slots.length}
                    />
                </aside>
            </main>

            {dragActive && (
                <div className="pointer-events-none fixed inset-0 z-50 flex items-center justify-center bg-base-100/85 backdrop-blur-sm">
                    <div className="pointer-events-none rounded-box border-2 border-dashed border-primary bg-primary/10 px-10 py-8 text-center">
                        <span className="iconify lucide--file-up size-12 text-primary block mx-auto" />
                        <div className="text-xl font-semibold mt-2">
                            Maçı içe aktarmak için JSON bırak
                        </div>
                        <div className="text-xs text-base-content/60 mt-1">
                            Mevcut maçın üzerine yazılır. Bulut kaydı senkronlar.
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default HomePage;

const SYNC_LABELS: Record<CloudSyncStatus, { label: string; icon: string; tone: string }> = {
    disabled: {
        label: "Bulut kapalı",
        icon: "lucide--cloud-off",
        tone: "text-base-content/40",
    },
    idle: {
        label: "Senkron",
        icon: "lucide--cloud",
        tone: "text-base-content/60",
    },
    pulling: {
        label: "Senkronlanıyor…",
        icon: "lucide--cloud-download",
        tone: "text-info",
    },
    saving: {
        label: "Kaydediliyor…",
        icon: "lucide--loader",
        tone: "text-info",
    },
    saved: {
        label: "Kaydedildi",
        icon: "lucide--cloud-check",
        tone: "text-success",
    },
    conflict: {
        label: "Uzaktan güncellendi",
        icon: "lucide--cloud-alert",
        tone: "text-warning",
    },
    error: {
        label: "Kayıt başarısız",
        icon: "lucide--cloud-alert",
        tone: "text-error",
    },
};

const SyncIndicator = ({ status }: { status: CloudSyncStatus }) => {
    const { label, icon, tone } = SYNC_LABELS[status];
    const isBusy = status === "saving" || status === "pulling";
    return (
        <div
            className={`inline-flex items-center gap-1.5 text-xs ${tone}`}
            role="status"
            aria-live="polite"
            title={label}>
            {isBusy ? (
                <span className="loading loading-spinner loading-xs" />
            ) : (
                <span className={`iconify ${icon} size-3.5`} />
            )}
            <span className="hidden sm:inline">{label}</span>
        </div>
    );
};
