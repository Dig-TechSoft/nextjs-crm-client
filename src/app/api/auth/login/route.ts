import { NextRequest, NextResponse } from 'next/server';
import { cookies } from 'next/headers';

export async function POST(request: NextRequest) {
    try {
        const { login, password } = await request.json();

        if (!login || !password) {
            return NextResponse.json({ retcode: "3001 Invalid parameters" }, { status: 400 });
        }

        // Call the external API to verify password
        const verifyUrl = `http://127.0.0.1:3000/api/user/check_password?login=${login}&password=${password}&type=main`;
        const response = await fetch(verifyUrl);
        const data = await response.json();

        // Check if verification was successful
        if (data.success && data.valid) {
            // Set session cookie
            const cookieStore = await cookies();
            cookieStore.set('session', login, {
                httpOnly: true,
                secure: process.env.NODE_ENV === 'production',
                sameSite: 'lax',
                maxAge: 60 * 60 * 24, // 1 day
            });

            return NextResponse.json(data);
        } else {
            return NextResponse.json(data);
        }
    } catch (error) {
        console.error('API verification error:', error);
        return NextResponse.json({ retcode: "5000 Internal Server Error" }, { status: 500 });
    }
}
