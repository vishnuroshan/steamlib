import type { VercelRequest, VercelResponse } from '@vercel/node';
import type { GetOwnedGamesResponse } from './_shared/types.js';
import { normalizeOwnedGames, normalizeProfile, type RawOwnedGamesResponse, type RawPlayerSummary } from './_shared/normalizer.js';

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
    console.log('STEAM_API_KEY present:', !!apiKey);
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
        const profileUrl = `https://api.steampowered.com/ISteamUser/GetPlayerSummaries/v2/?key=${apiKey}&steamids=${steamId64}`;

        console.log('Fetching from Steam API...');
        const [gamesRes, profileRes] = await Promise.all([
            fetch(steamUrl),
            fetch(profileUrl)
        ]);

        if (!gamesRes.ok) {
            const errorText = await gamesRes.text();
            console.error(`Steam API error (games): ${gamesRes.status} ${gamesRes.statusText} - Content: ${errorText}`);
            res.status(gamesRes.status).json({
                success: false,
                error: 'STEAM_API_ERROR',
                _debug: { status: gamesRes.status, statusText: gamesRes.statusText }
            } as any);
            return;
        }

        if (!profileRes.ok) {
            const errorText = await profileRes.text();
            console.error(`Steam API error (profile): ${profileRes.status} ${profileRes.statusText} - Content: ${errorText}`);
            res.status(profileRes.status).json({
                success: false,
                error: 'STEAM_API_ERROR',
                _debug: { status: profileRes.status, statusText: profileRes.statusText }
            } as any);
            return;
        }

        const gamesData = await gamesRes.json() as RawOwnedGamesResponse;
        const profileData = await profileRes.json() as { response: { players: RawPlayerSummary[] } };

        // Empty response usually means private profile or no games
        if (!gamesData.response || !gamesData.response.games) {
            // Check if it's likely a private profile vs empty library
            res.status(200).json({
                success: false,
                error: 'PROFILE_PRIVATE',
            } satisfies GetOwnedGamesResponse);
            return;
        }

        // Check for empty library
        if (gamesData.response.games.length === 0) {
            res.status(200).json({
                success: false,
                error: 'EMPTY_LIBRARY',
            } satisfies GetOwnedGamesResponse);
            return;
        }

        // Normalize and return
        const normalizedGames = normalizeOwnedGames(gamesData);
        const normalizedProfile = normalizeProfile(profileData.response.players[0]);

        res.status(200).json({
            success: true,
            games: normalizedGames.games,
            gameCount: normalizedGames.gameCount,
            profile: normalizedProfile,
        } satisfies GetOwnedGamesResponse);

    } catch (error) {
        console.error('Steam API request failed:', error);
        res.status(502).json({
            success: false,
            error: 'STEAM_API_ERROR',
        } satisfies GetOwnedGamesResponse);
    }
}
