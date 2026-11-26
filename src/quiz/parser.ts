import type { ChoiceQuestion, Question } from "./types";

export interface ParsedTestResult {
  questions: Question[];
  cards: [string, string][];
}

const OPTION_RE = /^\s*(\*|\+)?\s*([A-Da-dА-Га-г1-4])[).:\]]\s*(.+?)\s*(\*)?\s*$/;
const ANSWER_RE =
  /^\s*(?:to['ʻ’`]?g['ʻ’`]?ri\s*javob|javob|ответ|правильный\s*ответ|answer|ans|kalit|ключ)\s*[:\-–—]\s*(.+)$/i;
const EXPLAIN_RE = /^\s*(?:izoh|tushuntirish|пояснение|объяснение|explanation)\s*[:\-–—]\s*(.+)$/i;
const QUESTION_START_RE = /^\s*(?:№\s*)?(\d{1,4})[).:\]]\s+(.+)$/;

function letterToIndex(token: string): number {
  const c = token.trim().toUpperCase().replace(/[^A-DА-Г1-4]/g, "");
  if (c === "A" || c === "А" || c === "1") return 0;
  if (c === "B" || c === "Б" || c === "2") return 1;
  if (c === "C" || c === "В" || c === "С" || c === "3") return 2;
  if (c === "D" || c === "Г" || c === "Д" || c === "4") return 3;
  return -1;
}

function sanitizeQuestion(raw: unknown): Question | null {
  if (!raw || typeof raw !== "object") return null;
  const r = raw as Record<string, unknown>;
  const qText = typeof r.q === "string" ? r.q.trim() : "";
  if (qText.length < 2) return null;
  const explain = typeof r.explain === "string" && r.explain.trim() ? r.explain.trim() : undefined;

  if (r.type === "truefalse" && typeof r.answer === "boolean") {
    return { type: "truefalse", q: qText, answer: r.answer, explain };
  }
  if (r.type === "fill" && typeof r.answer === "string" && r.answer.trim()) {
    return { type: "fill", q: qText, answer: r.answer.trim(), explain };
  }
  if (r.type === "choice" && Array.isArray(r.options)) {
    const opts = r.options.map((o) => String(o).trim()).filter(Boolean).slice(0, 6);
    const ans = typeof r.answer === "number" && Number.isInteger(r.answer) ? r.answer : 0;
    if (opts.length >= 2 && ans >= 0 && ans < opts.length) {
      return { type: "choice", q: qText, options: opts, answer: ans, explain };
    }
  }
  return null;
}

/**
 * Turli formatlardagi matn/JSON dan savollarni avtomatik ajratib oladi:
 * 1) JSON massiv yoki { questions: [...] }
 * 2) Raqamlangan A) B) C) D) test bloklari (* yoki Javob: bilan)
 * 3) Savol | To'g'ri | Variant 2 | Variant 3
 * 4) So'z = Izoh
 */
export function parseTestContent(rawText: string): ParsedTestResult {
  const trimmed = rawText.trim();
  if (!trimmed) return { questions: [], cards: [] };

  // 1. JSON formati
  if (trimmed.startsWith("{") || trimmed.startsWith("[")) {
    try {
      const parsed = JSON.parse(trimmed);
      const list = Array.isArray(parsed)
        ? parsed
        : Array.isArray(parsed?.questions)
          ? parsed.questions
          : [];
      const questions = list.map(sanitizeQuestion).filter((x: Question | null): x is Question => x !== null);
      if (questions.length > 0) {
        const cards: [string, string][] = [];
        for (const q of questions) {
          if (q.type === "choice") {
            const ans = q.options[q.answer];
            if (ans && ans.length <= 45) cards.push([ans, q.q]);
          } else if (q.type === "fill") {
            const ans = Array.isArray(q.answer) ? q.answer[0] : q.answer;
            if (ans && ans.length <= 45) cards.push([ans, q.q]);
          }
        }
        return { questions, cards };
      }
    } catch {
      // Matn parseriga o'tamiz
    }
  }

  const lines = trimmed.replace(/\r\n?/g, "\n").split("\n");
  const questions: Question[] = [];
  const cards: [string, string][] = [];

  // 2. Blokli raqamlangan testlarni tahlil qilish
  interface DraftBlock {
    qLines: string[];
    options: string[];
    optionsAreNumeric: boolean;
    markedCorrectIdx: number;
    answerText: string | null;
    explain: string | null;
  }

  let current: DraftBlock | null = null;

  const flushBlock = () => {
    if (!current) return;
    const qText = current.qLines.join(" ").replace(/\s+/g, " ").trim();
    if (qText.length >= 2 && current.options.length >= 2) {
      let answerIdx = current.markedCorrectIdx;
      if (answerIdx < 0 && current.answerText) {
        const idxFromLetter = letterToIndex(current.answerText);
        if (idxFromLetter >= 0 && idxFromLetter < current.options.length) {
          answerIdx = idxFromLetter;
        } else {
          const normAns = current.answerText.toLowerCase();
          const matchIdx = current.options.findIndex((o) => o.toLowerCase() === normAns);
          if (matchIdx >= 0) answerIdx = matchIdx;
        }
      }
      if (answerIdx < 0 || answerIdx >= current.options.length) answerIdx = 0;

      const qObj: ChoiceQuestion = {
        type: "choice",
        q: qText,
        options: current.options.slice(0, 6),
        answer: answerIdx,
        ...(current.explain ? { explain: current.explain } : {}),
      };
      questions.push(qObj);
      const ans = qObj.options[qObj.answer];
      if (ans && ans.length <= 45) cards.push([ans, qObj.q]);
    } else if (qText.length >= 2 && current.answerText && current.options.length === 0) {
      const lower = current.answerText.trim().toLowerCase();
      if (lower === "to'g'ri" || lower === "tog'ri" || lower === "true" || lower === "верно") {
        questions.push({ type: "truefalse", q: qText, answer: true, ...(current.explain ? { explain: current.explain } : {}) });
      } else if (lower === "noto'g'ri" || lower === "notog'ri" || lower === "false" || lower === "неверно") {
        questions.push({ type: "truefalse", q: qText, answer: false, ...(current.explain ? { explain: current.explain } : {}) });
      } else {
        questions.push({
          type: "fill",
          q: qText,
          answer: current.answerText.trim(),
          ...(current.explain ? { explain: current.explain } : {}),
        });
        if (current.answerText.trim().length <= 45) cards.push([current.answerText.trim(), qText]);
      }
    }
    current = null;
  };

  for (let i = 0; i < lines.length; i++) {
    const line = lines[i].trim();
    if (!line) {
      if (current && current.options.length >= 2) {
        let j = i + 1;
        while (j < lines.length && !lines[j].trim()) j++;
        const nextLine = j < lines.length ? lines[j].trim() : "";
        if (!ANSWER_RE.test(nextLine) && !EXPLAIN_RE.test(nextLine) && !OPTION_RE.test(nextLine)) {
          flushBlock();
        }
      }
      continue;
    }

    // Pipe format: Savol | To'g'ri | Variant 2 | Variant 3
    if (line.includes("|") && (!current || current.options.length === 0)) {
      flushBlock();
      const parts = line
        .split("|")
        .map((p) => p.trim())
        .filter(Boolean);
      if (parts.length >= 3) {
        const [q, correct, ...others] = parts;
        questions.push({
          type: "choice",
          q,
          options: [correct, ...others].slice(0, 6),
          answer: 0,
        });
        if (correct.length <= 45) cards.push([correct, q]);
        continue;
      } else if (parts.length === 2) {
        questions.push({ type: "fill", q: parts[0], answer: parts[1] });
        if (parts[1].length <= 45) cards.push([parts[1], parts[0]]);
        continue;
      }
    }

    // Key = Value format (So'z = Izoh)
    if (!current && line.includes("=") && !QUESTION_START_RE.test(line)) {
      const eqIdx = line.indexOf("=");
      const word = line.slice(0, eqIdx).trim();
      const clue = line.slice(eqIdx + 1).trim();
      if (word && clue && word.length <= 50) {
        cards.push([word, clue]);
        questions.push({
          type: "fill",
          q: `${clue} — ___`,
          answer: word,
          explain: `${word}: ${clue}`,
        });
        continue;
      }
    }

    const ansMatch = line.match(ANSWER_RE);
    if (ansMatch && current) {
      current.answerText = ansMatch[1].trim();
      continue;
    }

    const expMatch = line.match(EXPLAIN_RE);
    if (expMatch && current) {
      current.explain = expMatch[1].trim();
      continue;
    }

    const optMatch = line.match(OPTION_RE);
    if (optMatch && current) {
      const label = optMatch[2];
      const isDigit = /^[1-4]$/.test(label);
      const digitVal = isDigit ? Number(label) : -1;
      const isValidOption = !isDigit || (
        current.options.length === 0
          ? digitVal === 1
          : current.optionsAreNumeric && digitVal === current.options.length + 1
      );

      if (isValidOption) {
        const isMarked = Boolean(optMatch[1] || optMatch[4]);
        const optText = optMatch[3].replace(/^\*+|\*+$/g, "").trim();
        if (optText) {
          if (current.options.length === 0 && isDigit) {
            current.optionsAreNumeric = true;
          }
          if (isMarked) current.markedCorrectIdx = current.options.length;
          current.options.push(optText);
        }
        continue;
      }
    }

    const qMatch = line.match(QUESTION_START_RE);
    if (qMatch) {
      flushBlock();
      current = {
        qLines: [qMatch[2].trim()],
        options: [],
        optionsAreNumeric: false,
        markedCorrectIdx: -1,
        answerText: null,
        explain: null,
      };
      continue;
    }

    // Agar hozirgi savol davom etayotgan bo'lsa
    if (current) {
      if (current.options.length === 0) {
        current.qLines.push(line);
      } else {
        // Oxirgi variantning davomi
        current.options[current.options.length - 1] += " " + line;
      }
    } else if (line.endsWith("?")) {
      current = {
        qLines: [line],
        options: [],
        optionsAreNumeric: false,
        markedCorrectIdx: -1,
        answerText: null,
        explain: null,
      };
    }
  }

  flushBlock();
  return { questions, cards };
}
