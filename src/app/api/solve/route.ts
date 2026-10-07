import { NextResponse } from 'next/server';
import { getCurrentUser } from '@/lib/auth';
import { query } from '@/lib/db';
import { solveMathQuestion } from '@/lib/gemini';
import { DAILY_LIMIT } from '../auth/me/route';

export const dynamic = 'force-dynamic';

export async function POST(request: Request) {
  try {
    // 1. Oturum Kontrolü (Sadece giriş yapmış kullanıcılar)
    const user = await getCurrentUser();
    if (!user) {
      return NextResponse.json(
        { error: 'Bu özelliği kullanabilmek için lütfen giriş yapınız.' },
        { status: 401 }
      );
    }

    // 2. Günlük Kullanım Limiti Kontrolü (SERVER-SIDE)
    const usageCheck = await query<{ count: number }>(
      'SELECT count FROM usage WHERE user_id = $1 AND date = CURRENT_DATE LIMIT 1',
      [user.id]
    );

    const currentUsed = usageCheck.rows.length > 0 ? Number(usageCheck.rows[0].count) : 0;

    if (currentUsed >= DAILY_LIMIT) {
      return NextResponse.json(
        {
          error: `Bugünkü ${DAILY_LIMIT} soru analiz limitinize ulaştınız. Yarın tekrar görüşmek üzere!`,
          usage: {
            used: currentUsed,
            limit: DAILY_LIMIT,
            remaining: 0,
          },
        },
        { status: 429 }
      );
    }

    // 3. İstek Girdilerini Doğrula
    const body = await request.json();
    const { topic, questionText, imageBase64, imageMimeType } = body;

    if (!topic || typeof topic !== 'string') {
      return NextResponse.json(
        { error: 'Lütfen bir konu başlığı seçiniz.' },
        { status: 400 }
      );
    }

    const hasText = Boolean(questionText && questionText.trim().length > 0);
    const hasImage = Boolean(imageBase64 && typeof imageBase64 === 'string');

    if (!hasText && !hasImage) {
      return NextResponse.json(
        { error: 'Lütfen sorunuzu metin olarak yazın veya soru görseli yükleyin.' },
        { status: 400 }
      );
    }

    // 4. Gemini API Çağrısı (Server-side)
    const solution = await solveMathQuestion({
      topic,
      questionText: questionText?.trim() || '',
      imageBase64,
      imageMimeType: imageMimeType || 'image/jpeg',
    });

    // 5. Başarılı AI Kullanımı Sonrası Veritabanı Güncellemeleri
    // 5a. Usage tablosunda sayacı artır (UPSERT)
    const updateUsageRes = await query<{ count: number }>(
      `INSERT INTO usage (user_id, date, count)
       VALUES ($1, CURRENT_DATE, 1)
       ON CONFLICT (user_id, date)
       DO UPDATE SET count = usage.count + 1
       RETURNING count;`,
      [user.id]
    );

    const newUsedCount = updateUsageRes.rows[0]?.count ?? currentUsed + 1;
    const remainingCount = Math.max(0, DAILY_LIMIT - newUsedCount);

    // 5b. Solutions tablosuna soruyu ve çözümü kaydet
    const insertSolutionRes = await query<{ id: number }>(
      `INSERT INTO solutions 
       (user_id, topic, question_text, has_image, answer, step_by_step, explanation, hint)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
       RETURNING id;`,
      [
        user.id,
        topic,
        questionText?.trim() || '(Görsel soru)',
        hasImage,
        solution.answer,
        solution.step_by_step,
        solution.explanation,
        solution.hint,
      ]
    );

    return NextResponse.json({
      success: true,
      solutionId: insertSolutionRes.rows[0]?.id,
      solution,
      usage: {
        used: newUsedCount,
        limit: DAILY_LIMIT,
        remaining: remainingCount,
      },
    });
  } catch (error: any) {
    console.error('Soru çözme hatası:', error);
    return NextResponse.json(
      {
        error:
          error.message ||
          'Sorunuz çözülürken bir hata meydana geldi. Lütfen tekrar deneyiniz.',
      },
      { status: 500 }
    );
  }
}
