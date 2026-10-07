import { GoogleGenAI } from '@google/genai';

export interface MathSolutionResponse {
  answer: string;
  step_by_step: string;
  explanation: string;
  hint: string;
}

const SYSTEM_INSTRUCTION = `Sen 11. sınıf matematik müfredatında uzman, pedagojik ve matematiksel hesaplamalarda sıfır hata prensibiyle çalışan bir matematik öğretmenisin. 
Amacın öğrencinin soru çözüm mantığını kavramasını sağlamaktır.
İşlemleri adım adım, hatasız ve anlaşılır biçimde açıkla.
ÖNEMLİ HESAPLAMA KURALI:
Önce soruyu adım adım çöz ve her adımın matematiksel sağlamasını yap.
Son adımda bulduğun nihai sonucu 'answer' alanına eksiksiz aktar.
Çıktıyı KESİNLİKLE ve YALNIZCA geçerli bir JSON nesnesi formatında döndür.
JSON nesnesi şu 4 alanı eksiksiz içermelidir:
1. "step_by_step": Çözümün mantıklı, numaralandırılmış, adım adım tüm işlem basamakları ve nihai sonuca ulaşan hesaplama.
2. "answer": Çözümün son adımında bulduğun kesin, sadeleştirilmiş doğru sayısal veya cebirsel sonuç (Örn: "4" veya "g(2) = 4").
3. "explanation": Kullanılan matematiksel kuralın/teoremin kısa öğretici açıklaması (Neden böyle?).
4. "hint": Öğrencinin benzer sorularda kendi başına düşünmesini ve ilerlemesini destekleyecek pratik ipucu/püf noktası.`;

/**
 * Gemini API kullanarak matematik sorusunu gerçek zamanlı çözer.
 * Asla sahte veya statik fallback yanıt üretmez.
 */
export async function solveMathQuestion(params: {
  topic: string;
  questionText: string;
  imageBase64?: string;
  imageMimeType?: string;
}): Promise<MathSolutionResponse> {
  const apiKey = process.env.GEMINI_API_KEY?.trim();

  // API Anahtarı Kontrolü
  if (!apiKey || apiKey === '' || apiKey === 'your_gemini_api_key_here') {
    throw new Error(
      'GEMINI_API_KEY yapılandırılmamış veya eksik. Lütfen .env.local dosyasına geçerli bir Google Gemini API anahtarı ekleyiniz.'
    );
  }

  const ai = new GoogleGenAI({ apiKey });

  // Çoklu içerik parçalarını hazırla
  const parts: any[] = [];

  // Görsel varsa ekle (Multimodal)
  if (params.imageBase64 && params.imageMimeType) {
    const cleanBase64 = params.imageBase64.includes(',')
      ? params.imageBase64.split(',')[1]
      : params.imageBase64;

    parts.push({
      inlineData: {
        data: cleanBase64,
        mimeType: params.imageMimeType,
      },
    });
  }

  // Soru istemi
  const promptText = `[11. Sınıf Matematik Sorusunu Çöz]
Konu: ${params.topic}
Soru: ${params.questionText || 'Görselde yer alan matematik sorusunu çöz.'}

Lütfen yukarıdaki talimatlara göre soruyu adım adım çöz, sağlamasını yap ve SADECE JSON formatında yanıt ver.`;

  parts.push({ text: promptText });

  // Erişilebilir, stabil ve hızlı Gemini modelleri
  const CANDIDATE_MODELS = ['gemini-3.5-flash-lite', 'gemini-3.1-flash-lite', 'gemini-3.8-flash'];
  let lastError: any = null;

  for (const modelName of CANDIDATE_MODELS) {
    try {
      const response = await ai.models.generateContent({
        model: modelName,
        contents: parts,
        config: {
          systemInstruction: SYSTEM_INSTRUCTION,
          responseMimeType: 'application/json',
          temperature: 0.1,
        },
      });

      const responseText = response.text || '';
      if (!responseText.trim()) {
        throw new Error('Gemini API boş bir yanıt döndürdü.');
      }

      // Markdown bloklarını temizle (```json ... ```)
      const cleanedJson = responseText
        .replace(/^```json\s*/i, '')
        .replace(/^```\s*/i, '')
        .replace(/\s*```$/i, '')
        .trim();

      const parsed = JSON.parse(cleanedJson) as MathSolutionResponse;

      if (!parsed.answer || !parsed.step_by_step) {
        throw new Error('Gemini yanıtı beklenen alanları (answer, step_by_step) eksik içeriyor.');
      }

      return {
        answer: String(parsed.answer).trim(),
        step_by_step: String(parsed.step_by_step).trim(),
        explanation: String(parsed.explanation || 'Temel matematik kuralları uygulandı.').trim(),
        hint: String(parsed.hint || 'İşlem adımlarına ve formüle dikkat ediniz.').trim(),
      };
    } catch (err: any) {
      console.warn(`Model ${modelName} denenirken hata oluştu:`, err?.message || err);
      lastError = err;
      continue;
    }
  }

  // Tüm modeller başarısız olduysa
  const errorMsg = lastError?.message || 'Gemini API ile iletişim kurulamadı.';
  throw new Error(`Gemini API Hatası: ${errorMsg}`);
}
