"use client";

import type { FormationKey, Team } from "@/types/team";
import { FORMATION_LIST } from "@/lib/formations";

const TEAM_COLORS = [
    "#a78bfa",
    "#f87171",
    "#34d399",
    "#60a5fa",
    "#fbbf24",
    "#f472b6",
    "#22d3ee",
    "#1e2832",
];

type ControlsPanelProps = {
    team: Team;
    onTeamNameChange: (name: string) => void;
    onTeamColorChange: (color: string) => void;
    onFormationChange: (formation: FormationKey) => void;
    onClearLineup: () => void;
    onResetAll: () => void;
    assignedCount: number;
    slotsCount: number;
};

export const ControlsPanel = ({
    team,
    onTeamNameChange,
    onTeamColorChange,
    onFormationChange,
    onClearLineup,
    onResetAll,
    assignedCount,
    slotsCount,
}: ControlsPanelProps) => {
    return (
        <div className="card bg-base-100 border border-base-300 h-full overflow-hidden">
            <div className="card-body p-4 gap-4 flex flex-col h-full overflow-auto">
                <div>
                    <h2 className="card-title text-lg mb-3">
                        <span className="iconify lucide--shield size-5" />
                        Team
                    </h2>
                    <div className="flex flex-col gap-2">
                        <input
                            type="text"
                            value={team.name}
                            onChange={(e) => onTeamNameChange(e.target.value)}
                            placeholder="Team name"
                            className="input input-sm w-full"
                        />
                        <div className="flex flex-wrap items-center gap-1.5">
                            {TEAM_COLORS.map((c) => (
                                <button
                                    key={c}
                                    type="button"
                                    onClick={() => onTeamColorChange(c)}
                                    aria-label={`Pick color ${c}`}
                                    className={`size-6 rounded-full border-2 transition-transform ${
                                        team.color === c
                                            ? "border-base-content scale-110"
                                            : "border-base-300 hover:scale-105"
                                    }`}
                                    style={{ backgroundColor: c }}
                                />
                            ))}
                        </div>
                    </div>
                </div>

                <div>
                    <div className="flex items-center justify-between mb-2">
                        <h3 className="font-medium inline-flex items-center gap-2">
                            <span className="iconify lucide--layout-grid size-4" />
                            Formation
                        </h3>
                        <span className="badge badge-sm badge-ghost">{team.formation}</span>
                    </div>
                    <div className="grid grid-cols-3 gap-1.5">
                        {FORMATION_LIST.map((f) => (
                            <button
                                key={f.key}
                                type="button"
                                onClick={() => onFormationChange(f.key)}
                                className={`btn btn-sm ${
                                    team.formation === f.key
                                        ? "btn-primary"
                                        : "btn-ghost border border-base-300"
                                }`}>
                                {f.label}
                            </button>
                        ))}
                    </div>
                </div>

                <div>
                    <h3 className="font-medium inline-flex items-center gap-2 mb-2">
                        <span className="iconify lucide--bar-chart-3 size-4" />
                        Lineup
                    </h3>
                    <div className="grid grid-cols-2 gap-2">
                        <Stat label="Assigned" value={`${assignedCount}/${slotsCount}`} />
                        <Stat label="Squad" value={`${team.roster.length}`} />
                    </div>
                    <progress
                        className="progress progress-primary w-full mt-2"
                        value={assignedCount}
                        max={slotsCount}
                    />
                </div>

                <div className="flex flex-col gap-2 mt-auto pt-2 border-t border-base-200">
                    <button
                        type="button"
                        onClick={onClearLineup}
                        className="btn btn-sm btn-outline">
                        <span className="iconify lucide--eraser size-4" />
                        Clear lineup
                    </button>
                    <button
                        type="button"
                        onClick={onResetAll}
                        className="btn btn-sm btn-ghost text-error">
                        <span className="iconify lucide--rotate-ccw size-4" />
                        Reset to default squad
                    </button>
                </div>
            </div>
        </div>
    );
};

const Stat = ({ label, value }: { label: string; value: string }) => (
    <div className="rounded-box bg-base-200 px-3 py-2">
        <div className="text-xs text-base-content/60">{label}</div>
        <div className="text-lg font-semibold">{value}</div>
    </div>
);
