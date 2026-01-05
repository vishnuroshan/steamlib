/**
 * GameDetailsPopover Component (Content)
 * 
 * Displays game metadata inside the Radix Popover Content.
 * Positioning and visibility are handled by the parent Popover component.
 */

import { LoadingSpinner } from './LoadingSpinner';
import type { GameMetadata } from '@/lib/shared/types';

interface GameDetailsPopoverProps {
    gameName: string;
    metadata: GameMetadata | undefined | null;
    loading: boolean;
}

export function GameDetailsPopover({ gameName, metadata, loading }: GameDetailsPopoverProps) {
    if (loading) {
        return (
            <div className="flex items-center gap-3">
                <LoadingSpinner />
                <span className="text-white/70 text-sm">Loading details...</span>
            </div>
        );
    }

    return (
        <div className="space-y-4">
            <div className="flex items-start justify-between gap-4">
                <h3 className="font-bold text-white text-base leading-tight">
                    {gameName}
                </h3>
            </div>

            {metadata ? (
                <>
                    {/* Metadata Grid */}
                    <div className="grid grid-cols-2 gap-4">
                        {metadata.year && (
                            <div>
                                <h4 className="text-[10px] font-bold uppercase tracking-widest text-primary-400 mb-1">Year</h4>
                                <p className="text-sm font-medium text-white">{metadata.year}</p>
                            </div>
                        )}
                        {metadata.external_game_source && (
                            <div>
                                <h4 className="text-[10px] font-bold uppercase tracking-widest text-primary-400 mb-1">Source</h4>
                                <p className="text-sm font-medium text-white">
                                    {metadata.external_game_source === 3 ? 'Steam' : 'External'}
                                </p>
                            </div>
                        )}
                    </div>

                    {/* Platforms */}
                    {metadata.platforms && metadata.platforms.length > 0 && (
                        <div>
                            <h4 className="text-[10px] font-bold uppercase tracking-widest text-primary-400 mb-2">Platforms</h4>
                            <div className="flex flex-wrap gap-1.5">
                                {metadata.platforms.map((p, idx) => (
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
                    {metadata.genres && metadata.genres.length > 0 && (
                        <div>
                            <h4 className="text-[10px] font-bold uppercase tracking-widest text-primary-400 mb-2">Genres</h4>
                            <div className="flex flex-wrap gap-1.5">
                                {metadata.genres.map((genre, idx) => (
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

                    {/* Summary */}
                    {metadata.summary && (
                        <div>
                            <h4 className="text-[10px] font-bold uppercase tracking-widest text-primary-400 mb-2">Summary</h4>
                            <p className="text-xs text-white/70 leading-relaxed line-clamp-4">
                                {metadata.summary}
                            </p>
                        </div>
                    )}
                </>
            ) : (
                <div className="py-4 text-center">
                    <p className="text-sm text-white/50">No details found.</p>
                </div>
            )}
        </div>
    );
}
