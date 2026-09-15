import { GoogleGenAI } from "@google/genai";

const defaultSystemInstruction =
  "Siz O'zbekiston maktab o'quvchilari uchun ixcham, samimiy va tushunarli AI yordamchisiz. " +
  "Javoblarni qisqa, aniq va foydali bering. " +
  "Kerak bo'lsa misollar va formulalar bilan tushuntiring. " +
  "O'zbek va rus tillarida ravon javob bera olasiz.";

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
        { status: 200 }
      );
    }

    const body = await request.json();

    const messages = Array.isArray(body.messages)
      ? body.messages
      : [];

    const message =
      typeof body.message === "string"
        ? body.message.trim()
        : "";

    const systemInstruction =
      typeof body.systemInstruction === "string" &&
      body.systemInstruction.trim()
        ? body.systemInstruction
        : defaultSystemInstruction;

    const contents: Array<{
      role: "user" | "model";
      parts: Array<{ text: string }>;
    }> = [];

    for (const m of messages) {
      if (!m) continue;

      const text = m.text || m.content;

      if (!text) continue;

      contents.push({
        role:
          m.role === "assistant" || m.role === "model"
            ? "model"
            : "user",
        parts: [
          {
            text: String(text),
          },
        ],
      });
    }

    if (message) {
      contents.push({
        role: "user",
        parts: [
          {
            text: message,
          },
        ],
      });
    }

    if (contents.length === 0) {
      return Response.json(
        {
          error: "Hech qanday xabar kiritilmadi",
        },
        { status: 400 }
      );
    }

    const ai = new GoogleGenAI({
      apiKey,
    });

    const modelName = "gemini-3.8-flash";

    const response = await ai.models.generateContent({
      model: modelName,
      contents,
      config: {
        systemInstruction,
      },
    });

    const text =
      response.text ||
      "Kechirasiz, hozircha javob olishning imkoni bo'lmadi.";

    const groundingChunks =
      response.candidates?.[0]?.groundingMetadata
        ?.groundingChunks || [];

    return Response.json({
      text,
      groundingChunks,
      model: modelName,
    });
  } catch (error) {
    console.error("AI Chat Error:", error);

    return Response.json(
      {
        error:
          error instanceof Error
            ? error.message
            : "AI serverda noma'lum xatolik yuz berdi",
      },
      { status: 500 }
    );
  }
}
