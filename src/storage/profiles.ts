/**
 * Local Storage - Profiles
 * 
 * Manages saved Steam profiles with consent-gated storage.
 */

import type { SavedProfile } from '../core/types';

const STORAGE_KEYS = {
    CONSENT: 'steamlib_storage_consent',
    PROFILES: 'steamlib_saved_profiles',
} as const;

// =============================================================================
// Consent Management
// =============================================================================

/**
 * Check if user has consented to local storage
 */
export function hasStorageConsent(): boolean {
    try {
        return localStorage.getItem(STORAGE_KEYS.CONSENT) === 'true';
    } catch {
        return false;
    }
}

/**
 * Set storage consent (true = consented, false = revoked)
 * If revoking, also clears all stored data
 */
export function setStorageConsent(consent: boolean): void {
    try {
        if (consent) {
            localStorage.setItem(STORAGE_KEYS.CONSENT, 'true');
        } else {
            // Revoke consent = clear everything
            localStorage.removeItem(STORAGE_KEYS.CONSENT);
            localStorage.removeItem(STORAGE_KEYS.PROFILES);
        }
    } catch (error) {
        console.error('Failed to set storage consent:', error);
    }
}

// =============================================================================
// Profile CRUD
// =============================================================================

/**
 * Get all saved profiles
 */
export function getSavedProfiles(): SavedProfile[] {
    try {
        if (!hasStorageConsent()) {
            return [];
        }

        const stored = localStorage.getItem(STORAGE_KEYS.PROFILES);
        if (!stored) {
            return [];
        }

        return JSON.parse(stored) as SavedProfile[];
    } catch (error) {
        console.error('Failed to get saved profiles:', error);
        return [];
    }
}

/**
 * Save a profile (adds or updates by steamId64)
 * @param profile Profile to save
 * @returns true if saved successfully
 */
export function saveProfile(profile: SavedProfile): boolean {
    try {
        if (!hasStorageConsent()) {
            return false;
        }

        const profiles = getSavedProfiles();
        const existingIndex = profiles.findIndex(p => p.steamId64 === profile.steamId64);

        if (existingIndex >= 0) {
            // Update existing
            profiles[existingIndex] = profile;
        } else {
            // Add new
            profiles.push(profile);
        }

        localStorage.setItem(STORAGE_KEYS.PROFILES, JSON.stringify(profiles));
        return true;
    } catch (error) {
        console.error('Failed to save profile:', error);
        return false;
    }
}

/**
 * Delete a profile by steamId64
 */
export function deleteProfile(steamId64: string): boolean {
    try {
        if (!hasStorageConsent()) {
            return false;
        }

        const profiles = getSavedProfiles();
        const filtered = profiles.filter(p => p.steamId64 !== steamId64);

        localStorage.setItem(STORAGE_KEYS.PROFILES, JSON.stringify(filtered));
        return true;
    } catch (error) {
        console.error('Failed to delete profile:', error);
        return false;
    }
}

/**
 * Clear all profiles
 */
export function clearAllProfiles(): boolean {
    try {
        localStorage.removeItem(STORAGE_KEYS.PROFILES);
        return true;
    } catch (error) {
        console.error('Failed to clear profiles:', error);
        return false;
    }
}
