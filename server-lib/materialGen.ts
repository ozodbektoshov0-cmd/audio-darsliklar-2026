import { Type } from "@google/genai";
import { createGeminiClient, isOverloaded, sleep, type HandlerResult } from "./ai";

export type MaterialKind =
  | "bsb"
  | "theme-test"
  | "math-sheet"
  | "crossword"
  | "word-search"
  | "anagram"
  | "matching"
  | "cloze"
  | "summary"
  | "lesson-slides";

const ALLOWED_KINDS = new Set<MaterialKind>([
  "bsb",
  "theme-test",
  "math-sheet",
  "crossword",
  "word-search",
  "anagram",
  "matching",
  "cloze",
  "summary",
  "lesson-slides",
]);

function materialModels(): string[] {
  const envVal = process.env.GEMINI_MATERIAL_MODELS;
  if (envVal) {
    const parsed = envVal.split(",").map((s) => s.trim()).filter(Boolean);
    if (parsed.length > 0) return parsed;
  }
  return ["gemini-4-hydrogen", "gemini-3.1-flash-lite"];
}

export async function handleGenerateMaterial(body: any): Promise<HandlerResult> {
  const ai = createGeminiClient();
  if (!ai) {
    return {
      status: 503,
      body: {
        error: "AI material generatori uchun GEMINI_API_KEY sozlanmagan. Tezkor darslik/matematika shablonidan foydalanishingiz mumkin.",
        code: "NO_API_KEY",
      },
    };
  }

  const b = body && typeof body === "object" ? body : {};
  const kind = typeof b.kind === "string" && ALLOWED_KINDS.has(b.kind as MaterialKind) ? (b.kind as MaterialKind) : "theme-test";
  const gradeNum = Number(b.grade);
  const grade = Number.isInteger(gradeNum) && gradeNum >= 1 && gradeNum <= 11 ? String(gradeNum) : "9";
  const lang = b.lang === "ru" ? "ru" : "uz";
  const subject = typeof b.subject === "string" ? b.subject.trim().slice(0, 100) : "Adabiyot";
  const topic = typeof b.topic === "string" ? b.topic.trim().slice(0, 180) : "";
  const countRaw = Number(b.count || 8);
  const count = Math.max(4, Math.min(16, Number.isFinite(countRaw) ? Math.round(countRaw) : 8));

  if (!topic) {
    return { status: 400, body: { error: lang === "uz" ? "Mavzu nomini kiriting." : "Укажите тему." } };
  }

  const prompt = [
    `Til: ${lang === "uz" ? "O'zbek tili (lotin alifbosi)" : "Rus tili"}.`,
    `Sinf: ${grade}-sinf. Fan: ${subject}. Mavzu: "${topic}".`,
    `Material turi: ${kind}. Topshiriqlar / elementlar soni: ${count}.`,
    `Tuzilma talablari:`,
    `- title: Material sarlavhasi`,
    `- subtitle: Sinf, fan va tavsiya etilgan vaqt/ball haqida qisqa izoh`,
    `- instructions: O'quvchi yoki o'qituvchi uchun qisqa yo'riqnoma`,
    `- items: Har biri { prompt, options (ixtiyoriy A/B/C/D), answer, hint/explanation } ko'rinishida ${count} ta sifatli o'quv topshirig'i (yoki slaydlar bo'lsa sarlavha=prompt, asosiy matn=explanation, tayanch so'z/savol=answer).`,
    `Agar kind="crossword" yoki "anagram" yoki "word-search" bo'lsa, answer maydoniga bitta toza kalit so'z (bo'sh joysiz) va prompt maydoniga ta'rif yozing.`,
  ].join("\n");

  const config = {
    systemInstruction:
      "Siz O'zbekiston umumta'lim maktablari o'qituvchilari uchun A4 chop etiladigan tarqatma materiallar, BSB/ChSB nazorat ishlari, krossvordlar va interaktiv slaydlar tuzuvchi metodistsiz. Barcha faktlar darslik dasturiga mos va xatosiz bo'lsin.",
    responseMimeType: "application/json",
    responseSchema: {
      type: Type.OBJECT,
      properties: {
        title: { type: Type.STRING },
        subtitle: { type: Type.STRING },
        instructions: { type: Type.STRING },
        items: {
          type: Type.ARRAY,
          items: {
            type: Type.OBJECT,
            properties: {
              prompt: { type: Type.STRING },
              options: { type: Type.ARRAY, items: { type: Type.STRING } },
              answer: { type: Type.STRING },
              explanation: { type: Type.STRING },
            },
            required: ["prompt", "answer"],
          },
        },
      },
      required: ["title", "items"],
    },
  };

  for (const model of materialModels()) {
    for (let attempt = 1; attempt <= 2; attempt++) {
      try {
        const res = await ai.models.generateContent({ model, contents: prompt, config });
        const parsed = JSON.parse((res.text ?? "{}").trim());
        if (parsed && Array.isArray(parsed.items) && parsed.items.length > 0) {
          return {
            status: 200,
            body: {
              kind,
              grade,
              lang,
              subject,
              topic,
              title: String(parsed.title || topic),
              subtitle: String(parsed.subtitle || `${grade}-sinf · ${subject}`),
              instructions: String(parsed.instructions || ""),
              items: parsed.items.slice(0, 20),
              method: "ai",
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
        console.warn(`[generate-material] ${model}:`, String(err?.message || err).slice(0, 120));
        break;
      }
    }
  }

  return {
    status: 503,
    body: {
      error: "AI material generatori vaqtinchalik band. Qayta urinib ko'ring yoki tezkor shablon rejimidan foydalaning.",
      code: "MODEL_OVERLOADED",
    },
  };
}
