/**
 * useLocalProfiles Hook
 * 
 * Manages saved profiles with consent flow.
 */

import { useState, useEffect, useCallback } from 'react';
import type { SavedProfile } from '../../api/_shared/types';
import {
    hasStorageConsent,
    setStorageConsent,
    getSavedProfiles,
    saveProfile as storageSaveProfile,
    deleteProfile as storageDeleteProfile,
} from '../storage/profiles';

interface UseLocalProfilesReturn {
    /** Whether user has consented to storage */
    hasConsent: boolean;
    /** All saved profiles */
    profiles: SavedProfile[];
    /** Show consent modal for saving */
    showConsentModal: boolean;
    /** Profile pending save (waiting for consent) */
    pendingProfile: SavedProfile | null;
    /** Request to save a profile (may trigger consent modal) */
    requestSaveProfile: (profile: SavedProfile) => void;
    /** Confirm consent and save pending profile */
    confirmConsent: () => void;
    /** Decline consent */
    declineConsent: () => void;
    /** Delete a profile */
    deleteProfile: (steamId64: string) => void;
    /** Revoke consent and clear all data */
    revokeConsent: () => void;
}

export function useLocalProfiles(): UseLocalProfilesReturn {
    const [hasConsent, setHasConsent] = useState(hasStorageConsent());
    const [profiles, setProfiles] = useState<SavedProfile[]>([]);
    const [showConsentModal, setShowConsentModal] = useState(false);
    const [pendingProfile, setPendingProfile] = useState<SavedProfile | null>(null);

    // Load profiles on mount and when consent changes
    useEffect(() => {
        if (hasConsent) {
            setProfiles(getSavedProfiles());
        } else {
            setProfiles([]);
        }
    }, [hasConsent]);

    const requestSaveProfile = useCallback((profile: SavedProfile) => {
        if (hasStorageConsent()) {
            // Already have consent, save directly
            storageSaveProfile(profile);
            setProfiles(getSavedProfiles());
        } else {
            // Need consent first
            setPendingProfile(profile);
            setShowConsentModal(true);
        }
    }, []);

    const confirmConsent = useCallback(() => {
        setStorageConsent(true);
        setHasConsent(true);
        setShowConsentModal(false);

        if (pendingProfile) {
            storageSaveProfile(pendingProfile);
            setProfiles(getSavedProfiles());
            setPendingProfile(null);
        }
    }, [pendingProfile]);

    const declineConsent = useCallback(() => {
        setShowConsentModal(false);
        setPendingProfile(null);
    }, []);

    const deleteProfile = useCallback((steamId64: string) => {
        storageDeleteProfile(steamId64);
        setProfiles(getSavedProfiles());
    }, []);

    const revokeConsent = useCallback(() => {
        setStorageConsent(false);
        setHasConsent(false);
        setProfiles([]);
    }, []);

    return {
        hasConsent,
        profiles,
        showConsentModal,
        pendingProfile,
        requestSaveProfile,
        confirmConsent,
        declineConsent,
        deleteProfile,
        revokeConsent,
    };
}
