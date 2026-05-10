"use client";

import {
    STAT_FULL_LABELS,
    STAT_KEYS,
    STAT_LABELS,
    type TeamRating,
    statTier,
} from "@/lib/player-stats";

type TeamRatingBarProps = {
    rating: TeamRating;
    teamColor: string;
    teamName: string;
    countMismatch?: boolean;
    onEvenOut?: () => void;
    opposing?: {
        rating: TeamRating;
        name: string;
        color: string;
    };
};

export const TeamRatingBar = ({
    rating,
    teamColor,
    teamName,
    countMismatch = false,
    onEvenOut,
    opposing,
}: TeamRatingBarProps) => {
    const { overall, stats, starters, requiredStarters } = rating;
    const overallTier = statTier(overall);
    const opposingTier = opposing ? statTier(opposing.rating.overall) : null;
    const diff = opposing ? overall - opposing.rating.overall : 0;
    const diffClass = diff > 0 ? "stat-text-great" : diff < 0 ? "stat-text-ok" : "";

    return (
        <div
            className="team-rating-bar"
            style={{ "--team-accent": teamColor } as React.CSSProperties}
            aria-label={`${teamName} takım gücü ${overall}`}>
            <div className="team-rating-context">
                <span className="team-rating-count">
                    <span className="iconify lucide--users size-3" aria-hidden="true" />
                    {starters}/{requiredStarters}
                </span>
                {countMismatch && (
                    <span className="inline-flex items-center gap-1 text-[11px] font-semibold text-warning">
                        <span
                            className="iconify lucide--triangle-alert size-3"
                            aria-hidden="true"
                        />
                        Eşit değil
                    </span>
                )}
                {countMismatch && onEvenOut && (
                    <button
                        type="button"
                        onClick={onEvenOut}
                        className="btn btn-xs btn-ghost text-warning gap-1 px-1.5 h-6 min-h-0"
                        title="Az olan takımı yedekle hizala">
                        <span className="iconify lucide--scale size-3" />
                        Hizala
                    </button>
                )}
                {opposing && opposingTier && (
                    <span
                        className="team-rating-opposing xl:hidden"
                        style={
                            {
                                "--opposing-accent": opposing.color,
                            } as React.CSSProperties
                        }
                        title={`${opposing.name} ${opposing.rating.overall}`}>
                        <span className="team-rating-opposing-vs">vs</span>
                        <span className="team-rating-opposing-dot" aria-hidden="true" />
                        <span className="team-rating-opposing-name">
                            {opposing.name}
                        </span>
                        <span
                            className={`team-rating-opposing-num stat-text-${opposingTier}`}>
                            {opposing.rating.overall}
                        </span>
                        <span className={`team-rating-opposing-diff ${diffClass}`}>
                            {diff > 0 ? `+${diff}` : diff}
                        </span>
                    </span>
                )}
            </div>
            <div className="team-rating-main">
                <div className={`team-rating-overall-num stat-text-${overallTier}`}>
                    {overall}
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
                                <span
                                    className={`team-rating-stat-value stat-text-${tier}`}>
                                    {v}
                                </span>
                            </div>
                        );
                    })}
                </div>
            </div>
        </div>
    );
};
