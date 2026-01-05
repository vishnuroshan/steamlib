/**
 * GameDetailsPopover Component
 * 
 * A premium, glassmorphism-style overlay that displays game metadata 
 * like genres, rating, and summary.
 */

import { X } from 'lucide-react';
import type { GameMetadata } from '@/lib/shared/types';
import { LoadingSpinner } from './LoadingSpinner';

interface GameDetailsPopoverProps {
    gameName: string;
    metadata: GameMetadata | null;
    loading: boolean;
    onClose: () => void;
}

export function GameDetailsPopover({ gameName, metadata, loading, onClose }: GameDetailsPopoverProps) {
    return (
        <div
            className="absolute inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-200"
            onClick={(e) => {
                e.stopPropagation();
                onClose();
            }}
        >
            <div
                className="relative w-full max-w-sm bg-container/90 backdrop-blur-xl border border-white/10 rounded-2xl shadow-2xl overflow-hidden animate-in zoom-in-95 duration-200"
                onClick={(e) => e.stopPropagation()}
            >
                {/* Header */}
                <div className="flex items-center justify-between p-4 border-b border-white/5">
                    <h3 className="font-bold text-lg text-white line-clamp-1">{gameName}</h3>
                    <button
                        onClick={onClose}
                        className="p-1 rounded-full hover:bg-white/10 transition-colors text-white/70 hover:text-white"
                    >
                        <X size={20} />
                    </button>
                </div>

                {/* Content */}
                <div className="p-5 space-y-4 max-h-[70vh] overflow-y-auto">
                    {loading ? (
                        <div className="flex flex-col items-center justify-center py-10 gap-3">
                            <LoadingSpinner />
                            <span className="text-sm text-white/50">Fetching details...</span>
                        </div>
                    ) : metadata ? (
                        <>
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

                            {/* Rating */}
                            {metadata.rating && (
                                <div>
                                    <h4 className="text-[10px] font-bold uppercase tracking-widest text-primary-400 mb-2">Rating</h4>
                                    <div className="flex items-center gap-2">
                                        <div className="h-2 flex-1 bg-white/5 rounded-full overflow-hidden">
                                            <div
                                                className="h-full bg-gradient-to-r from-primary-600 to-primary-400"
                                                style={{ width: `${metadata.rating}%` }}
                                            />
                                        </div>
                                        <span className="text-sm font-bold text-white">{Math.round(metadata.rating)}%</span>
                                    </div>
                                </div>
                            )}

                            {/* Summary */}
                            {metadata.summary && (
                                <div>
                                    <h4 className="text-[10px] font-bold uppercase tracking-widest text-primary-400 mb-2">Summary</h4>
                                    <p className="text-sm text-white/70 leading-relaxed font-light">
                                        {metadata.summary}
                                    </p>
                                </div>
                            )}
                        </>
                    ) : (
                        <div className="py-10 text-center">
                            <p className="text-sm text-white/40">No additional details found for this title.</p>
                        </div>
                    )}
                </div>

                {/* Footer / Hint */}
                <div className="p-4 bg-white/5 text-center">
                    <p className="text-[10px] text-white/30 uppercase tracking-tighter">Powered by IGDB & Supabase</p>
                </div>
            </div>
        </div>
    );
}
