import { NextRequest, NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import { query, RowDataPacket } from "@/lib/db";
import { sendOtpEmail } from "@/lib/email";
import crypto from "crypto";

type SignupRow = RowDataPacket & {
  email: string;
  password_hash: string;
  email_verified_at: string | null;
  status: string;
  real_login: string | null;
  demo_login: string | null;
};

export async function POST(request: NextRequest) {
  try {
    const { email, password } = await request.json();

    if (!email || !password) {
      return NextResponse.json(
        { success: false, message: "Email and password are required." },
        { status: 400 }
      );
    }

    const [row] = await query<SignupRow[]>(
      `
        SELECT email, password_hash, email_verified_at, status, real_login, demo_login
        FROM user_signups
        WHERE email = ?
        LIMIT 1
      `,
      [email]
    );

    if (!row) {
      return NextResponse.json(
        { success: false, message: "Account not found." },
        { status: 404 }
      );
    }

    const hasAccount = Boolean(row.real_login || row.demo_login);
    const isVerified = Boolean(row.email_verified_at) || hasAccount;

    // Only allow when status is accounts_created
    if (!isVerified || row.status !== "accounts_created") {
      return NextResponse.json(
        { success: false, message: "Please verify your email before logging in." },
        { status: 403 }
      );
    }

    const isMatch = await bcrypt.compare(password, row.password_hash);
    if (!isMatch) {
      return NextResponse.json(
        { success: false, message: "Invalid email or password." },
        { status: 401 }
      );
    }

    const primaryLogin = row.real_login || row.demo_login;
    if (!primaryLogin) {
      return NextResponse.json(
        { success: false, message: "No MT5 account linked to this email yet." },
        { status: 400 }
      );
    }

    // Auto-heal status if missing
    if (row.email_verified_at && row.status !== "accounts_created") {
      const newStatus = "accounts_created";
      await query(`UPDATE user_signups SET status = ? WHERE email = ?`, [newStatus, row.email]);
      row.status = newStatus;
    }

    // OTP flow
    const otp = Math.floor(100000 + Math.random() * 900000).toString();
    const otpHash = crypto.createHash("sha256").update(otp).digest("hex");
    const expiresAt = Date.now() + 5 * 60 * 1000; // 5 minutes
    const isHttps =
      request.headers.get("x-forwarded-proto") === "https" ||
      request.nextUrl?.protocol === "https:" ||
      request.url.startsWith("https://");

    // Send OTP email
    await sendOtpEmail(email, otp);

    const response = NextResponse.json({
      success: true,
      valid: true,
      requireOtp: true,
      email,
    });

    // Clear old otp cookies
    ["otp_email", "otp_login", "otp_hash", "otp_expires"].forEach((name) =>
      response.cookies.set({
        name,
        value: "",
        maxAge: 0,
        path: "/",
      })
    );

    response.cookies.set({
      name: "otp_email",
      value: email,
      httpOnly: true,
      secure: isHttps,
      sameSite: "lax",
      maxAge: 5 * 60,
      path: "/",
    });
    response.cookies.set({
      name: "otp_login",
      value: primaryLogin,
      httpOnly: true,
      secure: isHttps,
      sameSite: "lax",
      maxAge: 5 * 60,
      path: "/",
    });
    response.cookies.set({
      name: "otp_hash",
      value: otpHash,
      httpOnly: true,
      secure: isHttps,
      sameSite: "lax",
      maxAge: 5 * 60,
      path: "/",
    });
    response.cookies.set({
      name: "otp_expires",
      value: expiresAt.toString(),
      httpOnly: true,
      secure: isHttps,
      sameSite: "lax",
      maxAge: 5 * 60,
      path: "/",
    });

    return response;
  } catch (error) {
    console.error("Login error:", error);
    return NextResponse.json(
      { success: false, message: "Login failed." },
      { status: 500 }
    );
  }
}
