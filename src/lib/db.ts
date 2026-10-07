import { Pool } from 'pg';
import path from 'path';
import fs from 'fs';

// Veritabanı sorgu sonucu tipi
export interface QueryResult<T = any> {
  rows: T[];
  rowCount: number;
}

// Global bağlantı nesneleri (Next.js hot-reload sırasında çoklu bağlantı oluşmasını engellemek için)
declare global {
  // eslint-disable-next-line no-var
  var __pgPool: Pool | undefined;
  // eslint-disable-next-line no-var
  var __pgliteInstance: any | undefined;
  // eslint-disable-next-line no-var
  var __dbInitialized: boolean | undefined;
}

let isInitialized = global.__dbInitialized || false;

/**
 * PostgreSQL veritabanı şemasını başlatır.
 * Tablolar yoksa (users, usage, solutions) otomatik olarak oluşturur.
 */
async function initSchema(runQuery: (sql: string, params?: any[]) => Promise<any>) {
  if (isInitialized) return;

  const schemaSql = `
    CREATE TABLE IF NOT EXISTS users (
      id SERIAL PRIMARY KEY,
      name VARCHAR(100) NOT NULL,
      email VARCHAR(255) UNIQUE NOT NULL,
      password_hash VARCHAR(255) NOT NULL,
      created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
    );

    CREATE TABLE IF NOT EXISTS usage (
      id SERIAL PRIMARY KEY,
      user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
      date DATE NOT NULL DEFAULT CURRENT_DATE,
      count INTEGER NOT NULL DEFAULT 0,
      CONSTRAINT unique_user_date UNIQUE (user_id, date)
    );

    CREATE TABLE IF NOT EXISTS solutions (
      id SERIAL PRIMARY KEY,
      user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
      topic VARCHAR(100) NOT NULL,
      question_text TEXT NOT NULL,
      has_image BOOLEAN DEFAULT FALSE,
      answer TEXT NOT NULL,
      step_by_step TEXT NOT NULL,
      explanation TEXT NOT NULL,
      hint TEXT NOT NULL,
      created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
    );

    CREATE INDEX IF NOT EXISTS idx_users_email ON users(email);
    CREATE INDEX IF NOT EXISTS idx_usage_user_date ON usage(user_id, date);
    CREATE INDEX IF NOT EXISTS idx_solutions_user_created ON solutions(user_id, created_at DESC);
  `;

  try {
    await runQuery(schemaSql);
    isInitialized = true;
    global.__dbInitialized = true;
  } catch (error) {
    console.error('Veritabanı şeması başlatma hatası:', error);
  }
}

/**
 * Uzak PostgreSQL (pg.Pool) veya yerel PGlite istemcisini hazırlar
 */
async function getClient() {
  const connectionString = process.env.DATABASE_URL;

  // 1. Canlı / Uzak PostgreSQL (Vercel Postgres, Neon, Supabase, Railway vb.)
  if (connectionString && connectionString.startsWith('postgres')) {
    if (!global.__pgPool) {
      global.__pgPool = new Pool({
        connectionString,
        ssl: connectionString.includes('localhost') ? false : { rejectUnauthorized: false },
        max: 10,
        idleTimeoutMillis: 30000,
      });
    }

    const pool = global.__pgPool;
    if (!isInitialized) {
      await initSchema((sql) => pool.query(sql));
    }

    return {
      query: async <T = any>(sql: string, params?: any[]): Promise<QueryResult<T>> => {
        const res = await pool.query(sql, params);
        return {
          rows: res.rows as T[],
          rowCount: res.rowCount ?? res.rows.length,
        };
      },
    };
  }

  // 2. Yerel Geliştirme (PGlite - Sıfır kurulumlu gömülü WASM PostgreSQL)
  if (!global.__pgliteInstance) {
    const { PGlite } = await import('@electric-sql/pglite');
    const dataDir = path.join(process.cwd(), 'data', 'pglite_db');
    if (!fs.existsSync(path.dirname(dataDir))) {
      fs.mkdirSync(path.dirname(dataDir), { recursive: true });
    }
    global.__pgliteInstance = new PGlite(dataDir);
  }

  const pglite = global.__pgliteInstance;
  if (!isInitialized) {
    await initSchema((sql) => pglite.exec(sql));
  }

  return {
    query: async <T = any>(sql: string, params?: any[]): Promise<QueryResult<T>> => {
      const res = await pglite.query(sql, params);
      return {
        rows: res.rows as T[],
        rowCount: res.affectedRows ?? res.rows.length,
      };
    },
  };
}

/**
 * Parametrik SQL sorgusu çalıştıran ana fonksiyon
 */
export async function query<T = any>(sql: string, params?: any[]): Promise<QueryResult<T>> {
  const client = await getClient();
  return client.query<T>(sql, params);
}
