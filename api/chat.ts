import { GoogleGenAI } from "@google/genai";

const defaultSystemInstruction =
  "Siz O'zbekiston maktab ta'limi bo'yicha 'Audio Darsliklar' platformasining aqlli AI Ustoz va virtual repetitorisiz. " +
  "Siz 1-11-sinf o'quvchilariga adabiyot, ona tili, tarix, matematika, fizika, kimyo, biologiya va boshqa fanlardan tushunarli, " +
  "do'stona va rag'batlantiruvchi tarzda tushuntirasiz. Javoblaringizni chiroyli Markdown formatida, formulalar yoki misollar bilan bering. " +
  "O'zbek va rus tillarida ravon javob bera olasiz.";

// Model band bo'lib qolganda (503 UNAVAILABLE) avtomatik qayta urinadi.
// Har urinish orasida biroz kutadi, chunki bunday xatolar odatda
// bir necha soniyada o'z-o'zidan tuzaladi.
async function generateContentWithRetry(
  ai: GoogleGenAI,
  params: Parameters<GoogleGenAI["models"]["generateContent"]>[0],
  maxAttempts = 3,
): Promise<Awaited<ReturnType<GoogleGenAI["models"]["generateContent"]>>> {
  let lastError: unknown;

  for (let attempt = 1; attempt <= maxAttempts; attempt++) {
    try {
      return await ai.models.generateContent(params);
    } catch (error: any) {
      lastError = error;
      const status = error?.status || error?.error?.status;
      const isOverloaded = status === "UNAVAILABLE" || error?.error?.code === 503;

      if (!isOverloaded || attempt === maxAttempts) {
        throw error;
      }

      const waitMs = attempt * 1500; // 1.5s, keyin 3s
      await new Promise((resolve) => setTimeout(resolve, waitMs));
    }
  }

  throw lastError;
}

export async function POST(request: Request) {
  try {
    const apiKey = process.env.GEMINI_API_KEY;

    if (!apiKey || apiKey.trim() === "") {
      return Response.json(
        {
          text: "AI xizmati uchun GEMINI_API_KEY sozlanmagan. Vercel Environment Variables bo'limiga API kalitini kiriting.",
          groundingChunks: [],
          model: "system-notice",
        },
        { status: 200 },
      );
    }

    const body = await request.json();

    const messages = Array.isArray(body.messages) ? body.messages : [];

    const message = typeof body.message === "string" ? body.message.trim() : "";

    const systemInstruction =
      typeof body.systemInstruction === "string" && body.systemInstruction.trim()
        ? body.systemInstruction
        : defaultSystemInstruction;

    const useSearch = Boolean(body.useSearch);
    const modelType = typeof body.modelType === "string" ? body.modelType : "flash";

    let selectedModel = "gemini-3.8-flash";
    if (useSearch) {
      selectedModel = "gemini-3.5-flash";
    } else if (modelType === "pro") {
      selectedModel = "gemini-3.1-pro-preview";
    } else if (modelType === "lite") {
      selectedModel = "gemini-3.1-flash-lite";
    }

    const contents: Array<{
      role: "user" | "model";
      parts: Array<{ text: string }>;
    }> = [];

    for (const m of messages) {
      if (!m) continue;

      const text = m.text || m.content;

      if (!text) continue;

      contents.push({
        role: m.role === "assistant" || m.role === "model" ? "model" : "user",
        parts: [{ text: String(text) }],
      });
    }

    if (message) {
      contents.push({
        role: "user",
        parts: [{ text: message }],
      });
    }

    if (contents.length === 0) {
      return Response.json({ error: "Hech qanday xabar kiritilmadi" }, { status: 400 });
    }

    const ai = new GoogleGenAI({ apiKey });

    const config: Record<string, unknown> = { systemInstruction };
    if (useSearch) {
      config.tools = [{ googleSearch: {} }];
    }

    const response = await generateContentWithRetry(ai, {
      model: selectedModel,
      contents,
      config,
    });

    const text = response.text || "Kechirasiz, hozircha javob olishning imkoni bo'lmadi.";

    const groundingChunks = response.candidates?.[0]?.groundingMetadata?.groundingChunks || [];

    return Response.json({
      text,
      groundingChunks,
      model: selectedModel,
    });
  } catch (error: any) {
    console.error("AI Chat Error:", error);

    const status = error?.status || error?.error?.status;
    const isOverloaded = status === "UNAVAILABLE" || error?.error?.code === 503;

    if (isOverloaded) {
      return Response.json(
        {
          error: "AI Ustoz hozircha band. Bir necha soniyadan so'ng qayta urinib ko'ring.",
          code: "MODEL_OVERLOADED",
        },
        { status: 503 },
      );
    }

    return Response.json(
      {
        error: error instanceof Error ? error.message : "AI serverda noma'lum xatolik yuz berdi",
      },
      { status: 500 },
    );
  }
}
