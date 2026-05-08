"use client";

import {
    STAT_KEYS,
    STAT_LABELS,
    bestPosition,
    computeOverall,
    statTier,
    type StatTier,
} from "@/lib/player-stats";
import type { Player, PlayerStats, Position } from "@/types/team";

const TIER_BADGE_CLASS: Record<StatTier, string> = {
    elite: "ovr-tier-elite",
    great: "ovr-tier-great",
    good: "ovr-tier-good",
    ok: "ovr-tier-ok",
    weak: "ovr-tier-weak",
};

const TIER_TEXT_CLASS: Record<StatTier, string> = {
    elite: "stat-text-elite",
    great: "stat-text-great",
    good: "stat-text-good",
    ok: "stat-text-ok",
    weak: "stat-text-weak",
};

export type OvrBadgeProps = {
    value: number;
    size?: "xs" | "sm" | "md" | "lg";
    label?: string;
    showLabel?: boolean;
};

export const OvrBadge = ({ value, size = "sm", label, showLabel }: OvrBadgeProps) => {
    const tier = statTier(value);
    const sizeClass = `ovr-badge-${size}`;
    return (
        <span
            className={`ovr-badge ${TIER_BADGE_CLASS[tier]} ${sizeClass}`}
            title={label ? `${label}: ${value}` : `OVR ${value}`}
            aria-label={label ? `${label} ${value}` : `Overall ${value}`}>
            <span className="ovr-badge-num">{value}</span>
            {showLabel && label && <span className="ovr-badge-pos">{label}</span>}
        </span>
    );
};

export type StatValueProps = {
    statKey: keyof PlayerStats;
    value: number;
};

export const StatValue = ({ statKey, value }: StatValueProps) => {
    const tier = statTier(value);
    return (
        <div className="stat-row">
            <span className="stat-row-label">{STAT_LABELS[statKey]}</span>
            <span className={`stat-row-value ${TIER_TEXT_CLASS[tier]}`}>{value}</span>
        </div>
    );
};

export const StatGrid = ({ stats }: { stats: PlayerStats }) => (
    <div className="stat-grid">
        {STAT_KEYS.map((k) => (
            <StatValue key={k} statKey={k} value={stats[k]} />
        ))}
    </div>
);

// Compact horizontal stat strip — used inside roster rows where there isn't
// vertical room for the full grid.
export const StatStrip = ({ stats }: { stats: PlayerStats }) => (
    <div className="stat-strip">
        {STAT_KEYS.map((k) => {
            const tier = statTier(stats[k]);
            return (
                <span
                    key={k}
                    className={`stat-strip-cell ${TIER_TEXT_CLASS[tier]}`}
                    title={`${STAT_LABELS[k]} ${stats[k]}`}>
                    <span className="stat-strip-label">{STAT_LABELS[k]}</span>
                    <span className="stat-strip-value">{stats[k]}</span>
                </span>
            );
        })}
    </div>
);

export type PlayerCardProps = {
    player: Player;
    teamColor: string;
    // If provided, OVR is computed for this slot's role rather than the
    // player's natural best position. Useful for showing how the player would
    // rate at the spot they're being placed in.
    slotPosition?: Position;
};

export const PlayerCard = ({ player, teamColor, slotPosition }: PlayerCardProps) => {
    const natural = bestPosition(player.stats);
    const displayPos = slotPosition ?? natural.position;
    const displayOvr =
        slotPosition === undefined
            ? natural.overall
            : computeOverall(player.stats, slotPosition);

    return (
        <div
            className="player-card"
            style={{ "--card-accent": teamColor } as React.CSSProperties}>
            <div className="player-card-top">
                <div className="player-card-meta">
                    <span className="player-card-ovr">{displayOvr}</span>
                    <span className="player-card-pos">{displayPos}</span>
                </div>
                <div
                    className={`player-card-photo ${player.photoUrl ? "" : "poster-photo"}`}
                    style={{
                        backgroundImage: player.photoUrl
                            ? `url(${player.photoUrl})`
                            : undefined,
                    }}
                    aria-hidden="true"
                />
            </div>
            <div className="player-card-name" title={player.name}>
                <span className="player-card-num-inline">#{player.number}</span>
                <span className="truncate">{player.name}</span>
            </div>
            <div className="player-card-divider" />
            <StatGrid stats={player.stats} />
        </div>
    );
};

