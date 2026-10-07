# 📐 Matematik Koçu - 11. Sınıf Yapay Zekâ Eğitmeni

> **Edumints Final Projesi**  
> 11. sınıf öğrencilerine özel, pedagojik ilkelere dayalı, ezberletmeyen ve öğrencinin soru çözüm mantığını kavramasını sağlayan yeni nesil Türkçe web uygulaması.

---

## 🎯 Projenin Amacı ve Felsefesi
Geleneksel soru çözücü araçlar yalnızca sonucu verir ve öğrenciyi kopyalamaya iter. **Matematik Koçu**, öğrenciye doğrudan sonucu dayatmak yerine 4 aşamalı öğrenme rehberliği sunar:
1. **Doğru Cevap:** Kesin ve doğrulanmış matematiksel sonuç.
2. **Adım Adım Çözüm:** Mantıklı ve anlaşılır işlem adımları.
3. **Neden Böyle? (Öğretici Açıklama):** Kullanılan teoremin, formülün ve matematiksel yöntemin altında yatan mantık.
4. **İpucu:** Öğrencinin bir sonraki benzer soruda kendi başına ilerlemesini sağlayacak pratik püf nokta.

---

## 👥 Hedef Kitle
- **11. Sınıf Öğrencileri** (MEB müfredatındaki Fonksiyonlar, Trigonometri, Analitik Geometri, Denklem ve Eşitsizlikler, Çember ve Daire vb. üniteler).
- YKS (AYT/TYT) hazırlığına temel atan lise öğrencileri.

---

## 🚀 Temel Özellikler
- **Metin veya Görsel ile Soru Sorma:** Soru metin olarak yazılabilir veya sorunun fotoğrafı sisteme yüklenebilir.
- **Konu Odaklı Çözüm:** 11. sınıf ünitelerine göre özelleştirilmiş analiz.
- **Güvenli Kimlik Doğrulama:** Kayıt Ol, Giriş Yap, Çıkış Yap; şifreler `bcrypt` ile tuzlanarak hashlenir.
- **Günlük Kullanım Limiti (Rate Limiting):** Her öğrenci için günde **10 soru** hakkı bulunur. Kalan hak anlık olarak arayüzde gösterilir (`Bugün 7 / 10 kullanım hakkın kaldı`). Limit dolduğunda sunucu tarafında istek engellenir ve Türkçe bilgilendirme yapılır.
- **Geçmiş Sorularım (Solution History):** Kullanıcının daha önce çözdürdüğü sorular ve açıklamalar veritabanında saklanır ve geçmiş sekmesinden tekrar incelenebilir.
- **Mobil Öncelikli & Kart Tabanlı UI:** Hem akıllı telefonlarda hem de masaüstünde modern, şık ve tutarlı kullanıcı deneyimi.
- **%100 Türkçe Arayüz ve Hata Yönetimi.**

---

## 🛠️ Kullanılan Teknolojiler
- **Framework:** [Next.js](https://nextjs.org/) (App Router, Server-side API Routes)
- **Dil:** [TypeScript](https://www.typescriptlang.org/)
- **Stil & Tasarım:** [Tailwind CSS](https://tailwindcss.com/)
- **İkonlar:** [Lucide React](https://lucide.dev/)
- **Yapay Zekâ:** [Google Gemini API](https://aistudio.google.com/) (`@google/genai` resmi SDK)
- **Veritabanı:** [PostgreSQL](https://www.postgresql.org/) (`schema.sql` DDL, `pg` connection pool; yerel geliştirme için sıfır kurulumlu gömülü `@electric-sql/pglite`)
- **Oturum & Güvenlik:** `jose` (JWT) + HTTP-Only Güvenli Çerezler (Cookies) + `bcryptjs`

---

## 🔒 Güvenlik Mimarisi: API Anahtarı Neden Environment Variable Olarak Tutulur?
1. **İstemci Tarafında İfşayı Engelleme:** İstemci (tarayıcı) tarafına gönderilen kodlar herkes tarafından incelenebilir. Gemini API anahtarı client bundle içerisine girerse, kötü niyetli kişiler anahtarı ele geçirip kota tükenmesine veya yüksek faturalara yol açabilir.
2. **Server-Side İzolasyon:** Matematik Koçu'nda Gemini çağrıları **yalnızca sunucu tarafındaki** (`/api/solve`) Route Handler içinde yürütülür. Tarayıcı yalnızca sunucuya soru metnini ve görselini gönderir, cevabı alır.
3. **Versiyon Kontrol Güvenliği:** `.env` ve `.env.local` dosyaları `.gitignore` ile korunmaktadır. API anahtarları GitHub repolarına asla sızdırılmaz.
4. **Çok Katmanlı Yetkilendirme:** Veritabanındaki tüm sorgular ve AI istekleri, kullanıcının doğrulanmış JWT oturum kimliğine göre filtrelenir; kullanıcılar birbirinin verilerine erişemez.

---

## 💻 Yerel Ortamda Çalıştırma (Local Development)

### 1. Depoyu Klonlayın ve Bağımlılıkları Yükleyin:
```bash
git clone <repo-url>
cd "Matematik Koçu"
npm install
```

### 2. Ortam Değişkenlerini Tanımlayın:
`.env.example` dosyasını kopyalayarak `.env.local` oluşturun:
```bash
cp .env.example .env.local
```
`.env.local` dosyasının içeriği:
```env
# Google AI Studio'dan aldığınız API anahtarını buraya ekleyin:
GEMINI_API_KEY=AIzaSy...your_gemini_api_key_here

# Güvenli JWT oturum anahtarı (varsayılan bırakabilir veya değiştirebilirsiniz)
JWT_SECRET=matematik_kocu_super_secret_jwt_key_2026_edumints_project

# PostgreSQL bağlantı URL'i (Yerel test için BOŞ bırakabilirsiniz, gömülü Postgres otomatik çalışır)
DATABASE_URL=
```

> **Not (Yerel Veritabanı):** `DATABASE_URL` boş bırakıldığında uygulama, harici bir PostgreSQL servisine ihtiyaç duymadan gömülü WASM PostgreSQL motoru (`PGlite`) ile doğrudan çalışır ve tabloları otomatik oluşturur.

### 3. Geliştirme Sunucusunu Başlatın:
```bash
npm run dev
```
Tarayıcınızdan `http://localhost:3000` adresine giderek uygulamayı kullanmaya başlayabilirsiniz.

---

## 🗄️ Veritabanı Kurulumu ve Tablo Yapısı
Projede saf PostgreSQL DDL şeması (`schema.sql`) yer almaktadır.

### Tablolar:
1. **`users`**:
   - `id SERIAL PRIMARY KEY`
   - `name VARCHAR(100)`
   - `email VARCHAR(255) UNIQUE`
   - `password_hash VARCHAR(255)`
   - `created_at TIMESTAMP WITH TIME ZONE`
2. **`usage`**:
   - `id SERIAL PRIMARY KEY`
   - `user_id INTEGER REFERENCES users(id)`
   - `date DATE DEFAULT CURRENT_DATE`
   - `count INTEGER DEFAULT 0`
   - `UNIQUE(user_id, date)`
3. **`solutions`**:
   - `id SERIAL PRIMARY KEY`
   - `user_id INTEGER REFERENCES users(id)`
   - `topic VARCHAR(100)`
   - `question_text TEXT`
   - `has_image BOOLEAN`
   - `answer TEXT`
   - `step_by_step TEXT`
   - `explanation TEXT`
   - `hint TEXT`
   - `created_at TIMESTAMP WITH TIME ZONE`

---

## ☁️ Vercel Deployment Süreci

1. Projeyi GitHub'a push edin.
2. [Vercel Dashboard](https://vercel.com/)'a gidin ve **"Add New Project"** seçeneğiyle repoyu seçin.
3. Bir bulut PostgreSQL veritabanı edinin (örneğin ücretsiz [Neon.tech](https://neon.tech/) veya [Supabase](https://supabase.com/) veya [Vercel Postgres]).
4. Vercel proje ayarlarında **Environment Variables** bölümüne şunları ekleyin:
   - `GEMINI_API_KEY`: Google AI Studio'dan aldığınız anahtar.
   - `JWT_SECRET`: Rastgele güçlü bir metin.
   - `DATABASE_URL`: `postgresql://user:password@ep-sample.neon.tech/matematik_kocu?sslmode=require`
5. **Deploy** butonuna tıklayın. Uygulama ilk açılışta `schema.sql`'deki tabloları otomatik olarak uzak veritabanında oluşturacak ve yayına girecektir.

---

## 🏆 Teslim Kriterleri Kontrol Listesi
- [x] Vercel'de canlı çalışabilen Next.js mimarisi
- [x] GitHub'da düzenli commit geçmişi (Phase 1, 2, 3)
- [x] Kapsamlı ve detaylı Türkçe `README.md`
- [x] API anahtarının gizliliği (asla client'a veya repoya gitmez)
- [x] Server-side güvenli API kullanımı
- [x] PostgreSQL veritabanı desteği (`users`, `usage`, `solutions` tabloları)
- [x] Kayıt ol, Giriş yap, Çıkış yap işlevleri ve şifre hashleme
- [x] Korumalı Matematik Koçu ekranı
- [x] Günlük 10 soru kullanım limiti ve arayüzde gösterimi
- [x] Limit dolduğunda AI çağrısının engellenmesi ve Türkçe uyarı mesajı
- [x] Soru görseli yükleme ve analizi
- [x] Çözüm geçmişi (Geçmiş Sorularım)
- [x] Mobil ve masaüstü uyumlu responsive tasarım
- [x] Net eğitim amacı ve 11. sınıf müfredatına odak
