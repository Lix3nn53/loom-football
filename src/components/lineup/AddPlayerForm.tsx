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

    const parsedNumber = parseInt(number, 10);
    const typedNumber =
        number.trim() === "" || Number.isNaN(parsedNumber)
            ? null
            : Math.max(1, Math.min(99, parsedNumber));
    const numberTaken = typedNumber !== null && existingNumbers.has(typedNumber);
    const suggestedNumber = numberTaken ? pickUnusedNumber(existingNumbers) : null;

    const submit = () => {
        const trimmed = name.trim();
        if (!trimmed) return;
        if (numberTaken) return;
        const resolvedNumber =
            typedNumber !== null
                ? typedNumber
                : pickUnusedNumber(existingNumbers);
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
                    placeholder="1-99"
                    className="input input-sm join-item w-16 no-spinner"
                    aria-label="Forma numarası (boş bırakırsan rastgele atanır)"
                />
                <button
                    type="button"
                    onClick={submit}
                    disabled={!name.trim() || numberTaken}
                    className="btn btn-sm btn-primary join-item"
                    aria-label="Oyuncu ekle">
                    <span className="iconify lucide--plus size-4" />
                </button>
            </div>
            {numberTaken && suggestedNumber !== null ? (
                <div className="text-xs text-warning mt-1 flex items-center gap-2">
                    <span className="iconify lucide--triangle-alert size-3.5 shrink-0" />
                    <span className="grow">#{typedNumber} kullanılıyor.</span>
                    <button
                        type="button"
                        onClick={() => setNumber(String(suggestedNumber))}
                        className="btn btn-xs btn-ghost">
                        #{suggestedNumber} kullan
                    </button>
                </div>
            ) : (
                <p className="text-[10px] text-base-content/50 mt-1">
                    No alanını boş bırakırsan rastgele bir numara atanır.
                </p>
            )}
            <div className="join w-full mt-2">
                <input
                    type="url"
                    placeholder="Fotoğraf URL (opsiyonel)"
                    value={photoUrl}
                    onChange={(e) => setPhotoUrl(e.target.value)}
                    onKeyDown={(e) => {
                        if (e.key === "Enter") submit();
                        if (e.key === "Escape") setOpen(false);
                    }}
                    className="input input-sm join-item flex-1"
                />
                {photoUrl.trim() && (
                    <div
                        className="join-item flex items-center justify-center bg-base-100 border border-base-300 px-2"
                        aria-hidden="true">
                        <div
                            className="size-7 rounded-full bg-base-200 bg-cover bg-center"
                            style={{ backgroundImage: `url(${photoUrl.trim()})` }}
                            title="Fotoğraf önizleme"
                        />
                    </div>
                )}
            </div>
        </fieldset>
    );
};
