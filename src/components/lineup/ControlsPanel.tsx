"use client";

import { FORMATION_LIST } from "@/lib/formations";
import type { FormationKey, Team } from "@/types/team";

type ControlsPanelProps = {
    team: Team;
    onTeamNameChange: (name: string) => void;
    onFormationChange: (formation: FormationKey) => void;
    onAutoFillLineup?: () => void;
    assignedCount: number;
    slotsCount: number;
    benchSize: number;
};

export const ControlsPanel = ({
    team,
    onTeamNameChange,
    onFormationChange,
    onAutoFillLineup,
    assignedCount,
    slotsCount,
    benchSize,
}: ControlsPanelProps) => {
    const lineupIncomplete = assignedCount < slotsCount;
    const canAutoFill = lineupIncomplete && benchSize > 0;
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
                    {onAutoFillLineup && (
                        <button
                            type="button"
                            onClick={onAutoFillLineup}
                            disabled={!canAutoFill}
                            className="btn btn-sm w-full mt-2 gap-2"
                            title="Yedekteki en iyi oyuncuları boş slotlara yerleştirir">
                            <span className="iconify lucide--wand-sparkles size-4" />
                            Otomatik doldur
                        </button>
                    )}
                </fieldset>
            </div>
        </div>
    );
};
