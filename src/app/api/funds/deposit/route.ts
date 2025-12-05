// app/api/funds/deposit/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { query } from '@/lib/db';
import { writeFile, mkdir } from 'fs/promises';
import { join, isAbsolute } from 'path';

// Resolve upload folder from env with a safe fallback for local dev
const uploadRoot = process.env.DEPOSIT_RECEIPT_DIR && isAbsolute(process.env.DEPOSIT_RECEIPT_DIR)
    ? process.env.DEPOSIT_RECEIPT_DIR
    : join(process.cwd(), 'deposit_receipt');

// Increase file size limit (important!)
export const config = {
    api: {
        bodyParser: false,
        sizeLimit: '10mb',
    },
};

export async function POST(request: NextRequest) {
    try {
        // 1. Get login from session
        const cookieStore = await cookies();
        const session = cookieStore.get('session');
        if (!session?.value) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }
        const login = session.value;

        // Require verified/linked account before allowing deposits
        const [signup] = await query<any[]>(
            `SELECT email_verified_at, status FROM user_signups WHERE real_login = ? OR demo_login = ? LIMIT 1`,
            [login, login]
        );
        if (!signup || !signup.email_verified_at || signup.status !== 'accounts_created') {
            return NextResponse.json(
                { error: 'Please complete email verification and account setup before depositing.' },
                { status: 403 }
            );
        }

        // 2. Parse FormData
        const formData = await request.formData();
        const amount = formData.get('amount') as string;
        const paymentMethod = formData.get('paymentMethod') as string;
        const usdtAmount = formData.get('usdtAmount') as string | null;
        const file = formData.get('file') as File | null;

        if (!amount || !paymentMethod || !file) {
            return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
        }

        // 3. Generate UploadCode (3 letters + 18 digits)
        const letters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ';
        let uploadCode = '';
        for (let i = 0; i < 3; i++) uploadCode += letters[Math.floor(Math.random() * 26)];
        for (let i = 0; i < 18; i++) uploadCode += Math.floor(Math.random() * 10);

        // 4. Save file
        const buffer = Buffer.from(await file.arrayBuffer());
        const ext = file.name.split('.').pop()?.toLowerCase() || 'jpg';
        const filename = `${uploadCode}.${ext}`;
        const filepath = join(uploadRoot, filename);

        await mkdir(uploadRoot, { recursive: true });
        await writeFile(filepath, buffer);

        // 5. Insert into DB
        const sql = `
      INSERT INTO deposit_receipt_upload 
      (Login, UploadCode, Status, Amount, PaymentMethod, USDTType, WalletAddress, Deal, Comment)
      VALUES (?, ?, 'pending', ?, ?, ?, ?, NULL, '')
    `;

        const usdtType = paymentMethod === 'crypto_usdt' ? 'TRC-20' : null;
        const walletAddress = paymentMethod === 'crypto_usdt'
            ? 'TLaF6i2GkR7vT4K7Np3m8v9cX8yZk9pQrT'
            : null;

        await query(sql, [
            login,
            uploadCode,
            parseFloat(amount),
            paymentMethod,
            usdtType,
            walletAddress,
        ]);

        return NextResponse.json({ success: true, uploadCode, filename });

    } catch (error: any) {
        console.error('Deposit upload error:', error);
        return NextResponse.json(
            { error: 'Server error', details: error.message },
            { status: 500 }
        );
    }
}
