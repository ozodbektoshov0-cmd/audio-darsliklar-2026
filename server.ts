import express from "express";
import path from "path";
import dotenv from "dotenv";
import { createServer as createViteServer } from "vite";
import { handleChat, handleTts, hasApiKey, rateLimited, tooMany } from "./server-lib/ai";

dotenv.config();
dotenv.config({ path: ".env.local" });

process.on("unhandledRejection", (reason) => console.error("Unhandled Rejection:", reason));
process.on("uncaughtException", (error) => console.error("Uncaught Exception:", error));

async function startServer() {
  const app = express();
  const PORT = Number(process.env.PORT) || 3000;

  app.set("trust proxy", 1);
  app.use(express.json({ limit: "1mb" }));

  // JSON xatolarini ushlash
  app.use((err: any, _req: express.Request, res: express.Response, next: express.NextFunction) => {
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
    const r = await handleChat(req.body);
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

  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({ server: { middlewareMode: true }, appType: "spa" });
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

  app.listen(PORT, "0.0.0.0", () => console.log(`Server running on http://localhost:${PORT}`));
}

startServer();
