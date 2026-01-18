/**
 * Steam Library Manager - Core Types
 * 
 * Pure TypeScript types shared across all layers.
 * No framework dependencies, no environment access.
 */

// =============================================================================
// Steam Input Types
// =============================================================================

export type SteamInputType = 'steamid64' | 'vanity' | 'profileUrl';

export interface ParsedSteamInput {
    type: SteamInputType;
    /** Normalized value - either SteamID64 or vanity name */
    value: string;
    /** Original SteamID64 if already known */
    steamId64?: string;
}

// =============================================================================
// Game Data Types
// =============================================================================

export interface SteamGame {
    appId: number;
    name: string;
    playtimeMinutes: number;
    playtimeRecentMinutes: number | null;
    iconUrl: string | null;
    logoUrl: string | null;
    coverUrl: string | null;
    // Rich metadata (Optional as it comes from a different source)
    platforms?: string[];
    genres?: string[];
    releaseYear?: number;
}

// =============================================================================
// Profile Data Types
// =============================================================================

export interface SteamProfile {
    steamId64: string;
    personaname: string;
    profileUrl: string;
    avatar: string;
    avatarMedium: string;
    avatarFull: string;
    personaState: number; // 0 = Offline, 1 = Online, etc.
    realName?: string;
    locCountryCode?: string;
    timeCreated?: number;
}

// =============================================================================
// Profile Types (Local Storage)
// =============================================================================

export interface SavedProfile {
    steamId64: string;
    displayName: string | null;
    vanityUrl: string | null;
    savedAt: number;
    avatarUrl?: string; // Cache the avatar
}

// =============================================================================
// API Response Types
// =============================================================================

export type ResolveVanityResponse =
    | { success: true; steamId64: string }
    | { success: false; error: ErrorCode };

export interface GameMetadata {
    appid: number;
    igdb_id?: number;
    name: string;
    genres: string[];
    year?: number;
    platforms?: string[];
    external_game_source?: number;
    rating?: number;
    summary?: string;
}

export type GetOwnedGamesResponse =
    | { success: true; games: SteamGame[]; gameCount: number; profile: SteamProfile }
    | { success: false; error: ErrorCode };

export type GetGameDetailsResponse =
    | { success: true; data: GameMetadata[] }
    | { success: false; error: string };

// =============================================================================
// Error Codes
// =============================================================================

export type ErrorCode =
    | 'INVALID_INPUT_FORMAT'
    | 'VANITY_NOT_FOUND'
    | 'PROFILE_PRIVATE'
    | 'STEAM_API_ERROR'
    | 'EMPTY_LIBRARY'
    | 'RATE_LIMITED';

// =============================================================================
// Error Messages (User-facing)
// =============================================================================

export const ERROR_MESSAGES: Record<ErrorCode, string> = {
    INVALID_INPUT_FORMAT: "That doesn't look like a valid Steam ID or profile URL.",
    VANITY_NOT_FOUND: "We couldn't find a Steam profile with that name.",
    PROFILE_PRIVATE: "This Steam profile is private. The library must be set to public.",
    STEAM_API_ERROR: "Steam's servers aren't responding. Try again later.",
    EMPTY_LIBRARY: "This profile has no games, or the library is private.",
    RATE_LIMITED: "Too many requests. Wait a moment and try again.",
};
