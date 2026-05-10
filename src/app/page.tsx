"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { toast } from "sonner";

import { AppHeader } from "@/components/AppHeader";
import { Drawer } from "@/components/Drawer";
import { ExportModal } from "@/components/ExportModal";
import { ImportModal } from "@/components/ImportModal";
import { ShortcutsModal } from "@/components/ShortcutsModal";
import { ConfirmDeleteModal } from "@/components/lineup/ConfirmDeleteModal";
import { ControlsPanel } from "@/components/lineup/ControlsPanel";
import { DragDropOverlay } from "@/components/lineup/DragDropOverlay";
import { EditPlayerModal } from "@/components/lineup/EditPlayerModal";
import { MobileDrawerNav } from "@/components/lineup/MobileDrawerNav";
import { Pitch } from "@/components/lineup/Pitch";
import { PlayerPickerModal } from "@/components/lineup/PlayerPickerModal";
import { RosterPanel } from "@/components/lineup/RosterPanel";
import { SelectionBar } from "@/components/lineup/SelectionBar";
import { TeamRatingBar } from "@/components/lineup/TeamRatingBar";
import { useCloudSync } from "@/hooks/use-cloud-sync";
import { useFileDrop } from "@/hooks/use-file-drop";
import { useLineupManagement } from "@/hooks/use-lineup-management";
import { useLocalStorage } from "@/hooks/use-local-storage";
import { FORMATIONS } from "@/lib/formations";
import { parseImport } from "@/lib/match-format";
import { computeTeamRating } from "@/lib/player-stats";
import { DEFAULT_MATCH, SIDE_COLORS } from "@/lib/team-defaults";
import type { Match, Player, Side } from "@/types/team";

const STORAGE_KEY = "__OFFICE_FOOTBALL_MATCH_v2__";
const SIDES: Side[] = ["red", "blue"];
const IS_DEV = process.env.NODE_ENV !== "production";

const HomePage = () => {
    const [match, setMatch, matchLoaded] = useLocalStorage<Match>(
        STORAGE_KEY,
        DEFAULT_MATCH,
    );
    const [selectedPlayerId, setSelectedPlayerId] = useState<string | null>(null);
    const [rosterOpen, setRosterOpen] = useState(false);
    const [controlsOpen, setControlsOpen] = useState(false);
    // Modal state lives at the page root so the modals don't render
    // inside the drawer aside (which is transformed off-screen on mobile).
    const [editingPlayer, setEditingPlayer] = useState<Player | null>(null);
    const [confirmingDelete, setConfirmingDelete] = useState<Player | null>(null);
    const [pickingForSlot, setPickingForSlot] = useState<string | null>(null);
    const [exportOpen, setExportOpen] = useState(false);
    const [importOpen, setImportOpen] = useState(false);
    const [shortcutsOpen, setShortcutsOpen] = useState(false);
    const cloudStatus = useCloudSync(match, setMatch, matchLoaded);

    useEffect(() => {
        // Native HTML5 drag-and-drop doesn't fire on touch devices. The
        // polyfill synthesises drag events from touch input so the existing
        // handlers work on phones. holdToDrag lets users still scroll the
        // roster panel — only a deliberate long-press starts a drag.
        import("mobile-drag-drop").then(({ polyfill }) => {
            polyfill({ holdToDrag: 200 });
        });
    }, []);

    // Drag ghosts use CSS background-image for player photos, which paints
    // empty until the URL is fully decoded. Without this, the first drag of
    // a player shows an empty circle; the second drag works because the
    // browser HTTP-cached the photo. Decode each photoUrl once so ghosts
    // are correct from the first drag onward.
    const preloadedPhotos = useRef<Set<string>>(new Set());
    useEffect(() => {
        for (const side of SIDES) {
            for (const p of match[side].roster) {
                if (!p.photoUrl || preloadedPhotos.current.has(p.photoUrl)) {
                    continue;
                }
                preloadedPhotos.current.add(p.photoUrl);
                const img = new Image();
                img.src = p.photoUrl;
                img.decode().catch(() => {
                    // If decode fails, drop from the set so it can retry on
                    // the next render.
                    preloadedPhotos.current.delete(p.photoUrl!);
                });
            }
        }
    }, [match]);

    const closeDrawers = () => {
        setRosterOpen(false);
        setControlsOpen(false);
    };
    const toggleRoster = () => {
        setControlsOpen(false);
        setRosterOpen((v) => !v);
    };
    const toggleControls = () => {
        setRosterOpen(false);
        setControlsOpen((v) => !v);
    };

    const activeSide = match.activeSide;
    const activeTeam = match[activeSide];
    const otherSide: Side = activeSide === "red" ? "blue" : "red";
    const otherTeam = match[otherSide];
    const activeColor = SIDE_COLORS[activeSide];
    const otherColor = SIDE_COLORS[otherSide];
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

    const teamRatings: Record<Side, ReturnType<typeof computeTeamRating>> = useMemo(
        () => ({
            red: computeTeamRating(match.red, FORMATIONS[match.red.formation]),
            blue: computeTeamRating(match.blue, FORMATIONS[match.blue.formation]),
        }),
        [match.red, match.blue],
    );
    const playerCountMismatch =
        teamRatings.red.starters !== teamRatings.blue.starters;

    const {
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
    } = useLineupManagement({
        match,
        setMatch,
        selectedPlayerId,
        setSelectedPlayerId,
    });

    // "Hizala" CTA fills the shorter side's empty slots from its bench.
    // Only actionable when there's a mismatch AND the shorter side has
    // bench players to draw from.
    const evenOutSide: Side | null = playerCountMismatch
        ? teamRatings.red.starters < teamRatings.blue.starters
            ? "red"
            : "blue"
        : null;
    const evenOutSideHasBench = evenOutSide
        ? match[evenOutSide].roster.length > teamRatings[evenOutSide].starters
        : false;
    const onEvenOut =
        evenOutSide && evenOutSideHasBench
            ? () => autoFillSide(evenOutSide)
            : undefined;

    useEffect(() => {
        const onKey = (e: KeyboardEvent) => {
            // Don't hijack browser/system shortcuts.
            if (e.metaKey || e.ctrlKey || e.altKey) return;
            // Don't hijack keys while the user is typing into a field.
            const t = e.target as HTMLElement | null;
            if (
                t &&
                (t.tagName === "INPUT" ||
                    t.tagName === "TEXTAREA" ||
                    t.isContentEditable)
            ) {
                return;
            }

            if (e.key === "Escape") {
                if (rosterOpen || controlsOpen) {
                    closeDrawers();
                } else if (selectedPlayerId) {
                    setSelectedPlayerId(null);
                }
                return;
            }
            if (e.key === "1") switchSide("red");
            else if (e.key === "2") switchSide("blue");
            else if (e.key === "?") setShortcutsOpen(true);
        };
        document.addEventListener("keydown", onKey);
        return () => document.removeEventListener("keydown", onKey);
    }, [rosterOpen, controlsOpen, selectedPlayerId, activeSide, match]);

    useEffect(() => {
        if (!IS_DEV) return;
        const onKey = (e: KeyboardEvent) => {
            if (!e.ctrlKey || !e.shiftKey || e.altKey || e.metaKey) return;
            const key = e.key.toLowerCase();
            if (key === "e") {
                e.preventDefault();
                setExportOpen(true);
            } else if (key === "m") {
                e.preventDefault();
                setImportOpen(true);
            }
        };
        document.addEventListener("keydown", onKey);
        return () => document.removeEventListener("keydown", onKey);
    }, []);

    const onSlotClick = (slotId: string) => {
        if (selectedPlayerId) {
            const sourceSlot = slotByPlayerId[selectedPlayerId] ?? null;
            onPlacePlayer(selectedPlayerId, slotId, sourceSlot);
            return;
        }
        // No player selected — open a picker so the user can choose
        // straight from the bench without first opening the roster panel.
        setPickingForSlot(slotId);
    };

    const onSlotPlayerClick = (slotId: string) => {
        const playerInSlot = activeTeam.assignments[slotId];
        if (!playerInSlot) return;

        if (!selectedPlayerId) {
            setSelectedPlayerId(playerInSlot);
            return;
        }
        if (selectedPlayerId === playerInSlot) {
            setSelectedPlayerId(null);
            return;
        }
        const sourceSlot = slotByPlayerId[selectedPlayerId] ?? null;
        onPlacePlayer(selectedPlayerId, slotId, sourceSlot);
    };

    const selectedPlayer = selectedPlayerId
        ? playersBySide[activeSide][selectedPlayerId]
        : undefined;
    const selectedPlayerSlot = selectedPlayerId
        ? (slotByPlayerId[selectedPlayerId] ?? null)
        : null;

    const benchPlayers = useMemo(
        () => activeTeam.roster.filter((p) => benchIds.includes(p.id)),
        [activeTeam.roster, benchIds],
    );
    const pickingSlotPosition =
        pickingForSlot
            ? (formation.slots.find((s) => s.id === pickingForSlot)?.role ?? null)
            : null;

    const handleDroppedFile = async (file: File) => {
        try {
            const text = await file.text();
            const parsed = JSON.parse(text);
            const teams = parseImport(parsed);
            if (!teams) {
                toast.error("Geçersiz maç dosyası", {
                    description:
                        "red ve blue alanları gerekli (lineup ve bench içermeli).",
                });
                return;
            }
            setMatch((prev) => ({ ...teams, activeSide: prev.activeSide }));
            setSelectedPlayerId(null);
            toast.success("Maç içe aktarıldı");
        } catch {
            toast.error("Dosya okunamadı");
        }
    };

    const fileDrop = useFileDrop(handleDroppedFile);

    return (
        <div
            className="app-root flex h-screen flex-col bg-base-200/85"
            {...fileDrop.bind}>
            <AppHeader
                teamNames={{ red: match.red.name, blue: match.blue.name }}
                activeSide={activeSide}
                onSwitchSide={switchSide}
                onShowShortcuts={() => setShortcutsOpen(true)}
                cloudStatus={cloudStatus}
            />

            {selectedPlayer ? (
                <SelectionBar
                    selectedPlayer={selectedPlayer}
                    selectedPlayerSlot={selectedPlayerSlot}
                    otherTeamName={otherTeam.name}
                    otherTeamColor={otherColor}
                    onEdit={setEditingPlayer}
                    onSendToBench={onSlotPlayerBench}
                    onMoveToOtherTeam={onMovePlayerToOtherTeam}
                    onCancel={() => setSelectedPlayerId(null)}
                />
            ) : (
                <>
                    <MobileDrawerNav
                        rosterOpen={rosterOpen}
                        controlsOpen={controlsOpen}
                        onToggleRoster={toggleRoster}
                        onToggleControls={toggleControls}
                    />
                    <SelectionBar
                        className="hidden lg:flex"
                        selectedPlayer={null}
                        selectedPlayerSlot={null}
                        otherTeamName={otherTeam.name}
                        otherTeamColor={otherColor}
                        onEdit={setEditingPlayer}
                        onSendToBench={onSlotPlayerBench}
                        onMoveToOtherTeam={onMovePlayerToOtherTeam}
                        onCancel={() => setSelectedPlayerId(null)}
                    />
                </>
            )}

            <div
                className="h-[3px] w-full shrink-0 transition-colors duration-300"
                style={{ backgroundColor: activeColor }}
                aria-hidden="true"
            />

            <main className="relative grid grow grid-cols-1 gap-3 overflow-hidden p-3 lg:grid-cols-[260px_1fr_260px] xl:grid-cols-[260px_1fr_1fr_260px]">
                {(rosterOpen || controlsOpen) && (
                    <button
                        type="button"
                        aria-label="Paneli kapat"
                        onClick={closeDrawers}
                        className="absolute inset-0 z-30 bg-black/40 lg:hidden"
                    />
                )}

                <Drawer side="left" open={rosterOpen}>
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
                        onEditPlayer={setEditingPlayer}
                        onRequestDeletePlayer={setConfirmingDelete}
                        onPlacePlayer={onPlacePlayer}
                        teamName={activeTeam.name}
                        teamColor={activeColor}
                    />
                </Drawer>

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
                            <div className="w-full max-w-[420px]">
                                <TeamRatingBar
                                    rating={teamRatings[side]}
                                    teamColor={SIDE_COLORS[side]}
                                    teamName={team.name}
                                    countMismatch={playerCountMismatch}
                                    onEvenOut={onEvenOut}
                                    opposing={
                                        isActive
                                            ? {
                                                  rating: teamRatings[otherSide],
                                                  name: otherTeam.name,
                                                  color: otherColor,
                                              }
                                            : undefined
                                    }
                                />
                            </div>
                            <div
                                className={`w-full max-w-[420px] rounded-lg transition ${
                                    isActive
                                        ? "xl:ring-2 xl:ring-primary/50 xl:ring-offset-2 xl:ring-offset-base-200"
                                        : "xl:opacity-70 xl:cursor-pointer"
                                }`}>
                                <Pitch
                                    formation={teamFormation}
                                    assignments={team.assignments}
                                    playerById={playersBySide[side]}
                                    selectedPlayerId={isActive ? selectedPlayerId : null}
                                    onSlotClick={onSideSlotClick}
                                    onSlotPlayerClick={onSideSlotPlayerClick}
                                    onSlotDrop={onSideSlotDrop}
                                    teamColor={SIDE_COLORS[side]}
                                />
                            </div>
                        </div>
                    );
                })}

                <Drawer side="right" open={controlsOpen}>
                    <ControlsPanel
                        team={activeTeam}
                        onTeamNameChange={(name) => updateActiveTeam({ name })}
                        onFormationChange={onFormationChange}
                        onAutoFillLineup={onAutoFillLineup}
                        assignedCount={assignedCount}
                        slotsCount={formation.slots.length}
                        benchSize={benchIds.length}
                    />
                </Drawer>
            </main>

            <DragDropOverlay visible={fileDrop.active} />

            <EditPlayerModal
                player={editingPlayer}
                teamColor={activeColor}
                onClose={() => setEditingPlayer(null)}
                onSave={(id, changes) => {
                    onUpdatePlayer(id, changes);
                    setEditingPlayer(null);
                }}
            />
            <ConfirmDeleteModal
                player={confirmingDelete}
                onClose={() => setConfirmingDelete(null)}
                onConfirm={() => {
                    if (confirmingDelete) onRemovePlayer(confirmingDelete.id);
                    setConfirmingDelete(null);
                }}
            />
            <PlayerPickerModal
                open={pickingForSlot !== null}
                slotPosition={pickingSlotPosition}
                benchPlayers={benchPlayers}
                teamColor={activeColor}
                onClose={() => setPickingForSlot(null)}
                onPick={(playerId) => {
                    if (pickingForSlot) {
                        onPlacePlayer(playerId, pickingForSlot, null);
                    }
                    setPickingForSlot(null);
                }}
            />
            {IS_DEV && (
                <>
                    <ExportModal
                        open={exportOpen}
                        onClose={() => setExportOpen(false)}
                        match={match}
                    />
                    <ImportModal
                        open={importOpen}
                        onClose={() => setImportOpen(false)}
                        onImport={(teams) => {
                            setMatch((prev) => ({ ...teams, activeSide: prev.activeSide }));
                            setSelectedPlayerId(null);
                        }}
                    />
                </>
            )}
            <ShortcutsModal
                open={shortcutsOpen}
                onClose={() => setShortcutsOpen(false)}
            />
        </div>
    );
};

export default HomePage;
