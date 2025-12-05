import nodemailer from "nodemailer";

const smtpUser = process.env.SMTP_USER;
const smtpPass = process.env.SMTP_PASS;

if (!smtpUser || !smtpPass) {
  console.warn(
    "SMTP credentials missing. Set SMTP_USER and SMTP_PASS to enable email sending."
  );
}

const transporter = nodemailer.createTransport({
  service: "gmail",
  auth: {
    user: smtpUser,
    pass: smtpPass,
  },
});

export async function sendVerificationEmail(
  to: string,
  verificationLink: string
) {
  if (!smtpUser || !smtpPass) {
    throw new Error("SMTP credentials are not configured.");
  }

  const subject = "Verify your email";
  const text = `Welcome! Please verify your email to continue.`;
  const html = `
    <div style="font-family: Arial, sans-serif; line-height: 1.6; color: #0f172a;">
      <h2 style="margin: 0 0 12px 0;">Verify your email</h2>
      <p style="margin: 0 0 16px 0;">Thanks for registering. Please confirm your email to continue.</p>
      <a href="${verificationLink}" style="display:inline-block;padding:12px 18px;background:#111827;color:#ffffff;text-decoration:none;border-radius:8px;font-weight:600;">
        Verify Email
      </a>
    </div>
  `;

  await transporter.sendMail({
    from: smtpUser,
    to,
    subject,
    text,
    html,
  });
}

export async function sendAccountsEmail(
  to: string,
  demoLogin: string,
  realLogin?: string | null
) {
  if (!smtpUser || !smtpPass) {
    throw new Error("SMTP credentials are not configured.");
  }

  const subject = "Your trading accounts";
  const realLine = realLogin
    ? `<li><strong>Live account:</strong> ${realLogin}</li>`
    : `<li><strong>Live account:</strong> Pending KYC approval</li>`;
  const html = `
    <div style="font-family: Arial, sans-serif; line-height: 1.6; color: #0f172a;">
      <h2 style="margin: 0 0 12px 0;">Accounts created</h2>
      <p style="margin: 0 0 12px 0;">Your demo account is ready. Live account will be available after KYC.</p>
      <ul style="padding-left: 18px; margin: 0 0 12px 0;">
        ${realLine}
        <li><strong>Demo account:</strong> ${demoLogin}</li>
      </ul>
      <p style="margin: 0;">Use the password you set during registration to log in.</p>
    </div>
  `;

  await transporter.sendMail({
    from: smtpUser,
    to,
    subject,
    html,
  });
}

export async function sendOtpEmail(to: string, code: string) {
  if (!smtpUser || !smtpPass) {
    throw new Error("SMTP credentials are not configured.");
  }

  const subject = "Your login code";
  const html = `
    <div style="font-family: Arial, sans-serif; line-height: 1.6; color: #0f172a;">
      <h2 style="margin: 0 0 12px 0;">Login verification</h2>
      <p style="margin: 0 0 12px 0;">Use this code to finish signing in:</p>
      <div style="font-size: 28px; font-weight: 700; letter-spacing: 6px; margin: 16px 0; color: #111827;">
        ${code}
      </div>
      <p style="margin: 0;">This code expires in 5 minutes.</p>
    </div>
  `;

  await transporter.sendMail({
    from: smtpUser,
    to,
    subject,
    html,
  });
}
