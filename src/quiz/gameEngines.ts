import type { ChoiceQuestion, FillQuestion, Question, Quiz } from "./types";
import { correctAnswerText, getCards, isChoiceLike, normalize, shuffle, shuffleOptions } from "./util";

/* ================== 1. UMUMIY SAVOL KONVERTORI ================== */

/** Har qanday savolni 4 variantli (yoki To'g'ri/Noto'g'ri) savolga aylantiradi — Jamoaviy o'yinlar uchun */
export function toPlayableChoiceQuestions(quiz: Quiz, uz = true): (ChoiceQuestion | { type: "truefalse"; q: string; answer: boolean; explain?: string })[] {
  const fillAnswers = quiz.questions
    .filter((q): q is FillQuestion => q.type === "fill")
    .map((q) => (Array.isArray(q.answer) ? q.answer[0] : q.answer));
  const fallbackPool = ["Adabiyot", "Tarix", "Bilim", "Hikmat", "Ijod", "Madaniyat", ...fillAnswers];

  const out: (ChoiceQuestion | { type: "truefalse"; q: string; answer: boolean; explain?: string })[] = [];
  for (const q of quiz.questions) {
    if (q.type === "choice") {
      out.push(shuffleOptions(q));
    } else if (q.type === "truefalse") {
      out.push(q);
    } else {
      const correct = Array.isArray(q.answer) ? q.answer[0] : q.answer;
      const distractors = shuffle(
        fallbackPool.filter((w) => normalize(w) !== normalize(correct)),
      ).slice(0, 3);
      if (distractors.length >= 2) {
        const opts = [correct, ...distractors];
        out.push(
          shuffleOptions({
            type: "choice",
            q: q.q,
            options: opts,
            answer: 0,
            explain: q.explain ?? (uz ? `To'g'ri javob: ${correct}` : `Правильный ответ: ${correct}`),
          }),
        );
      }
    }
  }
  return shuffle(out);
}

/* ================== 2. ANAGRAM & SO'Z QIDIRISH UCHUN SO'ZLAR ================== */

export interface WordPuzzleItem {
  /** Katakchalar va anagram uchun faqat harflardan iborat toza so'z (masalan: ALPOMISH) */
  word: string;
  /** Asl ko'rinishi */
  displayWord: string;
  /** So'zni topish uchun izoh/savol */
  hint: string;
}

export function sanitizeLettersOnly(raw: string): string {
  return raw
    .toUpperCase()
    .replace(/[ʻʼ’‘`´'\-\s.,!?;:«»"()]/g, "")
    .replace(/[^A-ZА-ЯЁЎҚҒҲ]/g, "");
}

export function extractWordPuzzles(quiz: Quiz, fallback?: Quiz, minCount = 6): WordPuzzleItem[] {
  const seen = new Set<string>();
  const items: WordPuzzleItem[] = [];

  const tryAdd = (rawWord: string, hint: string) => {
    const clean = sanitizeLettersOnly(rawWord);
    if (clean.length < 4 || clean.length > 11) return;
    if (seen.has(clean)) return;
    seen.add(clean);
    items.push({ word: clean, displayWord: rawWord.trim(), hint: hint.trim() });
  };

  const absorbQuiz = (source: Quiz) => {
    for (const [front, back] of getCards(source)) {
      const words = front.trim().split(/\s+/);
      if (words.length <= 2) {
        tryAdd(front, back);
      }
    }
    for (const q of source.questions) {
      if (q.type === "fill") {
        const ans = Array.isArray(q.answer) ? q.answer[0] : q.answer;
        if (ans.trim().split(/\s+/).length <= 2) {
          tryAdd(ans, q.q);
        }
      } else if (q.type === "choice") {
        const ans = q.options[q.answer];
        if (ans && ans.trim().split(/\s+/).length === 1) {
          tryAdd(ans, q.q);
        }
      }
    }
  };

  absorbQuiz(quiz);
  if (items.length < minCount && fallback) {
    absorbQuiz(fallback);
  }

  return items;
}

export interface ScrambledTile {
  id: number;
  char: string;
}

export function scrambleWordTiles(word: string): ScrambledTile[] {
  const chars = word.split("");
  const tiles = chars.map((char, id) => ({ id, char }));
  if (chars.length <= 1) return tiles;
  const allSame = chars.every((c) => c === chars[0]);
  if (allSame) return tiles;

  let shuffled = shuffle(tiles);
  for (let tries = 0; tries < 6; tries++) {
    if (shuffled.map((t) => t.char).join("") !== word) break;
    shuffled = shuffle(tiles);
  }
  return shuffled;
}

/* ================== 3. SO'Z QIDIRISH (WORD SEARCH) ================== */

export interface GridCoord {
  r: number;
  c: number;
}

export interface WordPlacement {
  word: string;
  displayWord: string;
  hint: string;
  cells: GridCoord[];
}

export interface WordSearchPuzzle {
  size: number;
  grid: string[][];
  placements: WordPlacement[];
}

const LATIN_FILL = "ABDEFGHIJKLMNOPQRSTUVXYZ";
const CYRILLIC_FILL = "АБВГДЕЖЗИЙКЛМНОПРСТУФХЦЧШЩЭЮЯ";

export function generateWordSearch(words: WordPuzzleItem[], size = 10): WordSearchPuzzle {
  const candidates = shuffle(words.filter((w) => w.word.length <= size)).slice(0, 8);
  const grid: (string | null)[][] = Array.from({ length: size }, () => Array<string | null>(size).fill(null));
  const placements: WordPlacement[] = [];

  const dirs: GridCoord[] = [
    { r: 0, c: 1 }, // gorizontal
    { r: 1, c: 0 }, // vertikal
    { r: 1, c: 1 }, // diagonal
  ];

  for (const item of candidates) {
    const letters = item.word.split("");
    let placed = false;
    const tryDirs = shuffle(dirs);

    for (const dir of tryDirs) {
      if (placed) break;
      const positions: GridCoord[] = [];
      for (let r = 0; r < size; r++) {
        for (let c = 0; c < size; c++) {
          positions.push({ r, c });
        }
      }
      for (const pos of shuffle(positions)) {
        const endR = pos.r + dir.r * (letters.length - 1);
        const endC = pos.c + dir.c * (letters.length - 1);
        if (endR < 0 || endR >= size || endC < 0 || endC >= size) continue;

        let fits = true;
        const cells: GridCoord[] = [];
        for (let k = 0; k < letters.length; k++) {
          const rr = pos.r + dir.r * k;
          const cc = pos.c + dir.c * k;
          const existing = grid[rr][cc];
          if (existing !== null && existing !== letters[k]) {
            fits = false;
            break;
          }
          cells.push({ r: rr, c: cc });
        }

        if (fits) {
          cells.forEach(({ r, c }, idx) => {
            grid[r][c] = letters[idx];
          });
          placements.push({
            word: item.word,
            displayWord: item.displayWord,
            hint: item.hint,
            cells,
          });
          placed = true;
          break;
        }
      }
    }
  }

  const hasCyrillic = placements.some((p) => /[А-ЯЁЎҚҒҲ]/.test(p.word));
  const alphabet = hasCyrillic ? CYRILLIC_FILL : LATIN_FILL;

  const finalGrid: string[][] = grid.map((row) =>
    row.map((cell) => cell ?? alphabet[Math.floor(Math.random() * alphabet.length)]),
  );

  return { size, grid: finalGrid, placements };
}

export function getLineCoords(start: GridCoord, end: GridCoord): GridCoord[] {
  const dr = end.r - start.r;
  const dc = end.c - start.c;
  const absR = Math.abs(dr);
  const absC = Math.abs(dc);

  // Faqat to'g'ri chiziq: gorizontal, vertikal yoki 45° diagonal
  if (dr !== 0 && dc !== 0 && absR !== absC) return [];
  const steps = Math.max(absR, absC);
  const stepR = dr === 0 ? 0 : dr / absR;
  const stepC = dc === 0 ? 0 : dc / absC;

  const coords: GridCoord[] = [];
  for (let i = 0; i <= steps; i++) {
    coords.push({ r: start.r + stepR * i, c: start.c + stepC * i });
  }
  return coords;
}

export function matchWordSearchSelection(
  puzzle: WordSearchPuzzle,
  start: GridCoord,
  end: GridCoord,
): WordPlacement | null {
  const line = getLineCoords(start, end);
  if (line.length < 2) return null;
  const forward = line.map(({ r, c }) => puzzle.grid[r]?.[c] ?? "").join("");
  const backward = forward.split("").reverse().join("");
  return (
    puzzle.placements.find(
      (p) =>
        (p.word === forward || p.word === backward) &&
        p.cells.length === line.length &&
        ((p.cells[0].r === line[0].r && p.cells[0].c === line[0].c) ||
          (p.cells[0].r === line[line.length - 1].r && p.cells[0].c === line[line.length - 1].c)),
    ) ?? null
  );
}

/* ================== 4. GAP TUZISH (SENTENCE BUILDER) ================== */

export interface SentencePuzzle {
  id: number;
  targetSentence: string;
  words: string[];
  shuffledTokens: { id: number; text: string }[];
  hint: string;
}

export function extractSentencePuzzles(quiz: Quiz, fallback?: Quiz, maxItems = 12): SentencePuzzle[] {
  const out: SentencePuzzle[] = [];
  const seen = new Set<string>();

  const tryAddSentence = (rawSentence: string, hint: string) => {
    const cleaned = rawSentence.replace(/\s+/g, " ").trim().replace(/[;:]$/, ".");
    const tokens = cleaned.split(" ").filter(Boolean);
    if (tokens.length < 4 || tokens.length > 10) return;
    const key = normalize(cleaned);
    if (seen.has(key)) return;
    seen.add(key);

    const indexed = tokens.map((text, id) => ({ id, text }));
    let mixed = shuffle(indexed);
    for (let k = 0; k < 5; k++) {
      if (mixed.map((m) => m.text).join(" ") !== tokens.join(" ")) break;
      mixed = shuffle(indexed);
    }

    out.push({
      id: out.length,
      targetSentence: tokens.join(" "),
      words: tokens,
      shuffledTokens: mixed,
      hint,
    });
  };

  const absorb = (src: Quiz) => {
    for (const q of src.questions) {
      if (q.explain) {
        const firstPart = q.explain.split(/(?<=[.!?])\s+/)[0] ?? q.explain;
        tryAddSentence(firstPart, q.q);
      }
      if (q.type === "truefalse" && q.answer === true) {
        tryAddSentence(q.q, "Darslik faktidan to'g'ri gap tuzing");
      }
    }
    for (const [front, back] of getCards(src)) {
      tryAddSentence(back, `Atama: ${front}`);
    }
  };

  absorb(quiz);
  if (out.length < 5 && fallback) absorb(fallback);

  return shuffle(out).slice(0, maxItems);
}

export function isSentenceSolved(pickedWords: string[], targetWords: string[]): boolean {
  if (pickedWords.length !== targetWords.length) return false;
  return normalize(pickedWords.join(" ")) === normalize(targetWords.join(" "));
}

/* ================== 5. BO'SH JOYNI TO'LDIRISH (CLOZE) ================== */

export interface ClozeItem {
  q: string;
  answer: string[];
  explain: string;
  suggestions: string[];
}

export function extractClozePuzzles(quiz: Quiz, fallback?: Quiz, maxItems = 15): ClozeItem[] {
  const out: ClozeItem[] = [];
  const seen = new Set<string>();
  const allWordCandidates: string[] = [];

  for (const q of [...quiz.questions, ...(fallback?.questions ?? [])]) {
    if (q.type === "fill") {
      const a = Array.isArray(q.answer) ? q.answer[0] : q.answer;
      allWordCandidates.push(a);
    } else if (q.type === "choice") {
      allWordCandidates.push(q.options[q.answer]);
    }
  }

  const makeSuggestions = (correct: string, extra?: string[]): string[] => {
    const pool = [...(extra ?? []), ...allWordCandidates].filter(
      (w) => normalize(w) !== normalize(correct) && w.trim().length > 0 && w.length <= 36,
    );
    const distractors = shuffle(Array.from(new Set(pool))).slice(0, 3);
    return shuffle([correct, ...distractors]);
  };

  const absorb = (src: Quiz) => {
    for (const q of src.questions) {
      if (q.type === "fill") {
        const ansArr = Array.isArray(q.answer) ? q.answer : [q.answer];
        const key = normalize(q.q);
        if (!seen.has(key)) {
          seen.add(key);
          out.push({
            q: q.q.includes("___") ? q.q : `${q.q} (___)`,
            answer: ansArr,
            explain: q.explain ?? `To'g'ri javob: ${ansArr[0]}`,
            suggestions: makeSuggestions(ansArr[0]),
          });
        }
      }
    }
    for (const q of src.questions) {
      if (out.length >= maxItems) break;
      if (q.type === "choice") {
        const correct = q.options[q.answer];
        if (!correct || correct.length > 35) continue;
        const key = normalize(q.q);
        if (seen.has(key)) continue;
        seen.add(key);
        const prompt = q.q.endsWith("?")
          ? `${q.q.slice(0, -1)} → ___`
          : `${q.q} — ___`;
        out.push({
          q: prompt,
          answer: [correct],
          explain: q.explain ?? `To'g'ri javob: ${correct}`,
          suggestions: shuffle(q.options),
        });
      }
    }
  };

  absorb(quiz);
  if (out.length < 5 && fallback) absorb(fallback);

  return shuffle(out).slice(0, maxItems);
}

/* ================== 6. SIRLI QUTI (MYSTERY BOX) ================== */

export type MysteryBoxKind = "question" | "gift" | "double" | "trap";

export interface MysteryBoxTile {
  id: number;
  kind: MysteryBoxKind;
  points: number;
  question?: ChoiceQuestion | { type: "truefalse"; q: string; answer: boolean; explain?: string };
}

export function buildMysteryBoxes(quiz: Quiz, count = 12, uz = true): MysteryBoxTile[] {
  const pool = toPlayableChoiceQuestions(quiz, uz);
  const templates: { kind: MysteryBoxKind; points: number }[] = [
    { kind: "question", points: 100 },
    { kind: "question", points: 150 },
    { kind: "question", points: 200 },
    { kind: "question", points: 250 },
    { kind: "question", points: 300 },
    { kind: "question", points: 150 },
    { kind: "question", points: 200 },
    { kind: "question", points: 100 },
    { kind: "gift", points: 200 },
    { kind: "gift", points: 150 },
    { kind: "double", points: 0 },
    { kind: "trap", points: -50 },
  ];

  const mixed = shuffle(templates.slice(0, count));
  let qIdx = 0;

  return mixed.map((tpl, idx) => {
    if (tpl.kind === "question" && pool.length > 0) {
      const question = pool[qIdx % pool.length];
      qIdx++;
      return { id: idx + 1, kind: "question", points: tpl.points, question };
    }
    if (tpl.kind === "question") {
      return { id: idx + 1, kind: "gift", points: tpl.points };
    }
    return { id: idx + 1, kind: tpl.kind, points: tpl.points };
  });
}

/* ================== 7. OMAD CHARXI (WHEEL OF FORTUNE) ================== */

export interface WheelSector {
  label: string;
  points: number;
  type: "question" | "bonus" | "double" | "penalty";
  color: string;
}

export const WHEEL_SECTORS: WheelSector[] = [
  { label: "+100", points: 100, type: "question", color: "#2563eb" },
  { label: "+200", points: 200, type: "question", color: "#059669" },
  { label: "Sovg'a +250", points: 250, type: "bonus", color: "#d97706" },
  { label: "+150", points: 150, type: "question", color: "#0284c7" },
  { label: "2x Ball", points: 0, type: "double", color: "#7c3aed" },
  { label: "+300", points: 300, type: "question", color: "#16a34a" },
  { label: "Jarima -50", points: -50, type: "penalty", color: "#dc2626" },
  { label: "+100", points: 100, type: "question", color: "#4f46e5" },
];

/**
 * G'ildirakni ma'lum sektor yuqori strelkaga to'g'ri keladigan qilib aylantiradi.
 */
export function computeNextWheelRotation(currentDeg: number, targetIndex: number, extraTurns = 4): number {
  const n = WHEEL_SECTORS.length;
  const sliceDeg = 360 / n;
  // Sektor i markazi (soat strelkasiga qarshi pointer tepada = 0deg)
  const sectorCenter = targetIndex * sliceDeg + sliceDeg / 2;
  const desiredMod = (360 - (sectorCenter % 360)) % 360;
  const currentMod = ((currentDeg % 360) + 360) % 360;
  let delta = desiredMod - currentMod;
  if (delta <= 0) delta += 360;
  return currentDeg + extraTurns * 360 + delta;
}

/* ================== 8. ARG'AMCHI TORTISH (TUG OF WAR) ================== */

export function applyTugStep(
  position: number,
  team: 1 | 2,
  isCorrect: boolean,
  threshold = 4,
): { nextPosition: number; winner: 1 | 2 | null } {
  const delta = team === 1 ? (isCorrect ? -1 : 0) : isCorrect ? 1 : 0;
  const clamped = Math.max(-threshold, Math.min(threshold, position + delta));
  const winner = clamped <= -threshold ? 1 : clamped >= threshold ? 2 : null;
  return { nextPosition: clamped, winner };
}

/* ================== 9. JEOPARDY ================== */

export interface JeopardyTile {
  id: string;
  category: string;
  points: number;
  question: ChoiceQuestion | { type: "truefalse"; q: string; answer: boolean; explain?: string };
}

export interface JeopardyCategoryColumn {
  title: string;
  tiles: JeopardyTile[];
}

export function buildJeopardyBoard(
  sourceQuizzes: Quiz[],
  fallbackQuiz?: Quiz,
  uz = true,
): JeopardyCategoryColumn[] {
  const pointLevels = [100, 200, 300, 400];

  // Agar bir nechta mavzu bo'lsa (masalan butun kitob), har bir ustun bitta mavzu bo'ladi
  if (sourceQuizzes.length >= 2) {
    const selected = shuffle(sourceQuizzes).slice(0, 4);
    return selected.map((quiz, colIdx) => {
      const pool = toPlayableChoiceQuestions(quiz, uz);
      const shortTitle = quiz.title.replace(/^\d+\.\s*/, "").slice(0, 28);
      return {
        title: shortTitle,
        tiles: pointLevels.map((pts, rowIdx) => ({
          id: `j-${colIdx}-${rowIdx}`,
          category: shortTitle,
          points: pts,
          question: pool[rowIdx % pool.length],
        })),
      };
    });
  }

  // Bitta mavzu bo'lsa — savollarni 4 ta bo'limga taqsimlaymiz
  const single = sourceQuizzes[0] ?? fallbackQuiz;
  if (!single) return [];
  const pool = toPlayableChoiceQuestions(single, uz);
  const fullPool =
    pool.length >= 16 || !fallbackQuiz
      ? pool
      : [...pool, ...toPlayableChoiceQuestions(fallbackQuiz, uz)];

  const colNames = uz
    ? ["Asosiy tushunchalar", "Asar va faktlar", "Mantiqiy savollar", "Tezkor sinov"]
    : ["Основные понятия", "Факты и детали", "Логика", "Блиц-вопросы"];

  return colNames.map((title, colIdx) => ({
    title,
    tiles: pointLevels.map((pts, rowIdx) => {
      const q = fullPool[(colIdx * 4 + rowIdx) % fullPool.length];
      return {
        id: `j-${colIdx}-${rowIdx}`,
        category: title,
        points: pts,
        question: q,
      };
    }),
  }));
}

export function getAnswerTextForAny(q: Question, uz = true): string {
  if (isChoiceLike(q)) return correctAnswerText(q, uz);
  return Array.isArray(q.answer) ? q.answer[0] : q.answer;
}
