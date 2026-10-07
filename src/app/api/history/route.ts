import { NextResponse } from 'next/server';
import { getCurrentUser } from '@/lib/auth';
import { query } from '@/lib/db';

export const dynamic = 'force-dynamic';

export async function GET() {
  try {
    const user = await getCurrentUser();
    if (!user) {
      return NextResponse.json(
        { error: 'Geçmişi görüntülemek için lütfen giriş yapınız.' },
        { status: 401 }
      );
    }

    const res = await query(
      `SELECT id, topic, question_text, has_image, answer, step_by_step, explanation, hint, created_at
       FROM solutions
       WHERE user_id = $1
       ORDER BY created_at DESC
       LIMIT 20;`,
      [user.id]
    );

    return NextResponse.json({
      solutions: res.rows,
    });
  } catch (error) {
    console.error('Geçmiş sorular getirme hatası:', error);
    return NextResponse.json(
      { error: 'Geçmiş sorular yüklenirken hata oluştu.' },
      { status: 500 }
    );
  }
}
