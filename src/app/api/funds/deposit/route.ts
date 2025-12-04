// app/api/funds/deposit/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { query } from '@/lib/db';
import { writeFile, mkdir } from 'fs/promises';
import { join } from 'path';

// Project-relative upload folder (cross-environment)
const UPLOAD_DIR = join(process.cwd(), 'deposit_receipt');

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
        const filepath = join(UPLOAD_DIR, filename);

        await mkdir(UPLOAD_DIR, { recursive: true });
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
