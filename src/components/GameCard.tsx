/**
 * GameCard Component
 * 
 * Displays a single game with icon, name, and playtime.
 * Ant Design inspired styling with touch-friendly interactions.
 */

import { useState } from 'react';
import type { SteamGame } from '../../api/_shared/types';
import { formatPlaytime } from '../../api/_shared/normalizer';

interface GameCardProps {
    game: SteamGame;
}

export function GameCard({ game }: GameCardProps) {
    const [imgError, setImgError] = useState(false);
    const [imgLoaded, setImgLoaded] = useState(false);

    return (
        <div className="group relative bg-card border border-primary rounded-lg overflow-hidden hover:border-primary-500 transition-all duration-300 hover:shadow-xl hover:shadow-primary-500/10 hover:-translate-y-1">
            {/* Aspect Ratio Container (2:3) */}
            <div className="relative aspect-[2/3] overflow-hidden bg-hover">
                {game.coverUrl && !imgError ? (
                    <img
                        src={game.coverUrl}
                        alt={game.name}
                        className={`w-full h-full object-cover transition-transform duration-500 group-hover:scale-110 ${imgLoaded ? 'image-loaded' : 'opacity-0'}`}
                        loading="lazy"
                        onLoad={() => setImgLoaded(true)}
                        onError={() => setImgError(true)}
                    />
                ) : (
                    <div className="w-full h-full flex items-center justify-center p-6 text-center bg-gradient-to-br from-primary-900/40 to-black/60">
                        {/* Subtle "No Image" Indicator */}
                        <div className="absolute top-2 right-2 opacity-30">
                            <svg
                                xmlns="http://www.w3.org/2000/svg"
                                className="w-4 h-4 text-primary-100 lucide lucide-image-off"
                                viewBox="0 0 24 24"
                                fill="none"
                                stroke="currentColor"
                                strokeWidth="1"
                                strokeLinecap="round"
                                strokeLinejoin="round"
                            >
                                <line x1="2" x2="22" y1="2" y2="22" />
                                <path d="M10.41 10.41a2 2 0 1 1-2.83-2.83" />
                                <line x1="13.5" x2="6" y1="13.5" y2="21" />
                                <line x1="18" x2="21" y1="12" y2="15" />
                                <path d="M3.59 3.59A1.99 1.99 0 0 0 3 5v14a2 2 0 0 0 2 2h14c.55 0 1.052-.22 1.41-.59" />
                                <path d="M21 15V5a2 2 0 0 0-2-2H9" />
                            </svg>
                        </div>
                        <span className="text-primary-100 font-bold text-base leading-tight drop-shadow-lg group-hover:scale-110 transition-transform duration-500">
                            {game.name}
                        </span>
                    </div>
                )}

                {/* Gradient Overlay for Text Readability */}
                <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent opacity-80 group-hover:opacity-100 transition-opacity" />

                {/* Content Overlay (Glassmorphism) */}
                <div className="absolute bottom-0 left-0 right-0 p-3 backdrop-blur-sm bg-black/20 border-t border-white/10">
                    <h3 className="font-bold text-white text-sm line-clamp-1 group-hover:text-primary-400 transition-colors">
                        {game.name}
                    </h3>
                    <div className="flex flex-wrap items-center gap-2 mt-1">
                        <span className="text-white/70 text-[10px] font-medium uppercase tracking-wider">
                            {formatPlaytime(game.playtimeMinutes)}
                        </span>
                        {game.playtimeRecentMinutes !== null && game.playtimeRecentMinutes > 0 && (
                            <span className="text-primary-400 text-[10px] font-bold uppercase tracking-wider">
                                {formatPlaytime(game.playtimeRecentMinutes)} recent
                            </span>
                        )}
                    </div>
                </div>
            </div>

            {/* Hover Glow Effect */}
            <div className="absolute inset-0 pointer-events-none border-2 border-primary-500/0 group-hover:border-primary-500/50 rounded-lg transition-all duration-300" />
        </div>
    );
}
