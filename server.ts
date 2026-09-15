import express from "express";
import path from "path";
import dotenv from "dotenv";
import { GoogleGenAI, Modality } from "@google/genai";
import { createServer as createViteServer } from "vite";

dotenv.config();

// Process-level error protection to prevent server crashes
process.on("unhandledRejection", (reason) => {
  console.error("Unhandled Rejection:", reason);
});
process.on("uncaughtException", (error) => {
  console.error("Uncaught Exception:", error);
});

function pcmToWav(pcmBuffer: Buffer, sampleRate = 24000, numChannels = 1, bitsPerSample = 16): Buffer {
  const byteRate = (sampleRate * numChannels * bitsPerSample) / 8;
  const blockAlign = (numChannels * bitsPerSample) / 8;
  const dataSize = pcmBuffer.length;
  const header = Buffer.alloc(44);

  header.write("RIFF", 0);
  header.writeUInt32LE(36 + dataSize, 4);
  header.write("WAVE", 8);
  header.write("fmt ", 12);
  header.writeUInt32LE(16, 16);
  header.writeUInt16LE(1, 20); // PCM
  header.writeUInt16LE(numChannels, 22);
  header.writeUInt32LE(sampleRate, 24);
  header.writeUInt32LE(byteRate, 28);
  header.writeUInt16LE(blockAlign, 32);
  header.writeUInt16LE(bitsPerSample, 34);
  header.write("data", 36);
  header.writeUInt32LE(dataSize, 40);

  return Buffer.concat([header, pcmBuffer]);
}

function getGeminiClient(): GoogleGenAI | null {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey || apiKey.trim() === "") {
    return null;
  }
  return new GoogleGenAI({
    apiKey,
    httpOptions: {
      headers: {
        "User-Agent": "aistudio-build",
      },
    },
  });
}

async function startServer() {
  const app = express();
  const PORT = 3000;

  app.use(express.json({ limit: "15mb" }));

  // Handle JSON parse errors safely
  app.use((err: any, _req: express.Request, res: express.Response, next: express.NextFunction) => {
    if (err instanceof SyntaxError && "body" in err) {
      return res.status(400).json({ error: "Noto'g'ri JSON formati", code: "INVALID_JSON" });
    }
    next(err);
  });

  // Health check
  app.get("/api/health", (_req, res) => {
    res.json({
      status: "ok",
      hasApiKey: Boolean(process.env.GEMINI_API_KEY && process.env.GEMINI_API_KEY.trim() !== ""),
      timestamp: new Date().toISOString(),
    });
  });

  // AI Chatbot endpoint with multi-model fallback
  app.post("/api/chat", async (req, res) => {
    try {
      const ai = getGeminiClient();
      if (!ai) {
        return res.status(200).json({
          text: "AI xizmati uchun GEMINI_API_KEY sozlanmagan. Iltimos, loyiha sozlamalarida kalitni kiriting.",
          groundingChunks: [],
          model: "system-notice",
        });
      }

      const {
        messages = [],
        message = "",
        systemInstruction,
        useSearch = false,
        modelType = "flash",
      } = req.body;

      // Ordered model fallback list to eliminate quota and 404/503 errors
      let modelsToTry: string[] = [];

      if (modelType === "pro") {
        modelsToTry = [
          "gemini-3.1-pro-preview",
          "gemini-3.8-flash",
          "gemini-flash-latest",
          "gemini-3.1-flash-lite",
        ];
      } else if (useSearch) {
        modelsToTry = [
          "gemini-3.8-flash",
          "gemini-flash-latest",
          "gemini-3.1-flash-lite",
        ];
      } else {
        modelsToTry = [
          "gemini-3.8-flash",
          "gemini-flash-latest",
          "gemini-3.1-flash-lite",
          "gemini-3.1-pro-preview",
        ];
      }

      const defaultSystemInstruction =
        "Siz O'zbekiston maktab ta'limi bo'yicha 'Audio Darsliklar' platformasining aqlli AI Ustoz va virtual repetitorisiz. " +
        "Siz 1-11-sinf o'quvchilariga adabiyot, ona tili, tarix, matematika, fizika, kimyo, biologiya va boshqa fanlardan tushunarli, " +
        "do'stona va rag'batlantiruvchi tarzda tushuntirasiz. Javoblaringizni chiroyli Markdown formatida, formulalar yoki misollar bilan bering. " +
        "O'zbek va rus tillarida ravon javob bera olasiz.";

      // Build conversation contents
      const contents: Array<{ role: "user" | "model"; parts: Array<{ text: string }> }> = [];

      for (const m of messages) {
        if (m && (m.text || m.content)) {
          contents.push({
            role: m.role === "assistant" || m.role === "model" ? "model" : "user",
            parts: [{ text: String(m.text || m.content) }],
          });
        }
      }

      if (message && typeof message === "string" && message.trim().length > 0) {
        contents.push({
          role: "user",
          parts: [{ text: message.trim() }],
        });
      }

      if (contents.length === 0) {
        return res.status(400).json({ error: "Hech qanday xabar kiritilmadi" });
      }

      const config: Record<string, unknown> = {
        systemInstruction: systemInstruction || defaultSystemInstruction,
      };

      if (useSearch) {
        config.tools = [{ googleSearch: {} }];
      }

      let response: any = null;
      let usedModel = "";
      let lastError: any = null;

      // Try models sequentially until one succeeds
      for (const modelName of modelsToTry) {
        try {
          response = await ai.models.generateContent({
            model: modelName,
            contents,
            config,
          });

          if (response && response.text) {
            usedModel = modelName;
            break;
          }
        } catch (err: any) {
          lastError = err;
          console.warn(`[AI Chat] Model ${modelName} error (${err?.message?.slice(0, 100)}). Trying fallback...`);
          // If search tool fails on a model, retry next model without tools if needed
        }
      }

      if (response && response.text) {
        const responseText = response.text;
        const groundingChunks =
          response.candidates?.[0]?.groundingMetadata?.groundingChunks || [];

        return res.json({
          text: responseText,
          groundingChunks,
          model: usedModel,
        });
      }

      // If all models hit quota or are overloaded, return friendly helpful message instead of crashing
      console.error("[AI Chat] All fallback models failed:", lastError?.message);
      return res.status(200).json({
        text: "Kechirasiz, hozirda AI serverlarida vaqtinchalik yuqori yuklanish kuzatilmoqda. Iltimos, bir necha soniyadan so'ng qayta urinib ko'ring yoki savolingizni qisqartirib yozing.",
        groundingChunks: [],
        model: "fallback-safe",
      });
    } catch (error: any) {
      console.error("AI Chatbot Critical Error:", error);
      return res.status(200).json({
        text: "Xizmatda vaqtinchalik uzilish yuz berdi. Iltimos, qaytadan yozing.",
        groundingChunks: [],
        model: "safe-error-recovery",
      });
    }
  });

  // Text-To-Speech (TTS) endpoint
  app.post("/api/tts", async (req, res) => {
    try {
      const ai = getGeminiClient();
      if (!ai) {
        return res.status(200).json({
          audioBase64: null,
          fallbackToBrowserTts: true,
          error: "GEMINI_API_KEY sozlanmagan",
        });
      }

      const { text, voice = "Kore", stylePrompt } = req.body;

      if (!text || typeof text !== "string" || text.trim().length === 0) {
        return res.status(400).json({ error: "Matn kiritilmadi" });
      }

      const validVoices = ["Puck", "Charon", "Kore", "Fenrir", "Zephyr"];
      const selectedVoice = validVoices.includes(voice) ? voice : "Kore";

      // Keep text within safe token limits for TTS
      const safeText = text.trim().slice(0, 600);
      const promptText = stylePrompt ? `${stylePrompt}: ${safeText}` : safeText;

      try {
        const response = await ai.models.generateContent({
          model: "gemini-3.1-flash-tts-preview",
          contents: [{ parts: [{ text: promptText }] }],
          config: {
            responseModalities: [Modality.AUDIO],
            speechConfig: {
              voiceConfig: {
                prebuiltVoiceConfig: { voiceName: selectedVoice },
              },
            },
          },
        });

        const base64Audio =
          response.candidates?.[0]?.content?.parts?.[0]?.inlineData?.data;

        if (base64Audio) {
          const pcmBuffer = Buffer.from(base64Audio, "base64");
          const wavBuffer = pcmToWav(pcmBuffer, 24000, 1, 16);
          const wavBase64 = wavBuffer.toString("base64");

          return res.json({
            audioBase64: wavBase64,
            mimeType: "audio/wav",
            sampleRate: 24000,
            voice: selectedVoice,
            sizeBytes: wavBuffer.length,
          });
        }
      } catch (ttsErr: any) {
        console.warn("[TTS] Gemini TTS error, signalling browser speech synthesis fallback:", ttsErr?.message?.slice(0, 100));
      }

      // Return fallback signal so client seamlessly uses browser Web Speech synthesis
      return res.status(200).json({
        audioBase64: null,
        fallbackToBrowserTts: true,
        message: "Gemini TTS vaqtinchalik band, brauzer ovozi faollashtirildi",
      });
    } catch (error: any) {
      console.error("TTS Generation Error:", error);
      return res.status(200).json({
        audioBase64: null,
        fallbackToBrowserTts: true,
        error: error?.message || "Audio sintez qilishda xatolik",
      });
    }
  });

  // Direct Audio Download endpoint (returns binary audio stream with .mp3 attachment)
  app.post("/api/tts/download", async (req, res) => {
    try {
      const ai = getGeminiClient();
      if (!ai) {
        return res.status(500).send("GEMINI_API_KEY topilmadi");
      }

      const { text, voice = "Kore", filename = "audio-darslik.mp3" } = req.body;
      if (!text) {
        return res.status(400).send("Matn talab qilinadi");
      }

      const response = await ai.models.generateContent({
        model: "gemini-3.1-flash-tts-preview",
        contents: [{ parts: [{ text }] }],
        config: {
          responseModalities: [Modality.AUDIO],
          speechConfig: {
            voiceConfig: {
              prebuiltVoiceConfig: { voiceName: voice },
            },
          },
        },
      });

      const base64Audio =
        response.candidates?.[0]?.content?.parts?.[0]?.inlineData?.data;

      if (!base64Audio) {
        return res.status(500).send("Audio hosil qilib bo'lmadi");
      }

      const pcmBuffer = Buffer.from(base64Audio, "base64");
      const wavBuffer = pcmToWav(pcmBuffer, 24000, 1, 16);

      const safeFilename = encodeURIComponent(filename.replace(/[^\w\d_.-]/g, "_"));
      res.setHeader("Content-Type", "audio/mpeg");
      res.setHeader("Content-Disposition", `attachment; filename="${safeFilename}"`);
      res.setHeader("Content-Length", wavBuffer.length);
      return res.send(wavBuffer);
    } catch (error: any) {
      console.error("Direct TTS download error:", error);
      return res.status(500).send(error?.message || "Xatolik yuz berdi");
    }
  });

  // Vite middleware for development or static serving for production
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), "dist");
    app.use(express.static(distPath));
    app.get("*", (_req, res) => {
      res.sendFile(path.join(distPath, "index.html"));
    });
  }

  // Global catch-all error handling middleware to avoid unhandled request crashes
  app.use((err: any, _req: express.Request, res: express.Response, _next: express.NextFunction) => {
    console.error("Express Error Handler:", err);
    if (!res.headersSent) {
      res.status(err?.status || 500).json({
        error: "Serverda xatolik yuz berdi",
        message: err?.message || "Noma'lum xatolik",
      });
    }
  });

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`Server running on http://localhost:${PORT}`);
  });
}

startServer();
