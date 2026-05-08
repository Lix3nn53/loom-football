"use client";

import { useRef, useState } from "react";

// Tracks whether the user is currently dragging a file over a target. Returns
// the active flag plus DOM handler bindings to spread onto the drop target.
// Uses a depth counter so nested children don't flicker the active state when
// dragenter/dragleave bubble.
export const useFileDrop = (onFile: (file: File) => void) => {
    const [active, setActive] = useState(false);
    const depthRef = useRef(0);

    const isFileDrag = (e: React.DragEvent) =>
        Array.from(e.dataTransfer.types).includes("Files");

    const bind = {
        onDragEnter: (e: React.DragEvent) => {
            if (!isFileDrag(e)) return;
            e.preventDefault();
            depthRef.current += 1;
            setActive(true);
        },
        onDragOver: (e: React.DragEvent) => {
            if (!isFileDrag(e)) return;
            e.preventDefault();
            e.dataTransfer.dropEffect = "copy";
        },
        onDragLeave: () => {
            depthRef.current = Math.max(0, depthRef.current - 1);
            if (depthRef.current === 0) setActive(false);
        },
        onDrop: (e: React.DragEvent) => {
            if (!isFileDrag(e)) return;
            e.preventDefault();
            depthRef.current = 0;
            setActive(false);
            const file = e.dataTransfer.files?.[0];
            if (file) onFile(file);
        },
    } as const;

    return { active, bind };
};
