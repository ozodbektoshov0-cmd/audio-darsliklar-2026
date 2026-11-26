import type { ChoiceQuestion, FillQuestion, Question, Quiz } from "./types";
import { correctAnswerText, getCards, isChoiceLike, normalize, shuffle, shuffleOptions } from "./util";

/* ================== 1. UMUMIY SAVOL KONVERTORI ================== */

/** Har qanday savolni 4 variantli (yoki To'g'ri/Noto'g'ri) savolga aylantiradi — Jamoaviy o'yinlar uchun */
export function toPlayableChoiceQuestions(
  quiz: Quiz,
  uz = true,
): (ChoiceQuestion | { type: "truefalse"; q: string; answer: boolean; explain?: string })[] {
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

export function computeNextWheelRotation(currentDeg: number, targetIndex: number, extraTurns = 4): number {
  const n = WHEEL_SECTORS.length;
  const sliceDeg = 360 / n;
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

/* ================== 10. BILIM POYGASI (QUIZ RACE) ================== */

export function scoreRaceStep(
  currentProgress: number,
  isCorrect: boolean,
  targetSteps = 8,
): { nextProgress: number; finished: boolean } {
  const next = isCorrect ? Math.min(targetSteps, currentProgress + 1) : currentProgress;
  return { nextProgress: next, finished: next >= targetSteps };
}

/* ================== 11. HA / YO'Q BLITS (TRUE/FALSE BLITZ) ================== */

export function scoreTrueFalseStreak(
  currentStreak: number,
  isCorrect: boolean,
): { nextStreak: number; multiplier: number; deltaPoints: number } {
  if (!isCorrect) {
    return { nextStreak: 0, multiplier: 1, deltaPoints: 0 };
  }
  const nextStreak = currentStreak + 1;
  const multiplier = nextStreak >= 5 ? 3 : nextStreak >= 3 ? 2 : 1;
  return { nextStreak, multiplier, deltaPoints: 50 * multiplier };
}

/* ================== 12. MATEMATIK DUEL (MATH DUEL) ================== */

export interface MathDuelProblem {
  prompt: string;
  answer: number;
  options: number[];
  explain: string;
}

export function buildMathDuelProblems(gradeNum = 7, count = 12): MathDuelProblem[] {
  const level = Math.max(1, Math.min(11, gradeNum));
  const items: MathDuelProblem[] = [];

  for (let i = 0; i < count; i++) {
    let prompt = "";
    let ans = 0;
    let explain = "";

    const mode = i % 4;
    if (level <= 4) {
      const a = 8 + ((i * 7 + level * 3) % 35);
      const b = 3 + ((i * 5 + level * 2) % 18);
      if (mode === 0) {
        ans = a + b;
        prompt = `${a} + ${b} = ?`;
        explain = `${a} + ${b} = ${ans}`;
      } else if (mode === 1) {
        const hi = Math.max(a, b) + 10;
        const lo = Math.min(a, b);
        ans = hi - lo;
        prompt = `${hi} − ${lo} = ?`;
        explain = `${hi} − ${lo} = ${ans}`;
      } else if (mode === 2) {
        const x = 2 + (i % 8);
        const y = 3 + ((i + level) % 7);
        ans = x * y;
        prompt = `${x} × ${y} = ?`;
        explain = `${x} · ${y} = ${ans}`;
      } else {
        const div = 2 + (i % 6);
        const q = 3 + ((i + level) % 9);
        const num = div * q;
        ans = q;
        prompt = `${num} : ${div} = ?`;
        explain = `${num} : ${div} = ${q}`;
      }
    } else if (level <= 8) {
      if (mode === 0) {
        const k = 2 + (i % 5);
        const x = 3 + ((i + level) % 11);
        const b = 4 + (i % 9);
        const right = k * x + b;
        ans = x;
        prompt = `${k}x + ${b} = ${right} ⇒ x = ?`;
        explain = `${k}x = ${right - b} ⇒ x = ${x}`;
      } else if (mode === 1) {
        const base = 10 + (i % 15);
        const pct = [10, 20, 25, 50][i % 4];
        const whole = base * (100 / pct > 4 ? 10 : 4);
        ans = Math.round((whole * pct) / 100);
        prompt = `${whole} ning ${pct}% i nechaga teng?`;
        explain = `${whole} × ${pct} / 100 = ${ans}`;
      } else if (mode === 2) {
        const n = 4 + (i % 12);
        ans = n * n;
        prompt = `${n}² = ?`;
        explain = `${n} × ${n} = ${ans}`;
      } else {
        const a = 4 + (i % 9);
        const b = 3 + ((i + 2) % 8);
        ans = 2 * (a + b);
        prompt = `Tomonlari ${a} sm va ${b} sm bo'lgan to'g'ri to'rtburchak perimetri?`;
        explain = `P = 2·(${a} + ${b}) = ${ans} sm`;
      }
    } else {
      if (mode === 0) {
        const x = 2 + (i % 8);
        ans = x * x + 2 * x;
        prompt = `f(x) = x² + 2x bo'lsa, f(${x}) = ?`;
        explain = `${x}² + 2·${x} = ${x * x} + ${2 * x} = ${ans}`;
      } else if (mode === 1) {
        const a1 = 2 + (i % 7);
        const d = 3 + (i % 4);
        const n = 5;
        ans = a1 + (n - 1) * d;
        prompt = `Arifmetik progressiyada a₁ = ${a1}, d = ${d}. a₅ = ?`;
        explain = `a₅ = ${a1} + 4·${d} = ${ans}`;
      } else if (mode === 2) {
        const b = 2 + (i % 5);
        const p = 3 + (i % 4);
        ans = b ** p;
        prompt = `${b}^${p} = ?`;
        explain = `${b} ning ${p}-darajasi = ${ans}`;
      } else {
        const n = 3 + (i % 6);
        ans = n * (n - 1);
        prompt = `n = ${n} bo'lsa, n(n − 1) = ?`;
        explain = `${n} · (${n} − 1) = ${ans}`;
      }
    }

    const distSet = new Set<number>([ans]);
    const offsets = [1, -1, 2, -2, 4, -3, 5, 10, -5];
    for (const off of offsets) {
      if (distSet.size >= 4) break;
      const cand = ans + off;
      if (cand >= 0 && !distSet.has(cand)) distSet.add(cand);
    }
    const options = shuffle(Array.from(distSet));
    items.push({ prompt, answer: ans, options, explain });
  }

  return items;
}

/* ================== 13. KROSSVORD (CROSSWORD ENGINE) ================== */

export interface CrosswordEntry {
  number: number;
  direction: "across" | "down";
  word: string;
  displayWord: string;
  hint: string;
  row: number;
  col: number;
}

export interface CrosswordPuzzle {
  rows: number;
  cols: number;
  solutionGrid: (string | null)[][];
  numberGrid: (number | null)[][];
  entries: CrosswordEntry[];
}

export function buildCrosswordGrid(words: WordPuzzleItem[], maxWords = 6): CrosswordPuzzle {
  const candidates = words
    .filter((w) => w.word.length >= 4 && w.word.length <= 10)
    .slice(0, 14);

  const size = 12;
  const grid: (string | null)[][] = Array.from({ length: size }, () => Array<string | null>(size).fill(null));
  const placed: Omit<CrosswordEntry, "number">[] = [];

  if (candidates.length === 0) {
    return {
      rows: 1,
      cols: 1,
      solutionGrid: [[null]],
      numberGrid: [[null]],
      entries: [],
    };
  }

  // Birinchi so'zni gorizontal markazga joylaymiz
  const first = candidates[0];
  const startRow = 4;
  const startCol = Math.max(0, Math.floor((size - first.word.length) / 2));
  for (let i = 0; i < first.word.length; i++) {
    grid[startRow][startCol + i] = first.word[i];
  }
  placed.push({
    direction: "across",
    word: first.word,
    displayWord: first.displayWord,
    hint: first.hint,
    row: startRow,
    col: startCol,
  });

  const canPlace = (word: string, row: number, col: number, dir: "across" | "down"): number => {
    if (row < 0 || col < 0) return -1;
    if (dir === "across" && col + word.length > size) return -1;
    if (dir === "down" && row + word.length > size) return -1;

    // So'z boshi va oxiri bo'sh bo'lishi kerak
    if (dir === "across") {
      if (col > 0 && grid[row][col - 1] !== null) return -1;
      if (col + word.length < size && grid[row][col + word.length] !== null) return -1;
    } else {
      if (row > 0 && grid[row - 1][col] !== null) return -1;
      if (row + word.length < size && grid[row + word.length][col] !== null) return -1;
    }

    let intersections = 0;
    for (let i = 0; i < word.length; i++) {
      const r = dir === "across" ? row : row + i;
      const c = dir === "across" ? col + i : col;
      const existing = grid[r][c];
      if (existing !== null) {
        if (existing !== word[i]) return -1;
        intersections++;
      } else {
        // Yon kataklar kesishuvsiz to'qnashmasin
        if (dir === "across") {
          if ((r > 0 && grid[r - 1][c] !== null) || (r + 1 < size && grid[r + 1][c] !== null)) return -1;
        } else {
          if ((c > 0 && grid[r][c - 1] !== null) || (c + 1 < size && grid[r][c + 1] !== null)) return -1;
        }
      }
    }
    return intersections;
  };

  for (let wIdx = 1; wIdx < candidates.length && placed.length < maxWords; wIdx++) {
    const item = candidates[wIdx];
    let best: { row: number; col: number; dir: "across" | "down"; score: number } | null = null;

    for (const existing of placed) {
      const tryDir: "across" | "down" = existing.direction === "across" ? "down" : "across";
      for (let i = 0; i < existing.word.length; i++) {
        for (let j = 0; j < item.word.length; j++) {
          if (existing.word[i] !== item.word[j]) continue;
          const r = existing.direction === "across" ? existing.row - j : existing.row + i;
          const c = existing.direction === "across" ? existing.col + i : existing.col - j;
          const inter = canPlace(item.word, r, c, tryDir);
          if (inter >= 1 && (!best || inter > best.score)) {
            best = { row: r, col: c, dir: tryDir, score: inter };
          }
        }
      }
    }

    if (best) {
      for (let i = 0; i < item.word.length; i++) {
        const r = best.dir === "across" ? best.row : best.row + i;
        const c = best.dir === "across" ? best.col + i : best.col;
        grid[r][c] = item.word[i];
      }
      placed.push({
        direction: best.dir,
        word: item.word,
        displayWord: item.displayWord,
        hint: item.hint,
        row: best.row,
        col: best.col,
      });
    }
  }

  // Keraksiz bo'sh qator/ustunlarni qirqib olamiz
  let minR = size;
  let maxR = 0;
  let minC = size;
  let maxC = 0;
  for (let r = 0; r < size; r++) {
    for (let c = 0; c < size; c++) {
      if (grid[r][c] !== null) {
        minR = Math.min(minR, r);
        maxR = Math.max(maxR, r);
        minC = Math.min(minC, c);
        maxC = Math.max(maxC, c);
      }
    }
  }

  const rows = maxR - minR + 1;
  const cols = maxC - minC + 1;
  const solutionGrid: (string | null)[][] = Array.from({ length: rows }, (_, r) =>
    Array.from({ length: cols }, (_, c) => grid[minR + r][minC + c]),
  );
  const numberGrid: (number | null)[][] = Array.from({ length: rows }, () => Array<number | null>(cols).fill(null));

  const shifted = placed.map((e) => ({
    ...e,
    row: e.row - minR,
    col: e.col - minC,
  }));

  shifted.sort((a, b) => (a.row !== b.row ? a.row - b.row : a.col - b.col));

  let nextNum = 1;
  const coordNumbers = new Map<string, number>();
  const entries: CrosswordEntry[] = shifted.map((e) => {
    const key = `${e.row}:${e.col}`;
    let num = coordNumbers.get(key);
    if (!num) {
      num = nextNum++;
      coordNumbers.set(key, num);
      numberGrid[e.row][e.col] = num;
    }
    return { ...e, number: num };
  });

  return { rows, cols, solutionGrid, numberGrid, entries };
}

/* ================== 14. XOTIRA JUFTLARI (MEMORY CARDS) ================== */

export interface MemoryCardItem {
  uid: string;
  pairId: number;
  side: "front" | "back";
  text: string;
}

export function buildMemoryDeck(quiz: Quiz, fallback?: Quiz, pairCount = 6): MemoryCardItem[] {
  const rawPairs = getCards(quiz);
  const combined =
    rawPairs.length >= pairCount || !fallback
      ? rawPairs
      : [...rawPairs, ...getCards(fallback)];

  const unique: [string, string][] = [];
  const seen = new Set<string>();
  for (const [f, b] of combined) {
    const k = normalize(f);
    if (!seen.has(k) && f.trim().length > 0 && b.trim().length > 0) {
      seen.add(k);
      unique.push([f.trim(), b.trim()]);
    }
  }

  const picked = shuffle(unique).slice(0, pairCount);
  const cards: MemoryCardItem[] = [];
  picked.forEach(([front, back], idx) => {
    cards.push({ uid: `m-${idx}-f`, pairId: idx, side: "front", text: front });
    cards.push({ uid: `m-${idx}-b`, pairId: idx, side: "back", text: back });
  });

  return shuffle(cards);
}

/* ================== 15. SO'Z ZANJIRI (WORD CHAIN) ================== */

export interface WordChainLink {
  step: number;
  word: string;
  displayWord: string;
  hint: string;
  firstLetter: string;
  lastLetter: string;
  options: string[];
}

export function buildWordChain(words: WordPuzzleItem[], length = 8): WordChainLink[] {
  const clean = shuffle(words.filter((w) => w.word.length >= 4 && w.word.length <= 12));
  const picked = clean.slice(0, Math.min(length, clean.length));
  const allDisplays = clean.map((w) => w.displayWord);

  return picked.map((item, idx) => {
    const distractors = shuffle(
      allDisplays.filter((d) => normalize(d) !== normalize(item.displayWord)),
    ).slice(0, 3);
    return {
      step: idx + 1,
      word: item.word,
      displayWord: item.displayWord,
      hint: item.hint,
      firstLetter: item.word[0],
      lastLetter: item.word[item.word.length - 1],
      options: shuffle([item.displayWord, ...distractors]),
    };
  });
}
