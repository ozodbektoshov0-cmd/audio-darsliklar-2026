/**
 * Umumiy AI mantiqi: Express (server.ts) va Vercel funksiyalari (api/*.ts) shu yerdan foydalanadi.
 * Shunda ikki muhitda xatti-harakat bir xil bo'ladi.
 */
import { GoogleGenAI, Modality } from "@google/genai";
import type { VerifiedAuthUser } from "./authVerify";

export interface HandlerResult {
  status: number;
  body: Record<string, unknown>;
}

const list = (v: string | undefined, fallback: string[]) =>
  v ? v.split(",").map((s) => s.trim()).filter(Boolean) : fallback;

// Active Gemini SDK model aliases (env orqali almashtirish mumkin)
const flashModels = () =>
  list(process.env.GEMINI_CHAT_MODELS, [
    "gemini-4-hydrogen",
    "gemini-3.1-flash-lite",
  ]);
const proModels = () =>
  list(process.env.GEMINI_PRO_MODELS, [
    "gemini-4-neon",
    ...flashModels(),
  ]);
const ttsModels = () =>
  list(process.env.GEMINI_TTS_MODELS, [
    "gemini-3.8-flash-lite-tts",
    "gemini-3.8-flash-tts",
  ]);

const LIMITS = {
  maxMessages: 20,
  maxMessageChars: 4000,
  maxTtsChars: 600,
  ratePerMinute: 20,
};

const VALID_VOICES = ["Puck", "Charon", "Kore", "Fenrir", "Zephyr"];

// ---------- Rol (system prompt) serverda belgilanadi ----------
const PERSONAS = {
  tutor:
    "Siz O'zbekiston maktab ta'limi bo'yicha 'Audio Darsliklar' platformasining AI Ustoz va virtual repetitorisiz. " +
    "1-11-sinf o'quvchilariga barcha fanlardan tushunarli, do'stona va rag'batlantiruvchi tarzda tushuntirasiz. " +
    "Javoblarni chiroyli Markdown formatida, misollar bilan bering. O'zbek va rus tillarida ravon javob bera olasiz. " +
    "Faqat ta'limga oid savollarga javob bering; boshqa mavzularda muloyimlik bilan o'qishga yo'naltiring.",
  widget:
    "Siz O'zbekiston maktab o'quvchilari uchun ixcham, samimiy va tushunarli AI yordamchisiz. " +
    "Javoblarni qisqa, aniq va foydali bering. Faqat ta'limga oid savollarga javob bering.",
} as const;

export type Persona = keyof typeof PERSONAS;

// ---------- Oddiy rate limit (xotirada; serverless'da "best effort") ----------
const hits = new Map<string, number[]>();
export function rateLimited(key: string): boolean {
  const now = Date.now();
  const arr = (hits.get(key) || []).filter((t) => now - t < 60_000);
  arr.push(now);
  hits.set(key, arr);
  if (hits.size > 5000) {
    for (const [k, v] of hits) if (!v.some((t) => now - t < 60_000)) hits.delete(k);
  }
  return arr.length > LIMITS.ratePerMinute;
}

export function tooMany(): HandlerResult {
  return {
    status: 429,
    body: { error: "Juda ko'p so'rov. Bir daqiqadan so'ng qayta urinib ko'ring.", code: "RATE_LIMITED" },
  };
}

// ---------- Yordamchi ----------
export function hasApiKey(): boolean {
  return Boolean(process.env.GEMINI_API_KEY && process.env.GEMINI_API_KEY.trim() !== "");
}

export function createGeminiClient(): GoogleGenAI | null {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey || apiKey.trim() === "") return null;
  return new GoogleGenAI({
    apiKey,
    httpOptions: {
      headers: {
        "User-Agent": "aistudio-build",
      },
    },
  });
}

export function pcmToWav(pcm: Buffer, sampleRate = 24000, channels = 1, bits = 16): Buffer {
  const byteRate = (sampleRate * channels * bits) / 8;
  const blockAlign = (channels * bits) / 8;
  const h = Buffer.alloc(44);
  h.write("RIFF", 0);
  h.writeUInt32LE(36 + pcm.length, 4);
  h.write("WAVE", 8);
  h.write("fmt ", 12);
  h.writeUInt32LE(16, 16);
  h.writeUInt16LE(1, 20);
  h.writeUInt16LE(channels, 22);
  h.writeUInt32LE(sampleRate, 24);
  h.writeUInt32LE(byteRate, 28);
  h.writeUInt16LE(blockAlign, 32);
  h.writeUInt16LE(bits, 34);
  h.write("data", 36);
  h.writeUInt32LE(pcm.length, 40);
  return Buffer.concat([h, pcm]);
}

export const sleep = (ms: number) => new Promise((r) => setTimeout(r, ms));

export function isOverloaded(err: any): boolean {
  const status = err?.status || err?.error?.status;
  return status === "UNAVAILABLE" || status === 503 || err?.error?.code === 503;
}

// ---------- CHAT ----------
export async function handleChat(body: any, authUser: VerifiedAuthUser | null = null): Promise<HandlerResult> {
  const ai = createGeminiClient();
  if (!ai) {
    return {
      status: 200,
      body: {
        text: "AI xizmati uchun GEMINI_API_KEY sozlanmagan. Iltimos, muhit o'zgaruvchilariga kalitni kiriting.",
        groundingChunks: [],
        model: "system-notice",
      },
    };
  }

  const b = body && typeof body === "object" ? body : {};
  const persona: Persona = b.persona === "widget" ? "widget" : "tutor";

  // Xavfsizlik: tasdiqlanmagan foydalanuvchi Pro model va Google Search qimmat rejimlarini majburlay olmaydi
  const canUsePrivilegedOptions = Boolean(authUser && authUser.emailVerified);
  const useSearch = canUsePrivilegedOptions && Boolean(b.useSearch);
  const modelType = canUsePrivilegedOptions && b.modelType === "pro" ? "pro" : "flash";

  const gradeNum = Number(b.grade);
  const grade = Number.isInteger(gradeNum) && gradeNum >= 1 && gradeNum <= 11 ? gradeNum : null;

  const contents: Array<{ role: "user" | "model"; parts: Array<{ text: string }> }> = [];
  const history = Array.isArray(b.messages) ? b.messages.slice(-LIMITS.maxMessages) : [];
  for (const m of history) {
    const text = m && (m.text || m.content);
    if (!text) continue;
    contents.push({
      role: m.role === "assistant" || m.role === "model" ? "model" : "user",
      parts: [{ text: String(text).slice(0, LIMITS.maxMessageChars) }],
    });
  }
  const message = typeof b.message === "string" ? b.message.trim().slice(0, LIMITS.maxMessageChars) : "";
  if (message) contents.push({ role: "user", parts: [{ text: message }] });

  if (contents.length === 0) {
    return { status: 400, body: { error: "Hech qanday xabar kiritilmadi" } };
  }
  while (contents.length > 1 && contents[0].role !== "user") contents.shift();

  let systemInstruction: string = PERSONAS[persona];
  if (grade) systemInstruction += ` Foydalanuvchi ${grade}-sinf o'quvchisi: tushuntirishni shu yosh va dastur darajasiga moslang.`;

  const config: Record<string, unknown> = { systemInstruction };
  if (useSearch) config.tools = [{ googleSearch: {} }];

  const models = modelType === "pro" ? proModels() : flashModels();
  let lastError: any = null;

  for (const model of models) {
    for (let attempt = 1; attempt <= 2; attempt++) {
      try {
        const response: any = await ai.models.generateContent({ model, contents, config });
        if (response?.text) {
          return {
            status: 200,
            body: {
              text: response.text,
              groundingChunks: response.candidates?.[0]?.groundingMetadata?.groundingChunks || [],
              model,
            },
          };
        }
        break;
      } catch (err: any) {
        lastError = err;
        if (isOverloaded(err) && attempt === 1) {
          await sleep(1200);
          continue;
        }
        console.warn(`[chat] ${model}: ${String(err?.message || err).slice(0, 120)}`);
        break;
      }
    }
  }

  console.error("[chat] barcha modellar muvaffaqiyatsiz:", lastError?.message);
  return {
    status: 503,
    body: {
      error: "AI Ustoz hozircha band. Bir necha soniyadan so'ng qayta urinib ko'ring.",
      code: "MODEL_OVERLOADED",
    },
  };
}

// ---------- TTS ----------
export async function handleTts(body: any): Promise<HandlerResult> {
  const fallback = (message: string): HandlerResult => ({
    status: 200,
    body: { audioBase64: null, fallbackToBrowserTts: true, message },
  });

  const ai = createGeminiClient();
  if (!ai) return fallback("GEMINI_API_KEY sozlanmagan, brauzer ovozi ishlatiladi");

  const b = body && typeof body === "object" ? body : {};
  const text = typeof b.text === "string" ? b.text.trim() : "";
  if (!text) return { status: 400, body: { error: "Matn kiritilmadi" } };

  const voice = VALID_VOICES.includes(b.voice) ? b.voice : "Kore";
  const safeText = text.slice(0, LIMITS.maxTtsChars);
  const stylePrompt = typeof b.stylePrompt === "string" ? b.stylePrompt.slice(0, 200) : "";
  const promptText = stylePrompt ? `${stylePrompt}: ${safeText}` : safeText;

  for (const model of ttsModels()) {
    try {
      const response: any = await ai.models.generateContent({
        model,
        contents: [{ parts: [{ text: promptText }] }],
        config: {
          responseModalities: [Modality.AUDIO],
          speechConfig: { voiceConfig: { prebuiltVoiceConfig: { voiceName: voice } } },
        },
      });
      const base64Audio = response?.candidates?.[0]?.content?.parts?.[0]?.inlineData?.data;
      if (base64Audio) {
        const wav = pcmToWav(Buffer.from(base64Audio, "base64"));
        return {
          status: 200,
          body: { audioBase64: wav.toString("base64"), mimeType: "audio/wav", sampleRate: 24000, voice, sizeBytes: wav.length },
        };
      }
    } catch (err: any) {
      console.warn(`[tts] ${model}: ${String(err?.message || err).slice(0, 120)}`);
    }
  }
  return fallback("Gemini TTS vaqtinchalik band, brauzer ovozi faollashtirildi");
}
