"use client";

import { Logo } from "@/components/Logo";
import { SyncIndicator } from "@/components/SyncIndicator";
import type { CloudSyncStatus } from "@/hooks/use-cloud-sync";
import { SIDE_COLORS } from "@/lib/team-defaults";
import type { Side } from "@/types/team";

const SIDES: Side[] = ["red", "blue"];

type AppHeaderProps = {
    teamNames: Record<Side, string>;
    activeSide: Side;
    onSwitchSide: (side: Side) => void;
    cloudStatus: CloudSyncStatus;
};

export const AppHeader = ({
    teamNames,
    activeSide,
    onSwitchSide,
    cloudStatus,
}: AppHeaderProps) => {
    return (
        <header className="z-50 flex items-center justify-between gap-2 border-b border-base-300 bg-base-100 px-3 py-2">
            <div className="flex items-center gap-2 min-w-0">
                <Logo />
                <div className="hidden sm:flex flex-col leading-tight min-w-0">
                    <span className="text-base font-semibold truncate">
                        Loom Football
                    </span>
                    <span className="text-[11px] text-base-content/60">
                        Takım Yönetimi
                    </span>
                </div>
            </div>

            <div role="tablist" className="tabs tabs-box tabs-sm bg-base-200">
                {SIDES.map((side) => {
                    const active = side === activeSide;
                    return (
                        <button
                            key={side}
                            role="tab"
                            aria-selected={active}
                            onClick={() => onSwitchSide(side)}
                            className={`tab gap-2 ${active ? "tab-active" : ""}`}>
                            <span
                                className="size-3 rounded-full ring-1 ring-base-content/20"
                                style={{ backgroundColor: SIDE_COLORS[side] }}
                            />
                            {teamNames[side]}
                        </button>
                    );
                })}
            </div>

            <SyncIndicator status={cloudStatus} />
        </header>
    );
};
