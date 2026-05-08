"use client";

import { useMemo, useState } from "react";
import { toast } from "sonner";

import { Logo } from "@/components/Logo";
import { ThemeToggle } from "@/components/ThemeToggle";
import { ControlsPanel } from "@/components/lineup/ControlsPanel";
import { Pitch } from "@/components/lineup/Pitch";
import { RosterPanel } from "@/components/lineup/RosterPanel";
import { useLocalStorage } from "@/hooks/use-local-storage";
import { FORMATIONS } from "@/lib/formations";
import { DEFAULT_TEAM, ROLE_COLORS } from "@/lib/team-defaults";
import type { FormationKey, Player, Position, Team } from "@/types/team";

const STORAGE_KEY = "__OFFICE_FOOTBALL_TEAM_v1__";

const HomePage = () => {
    const [team, setTeam] = useLocalStorage<Team>(STORAGE_KEY, DEFAULT_TEAM);
    const [selectedPlayerId, setSelectedPlayerId] = useState<string | null>(null);

    const formation = FORMATIONS[team.formation];

    const playerById = useMemo(() => {
        const map: Record<string, Player | undefined> = {};
        for (const p of team.roster) map[p.id] = p;
        return map;
    }, [team.roster]);

    const benchIds = useMemo(() => {
        const assigned = new Set(
            Object.values(team.assignments).filter((v): v is string => !!v),
        );
        return team.roster.filter((p) => !assigned.has(p.id)).map((p) => p.id);
    }, [team.assignments, team.roster]);

    const assignedCount = formation.slots.reduce(
        (acc, s) => acc + (team.assignments[s.id] ? 1 : 0),
        0,
    );

    const updateTeam = (changes: Partial<Team>) => setTeam({ ...team, ...changes });

    const onSlotClick = (slotId: string) => {
        if (!selectedPlayerId) {
            toast("Pick a player from the bench first", {
                description: "Click a bench card, then click an empty slot.",
            });
            return;
        }
        const cleaned: Record<string, string | null> = { ...team.assignments };
        for (const k of Object.keys(cleaned)) {
            if (cleaned[k] === selectedPlayerId) cleaned[k] = null;
        }
        cleaned[slotId] = selectedPlayerId;
        updateTeam({ assignments: cleaned });
        setSelectedPlayerId(null);
    };

    const onSlotPlayerClick = (slotId: string) => {
        const next = { ...team.assignments, [slotId]: null };
        updateTeam({ assignments: next });
    };

    const onAddPlayer = ({
        name,
        number,
        role,
    }: {
        name: string;
        number: number;
        role: Position;
    }) => {
        const id = `p_${Date.now().toString(36)}_${Math.random().toString(36).slice(2, 6)}`;
        const player: Player = {
            id,
            name,
            number,
            role,
            color: ROLE_COLORS[role],
        };
        updateTeam({ roster: [...team.roster, player] });
        toast.success(`${name} added to squad`);
    };

    const onRemovePlayer = (id: string) => {
        const cleaned: Record<string, string | null> = { ...team.assignments };
        for (const k of Object.keys(cleaned)) {
            if (cleaned[k] === id) cleaned[k] = null;
        }
        updateTeam({
            roster: team.roster.filter((p) => p.id !== id),
            assignments: cleaned,
        });
        if (selectedPlayerId === id) setSelectedPlayerId(null);
    };

    const onUpdatePlayer = (id: string, changes: Partial<Player>) => {
        updateTeam({
            roster: team.roster.map((p) => (p.id === id ? { ...p, ...changes } : p)),
        });
    };

    const onFormationChange = (key: FormationKey) => {
        if (key === team.formation) return;
        updateTeam({ formation: key, assignments: {} });
        toast(`Switched to ${key}`);
    };

    const onClearLineup = () => {
        updateTeam({ assignments: {} });
        setSelectedPlayerId(null);
        toast("Lineup cleared");
    };

    const onResetAll = () => {
        setTeam(DEFAULT_TEAM);
        setSelectedPlayerId(null);
        toast("Squad reset to defaults");
    };

    const selectedPlayer = selectedPlayerId ? playerById[selectedPlayerId] : undefined;

    return (
        <div className="flex h-screen flex-col bg-base-200">
            <header className="flex items-center justify-between border-b border-base-300 bg-base-100 px-4 py-2.5">
                <div className="flex items-center gap-2">
                    <Logo />
                    <div className="flex flex-col leading-tight">
                        <span className="text-base font-semibold">Loom Football</span>
                        <span className="text-[11px] text-base-content/60">
                            Team Management
                        </span>
                    </div>
                </div>
                <div className="flex items-center gap-2">
                    {selectedPlayer && (
                        <div className="hidden sm:flex items-center gap-2 rounded-box border border-primary/40 bg-primary/10 px-3 py-1 text-sm">
                            <span className="iconify lucide--mouse-pointer-click size-4 text-primary" />
                            <span>
                                Place <span className="font-semibold">{selectedPlayer.name}</span>
                            </span>
                            <button
                                type="button"
                                onClick={() => setSelectedPlayerId(null)}
                                className="btn btn-ghost btn-xs btn-square"
                                aria-label="Cancel selection">
                                <span className="iconify lucide--x size-3.5" />
                            </button>
                        </div>
                    )}
                    <ThemeToggle className="btn btn-circle btn-ghost btn-sm" />
                </div>
            </header>

            <main className="grid grow grid-cols-1 gap-3 overflow-hidden p-3 lg:grid-cols-[280px_1fr_280px]">
                <div className="order-2 lg:order-1 min-h-0">
                    <RosterPanel
                        roster={team.roster}
                        benchIds={benchIds}
                        selectedPlayerId={selectedPlayerId}
                        onSelectPlayer={setSelectedPlayerId}
                        onAddPlayer={onAddPlayer}
                        onRemovePlayer={onRemovePlayer}
                        onUpdatePlayer={onUpdatePlayer}
                    />
                </div>

                <div className="order-1 lg:order-2 min-h-0 flex flex-col items-center justify-center">
                    <div className="w-full max-w-[520px]">
                        <Pitch
                            formation={formation}
                            assignments={team.assignments}
                            playerById={playerById}
                            selectedPlayerId={selectedPlayerId}
                            onSlotClick={onSlotClick}
                            onSlotPlayerClick={onSlotPlayerClick}
                            teamColor={team.color}
                        />
                    </div>
                </div>

                <div className="order-3 min-h-0">
                    <ControlsPanel
                        team={team}
                        onTeamNameChange={(name) => updateTeam({ name })}
                        onTeamColorChange={(color) => updateTeam({ color })}
                        onFormationChange={onFormationChange}
                        onClearLineup={onClearLineup}
                        onResetAll={onResetAll}
                        assignedCount={assignedCount}
                        slotsCount={formation.slots.length}
                    />
                </div>
            </main>
        </div>
    );
};

export default HomePage;
