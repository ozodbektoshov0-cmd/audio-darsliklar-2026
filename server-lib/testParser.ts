import { Type } from "@google/genai";
import mammoth from "mammoth";
import { parseTestContent } from "../src/quiz/parser";
import type { Question } from "../src/quiz/types";
import { createGeminiClient, isOverloaded, sleep } from "./ai";

// Vercel serverless payload limit (~4.5 MB) ga mos ravishda 4 MB maksimal fayl hajmi
export const MAX_FILE_BYTES = 4 * 1024 * 1024;
const ALLOWED_EXTS = new Set([".pdf", ".doc", ".docx", ".txt", ".csv", ".json", ".md"]);

function parserModels(): string[] {
  const envVal = process.env.GEMINI_PARSER_MODELS;
  if (envVal) {
    const parsed = envVal.split(",").map((s) => s.trim()).filter(Boolean);
    if (parsed.length > 0) return parsed;
  }
  return ["gemini-4-hydrogen", "gemini-3.1-flash-lite"];
}

function getExt(fileName: string): string {
  const idx = fileName.lastIndexOf(".");
  return idx >= 0 ? fileName.slice(idx).toLowerCase() : "";
}

function sanitizeExtractedQuestions(rawList: unknown[]): Question[] {
  const result: Question[] = [];
  for (const item of rawList) {
    if (!item || typeof item !== "object") continue;
    const obj = item as Record<string, unknown>;
    const q = typeof obj.q === "string" ? obj.q.trim() : "";
    if (q.length < 2) continue;
    const explain = typeof obj.explain === "string" && obj.explain.trim() ? obj.explain.trim() : undefined;

    if (obj.type === "choice" && Array.isArray(obj.options)) {
      const options = obj.options.map((o) => String(o).trim()).filter(Boolean).slice(0, 6);
      const ans = typeof obj.answerIndex === "number" && Number.isInteger(obj.answerIndex)
        ? obj.answerIndex
        : typeof obj.answer === "number" && Number.isInteger(obj.answer)
          ? obj.answer
          : 0;
      if (options.length >= 2 && ans >= 0 && ans < options.length) {
        result.push({ type: "choice", q, options, answer: ans, ...(explain ? { explain } : {}) });
      }
    } else if (obj.type === "truefalse" && typeof obj.boolAnswer === "boolean") {
      result.push({ type: "truefalse", q, answer: obj.boolAnswer, ...(explain ? { explain } : {}) });
    } else if (obj.type === "fill" && typeof obj.textAnswer === "string" && obj.textAnswer.trim()) {
      result.push({ type: "fill", q, answer: obj.textAnswer.trim(), ...(explain ? { explain } : {}) });
    }
  }
  return result.slice(0, 200);
}

async function extractWithGemini(
  contents: string | { parts: Array<{ inlineData?: { mimeType: string; data: string }; text?: string }> },
): Promise<Question[]> {
  const ai = createGeminiClient();
  if (!ai) return [];

  const config = {
    systemInstruction:
      "Siz O'zbekiston maktab darsliklari va test hujjatlaridan savollarni aniq ajratib oluvchi tahlilchisiz. " +
      "Berilgan hujjat yoki matndan barcha test savollarini toping (ko'pi bilan 150 ta). " +
      "Agar matnda tayyor variantli savollar bo'lsa, aynan o'sha savol, variantlar, to'g'ri javob indeksi (0 dan boshlanadi) va qisqa izohni chiqaring. " +
      "Agar hujjatda oddiy o'quv matni bo'lsa, shu matn mazmuni asosida sifatli maktab test savollari tuzing.",
    responseMimeType: "application/json",
    responseSchema: {
      type: Type.ARRAY,
      items: {
        type: Type.OBJECT,
        properties: {
          type: { type: Type.STRING, description: "Savol turi: choice, truefalse yoki fill" },
          q: { type: Type.STRING, description: "Savol matni" },
          options: {
            type: Type.ARRAY,
            items: { type: Type.STRING },
            description: "choice turi uchun 2-4 ta javob varianti",
          },
          answerIndex: { type: Type.INTEGER, description: "choice turi uchun to'g'ri javob indeksi (0 dan)" },
          boolAnswer: { type: Type.BOOLEAN, description: "truefalse turi uchun javob" },
          textAnswer: { type: Type.STRING, description: "fill turi uchun to'g'ri so'z" },
          explain: { type: Type.STRING, description: "Qisqa tushuntirish yoki izoh" },
        },
        required: ["type", "q"],
      },
    },
  };

  for (const model of parserModels()) {
    for (let attempt = 1; attempt <= 2; attempt++) {
      try {
        const response = await ai.models.generateContent({ model, contents, config });
        const rawText = (response.text ?? "[]").trim();
        const parsed = JSON.parse(rawText);
        if (Array.isArray(parsed)) {
          const sanitized = sanitizeExtractedQuestions(parsed);
          if (sanitized.length > 0) return sanitized;
        }
        break;
      } catch (err: any) {
        if (isOverloaded(err) && attempt === 1) {
          await sleep(1200);
          continue;
        }
        console.warn(`[parse-tests] ${model}:`, String(err?.message || err).slice(0, 120));
        break;
      }
    }
  }
  return [];
}

function extractReadableTextFromLegacyDoc(buf: Buffer): string {
  const utf8Runs = buf
    .toString("utf8")
    .replace(/[^\p{L}\p{N}\s.,?!:;()\-–—"'ʻʼ’‘|=/\n]/gu, " ")
    .replace(/[ \t]{2,}/g, " ");
  const lines = utf8Runs
    .split("\n")
    .map((l) => l.trim())
    .filter((l) => l.length >= 4);
  return lines.join("\n").slice(0, 60000);
}

export async function handleParseTestFile(body: any): Promise<{ status: number; body: Record<string, unknown> }> {
  const b = body && typeof body === "object" ? body : {};
  const fileName = typeof b.fileName === "string" ? b.fileName.trim().slice(0, 255) : "";
  const base64Data = typeof b.base64Data === "string" ? b.base64Data.trim() : "";
  const directText = typeof b.text === "string" ? b.text : "";

  if (!fileName && !directText) {
    return { status: 400, body: { error: "Fayl yoki matn yuborilmadi." } };
  }

  const ext = fileName ? getExt(fileName) : ".txt";
  if (!ALLOWED_EXTS.has(ext)) {
    return {
      status: 400,
      body: { error: "Faqat PDF, DOC, DOCX, TXT, CSV, MD yoki JSON fayllar qabul qilinadi." },
    };
  }

  let buffer: Buffer | null = null;
  if (base64Data) {
    const cleanB64 = base64Data.includes(",") ? base64Data.split(",").pop() || "" : base64Data;
    buffer = Buffer.from(cleanB64, "base64");
    if (buffer.length === 0 || buffer.length > MAX_FILE_BYTES) {
      return { status: 413, body: { error: "Fayl hajmi 4 MB dan oshmasligi kerak." } };
    }
  }

  try {
    let extractedText = directText;

    if (ext === ".txt" || ext === ".csv" || ext === ".md" || ext === ".json") {
      if (!extractedText && buffer) {
        extractedText = buffer.toString("utf8");
      }
      const directParsed = parseTestContent(extractedText);
      if (directParsed.questions.length >= 1) {
        return {
          status: 200,
          body: {
            questions: directParsed.questions,
            cards: directParsed.cards,
            method: "deterministic",
          },
        };
      }
      const aiQuestions = await extractWithGemini(
        `Quyidagi matndan test savollarini ajratib oling:\n\n${extractedText.slice(0, 40000)}`,
      );
      if (aiQuestions.length > 0) {
        return { status: 200, body: { questions: aiQuestions, cards: [], method: "ai" } };
      }
      return {
        status: 422,
        body: { error: "Fayldan test savollari aniqlanmadi. Matn formatini tekshiring." },
      };
    }

    if (ext === ".docx") {
      if (!buffer) return { status: 400, body: { error: "DOCX fayl bo'sh." } };
      const res = await mammoth.extractRawText({ buffer });
      extractedText = res.value || "";
      const directParsed = parseTestContent(extractedText);
      if (directParsed.questions.length >= 1) {
        return {
          status: 200,
          body: {
            questions: directParsed.questions,
            cards: directParsed.cards,
            method: "docx-deterministic",
          },
        };
      }
      if (extractedText.trim().length >= 20) {
        const aiQuestions = await extractWithGemini(
          `Quyidagi Word hujjati matnidan test savollarini ajratib oling:\n\n${extractedText.slice(0, 45000)}`,
        );
        if (aiQuestions.length > 0) {
          return { status: 200, body: { questions: aiQuestions, cards: [], method: "docx-ai" } };
        }
      }
      return {
        status: 422,
        body: { error: "DOCX hujjatdan test savollari topilmadi." },
      };
    }

    if (ext === ".doc") {
      if (!buffer) return { status: 400, body: { error: "DOC fayl bo'sh." } };
      try {
        const res = await mammoth.extractRawText({ buffer });
        if (res.value && res.value.trim().length > 10) {
          const directParsed = parseTestContent(res.value);
          if (directParsed.questions.length >= 1) {
            return { status: 200, body: { questions: directParsed.questions, cards: directParsed.cards, method: "doc-parsed" } };
          }
          const aiQ = await extractWithGemini(`Quyidagi hujjat matnidan test savollarini ajratib oling:\n\n${res.value.slice(0, 45000)}`);
          if (aiQ.length > 0) return { status: 200, body: { questions: aiQ, cards: [], method: "doc-ai" } };
        }
      } catch {
        // Legacy binary .doc fallback
      }
      const readable = extractReadableTextFromLegacyDoc(buffer);
      const directParsed = parseTestContent(readable);
      if (directParsed.questions.length >= 1) {
        return { status: 200, body: { questions: directParsed.questions, cards: directParsed.cards, method: "doc-legacy" } };
      }
      if (readable.length >= 40) {
        const aiQ = await extractWithGemini(`Quyidagi hujjat matnidan test savollarini ajratib oling:\n\n${readable.slice(0, 40000)}`);
        if (aiQ.length > 0) return { status: 200, body: { questions: aiQ, cards: [], method: "doc-ai" } };
      }
      return {
        status: 422,
        body: { error: "Eski .doc formatini o'qib bo'lmadi. Iltimos .docx, .pdf yoki .txt shaklida yuklang." },
      };
    }

    if (ext === ".pdf") {
      if (!buffer) return { status: 400, body: { error: "PDF fayl bo'sh." } };
      const cleanB64 = buffer.toString("base64");
      const aiQuestions = await extractWithGemini({
        parts: [
          { inlineData: { mimeType: "application/pdf", data: cleanB64 } },
          {
            text:
              "Ushbu PDF fayldagi barcha test savollarini ajratib oling. Agar PDF darslik matni bo'lsa, undagi asosiy mavzular bo'yicha test savollari tuzib JSON qaytaring.",
          },
        ],
      });
      if (aiQuestions.length > 0) {
        return { status: 200, body: { questions: aiQuestions, cards: [], method: "pdf-ai" } };
      }
      return {
        status: 422,
        body: { error: "PDF fayldan test savollarini aniqlab bo'lmadi. Matnli PDF yoki TXT/DOCX sinab ko'ring." },
      };
    }

    return { status: 400, body: { error: "Qo'llab-quvvatlanmaydigan fayl turi." } };
  } catch (err: any) {
    console.error("[parse-tests] error:", err?.message || err);
    return {
      status: 500,
      body: { error: "Faylni tahlil qilishda xatolik yuz berdi. Boshqa fayl yoki matn ko'rinishida urinib ko'ring." },
    };
  }
}
