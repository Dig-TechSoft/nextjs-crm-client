import { NextRequest, NextResponse } from 'next/server';

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
            // Decide if we should set a Secure cookie based on the incoming request protocol.
            // On HTTP (e.g., IP/localhost deployments), setting Secure would drop the cookie.
            const isHttps =
              request.headers.get("x-forwarded-proto") === "https" ||
              request.nextUrl?.protocol === "https:" ||
              request.url.startsWith("https://");

            const response = NextResponse.json(data);
            response.cookies.set({
              name: "session",
              value: login,
              httpOnly: true,
              secure: isHttps,
              sameSite: "lax",
              maxAge: 60 * 60 * 24,
              path: "/",
            });

            return response;
        } else {
            return NextResponse.json(data);
        }
    } catch (error) {
        console.error('API verification error:', error);
        return NextResponse.json({ retcode: "5000 Internal Server Error" }, { status: 500 });
    }
}
