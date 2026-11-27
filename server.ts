import http from "http";
import express from "express";
import path from "path";
import dotenv from "dotenv";
import { createServer as createViteServer } from "vite";
import { WebSocketServer } from "ws";
import { Modality, type LiveServerMessage } from "@google/genai";
import {
  createGeminiClient,
  handleChat,
  handleTts,
  hasApiKey,
  rateLimited,
  tooMany,
  VALID_VOICES,
} from "./server-lib/ai";
import { verifyBearerToken } from "./server-lib/authVerify";
import { handleParseTestFile } from "./server-lib/testParser";
import { handleGenerateMaterial } from "./server-lib/materialGen";
import { handleGenerateSlides, handleTranscribeAudio } from "./server-lib/mediaAi";

dotenv.config();
dotenv.config({ path: ".env.local" });

process.on("unhandledRejection", (reason) => console.error("Unhandled Rejection:", reason));
process.on("uncaughtException", (error) => console.error("Uncaught Exception:", error));

async function startServer() {
  const app = express();
  const httpServer = http.createServer(app);
  const PORT = Number(process.env.PORT) || 3000;

  app.set("trust proxy", 1);
  // 6mb JSON matches 4MB raw base64 payload safely (aligned with Vercel cap)
  app.use(express.json({ limit: "6mb" }));

  // JSON va PayloadTooLarge xatolarini ushlash
  app.use((err: any, _req: express.Request, res: express.Response, next: express.NextFunction) => {
    if (err?.type === "entity.too.large" || err?.status === 413) {
      return res.status(413).json({ error: "Fayl hajmi 4 MB dan oshmasligi kerak.", code: "PAYLOAD_TOO_LARGE" });
    }
    if (err instanceof SyntaxError && "body" in err) {
      return res.status(400).json({ error: "Noto'g'ri JSON formati", code: "INVALID_JSON" });
    }
    next(err);
  });

  app.get("/api/health", (_req, res) => {
    res.json({ status: "ok", hasApiKey: hasApiKey(), timestamp: new Date().toISOString() });
  });

  app.post("/api/chat", async (req, res) => {
    if (rateLimited(`chat:${req.ip}`)) {
      const r = tooMany();
      return res.status(r.status).json(r.body);
    }
    const authUser = await verifyBearerToken(req.headers.authorization);
    const r = await handleChat(req.body, authUser);
    res.status(r.status).json(r.body);
  });

  app.post("/api/tts", async (req, res) => {
    if (rateLimited(`tts:${req.ip}`)) {
      const r = tooMany();
      return res.status(r.status).json(r.body);
    }
    const r = await handleTts(req.body);
    res.status(r.status).json(r.body);
  });

  app.post("/api/transcribe", async (req, res) => {
    if (rateLimited(`transcribe:${req.ip}`)) {
      const r = tooMany();
      return res.status(r.status).json(r.body);
    }
    const r = await handleTranscribeAudio(req.body);
    res.status(r.status).json(r.body);
  });

  app.post("/api/slides", async (req, res) => {
    if (rateLimited(`slides:${req.ip}`)) {
      const r = tooMany();
      return res.status(r.status).json(r.body);
    }
    const r = await handleGenerateSlides(req.body);
    res.status(r.status).json(r.body);
  });

  app.post("/api/parse-tests", async (req, res) => {
    if (rateLimited(`parse:${req.ip}`)) {
      const r = tooMany();
      return res.status(r.status).json(r.body);
    }
    const r = await handleParseTestFile(req.body);
    res.status(r.status).json(r.body);
  });

  app.post("/api/generate-material", async (req, res) => {
    if (rateLimited(`mat:${req.ip}`)) {
      const r = tooMany();
      return res.status(r.status).json(r.body);
    }
    const r = await handleGenerateMaterial(req.body);
    res.status(r.status).json(r.body);
  });

  // Live API WebSocket bridge (/api/live)
  const liveWss = new WebSocketServer({ noServer: true, maxPayload: 1024 * 1024 });

  httpServer.on("upgrade", (req, socket, head) => {
    try {
      const parsed = new URL(req.url || "/", "http://localhost");
      if (parsed.pathname === "/api/live") {
        liveWss.handleUpgrade(req, socket, head, (ws) => {
          liveWss.emit("connection", ws, req);
        });
      }
    } catch {
      // Leave other upgrades (e.g. Vite HMR) untouched
    }
  });

  liveWss.on("connection", async (clientWs, req) => {
    const ai = createGeminiClient();
    if (!ai) {
      clientWs.send(JSON.stringify({ error: "Jonli ovozli suhbat uchun GEMINI_API_KEY sozlanmagan." }));
      clientWs.close(1008, "NO_API_KEY");
      return;
    }

    const parsed = new URL(req.url || "/", "http://localhost");
    const reqVoice = parsed.searchParams.get("voice") || "Zephyr";
    const voice = VALID_VOICES.includes(reqVoice as any) ? reqVoice : "Zephyr";
    const lang = parsed.searchParams.get("lang") === "ru" ? "ru" : "uz";
    const gradeParam = Number(parsed.searchParams.get("grade"));
    const grade = Number.isInteger(gradeParam) && gradeParam >= 1 && gradeParam <= 11 ? gradeParam : null;

    let session: any = null;
    let closed = false;

    try {
      const systemInstruction =
        lang === "uz"
          ? `Siz Audio Darsliklar 2026 platformasining jonli ovozli AI ustozisiz.${grade ? ` O'quvchi ${grade}-sinf.` : ""} Savollarga o'zbek tilida qisqa, tushunarli va samimiy ovozda javob bering.`
          : `Вы живой голосовой ИИ-учитель платформы Audio Darsliklar 2026.${grade ? ` Ученик ${grade} класса.` : ""} Отвечайте кратко, понятно и дружелюбно на русском языке.`;

      session = await ai.live.connect({
        model: "gemini-3.8-live",
        config: {
          responseModalities: [Modality.AUDIO],
          inputAudioTranscription: {},
          outputAudioTranscription: {},
          speechConfig: {
            voiceConfig: { prebuiltVoiceConfig: { voiceName: voice } },
          },
          systemInstruction,
        },
        callbacks: {
          onmessage: (message: LiveServerMessage) => {
            if (closed || clientWs.readyState !== 1) return;
            const content = message.serverContent;
            if (content?.inputTranscription?.text) {
              clientWs.send(JSON.stringify({ inputTranscript: content.inputTranscription.text }));
            }
            if (content?.outputTranscription?.text) {
              clientWs.send(JSON.stringify({ outputTranscript: content.outputTranscription.text }));
            }
            for (const part of content?.modelTurn?.parts ?? []) {
              if (part.inlineData?.data) {
                clientWs.send(JSON.stringify({ audio: part.inlineData.data }));
              }
            }
            if (content?.interrupted) {
              clientWs.send(JSON.stringify({ interrupted: true }));
            }
            if (content?.turnComplete) {
              clientWs.send(JSON.stringify({ turnComplete: true }));
            }
          },
          onerror: (err: any) => {
            if (!closed && clientWs.readyState === 1) {
              clientWs.send(JSON.stringify({ error: String(err?.message || "Live API xatoligi") }));
            }
          },
          onclose: () => {
            if (!closed && clientWs.readyState === 1) {
              clientWs.close();
            }
          },
        },
      });

      if (clientWs.readyState === 1) {
        clientWs.send(JSON.stringify({ ready: true, voice }));
      }
    } catch (err: any) {
      console.error("[live] connect error:", err?.message || err);
      if (clientWs.readyState === 1) {
        clientWs.send(JSON.stringify({ error: "Jonli ovozli AI sessiyasini ochib bo'lmadi." }));
        clientWs.close();
      }
      return;
    }

    clientWs.on("message", (raw) => {
      if (!session || closed) return;
      try {
        const msg = JSON.parse(raw.toString());
        if (typeof msg.audio === "string" && msg.audio.length > 0) {
          session.sendRealtimeInput({
            audio: { data: msg.audio, mimeType: "audio/pcm;rate=16000" },
          });
        } else if (typeof msg.text === "string" && msg.text.trim()) {
          session.sendRealtimeInput({ text: msg.text.trim().slice(0, 1000) });
        }
      } catch {
        // ignore malformed frames
      }
    });

    clientWs.on("close", () => {
      closed = true;
      try {
        session?.close();
      } catch {
        // ignore
      }
    });
  });

  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true, hmr: process.env.DISABLE_HMR ? false : undefined },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), "dist");
    app.use(express.static(distPath));
    app.get("*", (_req, res) => res.sendFile(path.join(distPath, "index.html")));
  }

  app.use((err: any, _req: express.Request, res: express.Response, _next: express.NextFunction) => {
    console.error("Express Error Handler:", err);
    if (!res.headersSent) {
      res.status(err?.status || 500).json({ error: "Serverda xatolik yuz berdi" });
    }
  });

  httpServer.listen(PORT, "0.0.0.0", () => console.log(`Server running on http://localhost:${PORT}`));
}

startServer();
