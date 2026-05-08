"use client";

import { AddPlayerForm } from "@/components/lineup/AddPlayerForm";
import { RosterList } from "@/components/lineup/RosterList";
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
    onEditPlayer: (player: Player) => void;
    onRequestDeletePlayer: (player: Player) => void;
    onPlacePlayer?: (
        playerId: string,
        targetSlot: string | null,
        sourceSlot: string | null,
    ) => void;
    teamName?: string;
    teamColor?: string;
};

export const RosterPanel = ({
    roster,
    benchIds,
    slotByPlayerId,
    selectedPlayerId,
    onSelectPlayer,
    onAddPlayer,
    onEditPlayer,
    onRequestDeletePlayer,
    onPlacePlayer,
    teamName,
    teamColor,
}: RosterPanelProps) => {
    const benchSet = new Set(benchIds);
    const benchPlayers = roster.filter((p) => benchSet.has(p.id));
    const onPitchPlayers = roster.filter((p) => !benchSet.has(p.id));

    const requestDelete = (id: string) => {
        const p = roster.find((player) => player.id === id);
        if (p) onRequestDeletePlayer(p);
    };

    const sendOnPitchToBench = (id: string) => {
        const slotId = slotByPlayerId?.[id];
        if (!slotId || !onPlacePlayer) return;
        onPlacePlayer(id, null, slotId);
    };

    return (
        <div className="card card-border bg-base-100 h-full overflow-hidden">
            <div className="card-body p-4 gap-3 flex flex-col h-full">
                <div className="flex items-center justify-between gap-2 min-w-0">
                    <h2 className="card-title text-base inline-flex items-center gap-2 min-w-0">
                        <span className="iconify lucide--users size-5 shrink-0" />
                        <span className="truncate">{teamName ?? "Kadro"}</span>
                    </h2>
                    <span
                        className="badge badge-ghost badge-sm shrink-0"
                        title={`${roster.length} oyuncu`}>
                        {roster.length} oyuncu
                    </span>
                </div>

                <AddPlayerForm
                    onAdd={onAddPlayer}
                    existingNumbers={new Set(roster.map((p) => p.number))}
                />

                {benchPlayers.length > 0 && onPitchPlayers.length === 0 && (
                    <div className="flex items-start gap-1.5 text-[11px] text-base-content/50 px-1 leading-snug">
                        <span className="iconify lucide--info size-3 mt-0.5 shrink-0" />
                        <span>
                            Sahaya yerleştirmek için bir oyuncuya dokun veya
                            sürükle.
                        </span>
                    </div>
                )}

                {roster.length === 0 ? (
                    <div className="grow flex flex-col items-center justify-center gap-3 text-center px-4 py-6 text-base-content/55">
                        <div
                            className="size-32 rounded-full bg-cover bg-center ring-2 ring-base-300/50 shadow-lg"
                            style={{
                                backgroundImage: "url('/poster.png')",
                                backgroundPosition: "35% 40%",
                            }}
                            aria-hidden="true"
                        />
                        <div className="text-sm font-medium text-base-content/80">
                            Henüz oyuncu yok
                        </div>
                        <div className="text-xs leading-relaxed max-w-[14rem]">
                            Yukarıdan oyuncu ekleyerek başla. Eklediklerin
                            otomatik olarak boş bir slota yerleşir.
                        </div>
                    </div>
                ) : (
                    <div className="flex flex-col gap-3 grow overflow-auto">
                        <RosterList
                            title="Yedek"
                            icon="lucide--armchair"
                            players={benchPlayers}
                            selectedId={selectedPlayerId}
                            emptyHint="Herkes sahada."
                            onSelect={onSelectPlayer}
                            onRemove={requestDelete}
                            removeIcon="lucide--x"
                            getRemoveLabel={(name) => `${name} oyuncusunu sil`}
                            onEdit={onEditPlayer}
                            onPlacePlayer={onPlacePlayer}
                            slotByPlayerId={slotByPlayerId}
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
                            onRemove={sendOnPitchToBench}
                            removeIcon="lucide--armchair"
                            getRemoveLabel={(name) =>
                                `${name} oyuncusunu yedeğe gönder`
                            }
                            onEdit={onEditPlayer}
                            onPlacePlayer={onPlacePlayer}
                            slotByPlayerId={slotByPlayerId}
                            teamColor={teamColor}
                            selectable={false}
                            draggable
                            droppable
                        />
                    </div>
                )}
            </div>
        </div>
    );
};
