"use client";

import {
    STAT_FULL_LABELS,
    STAT_LABELS,
    STAT_MAX,
    STAT_MIN,
    statTier,
} from "@/lib/player-stats";
import type { StatKey } from "@/types/team";

type StatSliderProps = {
    statKey: StatKey;
    value: number;
    onChange: (v: number) => void;
};

export const StatSlider = ({ statKey, value, onChange }: StatSliderProps) => {
    const tier = statTier(value);
    const pct = ((value - STAT_MIN) / (STAT_MAX - STAT_MIN)) * 100;

    return (
        <div className="stat-slider-row">
            <span className="stat-slider-label" title={STAT_FULL_LABELS[statKey]}>
                {STAT_LABELS[statKey]}
            </span>
            <div className="stat-slider-track-wrap">
                <div className="stat-slider-track">
                    <div
                        className={`stat-slider-fill stat-fill-${tier}`}
                        style={{ width: `${pct}%` }}
                    />
                </div>
                <div
                    className={`stat-slider-thumb stat-fill-${tier}`}
                    style={{ left: `${pct}%` }}
                />
                <input
                    type="range"
                    min={STAT_MIN}
                    max={STAT_MAX}
                    value={value}
                    onChange={(e) => onChange(Number(e.target.value))}
                    className="stat-slider-input"
                    aria-label={STAT_FULL_LABELS[statKey]}
                />
            </div>
            <input
                type="number"
                min={STAT_MIN}
                max={STAT_MAX}
                value={value}
                onChange={(e) => onChange(Number(e.target.value) || 0)}
                className={`stat-slider-number stat-text-${tier}`}
                aria-label={`${STAT_FULL_LABELS[statKey]} sayısal`}
            />
        </div>
    );
};
