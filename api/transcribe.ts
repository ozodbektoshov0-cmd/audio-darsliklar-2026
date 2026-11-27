import { rateLimited, tooMany } from "../server-lib/ai";
import { handleTranscribeAudio } from "../server-lib/mediaAi";

export async function POST(request: Request) {
  const ip = (request.headers.get("x-forwarded-for") || "anon").split(",")[0].trim();
  if (rateLimited(`transcribe:${ip}`)) {
    const r = tooMany();
    return Response.json(r.body, { status: r.status });
  }
  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return Response.json({ error: "Noto'g'ri JSON formati", code: "INVALID_JSON" }, { status: 400 });
  }
  const r = await handleTranscribeAudio(body);
  return Response.json(r.body, { status: r.status });
}
