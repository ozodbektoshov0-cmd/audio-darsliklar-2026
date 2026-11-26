import firebaseConfig from "../firebase-applet-config.json";

export interface VerifiedAuthUser {
  uid: string;
  emailVerified: boolean;
}

const tokenCache = new Map<string, { user: VerifiedAuthUser | null; expiresAt: number }>();

/**
 * Verifies a Firebase Auth ID token passed via Authorization: Bearer <token>.
 * Uses Google's tokeninfo endpoint with a short local cache so Express and Vercel
 * serverless functions can protect costly Pro/Search AI options without requiring admin keys.
 */
export async function verifyBearerToken(authHeader: string | null | undefined): Promise<VerifiedAuthUser | null> {
  if (!authHeader || typeof authHeader !== "string") return null;
  const match = authHeader.match(/^Bearer\s+([A-Za-z0-9\-_.]+)$/i);
  if (!match) return null;
  const token = match[1];
  if (token.length < 40 || token.length > 4096) return null;

  const now = Date.now();
  const cached = tokenCache.get(token);
  if (cached && cached.expiresAt > now) {
    return cached.user;
  }

  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), 3000);
  try {
    const res = await fetch(
      `https://oauth2.googleapis.com/tokeninfo?id_token=${encodeURIComponent(token)}`,
      { signal: controller.signal },
    );
    if (!res.ok) {
      tokenCache.set(token, { user: null, expiresAt: now + 60_000 });
      return null;
    }
    const info = (await res.json()) as Record<string, unknown>;
    const aud = typeof info.aud === "string" ? info.aud : "";
    const sub = typeof info.sub === "string" ? info.sub : "";
    const emailVerified = info.email_verified === "true" || info.email_verified === true;
    const expSec = Number(info.exp || 0);

    if (!sub || aud !== firebaseConfig.projectId || (expSec && expSec * 1000 < now)) {
      tokenCache.set(token, { user: null, expiresAt: now + 60_000 });
      return null;
    }

    const user: VerifiedAuthUser = { uid: sub, emailVerified };
    const ttl = expSec ? Math.min(300_000, Math.max(10_000, expSec * 1000 - now)) : 120_000;
    tokenCache.set(token, { user, expiresAt: now + ttl });
    if (tokenCache.size > 500) {
      for (const [k, v] of tokenCache) {
        if (v.expiresAt <= now) tokenCache.delete(k);
      }
    }
    return user;
  } catch {
    return null;
  } finally {
    clearTimeout(timer);
  }
}
