export function cleanTextForSpeech(raw: string, maxChars = 850): string {
  const cleaned = raw
    .replace(/```[\s\S]*?```/g, " ")
    .replace(/[*#_`>~]/g, " ")
    .replace(/\[([^\]]+)\]\([^)]+\)/g, "$1")
    .replace(/\s+/g, " ")
    .trim();

  if (cleaned.length <= maxChars) return cleaned;
  const slice = cleaned.slice(0, maxChars);
  const lastSpace = slice.lastIndexOf(" ");
  return (lastSpace > maxChars * 0.6 ? slice.slice(0, lastSpace) : slice).trim();
}

export interface ReadableQuizPayload {
  question: string;
  options?: string[];
}

export function formatQuizPayloadForSpeech(payload: ReadableQuizPayload, uz = true): string {
  const q = cleanTextForSpeech(payload.question, 420);
  if (!q) return "";
  const opts = (payload.options || [])
    .map((opt, idx) => {
      const letter = String.fromCharCode(65 + idx);
      return `${letter}: ${cleanTextForSpeech(opt, 110)}`;
    })
    .filter((line) => line.length > 3);

  if (opts.length === 0) return q;
  const prefix = uz ? "Variantlar:" : "Варианты:";
  const sep = /[.!?]$/.test(q) ? "" : ".";
  return cleanTextForSpeech(`${q}${sep} ${prefix} ${opts.join(". ")}.`, 850);
}

export function readVisiblePageText(): string {
  if (typeof document === "undefined") return "";

  try {
    const sel = window.getSelection?.()?.toString().trim();
    if (sel && sel.length >= 6) {
      return cleanTextForSpeech(sel);
    }
  } catch {
    // ignore selection errors
  }

  const activeEl = document.querySelector("[data-tts-readable='active']");
  if (activeEl) {
    const qEl = activeEl.querySelector("[data-tts-question]");
    const optEls = Array.from(activeEl.querySelectorAll("[data-tts-option]"));
    if (qEl?.textContent) {
      const formatted = formatQuizPayloadForSpeech(
        {
          question: qEl.textContent,
          options: optEls.map((el) => el.textContent || "").filter(Boolean),
        },
        document.documentElement.lang !== "ru",
      );
      if (formatted) return formatted;
    }
    if (activeEl.textContent?.trim()) {
      return cleanTextForSpeech(activeEl.textContent);
    }
  }

  const mainHeading = document.querySelector("main h1, main h2, main h3");
  const mainPara = document.querySelector("main p");
  const combined = [mainHeading?.textContent, mainPara?.textContent].filter(Boolean).join(". ");
  return cleanTextForSpeech(combined);
}
