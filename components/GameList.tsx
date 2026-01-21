/**
 * GameList Component
 * 
 * Displays a list of games with sorting options (asc/desc).
 * Ant Design inspired styling with touch-friendly controls.
 */

import { useState, useMemo, useEffect, useRef } from 'react';
import type { SteamGame } from '@/lib/shared/types';
import { GameCard } from './GameCard';
import { useDebounce } from '@/hooks/useDebounce';

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
    const [platformFilter, setPlatformFilter] = useState<string>('All');
    const [groupByGenre, setGroupByGenre] = useState(false);
    const [collapsedGenres, setCollapsedGenres] = useState<Set<string>>(new Set());

    // Restored State
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

    // Static list of platforms as requested
    const availablePlatforms = useMemo(() => {
        const platforms = [
            "Android",
            "Google Stadia",
            "iOS",
            "Linux",
            "Mac",
            "Nintendo GameCube",
            "Nintendo Switch",
            "Nintendo Switch 2",
            "Oculus Rift",
            "PC (Microsoft Windows)",
            "PlayStation 2",
            "PlayStation 3",
            "PlayStation 4",
            "PlayStation 5",
            "PlayStation Vita",
            "PlayStation VR",
            "SteamVR",
            "Wii U",
            "Xbox",
            "Xbox 360",
            "Xbox One",
            "Xbox Series X|S"
        ];
        return ['All', ...platforms];
    }, []);

    const filteredAndSortedGames = useMemo(() => {
        // 1. Filter by Search
        let result = [...games];
        if (debouncedSearchQuery) {
            const query = debouncedSearchQuery.toLowerCase();
            result = result.filter(game =>
                game.name.toLowerCase().includes(query)
            );
        }

        // 2. Filter by Platform
        if (platformFilter !== 'All') {
            result = result.filter(game => {
                if (!game.platforms) return false;
                return game.platforms.some(p => {
                    const pLower = p.toLowerCase();

                    // Special mappings for Steam vs naming conventions
                    if (platformFilter === 'PC (Microsoft Windows)') {
                        return pLower.includes('windows') || pLower.includes('pc');
                    }
                    if (platformFilter === 'Mac') {
                        return pLower.includes('mac') || pLower.includes('os x') || pLower.includes('osx') || pLower.includes('macos');
                    }
                    if (platformFilter === 'Linux') {
                        return pLower.includes('linux');
                    }
                    if (platformFilter === 'SteamVR') {
                        return pLower.includes('steamvr') || pLower.includes('steam vr');
                    }

                    // General loose matching for other platforms
                    return pLower.includes(platformFilter.toLowerCase());
                });
            });
        }

        // 3. Sort
        const multiplier = sort.direction === 'asc' ? 1 : -1;

        const sortFn = (a: SteamGame, b: SteamGame) => {
            switch (sort.field) {
                case 'name':
                    return multiplier * a.name.localeCompare(b.name);
                case 'playtime':
                    return multiplier * (a.playtimeMinutes - b.playtimeMinutes);
                case 'recent':
                    return multiplier * ((a.playtimeRecentMinutes ?? 0) - (b.playtimeRecentMinutes ?? 0));
                default:
                    return 0;
            }
        };

        result.sort(sortFn);
        return result;
    }, [games, sort, debouncedSearchQuery, platformFilter]);

    // Grouping Logic
    const groupedGames = useMemo(() => {
        if (!groupByGenre) return null;

        const groups: Record<string, SteamGame[]> = {};
        const noGenreKey = 'Uncategorized';

        filteredAndSortedGames.forEach(game => {
            if (!game.genres || game.genres.length === 0) {
                if (!groups[noGenreKey]) groups[noGenreKey] = [];
                groups[noGenreKey].push(game);
            } else {
                game.genres.forEach(genre => {
                    if (!groups[genre]) groups[genre] = [];
                    groups[genre].push(game);
                });
            }
        });

        // Sort groups alphabetically
        return Object.entries(groups).sort((a, b) => a[0].localeCompare(b[0]));
    }, [filteredAndSortedGames, groupByGenre]);

    const handleSortClick = (field: SortField) => {
        setSort(prev => {
            if (prev.field === field) {
                return { field, direction: prev.direction === 'asc' ? 'desc' : 'asc' };
            }
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
        <div className="space-y-6">
            {/* Search, Sort, and Filter Header */}
            <div className="flex flex-col gap-4">
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
                    <h2 className="text-base md:text-lg font-semibold text-primary">
                        {filteredAndSortedGames.length === gameCount ? (
                            <>{gameCount} {gameCount === 1 ? 'Game' : 'Games'}</>
                        ) : (
                            <>
                                {filteredAndSortedGames.length} <span className="text-tertiary font-normal">of {gameCount}</span> {gameCount === 1 ? 'Game' : 'Games'}
                            </>
                        )}
                        {debouncedSearchQuery && <span className="text-tertiary font-normal ml-2">matching "{debouncedSearchQuery}"</span>}
                    </h2>

                    <div className="flex flex-col sm:flex-row gap-3 sm:items-center">
                        {/* Platform Filter */}
                        <select
                            value={platformFilter}
                            onChange={(e) => setPlatformFilter(e.target.value)}
                            className="h-8 pl-3 pr-8 text-xs font-medium bg-container border border-primary rounded text-secondary hover:text-primary hover:bg-hover focus:outline-none focus:border-primary-500 focus:ring-1 focus:ring-primary-500 cursor-pointer transition-colors appearance-none bg-no-repeat bg-[length:12px_12px] bg-[right_10px_center]"
                            style={{ backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' fill='none' viewBox='0 0 24 24' stroke='%236b7280'%3E%3Cpath stroke-linecap='round' stroke-linejoin='round' stroke-width='2' d='M19 9l-7 7-7-7'/%3E%3C/svg%3E")` }}
                        >
                            {availablePlatforms.map(p => (
                                <option key={p} value={p}>{p === 'All' ? 'All Platforms' : p}</option>
                            ))}
                        </select>

                        {/* Genre Group Toggle */}
                        <button
                            onClick={() => setGroupByGenre(!groupByGenre)}
                            className={`h-8 px-3 text-xs font-medium rounded transition-colors border ${groupByGenre
                                ? 'bg-primary-500 text-white border-transparent'
                                : 'bg-container text-secondary border-primary hover:text-primary'
                                }`}
                        >
                            Group by Genre
                        </button>

                        {/* Sort Options */}
                        <div className="flex items-center gap-2">
                            <span className="text-secondary text-sm hidden sm:inline">Sort:</span>
                            <div className="flex gap-2">
                                <SortButton field="playtime" label="Playtime" />
                                <SortButton field="name" label="Name" />
                                <SortButton field="recent" label="Recent" />
                            </div>
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

            {/* Game Grid / Grouped View */}
            {filteredAndSortedGames.length > 0 ? (
                groupByGenre && groupedGames ? (
                    <div className="space-y-4">
                        {groupedGames.map(([genre, games]) => {
                            const isCollapsed = collapsedGenres.has(genre);
                            return (
                                <div key={genre} className="rounded-lg overflow-hidden bg-card border border-secondary">
                                    <button
                                        onClick={() => {
                                            setCollapsedGenres(prev => {
                                                const next = new Set(prev);
                                                if (next.has(genre)) {
                                                    next.delete(genre);
                                                } else {
                                                    next.add(genre);
                                                }
                                                return next;
                                            });
                                        }}
                                        className="w-full flex items-center justify-between px-4 py-3 text-left hover:bg-hover transition-colors bg-card"
                                    >
                                        <span className="flex items-center gap-3">
                                            <svg
                                                className={`w-4 h-4 text-tertiary transition-transform duration-200 ${isCollapsed ? '' : 'rotate-90'}`}
                                                fill="none"
                                                viewBox="0 0 24 24"
                                                stroke="currentColor"
                                            >
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                                            </svg>
                                            <span className="text-base font-semibold text-primary">{genre}</span>
                                            <span className="text-sm text-tertiary font-normal">({games.length})</span>
                                        </span>
                                    </button>
                                    {!isCollapsed && (
                                        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-4 p-4 pt-2">
                                            {games.map((game) => (
                                                <GameCard key={`${genre}-${game.appId}`} game={game} />
                                            ))}
                                        </div>
                                    )}
                                </div>
                            );
                        })}
                    </div>
                ) : (
                    <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-4">
                        {filteredAndSortedGames.map((game) => (
                            <GameCard key={game.appId} game={game} />
                        ))}
                    </div>
                )
            ) : (
                <div className="text-center py-12 bg-card border border-dashed border-secondary rounded-md">
                    <div className="w-12 h-12 mx-auto mb-3 rounded-full bg-hover flex items-center justify-center">
                        <svg className="w-6 h-6 text-tertiary" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                        </svg>
                    </div>
                    <h3 className="text-sm font-medium text-secondary">No games found</h3>
                    <p className="text-xs text-tertiary mt-1">Try adjusting your filters</p>
                    <button
                        onClick={() => { setSearchQuery(''); setPlatformFilter('All'); }}
                        className="mt-4 text-xs font-medium text-primary-500 hover:text-primary-600 transition-colors"
                    >
                        Clear filters
                    </button>
                </div>
            )}
        </div>
    );
}
