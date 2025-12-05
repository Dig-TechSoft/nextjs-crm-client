import { NextRequest, NextResponse } from "next/server";
import { cookies } from "next/headers";
import { query, RowDataPacket } from "@/lib/db";

type AccountRow = RowDataPacket & {
  demo_login: string | null;
};

export async function POST(request: NextRequest) {
  try {
    const { balance } = await request.json();
    const amount = Number(balance);
    if (!Number.isFinite(amount)) {
      return NextResponse.json({ success: false, message: "Invalid balance amount." }, { status: 400 });
    }

    const cookieStore = await cookies();
    const session = cookieStore.get("session");
    if (!session?.value) {
      return NextResponse.json({ success: false, message: "Unauthorized" }, { status: 401 });
    }

    const [row] = await query<AccountRow[]>(
      `
        SELECT demo_login
        FROM user_signups
        WHERE demo_login = ?
        LIMIT 1
      `,
      [session.value]
    );

    if (!row || row.demo_login !== session.value) {
      return NextResponse.json(
        { success: false, message: "Only demo accounts can set balance." },
        { status: 403 }
      );
    }

    // Fetch current balance
    const acctRes = await fetch(
      `http://127.0.0.1:3000/api/user/account/get?login=${session.value}`,
      { cache: "no-store" }
    );
    const acctJson = await acctRes.json();
    if (acctJson.retcode !== "0 Done") {
      return NextResponse.json({ success: false, message: "Failed to load account balance." }, { status: 500 });
    }
    const current = Number(acctJson.answer?.Balance || 0);
    const delta = amount - current;

    if (delta === 0) {
      return NextResponse.json({ success: true, newBalance: amount });
    }

    const res = await fetch(
      `http://127.0.0.1:3000/api/trade/balance?login=${session.value}&type=2&balance=${delta}&comment=demo`
    );

    let retcode: string | number | null = null;
    if (res.ok) {
      try {
        const data = await res.json();
        retcode = data?.retcode;
      } catch {
        retcode = "0 Done"; // treat as success when API responded 200 without JSON
      }
    }

    if (!res.ok || (retcode && retcode !== "0 Done" && retcode !== 0)) {
      return NextResponse.json({ success: false, message: "Failed to update balance." }, { status: 500 });
    }

    return NextResponse.json({ success: true, newBalance: amount });
  } catch (error) {
    console.error("Set demo balance error:", error);
    return NextResponse.json({ success: false, message: "Failed to update balance." }, { status: 500 });
  }
}
