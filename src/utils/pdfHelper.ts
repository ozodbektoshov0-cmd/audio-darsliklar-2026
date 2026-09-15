/**
 * Helper to ensure textbook PDF URLs are safe and accessible.
 * If a URL points to the deprecated old.eduportal.uz server (which returns HTTP 403 Forbidden),
 * this falls back to the verified public school textbooks library.
 */
export function getSafePdfUrl(url?: string): string {
  if (!url) return "#";
  if (url.includes("old.eduportal.uz")) {
    return "https://oliygoh.uz/kutubxona/maktab-darsliklari";
  }
  return url;
}
