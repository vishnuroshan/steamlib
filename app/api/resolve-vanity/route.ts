import { NextResponse } from 'next/server';
import type { ResolveVanityResponse } from '@/lib/shared/types';

export async function POST(request: Request) {
    try {
        const { vanityUrl } = await request.json();

        if (!vanityUrl || typeof vanityUrl !== 'string' || !/^[a-zA-Z0-9_-]{2,32}$/.test(vanityUrl)) {
            return NextResponse.json({
                success: false,
                error: 'INVALID_INPUT_FORMAT',
            } satisfies ResolveVanityResponse, { status: 400 });
        }

        const apiKey = process.env.STEAM_API_KEY;
        if (!apiKey) {
            console.error('STEAM_API_KEY not configured');
            return NextResponse.json({
                success: false,
                error: 'STEAM_API_ERROR',
            } satisfies ResolveVanityResponse, { status: 500 });
        }

        const steamUrl = `https://api.steampowered.com/ISteamUser/ResolveVanityURL/v1/?key=${apiKey}&vanityurl=${encodeURIComponent(vanityUrl)}`;
        const response = await fetch(steamUrl);

        if (!response.ok) {
            console.error(`Steam API error: ${response.status}`);
            return NextResponse.json({
                success: false,
                error: 'STEAM_API_ERROR',
            } satisfies ResolveVanityResponse, { status: 502 });
        }

        const data = await response.json() as {
            response: { success: number; steamid?: string; message?: string };
        };

        if (data.response.success !== 1 || !data.response.steamid) {
            return NextResponse.json({
                success: false,
                error: 'VANITY_NOT_FOUND',
            } satisfies ResolveVanityResponse, { status: 404 });
        }

        return NextResponse.json({
            success: true,
            steamId64: data.response.steamid,
        } satisfies ResolveVanityResponse);

    } catch (error) {
        console.error('Steam API request failed:', error);
        return NextResponse.json({
            success: false,
            error: 'STEAM_API_ERROR',
        } satisfies ResolveVanityResponse, { status: 502 });
    }
}
