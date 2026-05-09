"use client";

import type { Player } from "@/types/team";

type SelectionBarProps = {
    selectedPlayer: Player;
    selectedPlayerSlot: string | null;
    otherTeamName: string;
    otherTeamColor: string;
    onEdit: (player: Player) => void;
    onSendToBench: (slotId: string) => void;
    onMoveToOtherTeam: (playerId: string) => void;
    onCancel: () => void;
};

const buttonClass =
    "flex-1 flex items-center justify-center gap-1.5 py-2.5 text-sm font-medium active:bg-base-300";

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
            className="flex items-stretch shrink-0 border-b border-primary/40 bg-[color-mix(in_oklab,var(--color-primary)_10%,var(--color-base-100))]"
            role="status"
            aria-live="polite">
            <button
                type="button"
                onClick={() => onEdit(selectedPlayer)}
                className={buttonClass}
                title="Bilgi">
                <span className="iconify lucide--info size-5" />
                Bilgi
            </button>

            {selectedPlayerSlot && (
                <>
                    <div className="w-px bg-base-300" aria-hidden="true" />
                    <button
                        type="button"
                        onClick={() => onSendToBench(selectedPlayerSlot)}
                        className={`${buttonClass} text-warning`}
                        title="Yedeğe gönder">
                        <span className="iconify lucide--armchair size-5" />
                        Yedek
                    </button>
                </>
            )}

            <div className="w-px bg-base-300" aria-hidden="true" />
            <button
                type="button"
                onClick={() => onMoveToOtherTeam(selectedPlayer.id)}
                className={buttonClass}
                aria-label={`${otherTeamName} takımına gönder`}
                title={`${otherTeamName} takımına gönder`}>
                <span className="iconify lucide--arrow-right size-5" />
                <span
                    className="size-3 rounded-full ring-1 ring-base-content/20 shrink-0"
                    style={{ backgroundColor: otherTeamColor }}
                    aria-hidden="true"
                />
            </button>

            <div className="w-px bg-base-300" aria-hidden="true" />
            <button
                type="button"
                onClick={onCancel}
                className="px-4 flex items-center justify-center text-base-content/70 active:bg-base-300"
                aria-label="Seçimi iptal et"
                title="İptal">
                <span className="iconify lucide--x size-5" />
            </button>
        </div>
    );
};
