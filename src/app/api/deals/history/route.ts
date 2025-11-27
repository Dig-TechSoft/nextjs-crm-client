import { NextRequest, NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { query } from '@/lib/db';

export async function GET(request: NextRequest) {
    try {
        // Get session from cookies
        const cookieStore = await cookies();
        const session = cookieStore.get('session');

        if (!session) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const login = session.value;

        // Query trading history
        const sql = `
            SELECT 
                deal, 
                login, 
                time, 
                symbol, 
                profit, 
                priceposition, 
                pricesl, 
                pricetp, 
                marketbid, 
                marketask, 
                volume/10000 as volume
            FROM golday_mt5_uat.mt5_deals
            WHERE login = ?
            AND entry = 1
            ORDER BY time DESC
        `;

        const results = await query(sql, [login]);

        return NextResponse.json({ success: true, deals: results });
    } catch (error) {
        console.error('Error fetching trading history:', error);
        return NextResponse.json({ error: 'Failed to fetch trading history' }, { status: 500 });
    }
}
