"use client";

import { useEffect, useRef, useState } from "react";

type AddPlayerFormProps = {
    onAdd: (data: { name: string; number: number; photoUrl?: string }) => void;
    existingNumbers: Set<number>;
};

const pickUnusedNumber = (existing: Set<number>): number => {
    const available: number[] = [];
    for (let i = 1; i <= 99; i++) {
        if (!existing.has(i)) available.push(i);
    }
    if (available.length === 0) return Math.floor(Math.random() * 99) + 1;
    return available[Math.floor(Math.random() * available.length)];
};

export const AddPlayerForm = ({ onAdd, existingNumbers }: AddPlayerFormProps) => {
    const [open, setOpen] = useState(false);
    const [name, setName] = useState("");
    const [number, setNumber] = useState<string>("");
    const [photoUrl, setPhotoUrl] = useState("");
    const nameInputRef = useRef<HTMLInputElement>(null);

    useEffect(() => {
        if (open) nameInputRef.current?.focus();
    }, [open]);

    const submit = () => {
        const trimmed = name.trim();
        if (!trimmed) return;
        const parsed = parseInt(number, 10);
        const resolvedNumber =
            number.trim() === "" || Number.isNaN(parsed)
                ? pickUnusedNumber(existingNumbers)
                : Math.max(1, Math.min(99, parsed));
        const url = photoUrl.trim();
        onAdd({
            name: trimmed,
            number: resolvedNumber,
            ...(url ? { photoUrl: url } : {}),
        });
        setName("");
        setPhotoUrl("");
        setNumber("");
        nameInputRef.current?.focus();
    };

    if (!open) {
        return (
            <button
                type="button"
                onClick={() => setOpen(true)}
                className="btn btn-sm btn-outline w-full justify-center gap-2">
                <span className="iconify lucide--plus size-4" />
                Yeni oyuncu
            </button>
        );
    }

    return (
        <fieldset className="fieldset bg-base-200 rounded-box p-3">
            <div className="flex items-center justify-between mb-1">
                <legend className="fieldset-legend">Oyuncu ekle</legend>
                <button
                    type="button"
                    onClick={() => setOpen(false)}
                    className="btn btn-ghost btn-xs btn-square"
                    aria-label="Formu kapat">
                    <span className="iconify lucide--x size-3.5" />
                </button>
            </div>
            <div className="join w-full">
                <input
                    ref={nameInputRef}
                    type="text"
                    placeholder="Oyuncu adı"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    onKeyDown={(e) => {
                        if (e.key === "Enter") submit();
                        if (e.key === "Escape") setOpen(false);
                    }}
                    className="input input-sm join-item flex-1"
                />
                <input
                    type="number"
                    min={1}
                    max={99}
                    value={number}
                    onChange={(e) => setNumber(e.target.value)}
                    placeholder="No."
                    title="Boş bırakırsan rastgele numara verilir"
                    className="input input-sm join-item w-16 no-spinner"
                    aria-label="Forma numarası (boş = rastgele)"
                />
                <button
                    type="button"
                    onClick={submit}
                    disabled={!name.trim()}
                    className="btn btn-sm btn-primary join-item"
                    aria-label="Oyuncu ekle">
                    <span className="iconify lucide--plus size-4" />
                </button>
            </div>
            <input
                type="url"
                placeholder="Fotoğraf URL (opsiyonel)"
                value={photoUrl}
                onChange={(e) => setPhotoUrl(e.target.value)}
                onKeyDown={(e) => {
                    if (e.key === "Enter") submit();
                    if (e.key === "Escape") setOpen(false);
                }}
                className="input input-sm w-full mt-2"
            />
        </fieldset>
    );
};
