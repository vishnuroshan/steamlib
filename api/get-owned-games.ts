import type { VercelRequest, VercelResponse } from '@vercel/node';
import type { GetOwnedGamesResponse } from '../src/core/types';
import { normalizeOwnedGames, type RawOwnedGamesResponse } from '../src/core/normalizer';

/**
 * POST /api/get-owned-games
 * 
 * Fetches owned games for a Steam profile.
 * 
 * Request body: { steamId64: string }
 * Response: GetOwnedGamesResponse
 */
export default async function handler(
    req: VercelRequest,
    res: VercelResponse
): Promise<void> {
    // Only allow POST
    if (req.method !== 'POST') {
        res.status(405).json({ success: false, error: 'STEAM_API_ERROR' });
        return;
    }

    const { steamId64 } = req.body as { steamId64?: string };

    // Validate input
    if (!steamId64 || typeof steamId64 !== 'string') {
        res.status(400).json({
            success: false,
            error: 'INVALID_INPUT_FORMAT',
        } satisfies GetOwnedGamesResponse);
        return;
    }

    // Validate SteamID64 format (17 digits)
    if (!/^[0-9]{17}$/.test(steamId64)) {
        res.status(400).json({
            success: false,
            error: 'INVALID_INPUT_FORMAT',
        } satisfies GetOwnedGamesResponse);
        return;
    }

    // Get Steam API key from environment
    const apiKey = process.env.STEAM_API_KEY;
    if (!apiKey) {
        console.error('STEAM_API_KEY not configured');
        res.status(500).json({
            success: false,
            error: 'STEAM_API_ERROR',
        } satisfies GetOwnedGamesResponse);
        return;
    }

    try {
        // include_appinfo=1 to get game names and images
        // include_played_free_games=1 to include free-to-play games
        const steamUrl = `https://api.steampowered.com/IPlayerService/GetOwnedGames/v1/?key=${apiKey}&steamid=${steamId64}&include_appinfo=1&include_played_free_games=1&format=json`;

        const response = await fetch(steamUrl);

        if (!response.ok) {
            console.error(`Steam API error: ${response.status}`);
            res.status(502).json({
                success: false,
                error: 'STEAM_API_ERROR',
            } satisfies GetOwnedGamesResponse);
            return;
        }

        const data = await response.json() as RawOwnedGamesResponse;

        // Empty response usually means private profile or no games
        if (!data.response || !data.response.games) {
            // Check if it's likely a private profile vs empty library
            res.status(200).json({
                success: false,
                error: 'PROFILE_PRIVATE',
            } satisfies GetOwnedGamesResponse);
            return;
        }

        // Check for empty library
        if (data.response.games.length === 0) {
            res.status(200).json({
                success: false,
                error: 'EMPTY_LIBRARY',
            } satisfies GetOwnedGamesResponse);
            return;
        }

        // Normalize and return
        const normalized = normalizeOwnedGames(data);

        res.status(200).json({
            success: true,
            games: normalized.games,
            gameCount: normalized.gameCount,
        } satisfies GetOwnedGamesResponse);

    } catch (error) {
        console.error('Steam API request failed:', error);
        res.status(502).json({
            success: false,
            error: 'STEAM_API_ERROR',
        } satisfies GetOwnedGamesResponse);
    }
}
