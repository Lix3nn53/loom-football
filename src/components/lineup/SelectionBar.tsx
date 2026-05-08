"use client";

import type { Player } from "@/types/team";

type SelectionBarProps = {
    selectedPlayer: Player | undefined;
    selectedPlayerSlot: string | null;
    otherTeamName: string;
    otherTeamColor: string;
    onEdit: (player: Player) => void;
    onSendToBench: (slotId: string) => void;
    onMoveToOtherTeam: (playerId: string) => void;
    onCancel: () => void;
};

export const SelectionBar = ({
    selectedPlayer,
    selectedPlayerSlot,
    otherTeamName,
    otherTeamColor,
    onEdit,
    onSendToBench,
    onMoveToOtherTeam,
    onCancel,
}: SelectionBarProps) => {
    return (
        <div
            className={`shrink-0 flex items-center gap-2 border-t px-3 py-3 min-h-[60px] transition-colors ${
                selectedPlayer
                    ? "border-primary/40 bg-primary/10"
                    : "border-base-300 bg-base-100"
            }`}
            role="status"
            aria-live="polite">
            {selectedPlayer ? (
                <>
                    <span className="iconify lucide--mouse-pointer-click size-5 shrink-0 text-primary" />
                    <span className="min-w-0 flex-1 truncate">
                        <span className="font-mono text-base-content/70 mr-1">
                            #{selectedPlayer.number}
                        </span>
                        <span className="font-semibold">{selectedPlayer.name}</span>
                    </span>

                    <button
                        type="button"
                        onClick={() => onEdit(selectedPlayer)}
                        className="btn shrink-0"
                        title="Bilgi">
                        <span className="iconify lucide--info size-4" />
                        <span>Bilgi</span>
                    </button>

                    {selectedPlayerSlot && (
                        <button
                            type="button"
                            onClick={() => onSendToBench(selectedPlayerSlot)}
                            className="btn btn-warning shrink-0"
                            title="Yedeğe gönder">
                            <span className="iconify lucide--armchair size-4" />
                            <span>Yedek</span>
                        </button>
                    )}

                    <button
                        type="button"
                        onClick={() => onMoveToOtherTeam(selectedPlayer.id)}
                        className="btn shrink-0 border"
                        style={{
                            borderColor: otherTeamColor,
                            backgroundColor: `${otherTeamColor}26`,
                            color: "inherit",
                        }}
                        aria-label={`${otherTeamName} takımına gönder`}
                        title={`${otherTeamName} takımına gönder`}>
                        <span className="iconify lucide--arrow-right size-4" />
                        <span
                            className="size-2.5 rounded-full ring-1 ring-base-content/20 shrink-0"
                            style={{ backgroundColor: otherTeamColor }}
                            aria-hidden="true"
                        />
                    </button>

                    <button
                        type="button"
                        onClick={onCancel}
                        className="btn btn-ghost btn-square shrink-0"
                        aria-label="Seçimi iptal et"
                        title="İptal">
                        <span className="iconify lucide--x size-5" />
                    </button>
                </>
            ) : (
                <span className="flex items-center gap-2 text-base-content/45 flex-1 justify-center text-xs">
                    <span className="iconify lucide--hand size-4 shrink-0" />
                    <span>Bir oyuncuya dokun</span>
                </span>
            )}
        </div>
    );
};
