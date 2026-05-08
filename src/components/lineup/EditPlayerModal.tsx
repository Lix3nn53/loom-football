"use client";

import { useEffect, useState } from "react";

import { PlayerCard } from "@/components/lineup/PlayerCard";
import { StatSlider } from "@/components/lineup/StatSlider";
import { DEFAULT_STATS, STAT_KEYS, clampStat } from "@/lib/player-stats";
import type { Player, PlayerStats, StatKey } from "@/types/team";

type EditPlayerModalProps = {
    player: Player | null;
    teamColor: string;
    onClose: () => void;
    onSave: (id: string, changes: Partial<Player>) => void;
};

export const EditPlayerModal = ({
    player,
    teamColor,
    onClose,
    onSave,
}: EditPlayerModalProps) => {
    const [name, setName] = useState("");
    const [number, setNumber] = useState<number>(1);
    const [photoUrl, setPhotoUrl] = useState("");
    const [stats, setStats] = useState<PlayerStats>(DEFAULT_STATS);

    useEffect(() => {
        if (player) {
            setName(player.name);
            setNumber(player.number);
            setPhotoUrl(player.photoUrl ?? "");
            setStats(player.stats);
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

    const setStat = (key: StatKey, raw: number) => {
        setStats((s) => ({ ...s, [key]: clampStat(raw) }));
    };

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
            stats,
        });
    };

    // Build a transient player so the preview reflects unsaved edits.
    const previewPlayer: Player | null = player
        ? {
              ...player,
              name: name.trim() || player.name,
              number: Math.max(1, Math.min(99, number || 1)),
              ...(photoUrl.trim() ? { photoUrl: photoUrl.trim() } : {}),
              stats,
          }
        : null;

    return (
        <dialog className={`modal ${player ? "modal-open" : ""}`}>
            <div className="modal-box max-w-2xl p-0 flex flex-col max-h-[92vh] overflow-hidden">
                <div className="flex items-center justify-between px-4 py-3 border-b border-base-300 shrink-0">
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

                <div className="grow overflow-y-auto p-4 grid gap-4 sm:grid-cols-[11rem_1fr]">
                    <div className="flex justify-center sm:justify-start">
                        {previewPlayer && (
                            <PlayerCard player={previewPlayer} teamColor={teamColor} />
                        )}
                    </div>

                    <div className="flex flex-col gap-3 min-w-0">
                        <fieldset className="fieldset">
                            <legend className="fieldset-legend text-sm">Kimlik</legend>
                            <div className="join w-full">
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
                            <input
                                type="url"
                                placeholder="Fotoğraf URL (opsiyonel)"
                                value={photoUrl}
                                onChange={(e) => setPhotoUrl(e.target.value)}
                                className="input input-sm w-full mt-2"
                            />
                        </fieldset>

                        <fieldset className="fieldset">
                            <legend className="fieldset-legend text-sm">
                                İstatistikler
                            </legend>
                            <div className="bg-base-200 rounded-box px-3 py-1">
                                {STAT_KEYS.map((key) => (
                                    <StatSlider
                                        key={key}
                                        statKey={key}
                                        value={stats[key]}
                                        onChange={(v) => setStat(key, v)}
                                    />
                                ))}
                            </div>
                        </fieldset>
                    </div>
                </div>

                <div className="flex justify-end gap-2 px-4 py-3 border-t border-base-300 bg-base-200/50 shrink-0">
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
