import type { VercelRequest, VercelResponse } from '@vercel/node';
import type { ResolveVanityResponse } from '../src/core/types';

/**
 * POST /api/resolve-vanity
 * 
 * Resolves a Steam vanity URL to SteamID64.
 * 
 * Request body: { vanityUrl: string }
 * Response: ResolveVanityResponse
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

    const { vanityUrl } = req.body as { vanityUrl?: string };

    // Validate input
    if (!vanityUrl || typeof vanityUrl !== 'string') {
        res.status(400).json({
            success: false,
            error: 'INVALID_INPUT_FORMAT',
        } satisfies ResolveVanityResponse);
        return;
    }

    // Validate vanity URL format (2-32 alphanumeric chars)
    if (!/^[a-zA-Z0-9_-]{2,32}$/.test(vanityUrl)) {
        res.status(400).json({
            success: false,
            error: 'INVALID_INPUT_FORMAT',
        } satisfies ResolveVanityResponse);
        return;
    }

    // Get Steam API key from environment
    const apiKey = process.env.STEAM_API_KEY;
    if (!apiKey) {
        console.error('STEAM_API_KEY not configured');
        res.status(500).json({
            success: false,
            error: 'STEAM_API_ERROR',
        } satisfies ResolveVanityResponse);
        return;
    }

    try {
        const steamUrl = `https://api.steampowered.com/ISteamUser/ResolveVanityURL/v1/?key=${apiKey}&vanityurl=${encodeURIComponent(vanityUrl)}`;

        const response = await fetch(steamUrl);

        if (!response.ok) {
            console.error(`Steam API error: ${response.status}`);
            res.status(502).json({
                success: false,
                error: 'STEAM_API_ERROR',
            } satisfies ResolveVanityResponse);
            return;
        }

        const data = await response.json() as {
            response: {
                success: number;
                steamid?: string;
                message?: string;
            };
        };

        // Steam returns success: 1 for found, 42 for not found
        if (data.response.success !== 1 || !data.response.steamid) {
            res.status(404).json({
                success: false,
                error: 'VANITY_NOT_FOUND',
            } satisfies ResolveVanityResponse);
            return;
        }

        res.status(200).json({
            success: true,
            steamId64: data.response.steamid,
        } satisfies ResolveVanityResponse);

    } catch (error) {
        console.error('Steam API request failed:', error);
        res.status(502).json({
            success: false,
            error: 'STEAM_API_ERROR',
        } satisfies ResolveVanityResponse);
    }
}
