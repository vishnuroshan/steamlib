/**
 * Steam Input Parser
 * 
 * Pure function to parse and normalize various Steam profile input formats.
 * No external dependencies, no environment access.
 */

import type { ParsedSteamInput } from './types.js';

// SteamID64 is a 17-digit number
const STEAMID64_REGEX = /^[0-9]{17}$/;

// Full Steam profile URLs
const STEAM_PROFILE_URL_REGEX = /^https?:\/\/steamcommunity\.com\/profiles\/([0-9]{17})\/?$/;
const STEAM_VANITY_URL_REGEX = /^https?:\/\/steamcommunity\.com\/id\/([a-zA-Z0-9_-]+)\/?$/;

// Vanity URL pattern (alphanumeric, underscores, hyphens, 2-32 chars)
const VANITY_URL_REGEX = /^[a-zA-Z0-9_-]{2,32}$/;

/**
 * Parse a Steam profile input string and determine its type.
 * 
 * Accepts:
 * - SteamID64 (17-digit number)
 * - Vanity URL (2-32 alphanumeric chars)
 * - Full Steam community profile URL
 * 
 * @param input Raw user input
 * @returns ParsedSteamInput or null if invalid
 */
export function parseSteamInput(input: string): ParsedSteamInput | null {
    const trimmed = input.trim();

    if (!trimmed) {
        return null;
    }

    // Check if it's a direct SteamID64
    if (STEAMID64_REGEX.test(trimmed)) {
        return {
            type: 'steamid64',
            value: trimmed,
            steamId64: trimmed,
        };
    }

    // Check if it's a full profile URL with SteamID64
    const profileMatch = trimmed.match(STEAM_PROFILE_URL_REGEX);
    if (profileMatch) {
        return {
            type: 'profileUrl',
            value: profileMatch[1],
            steamId64: profileMatch[1],
        };
    }

    // Check if it's a full vanity URL
    const vanityUrlMatch = trimmed.match(STEAM_VANITY_URL_REGEX);
    if (vanityUrlMatch) {
        return {
            type: 'profileUrl',
            value: vanityUrlMatch[1],
        };
    }

    // Check if it's a plain vanity URL string
    if (VANITY_URL_REGEX.test(trimmed)) {
        return {
            type: 'vanity',
            value: trimmed,
        };
    }

    // Invalid input
    return null;
}

/**
 * Check if we need to resolve vanity URL to SteamID64
 */
export function needsVanityResolution(parsed: ParsedSteamInput): boolean {
    return parsed.steamId64 === undefined;
}
