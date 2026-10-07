-- =======================================================
-- Matematik Koçu - PostgreSQL Veritabanı Şeması
-- Edumints Final Projesi
-- =======================================================

-- 1. Kullanıcılar Tablosu (users)
CREATE TABLE IF NOT EXISTS users (
    id SERIAL PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    email VARCHAR(255) UNIQUE NOT NULL,
    password_hash VARCHAR(255) NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- 2. Günlük Kullanım Takip Tablosu (usage)
CREATE TABLE IF NOT EXISTS usage (
    id SERIAL PRIMARY KEY,
    user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    date DATE NOT NULL DEFAULT CURRENT_DATE,
    count INTEGER NOT NULL DEFAULT 0,
    CONSTRAINT unique_user_date UNIQUE (user_id, date)
);

-- 3. Çözülen Sorular ve Geçmiş Tablosu (solutions)
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

-- Performans ve Arama İndeksleri
CREATE INDEX IF NOT EXISTS idx_users_email ON users(email);
CREATE INDEX IF NOT EXISTS idx_usage_user_date ON usage(user_id, date);
CREATE INDEX IF NOT EXISTS idx_solutions_user_created ON solutions(user_id, created_at DESC);
