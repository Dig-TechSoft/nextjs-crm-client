import { NextRequest, NextResponse } from "next/server";
import { cookies } from "next/headers";
import { query, RowDataPacket } from "@/lib/db";
import { sendAccountsEmail } from "@/lib/email";

type SignupRow = RowDataPacket & {
  id: number;
  email: string;
  demo_login: string | null;
  real_login: string | null;
  status: string;
};

export async function POST(request: NextRequest) {
  try {
    const { password } = await request.json();
    if (!password || typeof password !== "string") {
      return NextResponse.json({ success: false, message: "Password is required." }, { status: 400 });
    }

    const cookieStore = await cookies();
    const session = cookieStore.get("session");
    if (!session?.value) {
      return NextResponse.json({ success: false, message: "Unauthorized" }, { status: 401 });
    }

    const [row] = await query<SignupRow[]>(
      `
        SELECT id, email, demo_login, real_login, status
        FROM user_signups
        WHERE demo_login = ? OR real_login = ?
        LIMIT 1
      `,
      [session.value, session.value]
    );

    if (!row) {
      return NextResponse.json({ success: false, message: "Account not found." }, { status: 404 });
    }

    if (row.real_login) {
      return NextResponse.json({ success: false, message: "Live account already exists." }, { status: 400 });
    }

    // Create real account
    const realParams = new URLSearchParams({
      group: "real\\itrade",
      name: "N/A",
      pass_main: password,
      pass_investor: password,
      email: row.email,
    });

    const realRes = await fetch(`http://127.0.0.1:3000/api/user/add?${realParams.toString()}`);
    const realJson = await realRes.json();

    if (realJson.retcode !== "0 Done" || !realJson.answer?.Login) {
      return NextResponse.json(
        { success: false, message: "Failed to create live account." },
        { status: 500 }
      );
    }

    await query(
      `
        UPDATE user_signups
        SET real_login = ?, status = 'accounts_created', account_password_synced = 1
        WHERE id = ?
      `,
      [realJson.answer.Login, row.id]
    );

    // Notify user
    try {
      await sendAccountsEmail(row.email, row.demo_login || "", realJson.answer.Login);
    } catch (err) {
      console.error("Failed to send accounts email (live):", err);
    }

    const isHttps =
      request.headers.get("x-forwarded-proto") === "https" ||
      request.nextUrl?.protocol === "https:" ||
      request.url.startsWith("https://");

    const response = NextResponse.json({
      success: true,
      real_login: realJson.answer.Login,
      demo_login: row.demo_login,
    });

    response.cookies.set({
      name: "session",
      value: realJson.answer.Login,
      httpOnly: true,
      secure: isHttps,
      sameSite: "lax",
      maxAge: 60 * 60 * 24,
      path: "/",
    });

    return response;
  } catch (error) {
    console.error("Create real account error:", error);
    return NextResponse.json(
      { success: false, message: "Failed to create live account." },
      { status: 500 }
    );
  }
}
