import { NextRequest, NextResponse } from "next/server";
import crypto from "crypto";

export async function POST(request: NextRequest) {
  try {
    const { code } = await request.json();
    if (!code || typeof code !== "string") {
      return NextResponse.json({ success: false, message: "OTP code is required." }, { status: 400 });
    }

    const cookies = request.cookies;
    const otpEmail = cookies.get("otp_email")?.value;
    const otpLogin = cookies.get("otp_login")?.value;
    const otpHash = cookies.get("otp_hash")?.value;
    const otpExpires = cookies.get("otp_expires")?.value;

    if (!otpEmail || !otpLogin || !otpHash || !otpExpires) {
      return NextResponse.json({ success: false, message: "OTP expired or missing." }, { status: 400 });
    }

    const expiresAt = Number(otpExpires);
    if (Number.isNaN(expiresAt) || Date.now() > expiresAt) {
      const expiredRes = NextResponse.json({ success: false, message: "OTP expired." }, { status: 400 });
      ["otp_email", "otp_login", "otp_hash", "otp_expires"].forEach((name) =>
        expiredRes.cookies.set({ name, value: "", maxAge: 0, path: "/" })
      );
      return expiredRes;
    }

    const hash = crypto.createHash("sha256").update(code).digest("hex");
    if (hash !== otpHash) {
      return NextResponse.json({ success: false, message: "Invalid code." }, { status: 401 });
    }

    const isHttps =
      request.headers.get("x-forwarded-proto") === "https" ||
      request.nextUrl?.protocol === "https:" ||
      request.url.startsWith("https://");

    const response = NextResponse.json({ success: true });

    // Set session cookie with the MT5 login
    response.cookies.set({
      name: "session",
      value: otpLogin,
      httpOnly: true,
      secure: isHttps,
      sameSite: "lax",
      maxAge: 60 * 60 * 24,
      path: "/",
    });

    // Clear OTP cookies
    ["otp_email", "otp_login", "otp_hash", "otp_expires"].forEach((name) =>
      response.cookies.set({ name, value: "", maxAge: 0, path: "/" })
    );

    return response;
  } catch (error) {
    console.error("OTP verify error:", error);
    return NextResponse.json(
      { success: false, message: "OTP verification failed." },
      { status: 500 }
    );
  }
}
