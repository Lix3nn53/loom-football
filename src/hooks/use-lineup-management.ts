"use client";

import { useCallback } from "react";
import { toast } from "sonner";

import { FORMATIONS } from "@/lib/formations";
import { DEFAULT_STATS, computeOverall } from "@/lib/player-stats";
import type { FormationKey, Match, Player, Side, Team } from "@/types/team";

const pickRandomEmptySlot = (team: Team): string | null => {
    const slots = FORMATIONS[team.formation].slots;
    const empty = slots.filter((s) => !team.assignments[s.id]).map((s) => s.id);
    if (empty.length === 0) return null;
    return empty[Math.floor(Math.random() * empty.length)];
};

type UseLineupManagementArgs = {
    match: Match;
    setMatch: (value: Match | ((m: Match) => Match)) => void;
    selectedPlayerId: string | null;
    setSelectedPlayerId: (id: string | null) => void;
};

export const useLineupManagement = ({
    match,
    setMatch,
    selectedPlayerId,
    setSelectedPlayerId,
}: UseLineupManagementArgs) => {
    const activeTeam = match[match.activeSide];

    const updateActiveTeam = useCallback(
        (changes: Partial<Team>) => {
            setMatch((m) => ({
                ...m,
                [m.activeSide]: { ...m[m.activeSide], ...changes },
            }));
        },
        [setMatch],
    );

    const switchSide = useCallback(
        (side: Side) => {
            if (side === match.activeSide) return;
            setMatch((m) => ({ ...m, activeSide: side }));
            setSelectedPlayerId(null);
        },
        [match.activeSide, setMatch, setSelectedPlayerId],
    );

    // Unified placement handler used by drag-and-drop:
    // - bench → slot:           targetSlot=X, sourceSlot=null  (displaced player goes to bench)
    // - slot A → slot B (empty): targetSlot=B, sourceSlot=A    (A cleared, B filled)
    // - slot A → slot B (full):  targetSlot=B, sourceSlot=A    (swap A and B)
    // - slot A → bench:          targetSlot=null, sourceSlot=A (clear A)
    const onPlacePlayer = useCallback(
        (playerId: string, targetSlot: string | null, sourceSlot: string | null) => {
            setMatch((m) => {
                const side = m.activeSide;
                const team = m[side];
                const next: Record<string, string | null> = { ...team.assignments };
                const displaced =
                    targetSlot && next[targetSlot] != null ? next[targetSlot] : null;

                for (const k of Object.keys(next)) {
                    if (next[k] === playerId) next[k] = null;
                }
                if (sourceSlot && displaced && displaced !== playerId) {
                    next[sourceSlot] = displaced;
                }
                if (targetSlot) {
                    next[targetSlot] = playerId;
                }

                return { ...m, [side]: { ...team, assignments: next } };
            });
            setSelectedPlayerId(null);
        },
        [setMatch, setSelectedPlayerId],
    );

    const onSlotPlayerBench = useCallback(
        (slotId: string) => {
            const playerInSlot = activeTeam.assignments[slotId];
            if (!playerInSlot) return;
            const next = { ...activeTeam.assignments, [slotId]: null };
            updateActiveTeam({ assignments: next });
            if (selectedPlayerId === playerInSlot) setSelectedPlayerId(null);
        },
        [activeTeam.assignments, updateActiveTeam, selectedPlayerId, setSelectedPlayerId],
    );

    const onAddPlayer = useCallback(
        ({
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
                stats: { ...DEFAULT_STATS },
            };
            setMatch((m) => {
                const side = m.activeSide;
                const team = m[side];
                const slot = pickRandomEmptySlot(team);
                const nextAssignments = slot
                    ? { ...team.assignments, [slot]: id }
                    : team.assignments;
                return {
                    ...m,
                    [side]: {
                        ...team,
                        roster: [...team.roster, player],
                        assignments: nextAssignments,
                    },
                };
            });
        },
        [setMatch],
    );

    const onRemovePlayer = useCallback(
        (id: string) => {
            const cleaned: Record<string, string | null> = { ...activeTeam.assignments };
            for (const k of Object.keys(cleaned)) {
                if (cleaned[k] === id) cleaned[k] = null;
            }
            updateActiveTeam({
                roster: activeTeam.roster.filter((p) => p.id !== id),
                assignments: cleaned,
            });
            if (selectedPlayerId === id) setSelectedPlayerId(null);
        },
        [
            activeTeam.assignments,
            activeTeam.roster,
            updateActiveTeam,
            selectedPlayerId,
            setSelectedPlayerId,
        ],
    );

    const onUpdatePlayer = useCallback(
        (id: string, changes: Partial<Player>) => {
            updateActiveTeam({
                roster: activeTeam.roster.map((p) =>
                    p.id === id ? { ...p, ...changes } : p,
                ),
            });
        },
        [activeTeam.roster, updateActiveTeam],
    );

    const onMovePlayerToOtherTeam = useCallback(
        (id: string) => {
            setMatch((m) => {
                const fromSide = m.activeSide;
                const toSide: Side = fromSide === "red" ? "blue" : "red";
                const fromTeam = m[fromSide];
                const toTeam = m[toSide];
                const player = fromTeam.roster.find((p) => p.id === id);
                if (!player) return m;

                const fromAssignments: Record<string, string | null> = {
                    ...fromTeam.assignments,
                };
                for (const k of Object.keys(fromAssignments)) {
                    if (fromAssignments[k] === id) fromAssignments[k] = null;
                }

                const slot = pickRandomEmptySlot(toTeam);
                const toAssignments = slot
                    ? { ...toTeam.assignments, [slot]: id }
                    : toTeam.assignments;

                return {
                    ...m,
                    [fromSide]: {
                        ...fromTeam,
                        roster: fromTeam.roster.filter((p) => p.id !== id),
                        assignments: fromAssignments,
                    },
                    [toSide]: {
                        ...toTeam,
                        roster: [...toTeam.roster, player],
                        assignments: toAssignments,
                    },
                };
            });
            if (selectedPlayerId === id) setSelectedPlayerId(null);
        },
        [setMatch, selectedPlayerId, setSelectedPlayerId],
    );

    const onFormationChange = useCallback(
        (key: FormationKey) => {
            if (key === activeTeam.formation) return;
            updateActiveTeam({ formation: key, assignments: {} });
        },
        [activeTeam.formation, updateActiveTeam],
    );

    // Greedy fill: for each empty slot, pick the bench player with the
    // highest position-specific OVR. Only touches empty slots — never
    // displaces a player that's already on the pitch. Returns true if
    // any slot was filled so callers can show feedback.
    const autoFillSide = useCallback(
        (side: Side) => {
            let placed = 0;
            const previous = match[side].assignments;
            setMatch((m) => {
                const team = m[side];
                const slots = FORMATIONS[team.formation].slots;
                const next: Record<string, string | null> = { ...team.assignments };
                const assignedIds = new Set(
                    Object.values(next).filter((v): v is string => !!v),
                );
                const benchPool = team.roster.filter(
                    (p) => !assignedIds.has(p.id),
                );
                if (benchPool.length === 0) return m;

                for (const slot of slots) {
                    if (next[slot.id] || benchPool.length === 0) continue;
                    let bestIdx = 0;
                    let bestOvr = computeOverall(benchPool[0].stats, slot.role);
                    for (let i = 1; i < benchPool.length; i++) {
                        const ovr = computeOverall(benchPool[i].stats, slot.role);
                        if (ovr > bestOvr) {
                            bestOvr = ovr;
                            bestIdx = i;
                        }
                    }
                    const [picked] = benchPool.splice(bestIdx, 1);
                    next[slot.id] = picked.id;
                    placed += 1;
                }

                return { ...m, [side]: { ...team, assignments: next } };
            });

            if (placed > 0) {
                toast.success(`${placed} oyuncu yerleştirildi`, {
                    action: {
                        label: "Geri al",
                        onClick: () => {
                            setMatch((m) => ({
                                ...m,
                                [side]: { ...m[side], assignments: previous },
                            }));
                        },
                    },
                });
            }
            return placed > 0;
        },
        [match, setMatch],
    );

    const onAutoFillLineup = useCallback(() => {
        autoFillSide(match.activeSide);
    }, [autoFillSide, match.activeSide]);

    return {
        updateActiveTeam,
        switchSide,
        onPlacePlayer,
        onSlotPlayerBench,
        onAddPlayer,
        onRemovePlayer,
        onUpdatePlayer,
        onMovePlayerToOtherTeam,
        onFormationChange,
        onAutoFillLineup,
        autoFillSide,
    };
};
