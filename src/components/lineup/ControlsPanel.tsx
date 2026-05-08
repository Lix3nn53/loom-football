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
        <div className="card card-border bg-base-100 h-full overflow-hidden">
            <div className="card-body p-4 gap-4 flex flex-col h-full overflow-auto">
                <fieldset className="fieldset">
                    <legend className="fieldset-legend inline-flex items-center gap-2 text-base font-medium">
                        <span className="iconify lucide--shield size-4" />
                        Takım
                    </legend>
                    <input
                        type="text"
                        value={team.name}
                        onChange={(e) => onTeamNameChange(e.target.value)}
                        placeholder="Takım adı"
                        className="input input-sm w-full"
                    />
                    <div
                        className="flex flex-wrap items-center gap-1.5 mt-1"
                        role="radiogroup"
                        aria-label="Takım rengi">
                        {TEAM_COLORS.map((c) => {
                            const active = team.color === c;
                            return (
                                <button
                                    key={c}
                                    type="button"
                                    role="radio"
                                    aria-checked={active}
                                    onClick={() => onTeamColorChange(c)}
                                    aria-label={`${c} rengini seç`}
                                    className={`size-6 rounded-full ring-offset-base-100 transition-transform ${
                                        active
                                            ? "ring-2 ring-base-content ring-offset-2 scale-110"
                                            : "ring-1 ring-base-300 hover:scale-105"
                                    }`}
                                    style={{ backgroundColor: c }}
                                />
                            );
                        })}
                    </div>
                </fieldset>

                <fieldset className="fieldset">
                    <legend className="fieldset-legend inline-flex items-center gap-2 text-base font-medium">
                        <span className="iconify lucide--layout-grid size-4" />
                        Diziliş
                        <span className="badge badge-sm badge-ghost ml-1">
                            {team.formation}
                        </span>
                    </legend>
                    <div
                        role="tablist"
                        className="tabs tabs-box bg-base-200 grid grid-cols-3 gap-1 p-1">
                        {FORMATION_LIST.map((f) => {
                            const active = team.formation === f.key;
                            return (
                                <button
                                    key={f.key}
                                    role="tab"
                                    type="button"
                                    aria-selected={active}
                                    onClick={() => onFormationChange(f.key)}
                                    className={`tab tab-sm ${active ? "tab-active" : ""}`}>
                                    {f.label}
                                </button>
                            );
                        })}
                    </div>
                </fieldset>

                <fieldset className="fieldset">
                    <legend className="fieldset-legend inline-flex items-center gap-2 text-base font-medium">
                        <span className="iconify lucide--bar-chart-3 size-4" />
                        Onbir
                    </legend>
                    <div className="stats stats-horizontal w-full bg-base-200 shadow-none">
                        <div className="stat py-2 px-3">
                            <div className="stat-title text-xs">Sahada</div>
                            <div className="stat-value text-lg">
                                {assignedCount}
                                <span className="text-base-content/40 text-base font-normal">
                                    /{slotsCount}
                                </span>
                            </div>
                        </div>
                        <div className="stat py-2 px-3">
                            <div className="stat-title text-xs">Kadro</div>
                            <div className="stat-value text-lg">{team.roster.length}</div>
                        </div>
                    </div>
                    <progress
                        className="progress progress-primary w-full mt-1"
                        value={assignedCount}
                        max={slotsCount}
                    />
                </fieldset>

                <div className="flex flex-col gap-2 mt-auto pt-2 border-t border-base-200">
                    <button
                        type="button"
                        onClick={onClearLineup}
                        className="btn btn-sm btn-outline">
                        <span className="iconify lucide--eraser size-4" />
                        Dizilişi temizle
                    </button>
                    <button
                        type="button"
                        onClick={onResetAll}
                        className="btn btn-sm btn-ghost text-error">
                        <span className="iconify lucide--rotate-ccw size-4" />
                        Varsayılana dön
                    </button>
                </div>
            </div>
        </div>
    );
};
