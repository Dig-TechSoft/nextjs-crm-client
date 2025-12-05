import { NextRequest, NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import { cookies } from "next/headers";
import { query, RowDataPacket } from "@/lib/db";

type SignupRow = RowDataPacket & {
  id: number;
  email: string;
  password_hash: string;
  real_login: string | null;
  demo_login: string | null;
};

function isValidPassword(password: string) {
  const pattern =
    /^(?=.*[0-9])(?=.*[a-z])(?=.*[A-Z])(?=.*[!@#$%^&*._-])[A-Za-z0-9!@#$%^&*._-]{8,12}$/;
  return pattern.test(password);
}

export async function POST(request: NextRequest) {
  try {
    const { currentPassword, newPassword } = await request.json();

    if (!currentPassword || !newPassword) {
      return NextResponse.json(
        { success: false, message: "Both current and new passwords are required." },
        { status: 400 }
      );
    }

    if (!isValidPassword(newPassword)) {
      return NextResponse.json(
        {
          success: false,
          message:
            "Password must be 8-12 characters with upper, lower, number, and one of !@#$%^&*._-",
        },
        { status: 400 }
      );
    }

    const cookieStore = await cookies();
    const session = cookieStore.get("session");
    if (!session?.value) {
      return NextResponse.json({ success: false, message: "Unauthorized" }, { status: 401 });
    }

    const [row] = await query<SignupRow[]>(
      `
        SELECT id, email, password_hash, real_login, demo_login
        FROM user_signups
        WHERE real_login = ? OR demo_login = ?
        LIMIT 1
      `,
      [session.value, session.value]
    );

    if (!row) {
      return NextResponse.json({ success: false, message: "Account not found." }, { status: 404 });
    }

    const match = await bcrypt.compare(currentPassword, row.password_hash);
    if (!match) {
      return NextResponse.json(
        { success: false, message: "Current password is incorrect." },
        { status: 401 }
      );
    }

    const newHash = await bcrypt.hash(newPassword, 10);
    await query(
      `UPDATE user_signups SET password_hash = ?, account_password_synced = 0 WHERE id = ?`,
      [newHash, row.id]
    );

    return NextResponse.json({ success: true, message: "Password updated." });
  } catch (error) {
    console.error("Password change error:", error);
    return NextResponse.json(
      { success: false, message: "Failed to change password." },
      { status: 500 }
    );
  }
}
