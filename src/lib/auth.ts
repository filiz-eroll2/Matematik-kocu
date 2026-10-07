import bcrypt from 'bcryptjs';
import { SignJWT, jwtVerify } from 'jose';
import { cookies } from 'next/headers';
import { query } from './db';

const JWT_SECRET = process.env.JWT_SECRET || 'matematik_kocu_super_secret_jwt_key_2026_edumints_project';
const secretKey = new TextEncoder().encode(JWT_SECRET);

export const SESSION_COOKIE_NAME = 'matematik_kocu_session';

export interface UserPayload {
  userId: number;
  email: string;
  name: string;
}

export interface UserRecord {
  id: number;
  name: string;
  email: string;
  created_at: string;
}

/**
 * Şifreyi bcrypt ile tuzlayıp güvenli şekilde hashler
 */
export async function hashPassword(password: string): Promise<string> {
  const salt = await bcrypt.genSalt(10);
  return bcrypt.hash(password, salt);
}

/**
 * Düz metin şifre ile hash'i karşılaştırır
 */
export async function verifyPassword(password: string, hash: string): Promise<boolean> {
  return bcrypt.compare(password, hash);
}

/**
 * Kullanıcı için güvenli JWT oturum belirteci üretir
 */
export async function createSessionToken(payload: UserPayload): Promise<string> {
  return new SignJWT({ ...payload })
    .setProtectedHeader({ alg: 'HS256' })
    .setIssuedAt()
    .setExpirationTime('7d')
    .sign(secretKey);
}

/**
 * JWT belirtecini doğrular ve yükünü döner
 */
export async function verifySessionToken(token: string): Promise<UserPayload | null> {
  try {
    const { payload } = await jwtVerify(token, secretKey);
    return {
      userId: Number(payload.userId),
      email: String(payload.email),
      name: String(payload.name),
    };
  } catch {
    return null;
  }
}

/**
 * Next.js Server Components veya Route Handlers içinde mevcut oturum açmış kullanıcıyı doğrular
 */
export async function getCurrentUser(): Promise<UserRecord | null> {
  try {
    const cookieStore = await cookies();
    const sessionCookie = cookieStore.get(SESSION_COOKIE_NAME);
    if (!sessionCookie?.value) {
      return null;
    }

    const payload = await verifySessionToken(sessionCookie.value);
    if (!payload?.userId) {
      return null;
    }

    // Kullanıcının veritabanında hala mevcut olduğunu doğrula
    const res = await query<UserRecord>(
      'SELECT id, name, email, created_at FROM users WHERE id = $1 LIMIT 1',
      [payload.userId]
    );

    if (res.rows.length === 0) {
      return null;
    }

    return res.rows[0];
  } catch (error) {
    console.error('getCurrentUser error:', error);
    return null;
  }
}
