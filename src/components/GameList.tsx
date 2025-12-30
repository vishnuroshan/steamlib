/**
 * GameList Component
 * 
 * Displays a list of games with sorting options (asc/desc).
 * Ant Design inspired styling with touch-friendly controls.
 */

import { useState, useMemo, useEffect, useRef } from 'react';
import type { SteamGame } from '../../api/_shared/types';
import { GameCard } from './GameCard';
import { useDebounce } from '../hooks/useDebounce';

interface GameListProps {
    games: SteamGame[];
    gameCount: number;
}

type SortField = 'name' | 'playtime' | 'recent';
type SortDirection = 'asc' | 'desc';

interface SortState {
    field: SortField;
    direction: SortDirection;
}

export function GameList({ games, gameCount }: GameListProps) {
    const [sort, setSort] = useState<SortState>({ field: 'playtime', direction: 'desc' });
    const [searchQuery, setSearchQuery] = useState('');
    const debouncedSearchQuery = useDebounce(searchQuery, 300);
    const searchInputRef = useRef<HTMLInputElement>(null);

    const [isSearchFocused, setIsSearchFocused] = useState(false);

    // Keyboard shortcut to focus search (/)
    useEffect(() => {
        const handleKeyDown = (e: KeyboardEvent) => {
            if (e.key === '/' && document.activeElement?.tagName !== 'INPUT') {
                e.preventDefault();
                searchInputRef.current?.focus();
            }
        };

        window.addEventListener('keydown', handleKeyDown);
        return () => window.removeEventListener('keydown', handleKeyDown);
    }, []);

    const filteredAndSortedGames = useMemo(() => {
        // 1. Filter
        let result = [...games];
        if (debouncedSearchQuery) {
            const query = debouncedSearchQuery.toLowerCase();
            result = result.filter(game =>
                game.name.toLowerCase().includes(query)
            );
        }

        // 2. Sort
        const multiplier = sort.direction === 'asc' ? 1 : -1;

        switch (sort.field) {
            case 'name':
                result.sort((a, b) => multiplier * a.name.localeCompare(b.name));
                break;
            case 'playtime':
                result.sort((a, b) => multiplier * (a.playtimeMinutes - b.playtimeMinutes));
                break;
            case 'recent':
                result.sort((a, b) => multiplier * ((a.playtimeRecentMinutes ?? 0) - (b.playtimeRecentMinutes ?? 0)));
                break;
        }

        return result;
    }, [games, sort, debouncedSearchQuery]);

    const handleSortClick = (field: SortField) => {
        setSort(prev => {
            if (prev.field === field) {
                // Toggle direction
                return { field, direction: prev.direction === 'asc' ? 'desc' : 'asc' };
            }
            // New field, default direction
            return { field, direction: field === 'name' ? 'asc' : 'desc' };
        });
    };

    const SortButton = ({ field, label }: { field: SortField; label: string }) => {
        const isActive = sort.field === field;

        return (
            <button
                onClick={() => handleSortClick(field)}
                className={`h-8 px-3 text-xs font-medium rounded transition-colors flex items-center gap-1.5 ${isActive
                    ? 'bg-primary-500 text-white'
                    : 'bg-container text-secondary hover:text-primary hover:bg-hover'
                    }`}
            >
                {label}
                {isActive && (
                    <svg
                        className={`w-4 h-4 transition-transform ${sort.direction === 'asc' ? 'rotate-180' : ''}`}
                        fill="none"
                        viewBox="0 0 24 24"
                        stroke="currentColor"
                    >
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                    </svg>
                )}
            </button>
        );
    };

    return (
        <div className="space-y-4">
            {/* Search and Sort Header */}
            <div className="flex flex-col gap-4">
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
                    <h2 className="text-base md:text-lg font-semibold text-primary">
                        {debouncedSearchQuery ? filteredAndSortedGames.length : gameCount} {(debouncedSearchQuery ? filteredAndSortedGames.length : gameCount) === 1 ? 'Game' : 'Games'}
                        {debouncedSearchQuery && <span className="text-tertiary font-normal ml-2">matching "{debouncedSearchQuery}"</span>}
                    </h2>

                    {/* Sort Options */}
                    <div className="flex items-center gap-2 flex-wrap">
                        <span className="text-secondary text-sm">Sort:</span>
                        <div className="flex gap-2">
                            <SortButton field="playtime" label="Playtime" />
                            <SortButton field="name" label="Name" />
                            <SortButton field="recent" label="Recent" />
                        </div>
                    </div>
                </div>

                {/* Search Input */}
                <div className="relative group">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                        <svg className="h-4 w-4 text-tertiary group-focus-within:text-primary transition-colors" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                        </svg>
                    </div>
                    <input
                        ref={searchInputRef}
                        type="text"
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        onFocus={() => setIsSearchFocused(true)}
                        onBlur={() => setIsSearchFocused(false)}
                        placeholder={isSearchFocused ? "Search your library..." : "Search your library... (Press '/' to focus)"}
                        className="block w-full pl-10 pr-10 py-2 bg-container border border-primary rounded-md text-sm text-primary placeholder-tertiary focus:outline-none focus:ring-1 focus:ring-primary-500 focus:border-primary-500 transition-all"
                    />
                    {searchQuery && (
                        <button
                            onClick={() => setSearchQuery('')}
                            className="absolute inset-y-0 right-0 pr-3 flex items-center text-tertiary hover:text-primary transition-colors"
                        >
                            <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                            </svg>
                        </button>
                    )}
                </div>
            </div>

            {/* Game Grid */}
            {filteredAndSortedGames.length > 0 ? (
                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-4">
                    {filteredAndSortedGames.map((game) => (
                        <GameCard key={game.appId} game={game} />
                    ))}
                </div>
            ) : (
                <div className="text-center py-12 bg-card border border-dashed border-secondary rounded-md">
                    <div className="w-12 h-12 mx-auto mb-3 rounded-full bg-hover flex items-center justify-center">
                        <svg className="w-6 h-6 text-tertiary" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                        </svg>
                    </div>
                    <h3 className="text-sm font-medium text-secondary">No games found</h3>
                    <p className="text-xs text-tertiary mt-1">Try adjusting your search query</p>
                    <button
                        onClick={() => setSearchQuery('')}
                        className="mt-4 text-xs font-medium text-primary-500 hover:text-primary-600 transition-colors"
                    >
                        Clear search
                    </button>
                </div>
            )}
        </div>
    );
}
