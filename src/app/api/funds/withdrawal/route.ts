// app/funds/withdrawal/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { query } from '@/lib/db';

const MANAGER_API = 'http://127.0.0.1:3000';

export async function POST(request: NextRequest) {
    try {
        // 1. Get login from session
        const cookieStore = await cookies();
        const session = cookieStore.get('session');
        if (!session?.value) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }
        const login = session.value.trim();

        // 2. Parse form data
        const formData = await request.formData();
        const amountStr = formData.get('amount') as string;
        const bankName = formData.get('bankName') as string;
        const accountNumber = formData.get('accountNumber') as string;
        const accountName = formData.get('accountName') as string;

        if (!amountStr || !bankName || !accountNumber || !accountName) {
            return NextResponse.json({ error: 'All fields are required' }, { status: 400 });
        }

        const amount = parseFloat(amountStr);
        if (isNaN(amount) || amount < 50) {
            return NextResponse.json({ error: 'Minimum withdrawal is $50' }, { status: 400 });
        }

        // 3. Get current account info + balance check
        const accRes = await fetch(`${MANAGER_API}/api/user/account/get?login=${login}`, { cache: 'no-store' });
        if (!accRes.ok) return NextResponse.json({ error: 'Failed to load account' }, { status: 500 });

        const accJson = await accRes.json();
        if (accJson.retcode !== "0 Done" || !accJson.answer) {
            return NextResponse.json({ error: 'Account not found' }, { status: 400 });
        }

        const acc = accJson.answer;
        if (parseFloat(acc.Balance) < amount) {
            return NextResponse.json({
                error: `Insufficient balance. Available: $${parseFloat(acc.Balance).toFixed(2)}`
            }, { status: 400 });
        }

        // 4. IMMEDIATELY DEDUCT BALANCE (real withdrawal)
        const withdrawUrl = `${MANAGER_API}/api/trade/balance?login=${login}&type=2&balance=-${amount}&comment=Withdrawal_CRMClient`;

        const withdrawRes = await fetch(withdrawUrl, {
            method: 'GET',
            headers: { 'Accept': 'application/json' }
        });

        if (!withdrawRes.ok) {
            console.error('Manager API error:', withdrawRes.status);
            return NextResponse.json({ error: 'Withdrawal failed on trading server' }, { status: 500 });
        }

        const result = await withdrawRes.json();

        if (!result.success || !result.data?.ticket) {
            console.error('No ticket received:', result);
            return NextResponse.json({ error: 'Withdrawal executed but no ticket returned' }, { status: 500 });
        }

        const ticket = result.data.ticket;

        // 5. Save request as PENDING (admin will later change status)
        const sql = `
            INSERT INTO withdrawal_request 
            (Login, ClientName, Amount, BankName, BankNumber, Status,
             balance, credit, equity, margin, marginfree, marginlevel,
             PaymentMethod, Comment, deal)
            VALUES (?, ?, ?, ?, ?, 'pending', ?, ?, ?, ?, ?, ?, 'Online Bank Transfer', 
                    'Auto-deducted on submit – awaiting bank transfer', ?)
        `;

        await query(sql, [
            login,
            accountName,
            amount,
            bankName,
            accountNumber,
            acc.Balance,
            acc.Credit,
            acc.Equity,
            acc.Margin,
            acc.MarginFree,
            acc.MarginLevel,
            ticket
        ]);

        return NextResponse.json({ success: true });

    } catch (error: any) {
        console.error('Withdrawal error:', error);
        return NextResponse.json(
            { error: 'Server error', details: error.message },
            { status: 500 }
        );
    }
}