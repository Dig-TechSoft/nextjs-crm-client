import { NextRequest, NextResponse } from "next/server";
import { cookies } from "next/headers";
import { query, RowDataPacket } from "@/lib/db";

type AccountRow = RowDataPacket & {
  email: string;
  real_login: string | null;
  demo_login: string | null;
  status: string;
};

export async function GET(request: NextRequest) {
  try {
    const cookieStore = await cookies();
    const session = cookieStore.get("session");
    if (!session?.value) {
      return NextResponse.json({ success: false, message: "Unauthorized" }, { status: 401 });
    }

    const currentLogin = session.value;

    const [row] = await query<AccountRow[]>(
      `
        SELECT email, real_login, demo_login, status
        FROM user_signups
        WHERE real_login = ? OR demo_login = ?
        LIMIT 1
      `,
      [currentLogin, currentLogin]
    );

    if (!row) {
      return NextResponse.json({ success: false, message: "No linked accounts found." }, { status: 404 });
    }

    const currentType =
      row.real_login === currentLogin ? "real" : row.demo_login === currentLogin ? "demo" : null;

    return NextResponse.json({
      success: true,
      email: row.email,
      real_login: row.real_login,
      demo_login: row.demo_login,
      status: row.status,
      current_login: currentLogin,
      current_type: currentType,
    });
  } catch (error) {
    console.error("Accounts list error:", error);
    return NextResponse.json({ success: false, message: "Failed to load accounts." }, { status: 500 });
  }
}
