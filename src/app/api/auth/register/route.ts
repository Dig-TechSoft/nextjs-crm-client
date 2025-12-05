import { NextRequest, NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import { randomUUID } from "crypto";
import { query, RowDataPacket } from "@/lib/db";
import { sendVerificationEmail } from "@/lib/email";

type SignupRow = RowDataPacket & {
  status?: string;
};

function isValidEmail(email: string) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
}

function isValidPassword(password: string) {
  // 8-12 chars, at least one digit, one lowercase, one uppercase, one allowed special char
  const pattern =
    /^(?=.*[0-9])(?=.*[a-z])(?=.*[A-Z])(?=.*[!@#$%^&*._-])[A-Za-z0-9!@#$%^&*._-]{8,12}$/;
  return pattern.test(password);
}

function formatDateToMySql(date: Date) {
  return date.toISOString().slice(0, 19).replace("T", " ");
}

export async function POST(request: NextRequest) {
  try {
    const { email, password, locale } = await request.json();

    if (!email || !password) {
      return NextResponse.json(
        { success: false, message: "Email and password are required." },
        { status: 400 }
      );
    }

    if (!isValidEmail(email)) {
      return NextResponse.json(
        { success: false, message: "Invalid email address." },
        { status: 400 }
      );
    }

    if (typeof password !== "string" || !isValidPassword(password)) {
      return NextResponse.json(
        {
          success: false,
          message:
            "Password must be 8-12 characters with upper, lower, number, and one of !@#$%^&*._-",
        },
        { status: 400 }
      );
    }

    const [existing] = await query<SignupRow[]>(
      "SELECT status FROM user_signups WHERE email = ? LIMIT 1",
      [email]
    );

    if (existing?.status === "verified" || existing?.status === "accounts_created") {
      return NextResponse.json(
        { success: false, message: "Email is already registered." },
        { status: 409 }
      );
    }

    const passwordHash = await bcrypt.hash(password, 10);
    const token = randomUUID();
    const passwordEncoded = Buffer.from(password).toString("base64url");
    const expiresAt = formatDateToMySql(
      new Date(Date.now() + 1000 * 60 * 60 * 24)
    );

    await query(
      `
        INSERT INTO user_signups (email, password_hash, verification_token, token_expires_at, status)
        VALUES (?, ?, ?, ?, 'pending')
        ON DUPLICATE KEY UPDATE
          password_hash = VALUES(password_hash),
          verification_token = VALUES(verification_token),
          token_expires_at = VALUES(token_expires_at),
          status = 'pending',
          email_verified_at = NULL,
          real_login = NULL,
          demo_login = NULL,
          account_password_synced = 0
      `,
      [email, passwordHash, token, expiresAt]
    );

    const origin = request.headers.get("origin") ?? request.nextUrl.origin;
    const selectedLocale =
      typeof locale === "string" && locale.length > 0 ? locale : "en";
    const verificationLink = `${origin}/${selectedLocale}/verify-email?token=${token}&pwd=${passwordEncoded}`;

    await sendVerificationEmail(email, verificationLink);

    return NextResponse.json({
      success: true,
      message: "Verification email sent.",
    });
  } catch (error) {
    console.error("Registration error:", error);
    return NextResponse.json(
      { success: false, message: "Registration failed." },
      { status: 500 }
    );
  }
}
