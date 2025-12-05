import { NextRequest, NextResponse } from "next/server";
import { query, RowDataPacket } from "@/lib/db";
import { sendAccountsEmail } from "@/lib/email";

type VerifyRow = RowDataPacket & {
  id: number;
  email: string;
  token_expires_at: string;
  status: string;
  email_verified_at?: string | null;
  real_login?: string | null;
  demo_login?: string | null;
};

export async function POST(request: NextRequest) {
  try {
    const { token, passwordEncoded } = await request.json();

    if (!token || typeof token !== "string") {
      return NextResponse.json(
        { success: false, message: "Verification token is required." },
        { status: 400 }
      );
    }

    if (!passwordEncoded || typeof passwordEncoded !== "string") {
      return NextResponse.json(
        { success: false, message: "Password is required for provisioning." },
        { status: 400 }
      );
    }

    let plainPassword: string;
    try {
      plainPassword = Buffer.from(passwordEncoded, "base64url").toString("utf-8");
    } catch {
      return NextResponse.json(
        { success: false, message: "Invalid password data." },
        { status: 400 }
      );
    }

    const [row] = await query<VerifyRow[]>(
      "SELECT id, email, token_expires_at, status, email_verified_at FROM user_signups WHERE verification_token = ? LIMIT 1",
      [token]
    );

    if (!row) {
      return NextResponse.json(
        { success: false, message: "Invalid verification token." },
        { status: 400 }
      );
    }

    const now = new Date();
    const expires = new Date(row.token_expires_at);
    if (expires.getTime() < now.getTime()) {
      return NextResponse.json(
        { success: false, message: "Verification link has expired." },
        { status: 400 }
      );
    }

    if (row.email_verified_at) {
      return NextResponse.json({
        success: true,
        message: "Email already verified.",
      });
    }

    // Create demo account
    const demoParams = new URLSearchParams({
      group: "demo\\itrade",
      name: "N/A",
      pass_main: plainPassword,
      pass_investor: plainPassword,
      email: row.email,
    });

    const demoRes = await fetch(
      `http://127.0.0.1:3000/api/user/add?${demoParams.toString()}`
    );
    const demoJson = await demoRes.json();

    if (demoJson.retcode !== "0 Done" || !demoJson.answer?.Login) {
      await query(
        `
          UPDATE user_signups
          SET email_verified_at = NOW(), status = 'failed'
          WHERE id = ?
        `,
        [row.id]
      );
      return NextResponse.json(
        { success: false, message: "Failed to create demo account." },
        { status: 500 }
      );
    }

    // Initial demo deposit (set to 10000)
    try {
      await fetch(
        `http://127.0.0.1:3000/api/trade/balance?login=${demoJson.answer.Login}&type=2&balance=10000&comment=demo_initial`
      );
    } catch (err) {
      console.error("Demo initial deposit failed:", err);
    }

    await query(
      `
        UPDATE user_signups
        SET email_verified_at = NOW(),
            status = 'accounts_created',
            real_login = NULL,
            demo_login = ?,
            account_password_synced = 1
        WHERE id = ?
      `,
      [demoJson.answer.Login, row.id]
    );

    // Notify user with demo account (live pending KYC)
    try {
      await sendAccountsEmail(row.email, demoJson.answer.Login, null);
    } catch (err) {
      console.error("Failed to send accounts email:", err);
    }

    const isHttps =
      request.headers.get("x-forwarded-proto") === "https" ||
      request.nextUrl?.protocol === "https:" ||
      request.url.startsWith("https://");

    const response = NextResponse.json({
      success: true,
      message: "Email verified. Demo account created.",
      demo_login: demoJson.answer.Login,
      real_login: null,
    });

    response.cookies.set({
      name: "session",
      value: demoJson.answer.Login,
      httpOnly: true,
      secure: isHttps,
      sameSite: "lax",
      maxAge: 60 * 60 * 24,
      path: "/",
    });

    return response;
  } catch (error) {
    console.error("Verify error:", error);
    return NextResponse.json(
      { success: false, message: "Verification failed." },
      { status: 500 }
    );
  }
}
