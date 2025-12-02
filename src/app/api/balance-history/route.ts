import { NextRequest, NextResponse } from "next/server";
import { query } from "@/lib/db";
import { cookies } from "next/headers";

export async function GET(request: NextRequest) {
    try {
        const cookieStore = await cookies();
        const session = cookieStore.get("session");

        if (!session) {
            return NextResponse.json(
                { error: "Unauthorized" },
                { status: 401 }
            );
        }

        const login = session.value;

        // Query balance history from mt5_daily table
        const results = await query(
            'SELECT Datetime, Balance FROM golday_mt5_uat.mt5_daily WHERE login = ? ORDER BY Datetime ASC',
            [login]
        ) as any[];

        // Transform data: convert Unix timestamp to date string and format for chart
        const balanceHistory = results.map((row) => ({
            date: new Date(row.Datetime * 1000).toISOString().split('T')[0], // Convert Unix to YYYY-MM-DD
            balance: parseFloat(row.Balance),
            timestamp: row.Datetime
        }));

        return NextResponse.json(balanceHistory);
    } catch (error) {
        console.error("Failed to fetch balance history:", error);
        return NextResponse.json(
            { error: "Failed to fetch balance history" },
            { status: 500 }
        );
    }
}
