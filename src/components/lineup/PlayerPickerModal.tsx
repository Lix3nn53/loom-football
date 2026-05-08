"use client";

import { useEffect, useMemo } from "react";

import { OvrBadge } from "@/components/lineup/PlayerCard";
import { computeOverall } from "@/lib/player-stats";
import type { Player, Position } from "@/types/team";

type PlayerPickerModalProps = {
    open: boolean;
    slotPosition: Position | null;
    benchPlayers: Player[];
    teamColor: string;
    onPick: (playerId: string) => void;
    onClose: () => void;
};

export const PlayerPickerModal = ({
    open,
    slotPosition,
    benchPlayers,
    teamColor,
    onPick,
    onClose,
}: PlayerPickerModalProps) => {
    const sortedPlayers = useMemo(() => {
        if (!slotPosition) return [];
        return [...benchPlayers].sort(
            (a, b) =>
                computeOverall(b.stats, slotPosition) -
                computeOverall(a.stats, slotPosition),
        );
    }, [benchPlayers, slotPosition]);

    useEffect(() => {
        if (!open) return;
        const onKey = (e: KeyboardEvent) => {
            if (e.key === "Escape") onClose();
        };
        document.addEventListener("keydown", onKey);
        return () => document.removeEventListener("keydown", onKey);
    }, [open, onClose]);

    return (
        <dialog className={`modal ${open ? "modal-open" : ""}`}>
            <div className="modal-box max-w-md p-0 flex flex-col max-h-[85vh] overflow-hidden">
                <div className="flex items-center justify-between px-4 py-3 border-b border-base-300 shrink-0">
                    <h3 className="font-semibold inline-flex items-center gap-2">
                        <span className="iconify lucide--user-plus size-5" />
                        {slotPosition
                            ? `${slotPosition} pozisyonuna oyuncu seç`
                            : "Oyuncu seç"}
                    </h3>
                    <button
                        type="button"
                        onClick={onClose}
                        className="btn btn-ghost btn-sm btn-square"
                        aria-label="Kapat">
                        <span className="iconify lucide--x size-4" />
                    </button>
                </div>

                <div className="grow overflow-y-auto">
                    {sortedPlayers.length === 0 ? (
                        <div className="flex flex-col items-center justify-center text-center px-6 py-12 text-base-content/55 gap-2">
                            <span className="iconify lucide--users-round size-10 opacity-60" />
                            <div className="text-sm font-medium">
                                Yedek boş
                            </div>
                            <div className="text-xs leading-relaxed max-w-[16rem]">
                                Önce yan paneldeki "Yeni oyuncu" ile kadroya
                                oyuncu ekle.
                            </div>
                        </div>
                    ) : (
                        <ul className="divide-y divide-base-200">
                            {sortedPlayers.map((p) => {
                                const ovr = slotPosition
                                    ? computeOverall(p.stats, slotPosition)
                                    : 0;
                                return (
                                    <li key={p.id}>
                                        <button
                                            type="button"
                                            onClick={() => onPick(p.id)}
                                            className="w-full flex items-center gap-3 px-3 py-2.5 active:bg-base-300 transition-colors text-left">
                                            <div
                                                className={`size-10 shrink-0 rounded-full overflow-hidden ${
                                                    p.photoUrl ? "" : "poster-photo"
                                                }`}
                                                style={{
                                                    backgroundColor: teamColor,
                                                    backgroundImage: p.photoUrl
                                                        ? `url(${p.photoUrl})`
                                                        : undefined,
                                                    backgroundSize: "cover",
                                                    backgroundPosition: "center",
                                                }}
                                            />
                                            <div className="grow min-w-0">
                                                <div className="truncate text-sm font-medium">
                                                    {p.name}
                                                </div>
                                                <div className="text-[11px] text-base-content/55 font-mono">
                                                    #{p.number}
                                                </div>
                                            </div>
                                            <OvrBadge
                                                value={ovr}
                                                size="sm"
                                                label={slotPosition ?? undefined}
                                                showLabel={!!slotPosition}
                                            />
                                        </button>
                                    </li>
                                );
                            })}
                        </ul>
                    )}
                </div>

                <div className="flex justify-end gap-2 px-4 py-3 border-t border-base-300 bg-base-200/50 shrink-0">
                    <button
                        type="button"
                        onClick={onClose}
                        className="btn btn-sm btn-ghost">
                        İptal
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
