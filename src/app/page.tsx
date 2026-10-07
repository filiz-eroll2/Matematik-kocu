import Link from 'next/link';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import { getCurrentUser } from '@/lib/auth';
import {
  GraduationCap,
  Sparkles,
  BookOpen,
  CheckCircle2,
  HelpCircle,
  Lightbulb,
  ArrowRight,
  ShieldCheck,
  Zap,
} from 'lucide-react';

export const dynamic = 'force-dynamic';

export default async function HomePage() {
  const user = await getCurrentUser();

  const topics = [
    { title: 'Fonksiyonlar', desc: 'Bileşke, ters fonksiyon ve fonksiyon grafikleri' },
    { title: 'Trigonometri', desc: 'Birim çember, trigonometrik bağıntılar ve grafikler' },
    { title: 'Analitik Geometri', desc: 'Noktanın ve doğrunun analitiği, eğim ve denklemler' },
    { title: 'Denklem ve Eşitsizlikler', desc: 'İkinci dereceden denklemler ve eşitsizlik sistemleri' },
    { title: 'Çember ve Daire', desc: 'Açılar, teğet-kiriş özellikleri ve alan hesapları' },
    { title: 'Diğer Konular', desc: '11. sınıf MEB müfredatındaki tüm matematik konuları' },
  ];

  return (
    <div className="min-h-screen flex flex-col bg-linear-to-b from-indigo-50/40 via-white to-gray-50">
      <Navbar user={user ? { name: user.name, email: user.email } : null} />

      {/* Hero Alanı */}
      <main className="flex-1">
        <section className="relative overflow-hidden pt-12 pb-20 sm:pt-20 sm:pb-28">
          <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 text-center relative z-10">
            {/* Rozet */}
            <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-indigo-50 border border-indigo-100 text-indigo-700 text-xs font-semibold mb-6 shadow-xs">
              <Sparkles className="w-4 h-4 text-indigo-500" />
              <span>11. Sınıf Müfredatına Özel Yapay Zekâ Eğitmeni</span>
            </div>

            {/* Başlık */}
            <h1 className="text-4xl sm:text-6xl font-black text-gray-900 tracking-tight leading-tight sm:leading-none">
              Yalnızca ezberleme, <br className="hidden sm:inline" />
              <span className="bg-gradient-to-r from-indigo-600 to-violet-600 bg-clip-text text-transparent">
                Matematiğin mantığını kavra!
              </span>
            </h1>

            {/* Açıklama */}
            <p className="mt-6 max-w-2xl mx-auto text-base sm:text-lg text-gray-600 leading-relaxed">
              <strong>Matematik Koçu</strong>, sorunun sadece sonucunu vermekle kalmaz. 
              Adım adım çözüm, yöntemin altında yatan <em>“Neden böyle?”</em> açıklaması ve 
              kendi başına çözebilmen için akılcı ipuçları sunar.
            </p>

            {/* CTA Butonları */}
            <div className="mt-8 flex flex-col sm:flex-row items-center justify-center gap-3.5">
              {user ? (
                <Link
                  href="/dashboard"
                  className="w-full sm:w-auto inline-flex items-center justify-center gap-2.5 px-8 py-3.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-semibold text-base shadow-lg shadow-indigo-200 transition-all hover:scale-102"
                >
                  <span>Koçuna Soru Sor (Panele Git)</span>
                  <ArrowRight className="w-5 h-5" />
                </Link>
              ) : (
                <>
                  <Link
                    href="/register"
                    className="w-full sm:w-auto inline-flex items-center justify-center gap-2.5 px-8 py-3.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-semibold text-base shadow-lg shadow-indigo-200 transition-all hover:scale-102"
                  >
                    <span>Hemen Ücretsiz Başla</span>
                    <ArrowRight className="w-5 h-5" />
                  </Link>
                  <Link
                    href="/login"
                    className="w-full sm:w-auto inline-flex items-center justify-center px-6 py-3.5 rounded-xl bg-white hover:bg-gray-50 border border-gray-200 text-gray-700 font-semibold text-base shadow-xs transition-all"
                  >
                    Giriş Yap
                  </Link>
                </>
              )}
            </div>

            <div className="mt-4 flex items-center justify-center gap-6 text-xs text-gray-400">
              <span className="flex items-center gap-1.5">
                <ShieldCheck className="w-4 h-4 text-emerald-500" />
                Günde 10 Soru Ücretsiz
              </span>
              <span className="flex items-center gap-1.5">
                <Zap className="w-4 h-4 text-amber-500" />
                Görsel ve Metin Desteği
              </span>
            </div>
          </div>
        </section>

        {/* 4 Boyutlu Öğretim Modeli */}
        <section className="py-16 bg-white border-y border-gray-100">
          <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center max-w-xl mx-auto mb-12">
              <h2 className="text-2xl sm:text-3xl font-bold text-gray-900 tracking-tight">
                Ezber Yok, 4 Aşamalı Öğretim Modeli
              </h2>
              <p className="mt-2 text-sm text-gray-500">
                Her soruda sana sunulan dört özel bölüm ile eksiksiz öğrenme.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              {/* Kart 1: Cevap */}
              <div className="p-6 rounded-2xl bg-emerald-50/40 border border-emerald-100 flex flex-col hover:shadow-md transition-shadow">
                <div className="w-10 h-10 rounded-xl bg-emerald-500 text-white flex items-center justify-center mb-4 shadow-sm">
                  <CheckCircle2 className="w-5 h-5" />
                </div>
                <h3 className="text-base font-bold text-gray-900 mb-1">1. Doğru Cevap</h3>
                <p className="text-xs text-gray-600 leading-relaxed">
                  Sorunun net ve matematiksel olarak doğrulanmış kesin sonucu.
                </p>
              </div>

              {/* Kart 2: Adım Adım Çözüm */}
              <div className="p-6 rounded-2xl bg-indigo-50/40 border border-indigo-100 flex flex-col hover:shadow-md transition-shadow">
                <div className="w-10 h-10 rounded-xl bg-indigo-600 text-white flex items-center justify-center mb-4 shadow-sm">
                  <BookOpen className="w-5 h-5" />
                </div>
                <h3 className="text-base font-bold text-gray-900 mb-1">2. Adım Adım Çözüm</h3>
                <p className="text-xs text-gray-600 leading-relaxed">
                  İşlemlerin hangi sırayla ve nasıl yapıldığını gösteren anlaşılır adımlar.
                </p>
              </div>

              {/* Kart 3: Neden Böyle? */}
              <div className="p-6 rounded-2xl bg-violet-50/40 border border-violet-100 flex flex-col hover:shadow-md transition-shadow">
                <div className="w-10 h-10 rounded-xl bg-violet-600 text-white flex items-center justify-center mb-4 shadow-sm">
                  <HelpCircle className="w-5 h-5" />
                </div>
                <h3 className="text-base font-bold text-gray-900 mb-1">3. Neden Böyle?</h3>
                <p className="text-xs text-gray-600 leading-relaxed">
                  Kullanılan teoremin ve matematiksel mantığın kısa öğretici açıklaması.
                </p>
              </div>

              {/* Kart 4: İpucu */}
              <div className="p-6 rounded-2xl bg-amber-50/40 border border-amber-100 flex flex-col hover:shadow-md transition-shadow">
                <div className="w-10 h-10 rounded-xl bg-amber-500 text-white flex items-center justify-center mb-4 shadow-sm">
                  <Lightbulb className="w-5 h-5" />
                </div>
                <h3 className="text-base font-bold text-gray-900 mb-1">4. Düşündürücü İpucu</h3>
                <p className="text-xs text-gray-600 leading-relaxed">
                  Benzer sorularda kendi başına ilerlemeni sağlayacak pratik püf nokta.
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* Konular Alanı */}
        <section className="py-16">
          <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center max-w-xl mx-auto mb-10">
              <h2 className="text-2xl font-bold text-gray-900 tracking-tight">
                11. Sınıf Konu Başlıkları
              </h2>
              <p className="mt-2 text-sm text-gray-500">
                Müfredata uygun tüm ünitelerde soru sorabilirsin.
              </p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {topics.map((t, idx) => (
                <div
                  key={idx}
                  className="p-5 rounded-2xl bg-white border border-gray-100 shadow-xs hover:border-indigo-200 transition-colors"
                >
                  <h4 className="font-semibold text-gray-900 text-sm mb-1">{t.title}</h4>
                  <p className="text-xs text-gray-500">{t.desc}</p>
                </div>
              ))}
            </div>
          </div>
        </section>
      </main>

      <Footer />
    </div>
  );
}
