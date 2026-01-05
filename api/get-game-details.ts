import type { VercelRequest, VercelResponse } from '@vercel/node';
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.VITE_SUPABASE_URL;
const supabaseAnonKey = process.env.VITE_SUPABASE_ANON_KEY;
const igdbClientId = process.env.IGDB_CLIENT_ID;
const igdbClientSecret = process.env.IGDB_CLIENT_SECRET;

const supabase = createClient(supabaseUrl || '', supabaseAnonKey || '');

let igdbAccessToken: string | null = null;

async function getIgdbAccessToken() {
    if (igdbAccessToken) return igdbAccessToken;

    const res = await fetch(`https://id.twitch.tv/oauth2/token?client_id=${igdbClientId}&client_secret=${igdbClientSecret}&grant_type=client_credentials`, {
        method: 'POST'
    });

    const data = await res.json();
    igdbAccessToken = data.access_token;
    return igdbAccessToken;
}

export default async function handler(req: VercelRequest, res: VercelResponse) {
    if (req.method !== 'POST') {
        return res.status(405).json({ error: 'Method not allowed' });
    }

    const { appIds } = req.body as { appIds: number[] };

    if (!appIds || !Array.isArray(appIds)) {
        return res.status(400).json({ error: 'Invalid input' });
    }

    try {
        // 1. Check Supabase cache
        const { data: cachedData, error: fetchError } = await supabase
            .from('game_metadata')
            .select('*')
            .in('appid', appIds);

        if (fetchError) throw fetchError;

        const cachedAppIds = cachedData?.map(d => d.appid) || [];
        const missingAppIds = appIds.filter(id => !cachedAppIds.includes(id));

        let freshlyFetched: any[] = [];

        // 2. Fetch missing from IGDB
        if (missingAppIds.length > 0) {
            const token = await getIgdbAccessToken();

            // IGDB query to find games by Steam AppID
            // external_games category 1 is Steam
            const query = `
                fields game.name, game.genres.name, game.total_rating, game.summary, uid;
                where uid = (${missingAppIds.map(id => `"${id}"`).join(',')}) & category = 1;
                limit 500;
            `;

            console.log('IGDB Query:', query);

            const igdbRes = await fetch('https://api.igdb.com/v4/external_games', {
                method: 'POST',
                headers: {
                    'Client-ID': igdbClientId!,
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'text/plain'
                },
                body: query
            });

            const igdbData = await igdbRes.json();
            console.log('IGDB Response:', JSON.stringify(igdbData, null, 2));

            if (Array.isArray(igdbData)) {
                freshlyFetched = igdbData.map((item: any) => ({
                    appid: parseInt(item.uid),
                    igdb_id: item.game.id,
                    name: item.game.name,
                    genres: item.game.genres?.map((g: any) => g.name) || [],
                    rating: item.game.total_rating,
                    summary: item.game.summary,
                    updated_at: new Date().toISOString()
                }));
                console.log('Freshly Fetched Count:', freshlyFetched.length);
            } else {
                console.error('IGDB Error Response:', igdbData);
            }
            if (freshlyFetched.length > 0) {
                const { error: insertError } = await supabase
                    .from('game_metadata')
                    .upsert(freshlyFetched, { onConflict: 'appid' });

                if (insertError) console.error('Supabase insert error:', insertError);
            }
        }

        // Combine cached and fresh data
        const allData = [...(cachedData || []), ...freshlyFetched];
        return res.status(200).json({ success: true, data: allData });

    } catch (error: any) {
        console.error('API Error:', error);
        return res.status(500).json({ success: false, error: error.message });
    }
}
