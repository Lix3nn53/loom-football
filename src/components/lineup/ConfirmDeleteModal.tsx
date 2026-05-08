"use client";

import { useEffect } from "react";

import type { Player } from "@/types/team";

type ConfirmDeleteModalProps = {
    player: Player | null;
    onClose: () => void;
    onConfirm: () => void;
};

export const ConfirmDeleteModal = ({
    player,
    onClose,
    onConfirm,
}: ConfirmDeleteModalProps) => {
    useEffect(() => {
        if (!player) return;
        const onKey = (e: KeyboardEvent) => {
            if (e.key === "Escape") onClose();
            else if (e.key === "Enter") onConfirm();
        };
        document.addEventListener("keydown", onKey);
        return () => document.removeEventListener("keydown", onKey);
    }, [player, onClose, onConfirm]);

    return (
        <dialog className={`modal ${player ? "modal-open" : ""}`}>
            <div className="modal-box max-w-sm">
                <h3 className="font-semibold inline-flex items-center gap-2 mb-2">
                    <span className="iconify lucide--triangle-alert size-5 text-warning" />
                    Oyuncuyu sil?
                </h3>
                <p className="text-sm text-base-content/70 mb-4">
                    <span className="font-semibold text-base-content">
                        {player?.name}
                    </span>{" "}
                    kadrodan kalıcı olarak silinsin mi?
                </p>
                <div className="modal-action">
                    <button
                        type="button"
                        onClick={onClose}
                        className="btn btn-sm btn-ghost">
                        İptal
                    </button>
                    <button
                        type="button"
                        onClick={onConfirm}
                        className="btn btn-sm btn-error"
                        autoFocus>
                        <span className="iconify lucide--trash-2 size-4" />
                        Sil
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
