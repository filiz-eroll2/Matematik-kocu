import { NextResponse } from 'next/server';
import { getCurrentUser } from '@/lib/auth';
import { query } from '@/lib/db';

export const dynamic = 'force-dynamic';
export const DAILY_LIMIT = 10;

export async function GET() {
  try {
    const user = await getCurrentUser();

    if (!user) {
      return NextResponse.json({
        authenticated: false,
        user: null,
        usage: {
          used: 0,
          limit: DAILY_LIMIT,
          remaining: DAILY_LIMIT,
        },
      });
    }

    // Bugünün kullanım miktarını veritabanından çek
    const usageRes = await query<{ count: number }>(
      'SELECT count FROM usage WHERE user_id = $1 AND date = CURRENT_DATE LIMIT 1',
      [user.id]
    );

    const used = usageRes.rows.length > 0 ? Number(usageRes.rows[0].count) : 0;
    const remaining = Math.max(0, DAILY_LIMIT - used);

    return NextResponse.json({
      authenticated: true,
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        created_at: user.created_at,
      },
      usage: {
        used,
        limit: DAILY_LIMIT,
        remaining,
      },
    });
  } catch (error) {
    console.error('Session me error:', error);
    return NextResponse.json(
      { error: 'Kullanıcı durumu alınırken hata oluştu.' },
      { status: 500 }
    );
  }
}
