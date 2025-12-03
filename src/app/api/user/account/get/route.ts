import { NextRequest, NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { query, RowDataPacket } from '@/lib/db';

export async function GET(request: NextRequest) {
    const searchParams = request.nextUrl.searchParams;
    let login = searchParams.get('login');

    if (!login) {
        const cookieStore = await cookies();
        const session = cookieStore.get('session');
        if (session && session.value) {
            login = session.value;
        }
    }

    if (!login) {
        return NextResponse.json({ retcode: "1 Error", answer: "Missing login parameter and no session found" }, { status: 401 });
    }

    try {
        const sql = `SELECT * FROM golday_mt5_uat.mt5_users WHERE login = ? LIMIT 1`;
        const results = await query<RowDataPacket[]>(sql, [login]);

        if (results.length === 0) {
            return NextResponse.json({ retcode: "2 Error", answer: "User not found" }, { status: 404 });
        }

        const user = results[0];

        // Map database fields to the desired JSON structure
        // Note: We are assuming the DB has these columns or we default to 0.
        // We use 'user.ColumnName' or 'user.columnname' checks if possible, but here we assume standard MT5 naming or lowercase.
        // Based on previous files, 'Login' was capitalized, 'balance' was lowercase in page.tsx but 'Balance' in user request.
        // We will check both.

        const getVal = (key: string, altKey?: string) => {
            const val = user[key] !== undefined ? user[key] : (altKey && user[altKey] !== undefined ? user[altKey] : 0);
            return typeof val === 'number' ? val.toFixed(2) : val.toString();
        };

        const answer = {
            Login: getVal('Login', 'login'),
            CurrencyDigits: getVal('CurrencyDigits', 'currency_digits') || "2", // Default to 2 if not found
            Balance: getVal('Balance', 'balance'),
            Credit: getVal('Credit', 'credit'),
            Margin: getVal('Margin', 'margin'),
            MarginFree: getVal('MarginFree', 'margin_free'),
            MarginLevel: getVal('MarginLevel', 'margin_level'),
            MarginLeverage: getVal('MarginLeverage', 'leverage'), // Leverage often named 'leverage'
            Profit: getVal('Profit', 'profit'),
            Storage: getVal('Storage', 'storage'),
            Floating: getVal('Floating', 'floating'),
            Equity: getVal('Equity', 'equity'),
            SOActivation: getVal('SOActivation'),
            SOTime: getVal('SOTime'),
            SOLevel: getVal('SOLevel'),
            SOEquity: getVal('SOEquity'),
            SOMargin: getVal('SOMargin'),
            Assets: getVal('Assets'),
            Liabilities: getVal('Liabilities'),
            BlockedCommission: getVal('BlockedCommission'),
            BlockedProfit: getVal('BlockedProfit'),
            MarginInitial: getVal('MarginInitial'),
            MarginMaintenance: getVal('MarginMaintenance')
        };

        return NextResponse.json({
            retcode: "0 Done",
            answer: answer
        });

    } catch (error) {
        console.error("Database error:", error);
        return NextResponse.json({ retcode: "3 Error", answer: "Database error" }, { status: 500 });
    }
}
