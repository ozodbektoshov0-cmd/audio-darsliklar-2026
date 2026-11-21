import { hasApiKey } from "../server-lib/ai";

export function GET() {
  return Response.json({ status: "ok", hasApiKey: hasApiKey(), timestamp: new Date().toISOString() });
}
