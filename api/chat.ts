import { handleChat, rateLimited, tooMany } from "../server-lib/ai";
import { verifyBearerToken } from "../server-lib/authVerify";

export async function POST(request: Request) {
  const ip = (request.headers.get("x-forwarded-for") || "anon").split(",")[0].trim();
  if (rateLimited(`chat:${ip}`)) {
    const r = tooMany();
    return Response.json(r.body, { status: r.status });
  }
  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return Response.json({ error: "Noto'g'ri JSON formati", code: "INVALID_JSON" }, { status: 400 });
  }
  const authUser = await verifyBearerToken(request.headers.get("authorization"));
  const r = await handleChat(body, authUser);
  return Response.json(r.body, { status: r.status });
}
