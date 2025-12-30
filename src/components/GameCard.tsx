/**
 * GameCard Component
 * 
 * Displays a single game with icon, name, and playtime.
 * Ant Design inspired styling with touch-friendly interactions.
 */

import type { SteamGame } from '../../api/_shared/types';
import { formatPlaytime } from '../../api/_shared/normalizer';

interface GameCardProps {
    game: SteamGame;
}

export function GameCard({ game }: GameCardProps) {
    return (
        <div className="group relative bg-card border border-primary rounded-lg overflow-hidden hover:border-primary-500 transition-all duration-300 hover:shadow-xl hover:shadow-primary-500/10 hover:-translate-y-1">
            {/* Aspect Ratio Container (2:3) */}
            <div className="relative aspect-[2/3] overflow-hidden bg-hover">
                {game.coverUrl ? (
                    <img
                        src={game.coverUrl}
                        alt={game.name}
                        className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
                        loading="lazy"
                        onError={(e) => {
                            // Fallback to logo if cover fails
                            const target = e.target as HTMLImageElement;
                            if (game.logoUrl && target.src !== game.logoUrl) {
                                target.src = game.logoUrl;
                            }
                        }}
                    />
                ) : (
                    <div className="w-full h-full flex items-center justify-center text-tertiary">
                        <svg className="w-8 h-8 opacity-20" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                        </svg>
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
