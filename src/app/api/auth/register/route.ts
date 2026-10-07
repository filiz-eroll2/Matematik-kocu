import { NextResponse } from 'next/server';
import { query } from '@/lib/db';
import { hashPassword, createSessionToken, SESSION_COOKIE_NAME } from '@/lib/auth';

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { name, email, password } = body;

    // 1. Temel Girdi Doğrulaması
    if (!name || typeof name !== 'string' || name.trim().length < 2) {
      return NextResponse.json(
        { error: 'Lütfen geçerli bir ad soyad giriniz (en az 2 karakter).' },
        { status: 400 }
      );
    }

    if (!email || typeof email !== 'string' || !/^\S+@\S+\.\S+$/.test(email)) {
      return NextResponse.json(
        { error: 'Lütfen geçerli bir e-posta adresi giriniz.' },
        { status: 400 }
      );
    }

    if (!password || typeof password !== 'string' || password.length < 6) {
      return NextResponse.json(
        { error: 'Şifreniz en az 6 karakter olmalıdır.' },
        { status: 400 }
      );
    }

    const cleanEmail = email.trim().toLowerCase();
    const cleanName = name.trim();

    // 2. E-posta zaten kayıtlı mı kontrolü
    const existing = await query('SELECT id FROM users WHERE email = $1 LIMIT 1', [cleanEmail]);
    if (existing.rows.length > 0) {
      return NextResponse.json(
        { error: 'Bu e-posta adresiyle kayıtlı bir hesap zaten bulunuyor. Lütfen giriş yapın.' },
        { status: 409 }
      );
    }

    // 3. Şifreyi hashle ve kullanıcıyı kaydet
    const hashedPassword = await hashPassword(password);
    const insertRes = await query<{ id: number; name: string; email: string; created_at: string }>(
      'INSERT INTO users (name, email, password_hash) VALUES ($1, $2, $3) RETURNING id, name, email, created_at',
      [cleanName, cleanEmail, hashedPassword]
    );

    const newUser = insertRes.rows[0];

    // 4. Oturum JWT Token oluştur
    const token = await createSessionToken({
      userId: newUser.id,
      email: newUser.email,
      name: newUser.name,
    });

    // 5. Güvenli HTTP-only Cookie ile yanıt dön
    const response = NextResponse.json({
      success: true,
      message: 'Kayıt başarıyla tamamlandı. Hoş geldin!',
      user: {
        id: newUser.id,
        name: newUser.name,
        email: newUser.email,
      },
    });

    response.cookies.set({
      name: SESSION_COOKIE_NAME,
      value: token,
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      path: '/',
      maxAge: 60 * 60 * 24 * 7, // 7 gün
    });

    return response;
  } catch (error) {
    console.error('Kayıt hatası:', error);
    return NextResponse.json(
      { error: 'Kayıt olurken bir sunucu hatası oluştu. Lütfen tekrar deneyiniz.' },
      { status: 500 }
    );
  }
}
