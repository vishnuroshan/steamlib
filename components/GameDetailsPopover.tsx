/**
 * GameDetailsPopover Component (Content)
 * 
 * Displays game metadata inside the Radix Popover Content.
 * Uses enriched data directly from the SteamGame object.
 */

import type { SteamGame } from '@/lib/shared/types';

interface GameDetailsPopoverProps {
    game: SteamGame;
}

export function GameDetailsPopover({ game }: GameDetailsPopoverProps) {
    const hasMetadata = game.genres?.length || game.platforms?.length || game.releaseYear;

    return (
        <div className="space-y-4">
            <div className="flex items-start justify-between gap-4">
                <h3 className="font-bold text-white text-base leading-tight">
                    {game.name}
                </h3>
            </div>

            {hasMetadata ? (
                <>
                    {/* Metadata Grid */}
                    <div className="grid grid-cols-2 gap-4">
                        {game.releaseYear && (
                            <div>
                                <h4 className="text-[10px] font-bold uppercase tracking-widest text-primary-400 mb-1">Year</h4>
                                <p className="text-sm font-medium text-white">{game.releaseYear}</p>
                            </div>
                        )}
                    </div>

                    {/* Platforms */}
                    {game.platforms && game.platforms.length > 0 && (
                        <div>
                            <h4 className="text-[10px] font-bold uppercase tracking-widest text-primary-400 mb-2">Platforms</h4>
                            <div className="flex flex-wrap gap-1.5">
                                {game.platforms.map((p, idx) => (
                                    <span
                                        key={idx}
                                        className="px-2 py-0.5 rounded-md bg-white/10 text-white/80 text-[10px] font-medium"
                                    >
                                        {p}
                                    </span>
                                ))}
                            </div>
                        </div>
                    )}

                    {/* Genres */}
                    {game.genres && game.genres.length > 0 && (
                        <div>
                            <h4 className="text-[10px] font-bold uppercase tracking-widest text-primary-400 mb-2">Genres</h4>
                            <div className="flex flex-wrap gap-1.5">
                                {game.genres.map((genre, idx) => (
                                    <span
                                        key={idx}
                                        className="px-2 py-0.5 rounded-full bg-primary-500/10 text-primary-300 border border-primary-500/20 text-[10px] font-medium"
                                    >
                                        {genre}
                                    </span>
                                ))}
                            </div>
                        </div>
                    )}
                </>
            ) : (
                <div className="py-4 text-center">
                    <p className="text-sm text-white/50">No details available for this game.</p>
                </div>
            )}
        </div>
    );
}

