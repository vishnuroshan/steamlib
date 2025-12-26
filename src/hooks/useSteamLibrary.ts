/**
 * useSteamLibrary Hook
 * 
 * Manages the state for fetching and displaying a Steam library.
 */

import { useState, useCallback } from 'react';
import type { SteamGame, SteamProfile, ErrorCode, SavedProfile } from '../../api/_shared/types';
import { parseSteamInput, needsVanityResolution } from '../../api/_shared/parser';
import { resolveVanityUrl, getOwnedGames } from '../api/steam';

interface SteamLibraryState {
    /** Current loading state */
    isLoading: boolean;
    /** Error if last request failed */
    error: ErrorCode | null;
    /** Games from successful fetch */
    games: SteamGame[] | null;
    /** Total game count */
    gameCount: number;
    /** Current profile info (from API) */
    profile: SteamProfile | null;
    /** Current profile info (for saving) */
    currentProfile: {
        steamId64: string;
        vanityUrl: string | null;
    } | null;
    /** Last input that caused an error (for button disable logic) */
    lastFailedInput: string | null;
}

interface UseSteamLibraryReturn extends SteamLibraryState {
    /** Fetch library for given input */
    fetchLibrary: (input: string) => Promise<void>;
    /** Clear current state */
    clear: () => void;
    /** Load a saved profile */
    loadProfile: (profile: SavedProfile) => Promise<void>;
}

export function useSteamLibrary(): UseSteamLibraryReturn {
    const [state, setState] = useState<SteamLibraryState>({
        isLoading: false,
        error: null,
        games: null,
        gameCount: 0,
        profile: null,
        currentProfile: null,
        lastFailedInput: null,
    });

    const fetchLibrary = useCallback(async (input: string) => {
        // Parse input
        const parsed = parseSteamInput(input);

        if (!parsed) {
            setState(prev => ({
                ...prev,
                isLoading: false,
                error: 'INVALID_INPUT_FORMAT',
                games: null,
                gameCount: 0,
                profile: null,
                currentProfile: null,
                lastFailedInput: input,
            }));
            return;
        }

        // Start loading
        setState(prev => ({
            ...prev,
            isLoading: true,
            error: null,
        }));

        let steamId64: string;
        let vanityUrl: string | null = null;

        // Resolve vanity URL if needed
        if (needsVanityResolution(parsed)) {
            vanityUrl = parsed.value;
            const vanityResult = await resolveVanityUrl(parsed.value);

            if (!vanityResult.success) {
                setState(prev => ({
                    ...prev,
                    isLoading: false,
                    error: vanityResult.error,
                    games: null,
                    gameCount: 0,
                    profile: null,
                    currentProfile: null,
                    lastFailedInput: input,
                }));
                return;
            }

            steamId64 = vanityResult.steamId64;
        } else {
            steamId64 = parsed.steamId64!;
        }

        // Fetch games
        const gamesResult = await getOwnedGames(steamId64);

        if (!gamesResult.success) {
            setState(prev => ({
                ...prev,
                isLoading: false,
                error: gamesResult.error,
                games: null,
                gameCount: 0,
                profile: null,
                currentProfile: null,
                lastFailedInput: input,
            }));
            return;
        }

        // Success!
        setState({
            isLoading: false,
            error: null,
            games: gamesResult.games,
            gameCount: gamesResult.gameCount,
            profile: gamesResult.profile,
            currentProfile: { steamId64, vanityUrl },
            lastFailedInput: null,
        });
    }, []);

    const loadProfile = useCallback(async (profile: SavedProfile) => {
        await fetchLibrary(profile.steamId64);
    }, [fetchLibrary]);

    const clear = useCallback(() => {
        setState({
            isLoading: false,
            error: null,
            games: null,
            gameCount: 0,
            profile: null,
            currentProfile: null,
            lastFailedInput: null,
        });
    }, []);

    return {
        ...state,
        fetchLibrary,
        clear,
        loadProfile,
    };
}
