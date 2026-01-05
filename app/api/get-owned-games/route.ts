import { NextResponse } from 'next/server';
import type { GetOwnedGamesResponse } from '@/lib/shared/types';
import { normalizeOwnedGames, normalizeProfile, type RawOwnedGamesResponse, type RawPlayerSummary } from '@/lib/shared/normalizer';

export async function POST(request: Request) {
    try {
        const { steamId64 } = await request.json();

        if (!steamId64 || typeof steamId64 !== 'string' || !/^[0-9]{17}$/.test(steamId64)) {
            return NextResponse.json({
                success: false,
                error: 'INVALID_INPUT_FORMAT',
            } satisfies GetOwnedGamesResponse, { status: 400 });
        }

        const apiKey = process.env.STEAM_API_KEY;
        if (!apiKey) {
            console.error('STEAM_API_KEY not configured');
            return NextResponse.json({
                success: false,
                error: 'STEAM_API_ERROR',
            } satisfies GetOwnedGamesResponse, { status: 500 });
        }

        const steamUrl = `https://api.steampowered.com/IPlayerService/GetOwnedGames/v1/?key=${apiKey}&steamid=${steamId64}&include_appinfo=1&include_played_free_games=1&format=json`;
        const profileUrl = `https://api.steampowered.com/ISteamUser/GetPlayerSummaries/v2/?key=${apiKey}&steamids=${steamId64}`;

        const [gamesRes, profileRes] = await Promise.all([
            fetch(steamUrl),
            fetch(profileUrl)
        ]);

        if (!gamesRes.ok) {
            console.error(`Steam API error (games): ${gamesRes.status}`);
            return NextResponse.json({
                success: false,
                error: 'STEAM_API_ERROR',
            } satisfies GetOwnedGamesResponse, { status: 502 });
        }

        if (!profileRes.ok) {
            console.error(`Steam API error (profile): ${profileRes.status}`);
            return NextResponse.json({
                success: false,
                error: 'STEAM_API_ERROR',
            } satisfies GetOwnedGamesResponse, { status: 502 });
        }

        const gamesData = await gamesRes.json() as RawOwnedGamesResponse;
        const profileData = await profileRes.json() as { response: { players: RawPlayerSummary[] } };

        if (!gamesData.response || !gamesData.response.games) {
            return NextResponse.json({
                success: false,
                error: 'PROFILE_PRIVATE',
            } satisfies GetOwnedGamesResponse);
        }

        if (gamesData.response.games.length === 0) {
            return NextResponse.json({
                success: false,
                error: 'EMPTY_LIBRARY',
            } satisfies GetOwnedGamesResponse);
        }

        const normalizedGames = normalizeOwnedGames(gamesData);
        const normalizedProfile = normalizeProfile(profileData.response.players[0]);

        return NextResponse.json({
            success: true,
            games: normalizedGames.games,
            gameCount: normalizedGames.gameCount,
            profile: normalizedProfile,
        } satisfies GetOwnedGamesResponse);

    } catch (error) {
        console.error('Steam API request failed:', error);
        return NextResponse.json({
            success: false,
            error: 'STEAM_API_ERROR',
        } satisfies GetOwnedGamesResponse, { status: 502 });
    }
}
