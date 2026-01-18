import { NextResponse } from 'next/server';
import { ensureGameMetadata } from '@/lib/igdb';

export async function POST(request: Request) {
    try {
        const { appIds } = await request.json();

        if (!appIds || !Array.isArray(appIds)) {
            return NextResponse.json({ error: 'Invalid input' }, { status: 400 });
        }

        const data = await ensureGameMetadata(appIds);
        return NextResponse.json({ success: true, data });

    } catch (error: any) {
        console.error('API Error:', error);
        return NextResponse.json({ success: false, error: error.message }, { status: 500 });
    }
}
