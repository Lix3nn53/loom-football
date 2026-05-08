"use client";

import {
    STAT_FULL_LABELS,
    STAT_KEYS,
    STAT_LABELS,
    type TeamRating,
    statTier,
} from "@/lib/player-stats";

const TIER_FILL_CLASS: Record<string, string> = {
    elite: "bg-yellow-400",
    great: "bg-green-500",
    good: "bg-cyan-500",
    ok: "bg-amber-500",
    weak: "bg-base-content/40",
};

type TeamRatingBarProps = {
    rating: TeamRating;
    teamColor: string;
    teamName: string;
};

export const TeamRatingBar = ({
    rating,
    teamColor,
    teamName,
}: TeamRatingBarProps) => {
    const { overall, stats, starters, requiredStarters } = rating;
    const incomplete = starters < requiredStarters;
    const overallTier = statTier(overall);

    return (
        <div
            className="team-rating-bar"
            style={{ "--team-accent": teamColor } as React.CSSProperties}
            aria-label={`${teamName} takım gücü ${overall}`}>
            <div className="team-rating-overall">
                <div className={`team-rating-overall-num stat-text-${overallTier}`}>
                    {overall}
                </div>
                <div className="team-rating-meta">
                    <span className="team-rating-count">
                        {starters}/{requiredStarters}
                        {incomplete && (
                            <span
                                className="iconify lucide--triangle-alert size-3 text-warning ml-1"
                                title="Kadro eksik"
                            />
                        )}
                    </span>
                </div>
            </div>
            <div className="team-rating-stats">
                {STAT_KEYS.map((k) => {
                    const v = stats[k];
                    const tier = statTier(v);
                    return (
                        <div
                            key={k}
                            className="team-rating-stat"
                            title={`${STAT_FULL_LABELS[k]} ortalaması: ${v}`}>
                            <span className="team-rating-stat-label">
                                {STAT_LABELS[k]}
                            </span>
                            <div className="team-rating-stat-bar">
                                <div
                                    className={`team-rating-stat-fill ${TIER_FILL_CLASS[tier]}`}
                                    style={{ width: `${v}%` }}
                                />
                            </div>
                            <span className={`team-rating-stat-value stat-text-${tier}`}>
                                {v}
                            </span>
                        </div>
                    );
                })}
            </div>
        </div>
    );
};
