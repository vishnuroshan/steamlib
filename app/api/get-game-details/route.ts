import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

import { Database } from '@/lib/database.types';

const supabaseUrl = process.env.SUPABASE_URL || process.env.VITE_SUPABASE_URL;
const supabaseAnonKey = process.env.SUPABASE_ANON_KEY || process.env.VITE_SUPABASE_ANON_KEY;
const igdbClientId = process.env.IGDB_CLIENT_ID;
const igdbClientSecret = process.env.IGDB_CLIENT_SECRET;

let supabaseInstance: ReturnType<typeof createClient<Database>> | null = null;

function getSupabase() {
    if (supabaseInstance) return supabaseInstance;

    // In build context or if vars are missing, we can't create a valid client.
    // We return null or throw depending on usage, but for the API route we expect them to exist at runtime.
    if (!supabaseUrl || !supabaseAnonKey) {
        throw new Error('Supabase credentials not configured');
    }

    supabaseInstance = createClient<Database>(supabaseUrl, supabaseAnonKey);
    return supabaseInstance;
}

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

export async function POST(request: Request) {
    try {
        const { appIds } = await request.json();

        if (!appIds || !Array.isArray(appIds)) {
            return NextResponse.json({ error: 'Invalid input' }, { status: 400 });
        }

        const supabase = getSupabase();

        const { data: cachedData, error: fetchError } = await supabase
            .from('game_metadata')
            .select('*')
            .in('appid', appIds);

        if (fetchError) throw fetchError;

        const cachedAppIds = (cachedData as any[])?.map(d => d.appid) || [];
        const missingAppIds = appIds.filter(id => !cachedAppIds.includes(id));

        let freshlyFetched: Database['public']['Tables']['game_metadata']['Insert'][] = [];

        if (missingAppIds.length > 0) {
            const token = await getIgdbAccessToken();

            const query = `
                fields game.name, game.genres.name, game.total_rating, game.summary, uid;
                where uid = (${missingAppIds.map(id => `"${id}"`).join(',')}) & category = 1;
                limit 500;
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

            const igdbData = await igdbRes.json();

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

                if (freshlyFetched.length > 0) {
                    const { error: insertError } = await supabase
                        .from('game_metadata')
                        .upsert(freshlyFetched, { onConflict: 'appid' });

                    if (insertError) console.error('Supabase insert error:', insertError);
                }
            }
        }

        const allData = [...(cachedData || []), ...freshlyFetched];
        return NextResponse.json({ success: true, data: allData });

    } catch (error: any) {
        console.error('API Error:', error);
        return NextResponse.json({ success: false, error: error.message }, { status: 500 });
    }
}
