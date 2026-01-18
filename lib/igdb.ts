import { getSupabase } from './supabase';
import { GameMetadata } from './shared/types';
import { Database } from './database.types';

const igdbClientId = process.env.IGDB_CLIENT_ID;
const igdbClientSecret = process.env.IGDB_CLIENT_SECRET;

let igdbAccessToken: string | null = null;
const IGDB_BATCH_SIZE = 500;

async function getIgdbAccessToken() {
    if (igdbAccessToken) return igdbAccessToken;

    try {
        const res = await fetch(`https://id.twitch.tv/oauth2/token?client_id=${igdbClientId}&client_secret=${igdbClientSecret}&grant_type=client_credentials`, {
            method: 'POST'
        });

        if (!res.ok) throw new Error(`IGDB Token Error: ${res.statusText}`);

        const data = await res.json();
        igdbAccessToken = data.access_token;
        return igdbAccessToken;
    } catch (error) {
        console.error('Failed to get IGDB token', error);
        throw error;
    }
}

/**
 * Ensures access to game metadata for a list of AppIDs.
 * Checks cache first, fetches missing from IGDB in batches, and updates cache.
 */
export async function ensureGameMetadata(appIds: number[]): Promise<GameMetadata[]> {
    if (!appIds.length) return [];

    const uniqueAppIds = Array.from(new Set(appIds));
    const supabase = getSupabase();

    // 1. Check Cache
    const { data: cachedData, error: fetchError } = await supabase
        .from('game_metadata')
        .select('*')
        .in('appid', uniqueAppIds);

    if (fetchError) {
        console.error('Supabase cache check failed:', fetchError);
        // Fallback: try to fetch everything from IGDB? Or just return what we have? 
        // For now, proceed as if cache is empty to be safe, or retry.
    }

    const cachedGames = (cachedData || []) as unknown as GameMetadata[];
    // Type assertion needed because DB types might differ slightly in nullability vs shared types
    // but the structure matches.

    const cachedAppIds = new Set(cachedGames.map(g => g.appid));
    const missingAppIds = uniqueAppIds.filter(id => !cachedAppIds.has(id));

    if (missingAppIds.length === 0) {
        return cachedGames;
    }

    console.log(`Fetching ${missingAppIds.length} games from IGDB...`);
    let freshGames: GameMetadata[] = [];

    // 2. Fetch Missing from IGDB in Batches
    for (let i = 0; i < missingAppIds.length; i += IGDB_BATCH_SIZE) {
        const batch = missingAppIds.slice(i, i + IGDB_BATCH_SIZE);
        try {
            const token = await getIgdbAccessToken();

            // IGDB Query
            // Note: external_game_source = 3 is Steam
            const query = `
                fields game.name, game.genres.name, game.total_rating, game.summary, game.release_dates.y, game.platforms.name, uid, external_game_source;
                where uid = ("${batch.join('", "')}") & external_game_source = 1;
                limit ${IGDB_BATCH_SIZE};
            `;

            const igdbRes = await fetch('https://api.igdb.com/v4/external_games', {
                method: 'POST',
                headers: {
                    'Client-ID': igdbClientId!,
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'text/plain'
                },
                body: query
            });

            if (!igdbRes.ok) {
                console.error(`IGDB fetch failed for batch ${i}`, await igdbRes.text());
                continue;
            }

            const igdbData = await igdbRes.json();

            if (Array.isArray(igdbData)) {
                const batchGames = igdbData.map((item: any) => ({
                    appid: parseInt(item.uid),
                    igdb_id: item.game.id,
                    name: item.game.name,
                    genres: item.game.genres?.map((g: any) => g.name) || [],
                    year: item.game.release_dates?.[0]?.y || null,
                    platforms: item.game.platforms?.map((p: any) => p.name) || [],
                    external_game_source: item.external_game_source,
                    rating: item.game.total_rating,
                    summary: item.game.summary,
                    // updated_at not in GameMetadata interface but in DB
                }));
                freshGames.push(...batchGames);
            }

        } catch (error) {
            console.error('Error processing IGDB batch:', error);
        }
    }

    // 3. Upsert to Cache
    if (freshGames.length > 0) {
        const dbRows = freshGames.map(g => ({
            ...g,
            updated_at: new Date().toISOString()
        }));

        const { error: insertError } = await supabase
            .from('game_metadata')
            .upsert(dbRows as any, { onConflict: 'appid' }); // Cast to any to avoid strict type mismatch on optional fields

        if (insertError) {
            console.error('Failed to update game cache:', insertError);
        }
    }

    return [...cachedGames, ...freshGames];
}
