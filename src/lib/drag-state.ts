// Module-level state for the active drag operation.
// Browser DataTransfer is used to satisfy drag start (with text/plain), but we
// read the actual payload from this module — avoids cross-browser quirks
// around custom MIME types and getData() during dragover.

export type ActiveDrag = {
    playerId: string;
    sourceSlot: string | null;
};

let activeDrag: ActiveDrag | null = null;

export const setActiveDrag = (drag: ActiveDrag | null) => {
    activeDrag = drag;
};

export const getActiveDrag = (): ActiveDrag | null => activeDrag;

export const isPlayerDragActive = (): boolean => activeDrag !== null;
