"use client";

type DragDropOverlayProps = {
    visible: boolean;
};

export const DragDropOverlay = ({ visible }: DragDropOverlayProps) => {
    if (!visible) return null;
    return (
        <div className="pointer-events-none fixed inset-0 z-50 flex items-center justify-center bg-base-100/85 backdrop-blur-sm">
            <div className="pointer-events-none rounded-box border-2 border-dashed border-primary bg-primary/10 px-10 py-8 text-center">
                <span className="iconify lucide--file-up size-12 text-primary block mx-auto" />
                <div className="text-xl font-semibold mt-2">
                    Maçı içe aktarmak için JSON bırak
                </div>
                <div className="text-xs text-base-content/60 mt-1">
                    Mevcut maçın üzerine yazılır. Bulut kaydı senkronlar.
                </div>
            </div>
        </div>
    );
};
