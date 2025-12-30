/**
 * Steam Data Normalizer
 * 
 * Converts raw Steam API responses to clean, typed data structures.
 * No external dependencies, no environment access.
 */

import type { SteamGame } from './types.js';

/**
 * Raw game data from Steam API (IPlayerService/GetOwnedGames)
 */
interface RawSteamGame {
    appid: number;
    name?: string;
    playtime_forever?: number;
    playtime_2weeks?: number;
    img_icon_url?: string;
    img_logo_url?: string;
}

/**
 * Raw response from IPlayerService/GetOwnedGames
 */
export interface RawOwnedGamesResponse {
    response: {
        game_count?: number;
        games?: RawSteamGame[];
    };
}

/**
 * Raw player summary from Steam API (ISteamUser/GetPlayerSummaries)
 */
export interface RawPlayerSummary {
    steamid: string;
    personaname: string;
    profileurl: string;
    avatar: string;
    avatarmedium: string;
    avatarfull: string;
    personastate: number;
    realname?: string;
    loccountrycode?: string;
    timecreated?: number;
}

/**
 * Base URL for Steam game icons/logos
 */
const STEAM_MEDIA_BASE = 'https://media.steampowered.com/steamcommunity/public/images/apps';

/**
 * Build icon URL from app ID and hash
 */
function buildIconUrl(appId: number, iconHash: string | undefined): string | null {
    if (!iconHash) return null;
    return `${STEAM_MEDIA_BASE}/${appId}/${iconHash}.jpg`;
}

/**
 * Build logo URL from app ID and hash
 */
function buildLogoUrl(appId: number, logoHash: string | undefined): string | null {
    if (!logoHash) return null;
    return `${STEAM_MEDIA_BASE}/${appId}/${logoHash}.jpg`;
}

/**
 * Normalize a single game from raw Steam API data
 */
function normalizeGame(raw: RawSteamGame): SteamGame {
    return {
        appId: raw.appid,
        name: raw.name ?? `App ${raw.appid}`,
        playtimeMinutes: raw.playtime_forever ?? 0,
        playtimeRecentMinutes: raw.playtime_2weeks ?? null,
        iconUrl: buildIconUrl(raw.appid, raw.img_icon_url),
        logoUrl: buildLogoUrl(raw.appid, raw.img_logo_url),
    };
}

/**
 * Normalize the full owned games response
 * 
 * @param raw Raw Steam API response
 * @returns Object with games array and count
 */
export function normalizeOwnedGames(raw: RawOwnedGamesResponse): {
    games: SteamGame[];
    gameCount: number;
} {
    const response = raw.response;
    console.log(response.games)
    const games = response.games ?? [];

    return {
        games: games.map(normalizeGame),
        gameCount: response.game_count ?? games.length,
    };
}

/**
 * Format playtime minutes to human-readable string
 */
export function formatPlaytime(minutes: number): string {
    if (minutes === 0) return 'Never played';

    const hours = minutes / 60;

    if (hours < 1) {
        return `${minutes} min`;
    }

    if (hours < 10) {
        return `${hours.toFixed(1)} hrs`;
    }

    return `${Math.round(hours)} hrs`;
}

/**
 * Normalize a raw player summary
 */
export function normalizeProfile(raw: RawPlayerSummary): import('./types').SteamProfile {
    return {
        steamId64: raw.steamid,
        personaname: raw.personaname,
        profileUrl: raw.profileurl,
        avatar: raw.avatar,
        avatarMedium: raw.avatarmedium,
        avatarFull: raw.avatarfull,
        personaState: raw.personastate,
        realName: raw.realname,
        locCountryCode: raw.loccountrycode,
        timeCreated: raw.timecreated,
    };
}
