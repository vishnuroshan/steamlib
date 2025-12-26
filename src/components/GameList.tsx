/**
 * GameList Component
 * 
 * Displays a list of games with sorting options (asc/desc).
 * Ant Design inspired styling with touch-friendly controls.
 */

import { useState, useMemo } from 'react';
import type { SteamGame } from '../core/types';
import { GameCard } from './GameCard';

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

    const sortedGames = useMemo(() => {
        const sorted = [...games];
        const multiplier = sort.direction === 'asc' ? 1 : -1;

        switch (sort.field) {
            case 'name':
                sorted.sort((a, b) => multiplier * a.name.localeCompare(b.name));
                break;
            case 'playtime':
                sorted.sort((a, b) => multiplier * (a.playtimeMinutes - b.playtimeMinutes));
                break;
            case 'recent':
                sorted.sort((a, b) => multiplier * ((a.playtimeRecentMinutes ?? 0) - (b.playtimeRecentMinutes ?? 0)));
                break;
        }

        return sorted;
    }, [games, sort]);

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
            {/* Header */}
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
                <h2 className="text-base md:text-lg font-semibold text-primary">
                    {gameCount} {gameCount === 1 ? 'Game' : 'Games'}
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

            {/* Game Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
                {sortedGames.map((game) => (
                    <GameCard key={game.appId} game={game} />
                ))}
            </div>
        </div>
    );
}
