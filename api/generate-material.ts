import { rateLimited, tooMany } from "../server-lib/ai";
import { handleGenerateMaterial } from "../server-lib/materialGen";

export async function POST(request: Request) {
  const ip = (request.headers.get("x-forwarded-for") || "anon").split(",")[0].trim();
  if (rateLimited(`mat:${ip}`)) {
    const r = tooMany();
    return Response.json(r.body, { status: r.status });
  }
  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return Response.json({ error: "Noto'g'ri JSON formati", code: "INVALID_JSON" }, { status: 400 });
  }
  const r = await handleGenerateMaterial(body);
  return Response.json(r.body, { status: r.status });
}
