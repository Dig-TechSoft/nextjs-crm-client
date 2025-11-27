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

        // Query positions
        const sql = `
            SELECT 
                position, 
                login, 
                timecreate, 
                symbol, 
                profit, 
                storage, 
                priceopen, 
                pricesl, 
                pricetp, 
                pricecurrent, 
                volume/10000 as volume
            FROM golday_mt5_uat.mt5_positions
            WHERE login = ?
            ORDER BY timecreate DESC
        `;

        const results = await query(sql, [login]);

        return NextResponse.json({ success: true, positions: results });
    } catch (error) {
        console.error('Error fetching positions:', error);
        return NextResponse.json({ error: 'Failed to fetch positions' }, { status: 500 });
    }
}