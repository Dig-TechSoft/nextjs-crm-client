import { NextRequest, NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { query, RowDataPacket } from '@/lib/db';

export async function GET(request: NextRequest) {
    try {
        const cookieStore = await cookies();
        const session = cookieStore.get('session');

        if (!session) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const login = session.value;

        const sql = `
      SELECT Login, Registration, Phone, Email, Name 
      FROM golday_mt5_uat.mt5_users 
      WHERE login = ?
      LIMIT 1
    `;

        // Type it correctly
        const results = await query<RowDataPacket[]>(sql, [login]);

        if (!results || results.length === 0) {
            return NextResponse.json({ error: 'User not found' }, { status: 404 });
        }

        const user = results[0]; // Now safe — TypeScript knows it's there

        return NextResponse.json({
            success: true,
            user: {
                Login: user.Login,
                Registration: user.Registration,
                Phone: user.Phone || '',
                Email: user.Email,
                Name: user.Name,
            }
        });
    } catch (error) {
        console.error('Error fetching profile:', error);
        return NextResponse.json({ error: 'Failed to fetch profile' }, { status: 500 });
    }
}