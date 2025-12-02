import { NextRequest, NextResponse } from 'next/server';

export async function GET(request: NextRequest) {
    const searchParams = request.nextUrl.searchParams;
    const login = searchParams.get('login');
    const type = searchParams.get('type') || 'main';
    const password = searchParams.get('password');

    if (!login || !password) {
        return NextResponse.json({ retcode: "3001 Invalid parameters" });
    }

    try {
        // Call external API as requested
        const apiUrl = `http://127.0.0.1:3000/api/user/change_password?login=${login}&type=${type}&password=${password}`;

        const response = await fetch(apiUrl);
        const data = await response.json();

        return NextResponse.json(data);

    } catch (error) {
        console.error('Password change error:', error);
        return NextResponse.json({ retcode: "5000 Internal Server Error" });
    }
}
