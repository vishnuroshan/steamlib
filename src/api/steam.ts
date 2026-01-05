/**
 * Steam API Client
 * 
 * Typed fetch wrappers for Steam-related API endpoints.
 * Calls our serverless backend, never Steam directly.
 */

import type { ResolveVanityResponse, GetOwnedGamesResponse, GetGameDetailsResponse } from '../../api/_shared/types';

/**
 * Resolve a Steam vanity URL to SteamID64
 * 
 * @param vanityUrl The vanity URL (e.g., "gabordemooij")
 * @returns Promise resolving to the API response
 */
export async function resolveVanityUrl(vanityUrl: string): Promise<ResolveVanityResponse> {
    try {
        const response = await fetch('/api/resolve-vanity', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ vanityUrl }),
        });

        const data = await response.json() as ResolveVanityResponse;
        return data;
    } catch (error) {
        console.error('Failed to resolve vanity URL:', error);
        return {
            success: false,
            error: 'STEAM_API_ERROR',
        };
    }
}

/**
 * Get owned games for a SteamID64
 * 
 * @param steamId64 The 17-digit Steam ID
 * @returns Promise resolving to the API response
 */
export async function getOwnedGames(steamId64: string): Promise<GetOwnedGamesResponse> {
    try {
        const response = await fetch('/api/get-owned-games', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ steamId64 }),
        });

        const data = await response.json() as GetOwnedGamesResponse;
        return data;
    } catch (error) {
        console.error('Failed to get owned games:', error);
        return {
            success: false,
            error: 'STEAM_API_ERROR',
        };
    }
}

/**
 * Get detailed metadata (genres, etc.) for a list of AppIDs
 * 
 * @param appIds Array of Steam AppIDs
 * @returns Promise resolving to the API response
 */
export async function getGameDetails(appIds: number[]): Promise<GetGameDetailsResponse> {
    try {
        const response = await fetch('/api/get-game-details', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ appIds }),
        });

        return await response.json() as GetGameDetailsResponse;
    } catch (error) {
        console.error('Failed to get game details:', error);
        return {
            success: false,
            error: 'Failed to fetch game details',
        };
    }
}
