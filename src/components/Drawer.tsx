"use client";

import type { ReactNode } from "react";

// Slide-in drawer used for the roster (left) and controls (right) panels.
// On lg+ the aside is statically placed in the grid (no transform). Below
// that breakpoint it floats as an absolute overlay that slides in/out from
// its respective edge.
type DrawerProps = {
    side: "left" | "right";
    open: boolean;
    children: ReactNode;
};

const SIDE_CONFIG = {
    left: {
        anchor: "left-0",
        order: "order-2 lg:order-1",
        closed: "-translate-x-full",
    },
    right: {
        anchor: "right-0",
        order: "order-3",
        closed: "translate-x-full",
    },
} as const;

export const Drawer = ({ side, open, children }: DrawerProps) => {
    const cfg = SIDE_CONFIG[side];
    return (
        <aside
            className={`${cfg.order} ${cfg.anchor} min-h-0 absolute inset-y-0 z-40 w-80 max-w-[85vw] transform transition-transform duration-200 ease-out bg-base-200 shadow-2xl lg:static lg:inset-auto lg:w-auto lg:max-w-none lg:bg-transparent lg:shadow-none lg:translate-x-0 ${
                open ? "translate-x-0" : `${cfg.closed} lg:translate-x-0`
            }`}>
            {children}
        </aside>
    );
};
