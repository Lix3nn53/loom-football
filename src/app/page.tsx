"use client";

import { useMemo, useState } from "react";
import { toast } from "sonner";

import { Logo } from "@/components/Logo";
import { ExportModal, ImportModal } from "@/components/MatchIO";
import { ThemeToggle } from "@/components/ThemeToggle";
import { ControlsPanel } from "@/components/lineup/ControlsPanel";
import { Pitch } from "@/components/lineup/Pitch";
import { RosterPanel } from "@/components/lineup/RosterPanel";
import { useLocalStorage } from "@/hooks/use-local-storage";
import { FORMATIONS } from "@/lib/formations";
import { DEFAULT_MATCH, DEFAULT_BLUE_TEAM, DEFAULT_RED_TEAM } from "@/lib/team-defaults";
import type { FormationKey, Match, Player, Side, Team } from "@/types/team";

const STORAGE_KEY = "__OFFICE_FOOTBALL_MATCH_v1__";
const SIDES: Side[] = ["red", "blue"];

const HomePage = () => {
    const [match, setMatch] = useLocalStorage<Match>(STORAGE_KEY, DEFAULT_MATCH);
    const [selectedPlayerId, setSelectedPlayerId] = useState<string | null>(null);
    const [exportOpen, setExportOpen] = useState(false);
    const [importOpen, setImportOpen] = useState(false);

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

    const assignedCount = formation.slots.reduce(
        (acc, s) => acc + (activeTeam.assignments[s.id] ? 1 : 0),
        0,
    );

    const updateActiveTeam = (changes: Partial<Team>) => {
        setMatch({ ...match, [activeSide]: { ...activeTeam, ...changes } });
    };

    const switchSide = (side: Side) => {
        if (side === activeSide) return;
        setMatch({ ...match, activeSide: side });
        setSelectedPlayerId(null);
    };

    const onSlotClick = (slotId: string) => {
        if (!selectedPlayerId) {
            toast("Pick a player from the bench first", {
                description: "Click a bench card, then click an empty slot.",
            });
            return;
        }
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

    const onAddPlayer = ({ name, number }: { name: string; number: number }) => {
        const id = `p_${Date.now().toString(36)}_${Math.random().toString(36).slice(2, 6)}`;
        const player: Player = { id, name, number };
        updateActiveTeam({ roster: [...activeTeam.roster, player] });
        toast.success(`${name} added to ${activeTeam.name}`);
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
        toast.success(`${player.name} moved to ${otherTeam.name}`);
    };

    const onFormationChange = (key: FormationKey) => {
        if (key === activeTeam.formation) return;
        updateActiveTeam({ formation: key, assignments: {} });
        toast(`${activeTeam.name} switched to ${key}`);
    };

    const onClearLineup = () => {
        updateActiveTeam({ assignments: {} });
        setSelectedPlayerId(null);
        toast(`${activeTeam.name} lineup cleared`);
    };

    const onResetActiveTeam = () => {
        const fresh = activeSide === "red" ? DEFAULT_RED_TEAM : DEFAULT_BLUE_TEAM;
        setMatch({ ...match, [activeSide]: fresh });
        setSelectedPlayerId(null);
        toast(`${fresh.name} reset to defaults`);
    };

    const onImport = (next: Match) => {
        setMatch(next);
        setSelectedPlayerId(null);
    };

    const selectedPlayer = selectedPlayerId
        ? playersBySide[activeSide][selectedPlayerId]
        : undefined;

    return (
        <div className="flex h-screen flex-col bg-base-200">
            <header className="flex items-center justify-between gap-2 border-b border-base-300 bg-base-100 px-3 py-2">
                <div className="flex items-center gap-2 min-w-0">
                    <Logo />
                    <div className="hidden sm:flex flex-col leading-tight min-w-0">
                        <span className="text-base font-semibold truncate">
                            Loom Football
                        </span>
                        <span className="text-[11px] text-base-content/60">
                            Team Management
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
                                Place{" "}
                                <span className="font-semibold">{selectedPlayer.name}</span>
                            </span>
                            <button
                                type="button"
                                onClick={() =>
                                    onMovePlayerToOtherTeam(selectedPlayer.id)
                                }
                                className="btn btn-ghost btn-xs gap-1"
                                title={`Move to ${match[activeSide === "red" ? "blue" : "red"].name}`}>
                                <span className="iconify lucide--arrow-right-left size-3.5" />
                                <span className="hidden lg:inline">
                                    Move to{" "}
                                    {match[activeSide === "red" ? "blue" : "red"].name}
                                </span>
                            </button>
                            <button
                                type="button"
                                onClick={() => setSelectedPlayerId(null)}
                                className="btn btn-ghost btn-xs btn-square"
                                aria-label="Cancel selection">
                                <span className="iconify lucide--x size-3.5" />
                            </button>
                        </div>
                    )}
                    <div className="join">
                        <button
                            type="button"
                            onClick={() => setExportOpen(true)}
                            className="btn btn-sm btn-ghost join-item gap-1.5"
                            aria-label="Export match"
                            title="Export match">
                            <span className="iconify lucide--download size-4" />
                            <span className="hidden sm:inline">Export</span>
                        </button>
                        <button
                            type="button"
                            onClick={() => setImportOpen(true)}
                            className="btn btn-sm btn-ghost join-item gap-1.5"
                            aria-label="Import match"
                            title="Import match">
                            <span className="iconify lucide--upload size-4" />
                            <span className="hidden sm:inline">Import</span>
                        </button>
                    </div>
                    <ThemeToggle className="btn btn-circle btn-ghost btn-sm" />
                </div>
            </header>

            <main className="grid grow grid-cols-1 gap-3 overflow-hidden p-3 lg:grid-cols-[260px_1fr_260px] xl:grid-cols-[260px_1fr_1fr_260px]">
                <div className="order-2 lg:order-1 min-h-0">
                    <RosterPanel
                        roster={activeTeam.roster}
                        benchIds={benchIds}
                        selectedPlayerId={selectedPlayerId}
                        onSelectPlayer={setSelectedPlayerId}
                        onAddPlayer={onAddPlayer}
                        onRemovePlayer={onRemovePlayer}
                        onUpdatePlayer={onUpdatePlayer}
                        onMoveToOtherTeam={onMovePlayerToOtherTeam}
                        teamName={activeTeam.name}
                        teamColor={activeTeam.color}
                        otherTeamName={
                            match[activeSide === "red" ? "blue" : "red"].name
                        }
                    />
                </div>

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
                                    {isActive ? "Active" : "Tap to edit"}
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
                                    teamColor={team.color}
                                />
                            </div>
                        </div>
                    );
                })}

                <div className="order-3 min-h-0">
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
                </div>
            </main>

            <ExportModal
                open={exportOpen}
                onClose={() => setExportOpen(false)}
                match={match}
            />
            <ImportModal
                open={importOpen}
                onClose={() => setImportOpen(false)}
                onImport={onImport}
            />
        </div>
    );
};

export default HomePage;
