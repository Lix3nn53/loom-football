"use client";

type MobileDrawerNavProps = {
    rosterOpen: boolean;
    controlsOpen: boolean;
    onToggleRoster: () => void;
    onToggleControls: () => void;
};

export const MobileDrawerNav = ({
    rosterOpen,
    controlsOpen,
    onToggleRoster,
    onToggleControls,
}: MobileDrawerNavProps) => {
    return (
        <nav
            className="lg:hidden flex items-stretch shrink-0 border-b border-base-300 bg-base-100"
            aria-label="Paneller">
            <button
                type="button"
                onClick={onToggleRoster}
                aria-expanded={rosterOpen}
                className={`flex-1 flex items-center justify-center gap-2 py-2.5 text-sm font-medium transition-colors ${
                    rosterOpen
                        ? "bg-base-200 text-base-content"
                        : "text-base-content/80 active:bg-base-300"
                }`}>
                <span className="iconify lucide--users size-5" />
                Oyuncular
            </button>
            <div className="w-px bg-base-300" aria-hidden="true" />
            <button
                type="button"
                onClick={onToggleControls}
                aria-expanded={controlsOpen}
                className={`flex-1 flex items-center justify-center gap-2 py-2.5 text-sm font-medium transition-colors ${
                    controlsOpen
                        ? "bg-base-200 text-base-content"
                        : "text-base-content/80 active:bg-base-300"
                }`}>
                <span className="iconify lucide--sliders-horizontal size-5" />
                Takım
            </button>
        </nav>
    );
};
