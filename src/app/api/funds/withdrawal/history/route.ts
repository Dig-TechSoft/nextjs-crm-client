// app/api/funds/withdrawal/history/route.ts
import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { query } from '@/lib/db';   // Make sure this file exists and exports `query`

const MANAGER_API = 'http://127.0.0.1:3000';

export async function GET() {
    try {
        const cookieStore = await cookies();
        const session = cookieStore.get('session');

        if (!session?.value) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const login = session.value.trim();

        const sql = `
      SELECT 
        Withdraw_ID,
        Amount, 
        BankName, 
        BankNumber, 
        Status, 
        Time
      FROM withdrawal_request
      WHERE Login = ?
      ORDER BY Time DESC
      LIMIT 50
    `;

        const results: any[] = await query(sql, [login]);

        // Generate client-friendly reference number
        // Reverse the index so oldest (last in DESC order) gets W1000001
        const totalCount = results.length;
        const data = results.map((row, index) => ({
            ...row,
            ref: `W${String(1000001 + (totalCount - 1 - index)).padStart(7, '0')}`,
        }));

        return NextResponse.json({ success: true, data });
    } catch (error) {
        console.error('History error:', error);
        return NextResponse.json({ error: 'Server error' }, { status: 500 });
    }
}

// Cancel & Refund
export async function POST(request: Request) {
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

        const { requestId } = await request.json();
        if (!requestId) return NextResponse.json({ error: 'Missing ID' }, { status: 400 });

        // Check request is pending and belongs to user
        const check = await query(
            `SELECT Amount, Status FROM withdrawal_request WHERE Withdraw_ID = ? AND CAST(Login AS CHAR) = ?`,
            [requestId, login]
        );

        const rows = check as any[];
        if (rows.length === 0 || rows[0].Status !== 'pending') {
            return NextResponse.json({ error: 'Cannot cancel this request' }, { status: 400 });
        }

        const amount = rows[0].Amount;

        // Refund money back
        const refundUrl = `${MANAGER_API}/api/trade/balance?login=${login}&type=2&balance=${amount}&comment=ADJ_Cancel_Refund`;
        const res = await fetch(refundUrl);
        const result = await res.json();

        if (!result.success || !result.data?.ticket) {
            console.error('Refund failed:', result);
            return NextResponse.json({ error: 'Refund failed on trading server' }, { status: 500 });
        }

        const refundTicket = result.data.ticket;

        // Save refund ticket + status + comment
        await query(
            `UPDATE withdrawal_request 
       SET Status = 'cancelled',
           cancelwithdrawdeal = ?,
           Comment = 'Cancelled by client – amount refunded'
       WHERE Withdraw_ID = ?`,
            [refundTicket, requestId]
        );

        return NextResponse.json({ success: true, refundTicket });

    } catch (error) {
        console.error('Cancel error:', error);
        return NextResponse.json({ error: 'Server error' }, { status: 500 });
    }
}