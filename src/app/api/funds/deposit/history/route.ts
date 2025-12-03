// app/api/funds/deposit/history/route.ts
import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { query } from '@/lib/db';

export async function GET() {
    try {
        const cookieStore = await cookies();
        const allCookies = cookieStore.getAll();

        let rawValue = '';
        for (const c of allCookies) {
            if (c.value.includes('50') || c.value.includes('"login"')) {
                rawValue = c.value;
                break;
            }
        }
        if (!rawValue) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

        let login: string;
        try {
            const parsed = JSON.parse(rawValue);
            login = String(parsed.login || parsed.Login || parsed.id || parsed).trim();
        } catch {
            login = rawValue.trim();
        }

        const sql = `
      SELECT 
        Receipt_ID,
        Deal,
        Amount,
        Status,
        Time,
        PaymentMethod,
        USDTType,
        WalletAddress,
        Comment
      FROM deposit_receipt_upload
      WHERE Login = ?
      ORDER BY Time DESC
      LIMIT 50
    `;

        const results = await query(sql, [login]);

        return NextResponse.json({ success: true, data: results });
    } catch (error: any) {
        console.error('Deposit history error:', error);
        return NextResponse.json({ error: 'Server error' }, { status: 500 });
    }
}