import { NextRequest, NextResponse } from "next/server";
import { cookies } from "next/headers";
import { query, RowDataPacket } from "@/lib/db";

type AccountRow = RowDataPacket & {
  real_login: string | null;
  demo_login: string | null;
};

export async function POST(request: NextRequest) {
  try {
    const { login } = await request.json();
    if (!login) {
      return NextResponse.json({ success: false, message: "Login is required." }, { status: 400 });
    }

    const cookieStore = await cookies();
    const session = cookieStore.get("session");
    if (!session?.value) {
      return NextResponse.json({ success: false, message: "Unauthorized" }, { status: 401 });
    }

    const [row] = await query<AccountRow[]>(
      `
        SELECT real_login, demo_login
        FROM user_signups
        WHERE real_login = ? OR demo_login = ? OR real_login = ? OR demo_login = ?
        LIMIT 1
      `,
      [session.value, session.value, login, login]
    );

    if (!row || (row.real_login !== login && row.demo_login !== login)) {
      return NextResponse.json({ success: false, message: "Account not linked to this user." }, { status: 403 });
    }

    const isHttps =
      request.headers.get("x-forwarded-proto") === "https" ||
      request.nextUrl?.protocol === "https:" ||
      request.url.startsWith("https://");

    const response = NextResponse.json({ success: true, login });
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
  } catch (error) {
    console.error("Account switch error:", error);
    return NextResponse.json({ success: false, message: "Failed to switch account." }, { status: 500 });
  }
}
