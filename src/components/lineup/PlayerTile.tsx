"use client";

import { computeOverall, statTier } from "@/lib/player-stats";
import type { Player, Position } from "@/types/team";

type PlayerTileProps = {
    player: Player;
    position: Position;
    teamColor: string;
    selected: boolean;
};

export const PlayerTile = ({
    player,
    position,
    teamColor,
    selected,
}: PlayerTileProps) => {
    const ovr = computeOverall(player.stats, position);
    const tier = statTier(ovr);

    return (
        <span
            className={`player-tile ${selected ? "is-selected" : ""}`}
            style={{ "--tile-accent": teamColor } as React.CSSProperties}>
            <span className="player-tile-body">
                <span className="player-tile-head">
                    <span className={`player-tile-ovr stat-tier-${tier}`}>{ovr}</span>
                    <span className="player-tile-pos">{position}</span>
                </span>
                <span className="player-tile-photo-wrap">
                    <span
                        className={`player-tile-photo ${player.photoUrl ? "" : "poster-photo"}`}
                        style={{
                            backgroundImage: player.photoUrl
                                ? `url(${player.photoUrl})`
                                : undefined,
                        }}
                        aria-hidden="true">
                        <span className="player-tile-num-corner">
                            {player.number}
                        </span>
                    </span>
                </span>
                <span className="player-tile-name" title={player.name}>
                    {player.name}
                </span>
            </span>
        </span>
    );
};
