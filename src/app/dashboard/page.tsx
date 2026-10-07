'use client';

import { useState, useEffect, useRef } from 'react';
import { useRouter } from 'next/navigation';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import {
  Sparkles,
  BookOpen,
  CheckCircle2,
  HelpCircle,
  Lightbulb,
  UploadCloud,
  X,
  History,
  AlertCircle,
  Loader2,
  ChevronRight,
  ArrowRight,
  Calculator,
  RefreshCw,
  Send,
} from 'lucide-react';

const TOPICS = [
  'Fonksiyonlar',
  'Trigonometri',
  'Analitik Geometri',
  'Denklem ve Eşitsizlikler',
  'Çember ve Daire',
  'Diğer',
];

interface Solution {
  id?: number;
  topic: string;
  question_text?: string;
  has_image?: boolean;
  answer: string;
  step_by_step: string;
  explanation: string;
  hint: string;
  created_at?: string;
}

export default function DashboardPage() {
  const router = useRouter();
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Oturum ve Kullanım Durumu
  const [user, setUser] = useState<{ id: number; name: string; email: string } | null>(null);
  const [usage, setUsage] = useState<{ used: number; limit: number; remaining: number }>({
    used: 0,
    limit: 10,
    remaining: 10,
  });
  const [authLoading, setAuthLoading] = useState(true);

  // Form Durumları
  const [selectedTopic, setSelectedTopic] = useState('Fonksiyonlar');
  const [questionText, setQuestionText] = useState('');
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [imageMimeType, setImageMimeType] = useState<string | null>(null);

  // İşlem Durumları
  const [solving, setSolving] = useState(false);
  const [currentSolution, setCurrentSolution] = useState<Solution | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [successNotice, setSuccessNotice] = useState<string | null>(null);

  // Geçmiş Durumları
  const [historyList, setHistoryList] = useState<Solution[]>([]);
  const [historyLoading, setHistoryLoading] = useState(false);
  const [activeTab, setActiveTab] = useState<'solve' | 'history'>('solve');

  // 1. Kullanıcı oturumunu ve kullanım bilgisini getir
  const fetchUserData = async () => {
    try {
      const res = await fetch('/api/auth/me');
      const data = await res.json();

      if (!data.authenticated || !data.user) {
        router.push('/login');
        return;
      }

      setUser(data.user);
      if (data.usage) {
        setUsage(data.usage);
      }
    } catch (err) {
      console.error('Kullanıcı doğrulama hatası:', err);
      router.push('/login');
    } finally {
      setAuthLoading(false);
    }
  };

  // 2. Geçmiş soruları getir
  const fetchHistory = async () => {
    setHistoryLoading(true);
    try {
      const res = await fetch('/api/history');
      const data = await res.json();
      if (data.solutions) {
        setHistoryList(data.solutions);
      }
    } catch (err) {
      console.error('Geçmiş yükleme hatası:', err);
    } finally {
      setHistoryLoading(false);
    }
  };

  useEffect(() => {
    fetchUserData();
  }, []);

  // Görsel Yükleme İşlemi (Base64)
  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith('image/')) {
      setErrorMessage('Lütfen geçerli bir görsel dosyası seçiniz (PNG, JPG, WebP vb.).');
      return;
    }

    if (file.size > 5 * 1024 * 1024) {
      setErrorMessage('Görsel boyutu 5 MB\'tan küçük olmalıdır.');
      return;
    }

    const reader = new FileReader();
    reader.onload = () => {
      setImagePreview(reader.result as string);
      setImageMimeType(file.type);
      setErrorMessage(null);
    };
    reader.readAsDataURL(file);
  };

  const removeImage = () => {
    setImagePreview(null);
    setImageMimeType(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  // Soruyu Çöz İstemi
  const handleSolve = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);
    setSuccessNotice(null);

    // Limit Kontrolü (İstemci Tarafında Erken Uyarı)
    if (usage.remaining <= 0) {
      setErrorMessage(
        'Bugünkü 10 soru analiz limitinize ulaştınız. Limitiniz yarın sıfırlanacaktır!'
      );
      return;
    }

    if (!questionText.trim() && !imagePreview) {
      setErrorMessage('Lütfen bir soru metni girin veya soru görseli yükleyin.');
      return;
    }

    setSolving(true);
    setCurrentSolution(null);

    try {
      const res = await fetch('/api/solve', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          topic: selectedTopic,
          questionText: questionText.trim(),
          imageBase64: imagePreview,
          imageMimeType: imageMimeType,
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || 'Soru çözülürken bir hata oluştu.');
      }

      // Başarılı çözüm
      setCurrentSolution({
        ...data.solution,
        topic: selectedTopic,
        question_text: questionText.trim(),
        has_image: Boolean(imagePreview),
      });

      if (data.usage) {
        setUsage(data.usage);
      }

      setSuccessNotice('Sorun başarıyla analiz edildi ve çözüm hazırlandı!');

      // Formu temizle
      setQuestionText('');
      removeImage();
    } catch (err: any) {
      setErrorMessage(err.message || 'Bir hata oluştu. Lütfen tekrar deneyiniz.');
    } finally {
      setSolving(false);
    }
  };

  if (authLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="flex flex-col items-center gap-3">
          <Loader2 className="w-8 h-8 text-indigo-600 animate-spin" />
          <p className="text-sm text-gray-500 font-medium">Matematik Koçu Yükleniyor...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col bg-slate-50">
      <Navbar
        user={user}
        remainingUsage={usage.remaining}
        maxUsage={usage.limit}
        onLogout={() => router.push('/login')}
      />

      <main className="flex-1 max-w-6xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Üst Karşılama ve Kullanım Limiti Kartı */}
        <div className="bg-white rounded-2xl border border-indigo-100/80 p-5 sm:p-6 shadow-xs mb-8">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-2xl font-bold text-gray-900 tracking-tight">
                  Matematik Koçu
                </h1>
                <span className="text-xs font-semibold bg-indigo-50 text-indigo-700 px-2.5 py-0.5 rounded-full border border-indigo-200">
                  11. Sınıf
                </span>
              </div>
              <p className="mt-1 text-sm text-gray-500">
                Sorunu yaz veya görselini yükle; doğru cevabı, adım adım çözümü, mantığını ve ipucunu al.
              </p>
            </div>

            {/* Günlük Limit Göstergesi */}
            <div className="w-full sm:w-auto bg-gradient-to-br from-indigo-50 to-violet-50 rounded-xl p-4 border border-indigo-100 flex flex-col sm:items-end">
              <div className="flex items-center gap-2 mb-1.5">
                <Sparkles className="w-4 h-4 text-indigo-600" />
                <span className="text-xs font-semibold uppercase tracking-wider text-indigo-900">
                  Günlük Kullanım Hakkı
                </span>
              </div>
              <div className="text-base font-extrabold text-indigo-950">
                Bugün <span className="text-indigo-600 text-lg">{usage.remaining}</span> / {usage.limit} kullanım hakkın kaldı
              </div>

              {/* İlerleme Çubuğu */}
              <div className="w-full sm:w-48 bg-indigo-200/50 h-2 rounded-full mt-2 overflow-hidden">
                <div
                  className={`h-full rounded-full transition-all duration-500 ${
                    usage.remaining <= 2
                      ? 'bg-rose-500'
                      : usage.remaining <= 5
                      ? 'bg-amber-500'
                      : 'bg-indigo-600'
                  }`}
                  style={{ width: `${(usage.remaining / usage.limit) * 100}%` }}
                />
              </div>
            </div>
          </div>

          {/* Sekme Geçişleri */}
          <div className="flex items-center gap-2 mt-6 border-t border-gray-100 pt-4">
            <button
              onClick={() => setActiveTab('solve')}
              className={`flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-semibold transition-all cursor-pointer ${
                activeTab === 'solve'
                  ? 'bg-indigo-600 text-white shadow-xs'
                  : 'text-gray-600 hover:bg-gray-100'
              }`}
            >
              <Calculator className="w-4 h-4" />
              <span>Soru Çöz</span>
            </button>
            <button
              onClick={() => {
                setActiveTab('history');
                fetchHistory();
              }}
              className={`flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-semibold transition-all cursor-pointer ${
                activeTab === 'history'
                  ? 'bg-indigo-600 text-white shadow-xs'
                  : 'text-gray-600 hover:bg-gray-100'
              }`}
            >
              <History className="w-4 h-4" />
              <span>Geçmiş Sorularım</span>
            </button>
          </div>
        </div>

        {/* ===================== SEKME 1: SORU ÇÖZ ===================== */}
        {activeTab === 'solve' && (
          <div className="space-y-8">
            {/* Hata Bildirimi */}
            {errorMessage && (
              <div className="p-4 rounded-xl bg-red-50 border border-red-200 text-red-700 text-sm flex items-start gap-3">
                <AlertCircle className="w-5 h-5 shrink-0 text-red-500 mt-0.5" />
                <div className="flex-1">
                  <p className="font-semibold">İşlem Gerçekleştirilemedi</p>
                  <p className="text-xs mt-0.5">{errorMessage}</p>
                </div>
                <button onClick={() => setErrorMessage(null)} className="text-red-400 hover:text-red-600">
                  <X className="w-4 h-4" />
                </button>
              </div>
            )}

            {/* Başarı Bildirimi */}
            {successNotice && (
              <div className="p-4 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-sm flex items-center gap-3">
                <CheckCircle2 className="w-5 h-5 shrink-0 text-emerald-600" />
                <span className="flex-1 text-xs sm:text-sm font-medium">{successNotice}</span>
                <button onClick={() => setSuccessNotice(null)} className="text-emerald-500 hover:text-emerald-700">
                  <X className="w-4 h-4" />
                </button>
              </div>
            )}

            {/* Soru Giriş Formu */}
            <div className="bg-white rounded-2xl border border-gray-200/80 shadow-xs p-6 sm:p-8">
              <form onSubmit={handleSolve} className="space-y-6">
                {/* 1. Konu Seçimi */}
                <div>
                  <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-2.5">
                    1. 11. Sınıf Konusunu Seç
                  </label>
                  <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-6 gap-2">
                    {TOPICS.map((topic) => (
                      <button
                        type="button"
                        key={topic}
                        onClick={() => setSelectedTopic(topic)}
                        className={`py-2.5 px-3 rounded-xl text-xs font-semibold border transition-all text-center cursor-pointer ${
                          selectedTopic === topic
                            ? 'bg-indigo-50 border-indigo-500 text-indigo-700 shadow-xs ring-1 ring-indigo-500'
                            : 'bg-white border-gray-200 text-gray-700 hover:bg-gray-50'
                        }`}
                      >
                        {topic}
                      </button>
                    ))}
                  </div>
                </div>

                {/* 2. Soru Metni */}
                <div>
                  <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-2">
                    2. Sorunu Yaz (Veya aşağıdan görsel yükle)
                  </label>
                  <textarea
                    rows={4}
                    value={questionText}
                    onChange={(e) => setQuestionText(e.target.value)}
                    placeholder="Örnek: f(x) = 2x + 3 ve (fog)(x) = 6x - 1 olduğuna göre g(2) kaçtır?"
                    className="w-full p-4 border border-gray-200 rounded-xl text-sm placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-all font-mono"
                  />
                </div>

                {/* 3. Görsel Yükleme */}
                <div>
                  <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-2">
                    3. Soru Görseli Yükle (İsteğe bağlı)
                  </label>
                  
                  {!imagePreview ? (
                    <div
                      onClick={() => fileInputRef.current?.click()}
                      className="border-2 border-dashed border-gray-200 hover:border-indigo-400 rounded-xl p-6 text-center cursor-pointer transition-colors bg-gray-50/50 hover:bg-indigo-50/30 group"
                    >
                      <input
                        type="file"
                        ref={fileInputRef}
                        accept="image/*"
                        onChange={handleImageChange}
                        className="hidden"
                      />
                      <UploadCloud className="w-8 h-8 mx-auto text-gray-400 group-hover:text-indigo-600 transition-colors mb-2" />
                      <p className="text-xs font-semibold text-gray-700 group-hover:text-indigo-700">
                        Soru fotoğrafını seçmek için tıkla
                      </p>
                      <p className="text-[11px] text-gray-400 mt-1">
                        PNG, JPG, JPEG veya WebP (Maks. 5 MB)
                      </p>
                    </div>
                  ) : (
                    <div className="relative inline-block border border-gray-200 rounded-xl overflow-hidden shadow-xs bg-gray-50">
                      <img
                        src={imagePreview}
                        alt="Soru Görseli"
                        className="max-h-64 object-contain rounded-xl p-2"
                      />
                      <button
                        type="button"
                        onClick={removeImage}
                        className="absolute top-3 right-3 bg-red-600 text-white p-1.5 rounded-lg hover:bg-red-700 shadow-md transition-colors cursor-pointer"
                        title="Görseli Kaldır"
                      >
                        <X className="w-4 h-4" />
                      </button>
                    </div>
                  )}
                </div>

                {/* 4. Gönder Butonu */}
                <div className="pt-2">
                  <button
                    type="submit"
                    disabled={solving || usage.remaining <= 0}
                    className="w-full sm:w-auto inline-flex items-center justify-center gap-3 px-8 py-3.5 bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-base rounded-xl shadow-md shadow-indigo-200 transition-all disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer"
                  >
                    {solving ? (
                      <>
                        <Loader2 className="w-5 h-5 animate-spin" />
                        <span>Yapay Zekâ Soruyu Analiz Ediyor...</span>
                      </>
                    ) : usage.remaining <= 0 ? (
                      <>
                        <AlertCircle className="w-5 h-5 text-amber-300" />
                        <span>Günlük Kullanım Limitin Doldu</span>
                      </>
                    ) : (
                      <>
                        <Sparkles className="w-5 h-5" />
                        <span>Soruyu Çöz</span>
                      </>
                    )}
                  </button>
                </div>
              </form>
            </div>

            {/* AI Çözüm Sonucu Bölümü */}
            {currentSolution && (
              <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
                <div className="flex items-center gap-2">
                  <h2 className="text-xl font-bold text-gray-900 tracking-tight">
                    Matematik Koçu Çözüm Analizi
                  </h2>
                  <span className="text-xs font-semibold bg-emerald-50 text-emerald-700 px-2.5 py-0.5 rounded-full border border-emerald-200">
                    {currentSolution.topic}
                  </span>
                </div>

                <div className="grid grid-cols-1 gap-5">
                  {/* BÖLÜM 1: DOĞRU CEVAP */}
                  <div className="bg-emerald-50/50 border-2 border-emerald-200/80 rounded-2xl p-6 shadow-xs">
                    <div className="flex items-center gap-2.5 text-emerald-800 font-bold text-sm uppercase tracking-wider mb-2">
                      <CheckCircle2 className="w-5 h-5 text-emerald-600" />
                      <span>1. Doğru Cevap</span>
                    </div>
                    <div className="text-lg sm:text-xl font-extrabold text-emerald-950 font-mono bg-white/80 p-3.5 rounded-xl border border-emerald-100">
                      {currentSolution.answer}
                    </div>
                  </div>

                  {/* BÖLÜM 2: ADIM ADIM ÇÖZÜM */}
                  <div className="bg-white border border-indigo-100 rounded-2xl p-6 shadow-xs">
                    <div className="flex items-center gap-2.5 text-indigo-900 font-bold text-sm uppercase tracking-wider mb-3">
                      <BookOpen className="w-5 h-5 text-indigo-600" />
                      <span>2. Adım Adım Çözüm</span>
                    </div>
                    <div className="text-sm text-gray-700 leading-relaxed whitespace-pre-line bg-indigo-50/20 p-4 rounded-xl border border-indigo-50 font-mono">
                      {currentSolution.step_by_step}
                    </div>
                  </div>

                  {/* BÖLÜM 3: NEDEN BÖYLE? */}
                  <div className="bg-violet-50/40 border border-violet-100 rounded-2xl p-6 shadow-xs">
                    <div className="flex items-center gap-2.5 text-violet-900 font-bold text-sm uppercase tracking-wider mb-2">
                      <HelpCircle className="w-5 h-5 text-violet-600" />
                      <span>3. Neden Böyle? (Öğretici Açıklama)</span>
                    </div>
                    <p className="text-sm text-violet-950 leading-relaxed bg-white/80 p-4 rounded-xl border border-violet-100">
                      {currentSolution.explanation}
                    </p>
                  </div>

                  {/* BÖLÜM 4: İPUCU */}
                  <div className="bg-amber-50/50 border border-amber-200/80 rounded-2xl p-6 shadow-xs">
                    <div className="flex items-center gap-2.5 text-amber-900 font-bold text-sm uppercase tracking-wider mb-2">
                      <Lightbulb className="w-5 h-5 text-amber-600" />
                      <span>4. İpucu (Kendi Başına İlerlemek İçin)</span>
                    </div>
                    <p className="text-sm text-amber-950 leading-relaxed bg-white/80 p-4 rounded-xl border border-amber-100">
                      {currentSolution.hint}
                    </p>
                  </div>
                </div>
              </div>
            )}
          </div>
        )}

        {/* ===================== SEKME 2: GEÇMİŞ SORULARIM ===================== */}
        {activeTab === 'history' && (
          <div className="bg-white rounded-2xl border border-gray-200/80 shadow-xs p-6 sm:p-8">
            <div className="flex items-center justify-between mb-6 pb-4 border-b border-gray-100">
              <div>
                <h2 className="text-lg font-bold text-gray-900">Geçmiş Sorularım</h2>
                <p className="text-xs text-gray-500">Daha önce çözdürdüğün 11. sınıf soruları</p>
              </div>
              <button
                onClick={fetchHistory}
                className="flex items-center gap-1.5 text-xs text-indigo-600 hover:text-indigo-800 font-semibold p-2 hover:bg-indigo-50 rounded-lg transition-colors cursor-pointer"
              >
                <RefreshCw className="w-3.5 h-3.5" />
                <span>Yenile</span>
              </button>
            </div>

            {historyLoading ? (
              <div className="py-12 flex justify-center items-center">
                <Loader2 className="w-6 h-6 text-indigo-600 animate-spin" />
              </div>
            ) : historyList.length === 0 ? (
              <div className="py-12 text-center">
                <BookOpen className="w-10 h-10 text-gray-300 mx-auto mb-3" />
                <p className="text-sm font-semibold text-gray-700">Henüz çözülmüş soru yok</p>
                <p className="text-xs text-gray-400 mt-1">
                  İlk sorunu sormak için yukarıdaki "Soru Çöz" sekmesine tıkla.
                </p>
              </div>
            ) : (
              <div className="space-y-4">
                {historyList.map((item, idx) => (
                  <div
                    key={item.id || idx}
                    className="p-5 rounded-xl border border-gray-100 bg-gray-50/50 hover:bg-white hover:border-indigo-200 transition-all shadow-2xs"
                  >
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-xs font-bold text-indigo-700 bg-indigo-50 px-2.5 py-0.5 rounded-full border border-indigo-100">
                        {item.topic}
                      </span>
                      {item.created_at && (
                        <span className="text-[11px] text-gray-400">
                          {new Date(item.created_at).toLocaleDateString('tr-TR', {
                            day: 'numeric',
                            month: 'short',
                            hour: '2-digit',
                            minute: '2-digit',
                          })}
                        </span>
                      )}
                    </div>

                    <p className="text-xs text-gray-800 font-mono mb-3 line-clamp-2">
                      {item.question_text || '(Görsel soru)'}
                    </p>

                    <div className="bg-white p-3 rounded-lg border border-gray-100 space-y-2">
                      <div className="flex items-center gap-1.5 text-xs font-bold text-emerald-700">
                        <CheckCircle2 className="w-3.5 h-3.5" />
                        <span>Cevap: {item.answer}</span>
                      </div>
                      <details className="text-xs text-gray-600 cursor-pointer">
                        <summary className="font-semibold text-indigo-600 hover:text-indigo-700 select-none">
                          Adım adım çözümü ve açıklamayı göster
                        </summary>
                        <div className="mt-2 pt-2 border-t border-gray-100 space-y-2">
                          <div>
                            <span className="font-bold text-gray-700">Çözüm Adımları:</span>
                            <p className="whitespace-pre-line font-mono text-[11px] text-gray-600 mt-0.5">
                              {item.step_by_step}
                            </p>
                          </div>
                          <div>
                            <span className="font-bold text-violet-700">Neden Böyle?</span>
                            <p className="text-[11px] text-gray-600 mt-0.5">{item.explanation}</p>
                          </div>
                          <div>
                            <span className="font-bold text-amber-700">İpucu:</span>
                            <p className="text-[11px] text-gray-600 mt-0.5">{item.hint}</p>
                          </div>
                        </div>
                      </details>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}
      </main>

      <Footer />
    </div>
  );
}
