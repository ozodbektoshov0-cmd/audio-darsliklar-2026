import { Type } from "@google/genai";
import { createGeminiClient, isOverloaded, sleep, type HandlerResult } from "./ai";

const SLIDE_MODELS = ["gemini-4-hydrogen", "gemini-3.1-flash-lite"];
const TRANSCRIBE_MODEL = "gemini-3.5-transcribe";
const MAX_AUDIO_BYTES = 4 * 1024 * 1024;
const ALLOWED_AUDIO_MIMES = new Set([
  "audio/webm",
  "audio/wav",
  "audio/wave",
  "audio/x-wav",
  "audio/mp3",
  "audio/mpeg",
  "audio/ogg",
  "audio/mp4",
  "audio/aac",
]);

export async function handleGenerateSlides(body: any): Promise<HandlerResult> {
  const ai = createGeminiClient();
  if (!ai) {
    return {
      status: 503,
      body: {
        error: "AI Taqdimot yaratish uchun GEMINI_API_KEY sozlanmagan. Settings > Secrets bo'limini tekshiring.",
        code: "NO_API_KEY",
      },
    };
  }

  const b = body && typeof body === "object" ? body : {};
  const gradeNum = Number(b.grade);
  const grade = Number.isInteger(gradeNum) && gradeNum >= 1 && gradeNum <= 11 ? String(gradeNum) : "9";
  const lang = b.lang === "ru" ? "ru" : "uz";
  const subject = typeof b.subject === "string" && b.subject.trim() ? b.subject.trim().slice(0, 100) : "Adabiyot";
  const topic = typeof b.topic === "string" ? b.topic.trim().slice(0, 200) : "";
  const slideCountRaw = Number(b.slideCount || 5);
  const slideCount = Math.max(4, Math.min(8, Number.isFinite(slideCountRaw) ? Math.round(slideCountRaw) : 5));

  if (!topic) {
    return {
      status: 400,
      body: { error: lang === "uz" ? "Taqdimot mavzusini kiriting." : "Укажите тему презентации." },
    };
  }

  const prompt = [
    `Til: ${lang === "uz" ? "O'zbek tili (lotin yozuvida)" : "Rus tili"}.`,
    `Sinf: ${grade}-sinf. Fan: ${subject}. Mavzu: "${topic}".`,
    `${slideCount} ta slaydli to'liq o'quv taqdimot (slayd dars) yarating.`,
    `Har bir slaydda quyidagilar bo'lishi shart:`,
    `1) title, subtitle, body (2-3 ta tushunarli gap), bullets (3 ta aniq tezis), highlight (asosiy xulosa), teacherNote (o'qituvchi uchun metodik izoh).`,
    `2) visualTheme: "stem" (aniq/tabiiy fanlar) yoki "humanities" (gumanitar/adabiyot/tarix).`,
    `3) diagram: slayd mazmunini ko'rgazmali ko'rsatuvchi sxema { kind: "steps" | "cycle" | "comparison" | "concept" | "timeline", caption, items: 3-4 ta { label, detail } }.`,
    `4) Oxirgi yoki o'rtadagi slaydlarda checkQuestion { q, options (4 ta), answer (0..3), explain } bo'lsin.`,
  ].join("\n");

  const config = {
    systemInstruction:
      "Siz O'zbekiston maktablari uchun vizual chiroyli, faktlari aniq va o'quvchi e'tiborini tortuvchi taqdimotlar tuzuvchi metodist-dizaynersiz.",
    responseMimeType: "application/json",
    responseSchema: {
      type: Type.OBJECT,
      properties: {
        title: { type: Type.STRING },
        visualTheme: { type: Type.STRING, description: "stem or humanities" },
        objectives: { type: Type.ARRAY, items: { type: Type.STRING } },
        keyTerms: {
          type: Type.ARRAY,
          items: {
            type: Type.OBJECT,
            properties: {
              term: { type: Type.STRING },
              def: { type: Type.STRING },
            },
            required: ["term", "def"],
          },
        },
        slides: {
          type: Type.ARRAY,
          items: {
            type: Type.OBJECT,
            properties: {
              title: { type: Type.STRING },
              subtitle: { type: Type.STRING },
              body: { type: Type.STRING },
              bullets: { type: Type.ARRAY, items: { type: Type.STRING } },
              highlight: { type: Type.STRING },
              teacherNote: { type: Type.STRING },
              visualTheme: { type: Type.STRING },
              diagram: {
                type: Type.OBJECT,
                properties: {
                  kind: { type: Type.STRING },
                  caption: { type: Type.STRING },
                  items: {
                    type: Type.ARRAY,
                    items: {
                      type: Type.OBJECT,
                      properties: {
                        label: { type: Type.STRING },
                        detail: { type: Type.STRING },
                      },
                      required: ["label", "detail"],
                    },
                  },
                },
                required: ["kind", "caption", "items"],
              },
              checkQuestion: {
                type: Type.OBJECT,
                properties: {
                  q: { type: Type.STRING },
                  options: { type: Type.ARRAY, items: { type: Type.STRING } },
                  answer: { type: Type.INTEGER },
                  explain: { type: Type.STRING },
                },
                required: ["q", "options", "answer", "explain"],
              },
            },
            required: ["title", "body", "bullets", "teacherNote", "diagram"],
          },
        },
      },
      required: ["title", "objectives", "keyTerms", "slides"],
    },
  };

  for (const model of SLIDE_MODELS) {
    for (let attempt = 1; attempt <= 2; attempt++) {
      try {
        const response = await ai.models.generateContent({ model, contents: prompt, config });
        const parsed = JSON.parse((response.text ?? "{}").trim());
        if (parsed && Array.isArray(parsed.slides) && parsed.slides.length > 0) {
          const deckTheme = parsed.visualTheme === "stem" ? "stem" : "humanities";
          const slides = parsed.slides.slice(0, 8).map((s: any, idx: number) => ({
            title: String(s.title || `${idx + 1}-slayd`),
            subtitle: s.subtitle ? String(s.subtitle) : `${idx + 1}-slayd · ${subject}`,
            body: String(s.body || ""),
            bullets: Array.isArray(s.bullets) ? s.bullets.map(String).slice(0, 5) : [],
            highlight: s.highlight ? String(s.highlight) : undefined,
            teacherNote: String(s.teacherNote || ""),
            visualTheme: s.visualTheme === "stem" || s.visualTheme === "humanities" ? s.visualTheme : deckTheme,
            diagram: s.diagram && Array.isArray(s.diagram.items) ? s.diagram : undefined,
            checkQuestion:
              s.checkQuestion && Array.isArray(s.checkQuestion.options) && s.checkQuestion.options.length >= 2
                ? {
                    q: String(s.checkQuestion.q),
                    options: s.checkQuestion.options.map(String).slice(0, 4),
                    answer: Math.max(0, Math.min(s.checkQuestion.options.length - 1, Number(s.checkQuestion.answer) || 0)),
                    explain: String(s.checkQuestion.explain || ""),
                  }
                : undefined,
          }));

          return {
            status: 200,
            body: {
              id: `ai-deck-${Date.now()}`,
              grade,
              subjectName: subject,
              lang,
              title: String(parsed.title || topic),
              durationMin: 45,
              visualTheme: deckTheme,
              objectives: Array.isArray(parsed.objectives) ? parsed.objectives.map(String).slice(0, 5) : [],
              keyTerms: Array.isArray(parsed.keyTerms) ? parsed.keyTerms.slice(0, 6) : [],
              slides,
              model,
            },
          };
        }
        break;
      } catch (err: any) {
        if (isOverloaded(err) && attempt === 1) {
          await sleep(1200);
          continue;
        }
        console.warn(`[slides] ${model}:`, String(err?.message || err).slice(0, 140));
        break;
      }
    }
  }

  return {
    status: 503,
    body: {
      error: "AI slayd generatori hozircha band. Bir necha soniyadan so'ng qayta urinib ko'ring.",
      code: "MODEL_OVERLOADED",
    },
  };
}

export async function handleTranscribeAudio(body: any): Promise<HandlerResult> {
  const ai = createGeminiClient();
  if (!ai) {
    return {
      status: 503,
      body: {
        error: "Audio transkripsiya uchun GEMINI_API_KEY sozlanmagan.",
        code: "NO_API_KEY",
      },
    };
  }

  const b = body && typeof body === "object" ? body : {};
  const audioBase64 = typeof b.audioBase64 === "string" ? b.audioBase64.trim() : "";
  const rawMime = typeof b.mimeType === "string" ? b.mimeType.split(";")[0].trim().toLowerCase() : "audio/webm";
  const lang = b.lang === "ru" ? "ru" : "uz";

  if (!audioBase64) {
    return { status: 400, body: { error: "Audio ma'lumoti yuborilmadi." } };
  }
  if (!ALLOWED_AUDIO_MIMES.has(rawMime)) {
    return { status: 400, body: { error: "Qo'llab-quvvatlanmaydigan audio formati." } };
  }

  const cleanB64 = audioBase64.includes(",") ? audioBase64.split(",").pop() || "" : audioBase64;
  const buf = Buffer.from(cleanB64, "base64");
  if (buf.length === 0 || buf.length > MAX_AUDIO_BYTES) {
    return { status: 413, body: { error: "Audio fayl hajmi 4 MB dan oshmasligi kerak." } };
  }

  try {
    const response = await ai.models.generateContent({
      model: TRANSCRIBE_MODEL,
      contents: {
        parts: [
          {
            inlineData: {
              mimeType: rawMime,
              data: cleanB64,
            },
          },
          {
            text:
              lang === "uz"
                ? "Ushbu audioni aniq va imlo qoidalariga mos matn ko'rinishida yozib bering (transkripsiya qiling). Faqat eshitilgan nutq matnini qaytaring."
                : "Точно транскрибируйте эту аудиозапись в текст. Верните только текст речи.",
          },
        ],
      },
    });
    const text = (response.text ?? "").trim();
    if (!text) {
      return { status: 422, body: { error: "Audiodan nutq aniqlanmadi. Aniqroq gapirib qayta urinib ko'ring." } };
    }
    return {
      status: 200,
      body: { text, model: TRANSCRIBE_MODEL },
    };
  } catch (err: any) {
    console.warn("[transcribe]", String(err?.message || err).slice(0, 140));
    return {
      status: 503,
      body: {
        error: "Audioni matnga aylantirishda xatolik yuz berdi. Qayta urinib ko'ring.",
        code: "TRANSCRIBE_ERROR",
      },
    };
  }
}
