"use client";

import { useEscapeToClose } from "@/hooks/use-escape-to-close";

type ShortcutsModalProps = {
    open: boolean;
    onClose: () => void;
};

const SHORTCUTS: { keys: string[]; label: string }[] = [
    { keys: ["1"], label: "Kırmızı takıma geç" },
    { keys: ["2"], label: "Mavi takıma geç" },
    { keys: ["Esc"], label: "Seçimi / paneli kapat" },
];

export const ShortcutsModal = ({ open, onClose }: ShortcutsModalProps) => {
    useEscapeToClose(open, onClose);

    return (
        <dialog className={`modal ${open ? "modal-open" : ""}`}>
            <div className="modal-box max-w-md">
                <div className="flex items-center justify-between mb-3">
                    <h3 className="font-semibold inline-flex items-center gap-2">
                        <span className="iconify lucide--keyboard size-5" />
                        Klavye kısayolları
                    </h3>
                    <button
                        type="button"
                        onClick={onClose}
                        className="btn btn-ghost btn-sm btn-square"
                        aria-label="Kapat">
                        <span className="iconify lucide--x size-4" />
                    </button>
                </div>

                <ul className="flex flex-col gap-2">
                    {SHORTCUTS.map((s) => (
                        <li
                            key={s.label}
                            className="flex items-center justify-between gap-3 py-1.5 px-2 rounded-box bg-base-200">
                            <span className="text-sm">{s.label}</span>
                            <span className="flex items-center gap-1">
                                {s.keys.map((k) => (
                                    <kbd key={k} className="kbd kbd-sm">
                                        {k}
                                    </kbd>
                                ))}
                            </span>
                        </li>
                    ))}
                </ul>

                <p className="text-xs text-base-content/50 mt-3">
                    Sahaya tıkla, oyuncu seç, sürükle-bırak veya boş slota tıklayarak
                    yedekten oyuncu çek.
                </p>

                <div className="modal-action">
                    <button
                        type="button"
                        onClick={onClose}
                        className="btn btn-sm btn-ghost">
                        Kapat
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
