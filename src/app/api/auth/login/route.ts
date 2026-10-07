import { NextResponse } from 'next/server';
import { query } from '@/lib/db';
import { verifyPassword, createSessionToken, SESSION_COOKIE_NAME } from '@/lib/auth';

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { email, password } = body;

    // 1. Temel Girdi Doğrulaması
    if (!email || !password) {
      return NextResponse.json(
        { error: 'Lütfen e-posta ve şifrenizi giriniz.' },
        { status: 400 }
      );
    }

    const cleanEmail = String(email).trim().toLowerCase();

    // 2. Kullanıcıyı Veritabanında Ara
    const res = await query<{
      id: number;
      name: string;
      email: string;
      password_hash: string;
    }>('SELECT id, name, email, password_hash FROM users WHERE email = $1 LIMIT 1', [cleanEmail]);

    if (res.rows.length === 0) {
      return NextResponse.json(
        { error: 'Girdiğiniz e-posta veya şifre hatalı.' },
        { status: 401 }
      );
    }

    const user = res.rows[0];

    // 3. Şifre Doğrulaması (bcrypt)
    const isPasswordValid = await verifyPassword(String(password), user.password_hash);
    if (!isPasswordValid) {
      return NextResponse.json(
        { error: 'Girdiğiniz e-posta veya şifre hatalı.' },
        { status: 401 }
      );
    }

    // 4. Oturum JWT Token oluştur
    const token = await createSessionToken({
      userId: user.id,
      email: user.email,
      name: user.name,
    });

    // 5. Güvenli HTTP-only Cookie ile yanıt dön
    const response = NextResponse.json({
      success: true,
      message: 'Giriş başarılı!',
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
      },
    });

    response.cookies.set({
      name: SESSION_COOKIE_NAME,
      value: token,
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      path: '/',
      maxAge: 60 * 60 * 24 * 7,
    });

    return response;
  } catch (error) {
    console.error('Giriş hatası:', error);
    return NextResponse.json(
      { error: 'Giriş yapılırken bir sunucu hatası oluştu. Lütfen tekrar deneyiniz.' },
      { status: 500 }
    );
  }
}
