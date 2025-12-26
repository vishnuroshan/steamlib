/**
 * GameCard Component
 * 
 * Displays a single game with icon, name, and playtime.
 * Ant Design inspired styling with touch-friendly interactions.
 */

import type { SteamGame } from '../core/types';
import { formatPlaytime } from '../core/normalizer';

interface GameCardProps {
    game: SteamGame;
}

export function GameCard({ game }: GameCardProps) {
    return (
        <div className="group bg-card border border-primary rounded p-3 hover:bg-hover transition-colors duration-150 min-h-[60px]">
            <div className="flex items-center gap-3">
                {/* Game Icon - 32x32 mobile, 40x40 desktop */}
                <div className="flex-shrink-0 w-8 h-8 md:w-10 md:h-10 rounded-sm overflow-hidden bg-hover">
                    {game.iconUrl ? (
                        <img
                            src={game.iconUrl}
                            alt=""
                            className="w-full h-full object-cover"
                            loading="lazy"
                        />
                    ) : (
                        <div className="w-full h-full flex items-center justify-center text-tertiary">
                            <svg className="w-4 h-4 md:w-5 md:h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M14.752 11.168l-3.197-2.132A1 1 0 0010 9.87v4.263a1 1 0 001.555.832l3.197-2.132a1 1 0 000-1.664z" />
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                            </svg>
                        </div>
                    )}
                </div>

                {/* Game Info */}
                <div className="flex-1 min-w-0">
                    <h3 className="font-medium text-primary text-sm truncate group-hover:text-primary-500 transition-colors">
                        {game.name}
                    </h3>
                    <div className="flex flex-wrap items-center gap-2 mt-0.5">
                        <span className="text-secondary text-xs">
                            {formatPlaytime(game.playtimeMinutes)}
                        </span>
                        {game.playtimeRecentMinutes !== null && game.playtimeRecentMinutes > 0 && (
                            <span className="text-primary-500 text-xs">
                                {formatPlaytime(game.playtimeRecentMinutes)} recent
                            </span>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
}
