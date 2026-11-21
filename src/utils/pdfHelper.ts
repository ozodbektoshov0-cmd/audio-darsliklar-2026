/**
 * PDF havolalari bilan ishlash yordamchilari.
 */

const DRIVE_ID_RE = /drive\.google\.com\/(?:file\/d\/|open\?id=|uc\?(?:export=\w+&)?id=)([\w-]{20,})/;

export function getDriveId(url?: string | null): string | null {
  if (!url) return null;
  const m = url.match(DRIVE_ID_RE);
  return m ? m[1] : null;
}

/**
 * Eski old.eduportal.uz serveri (403 qaytaradi) havolalarini umumiy kutubxonaga yo'naltiradi.
 */
export function getSafePdfUrl(url?: string | null): string {
  if (!url) return "#";
  if (url.includes("old.eduportal.uz")) {
    return "https://oliygoh.uz/kutubxona/maktab-darsliklari";
  }
  return url;
}

export type EmbedKind = "drive" | "pdf" | "none";

export interface EmbedInfo {
  kind: EmbedKind;
  /** iframe uchun manzil (kind !== "none" bo'lsa) */
  embedUrl: string | null;
  /** Yangi oynada ochish uchun manzil */
  openUrl: string;
  /** To'g'ridan-to'g'ri yuklab olish manzili (agar ma'lum bo'lsa) */
  downloadUrl: string | null;
}

/**
 * Havolani sayt ichida o'qish mumkinmi, aniqlaydi.
 *  - Google Drive: /preview ko'rinishi iframe'da ochiladi (fayl "havolasi borlar ko'ra oladi" bo'lishi kerak)
 *  - To'g'ridan-to'g'ri .pdf: brauzerning o'z PDF ko'rgichi
 *  - Boshqalar (t.me, umumiy sahifalar): faqat yangi oynada
 */
export function getEmbedInfo(url?: string | null): EmbedInfo {
  const safe = getSafePdfUrl(url);
  const id = getDriveId(safe);
  if (id) {
    return {
      kind: "drive",
      embedUrl: `https://drive.google.com/file/d/${id}/preview`,
      openUrl: `https://drive.google.com/file/d/${id}/view`,
      downloadUrl: `https://drive.google.com/uc?export=download&id=${id}`,
    };
  }
  if (/^https?:\/\/.+\.pdf(?:[?#].*)?$/i.test(safe) || safe.startsWith("/")) {
    return { kind: "pdf", embedUrl: safe, openUrl: safe, downloadUrl: safe };
  }
  return { kind: "none", embedUrl: null, openUrl: safe, downloadUrl: null };
}
