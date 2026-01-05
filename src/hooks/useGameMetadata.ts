import { useState, useCallback } from 'react';
import { getGameDetails } from '../api/steam';
import type { GameMetadata } from '../../api/_shared/types';

// Simple global cache to avoid re-fetching same games in different components
const metadataCache: Record<number, GameMetadata> = {};

export function useGameMetadata() {
    const [metadata, setMetadata] = useState<Record<number, GameMetadata>>(metadataCache);
    const [loading, setLoading] = useState(false);

    const fetchMetadata = useCallback(async (appIds: number[]) => {
        if (!appIds || appIds.length === 0) return;

        // Filter out games we already have in cache
        const missingIds = appIds.filter(id => !metadataCache[id]);

        if (missingIds.length === 0) {
            // All requested IDs are in cache, update local state just in case
            setMetadata({ ...metadataCache });
            return;
        }

        setLoading(true);
        try {
            const res = await getGameDetails(missingIds);
            if (res.success && res.data) {
                res.data.forEach(item => {
                    metadataCache[item.appid] = item;
                });

                // Update state with the updated global cache
                setMetadata({ ...metadataCache });
            }
        } catch (err) {
            console.error('Metadata fetch error:', err);
        } finally {
            setLoading(false);
        }
    }, []);

    const getMetadataForGame = useCallback((appId: number) => {
        return metadata[appId] || metadataCache[appId];
    }, [metadata]);

    return {
        metadata,
        loading,
        fetchMetadata,
        getMetadataForGame
    };
}
