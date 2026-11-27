import { useCallback, useEffect, useState } from "react";
import type {
  ChoiceQuestion,
  DifficultyLevel,
  FillQuestion,
  GameId,
  Question,
  Quiz,
  TestDifficulty,
  TrueFalseQuestion,
} from "./types";

export function shuffle<T>(arr: readonly T[]): T[] {
  const a = arr.slice();
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

/** O'zbek apostroflarini (ʻ ʼ ’ ‘ `) birlashtirib, registrsiz solishtirish uchun */
export function normalize(s: string): string {
  return s
    .toLowerCase()
    .replace(/[ʻʼ’‘`´]/g, "'")
    .replace(/\s+/g, " ")
    .trim();
}

/** Sekundlarni xx.xx.xx ko'rinishida formatlaydi (masalan: 00.02.15) */
export function formatTimerHMS(totalSeconds: number): string {
  const safe = Math.max(0, Math.floor(totalSeconds));
  const hrs = Math.floor(safe / 3600);
  const mins = Math.floor((safe % 3600) / 60);
  const secs = safe % 60;
  return [hrs, mins, secs].map((n) => String(n).padStart(2, "0")).join(".");
}

export function isFillCorrect(q: FillQuestion, input: string): boolean {
  const answers = Array.isArray(q.answer) ? q.answer : [q.answer];
  const n = normalize(input);
  return n.length > 0 && answers.some((a) => normalize(a) === n);
}

export function correctAnswerText(q: Question, uz = true): string {
  if (q.type === "choice") return q.options[q.answer];
  if (q.type === "truefalse") return q.answer ? (uz ? "To'g'ri" : "Верно") : uz ? "Noto'g'ri" : "Неверно";
  return Array.isArray(q.answer) ? q.answer[0] : q.answer;
}

export function buildExplanation(q: Question, uz = true): string {
  if (q.explain && q.explain.trim().length > 0) return q.explain;
  const ans = correctAnswerText(q, uz);
  if (q.type === "truefalse") {
    return q.answer
      ? uz
        ? "Ushbu fikr darslik ma'lumotlariga to'liq mos keladi."
        : "Это утверждение полностью соответствует материалу учебника."
      : uz
        ? "Ushbu fikr darslikdagi ma'lumotlarga zid keladi, shu sababli noto'g'ri."
        : "Это утверждение противоречит фактам учебника, поэтому оно неверно.";
  }
  return uz ? `To'g'ri javob — «${ans}».` : `Правильный ответ — «${ans}».`;
}

export const isChoiceLike = (q: Question): q is ChoiceQuestion | TrueFalseQuestion =>
  q.type === "choice" || q.type === "truefalse";

/** Kartochkalar bo'lmasa, test savollaridan yasaymiz: savol -> to'g'ri javob */
export function getCards(quiz: Quiz): [string, string][] {
  if (quiz.cards && quiz.cards.length > 0) return quiz.cards;
  return quiz.questions
    .filter((q): q is ChoiceQuestion => q.type === "choice")
    .map((q) => [q.q, q.options[q.answer]] as [string, string]);
}

/** Tanlash savolida variantlarni aralashtiradi (to'g'ri javob indeksini saqlab) */
export function shuffleOptions(q: ChoiceQuestion): ChoiceQuestion {
  const idx = shuffle(q.options.map((_, i) => i));
  return { ...q, options: idx.map((i) => q.options[i]), answer: idx.indexOf(q.answer) };
}

/** Savolning murakkablik darajasini (0..100) baholaydi */
export function scoreQuestionDifficulty(q: Question, index = 0, total = 1): number {
  if (q.difficulty === "easy") return 20;
  if (q.difficulty === "medium") return 55;
  if (q.difficulty === "hard") return 85;

  let score = q.type === "truefalse" ? 20 : q.type === "choice" ? 44 : 72;
  const text = q.q.toLowerCase();

  // Oddiy ta'rif yoki to'g'ridan-to'g'ri fakt savollari
  if (/(ta'rif|koeffitsiyent|ozod had|muallifi kim|qaysi gazetada|nechta|qaysi formula|nima deb|какая формула|кто автор)/i.test(text)) {
    score -= 10;
  }

  // Murakkab ko'p bosqichli, tengsizlik, sistema yoki tahliliy savollar
  const complexMatches =
    text.match(/(\{|√|sin|cos|tg|ctg|≤|≥|sistema|isbot|eng katta|eng kichik|cheksiz|dispersiya|ehtimollik|koshi|butun yechim|асимптота|система|вероятность)/gi)?.length ?? 0;
  score += Math.min(24, complexMatches * 7);

  if (text.length > 95) score += 8;
  else if (text.length < 52) score -= 5;

  if (q.type === "choice") {
    const avgOptLen = q.options.reduce((acc, o) => acc + o.length, 0) / Math.max(1, q.options.length);
    if (avgOptLen > 24) score += 8;
    else if (avgOptLen <= 8) score -= 4;
  }

  if (total > 1) {
    const relPos = Math.max(0, Math.min(1, index / (total - 1)));
    score += Math.round(relPos * 14);
  }

  return Math.max(0, Math.min(100, score));
}

export function classifyQuestionDifficulty(q: Question, index = 0, total = 1): DifficultyLevel {
  if (q.difficulty) return q.difficulty;
  const s = scoreQuestionDifficulty(q, index, total);
  if (s <= 42) return "easy";
  if (s <= 67) return "medium";
  return "hard";
}

export function summarizeQuizDifficulties(questions: readonly Question[]): {
  easy: number;
  medium: number;
  hard: number;
} {
  let easy = 0;
  let medium = 0;
  let hard = 0;
  const total = questions.length;
  for (let i = 0; i < total; i++) {
    const lvl = classifyQuestionDifficulty(questions[i], i, total);
    if (lvl === "easy") easy++;
    else if (lvl === "medium") medium++;
    else hard++;
  }
  return { easy, medium, hard };
}

/** Tanlangan son va daraja asosida test savollarini saralab tayyorlaydi */
export function prepareQuizQuestions(
  questions: readonly Question[],
  limit: number | "all",
  difficulty?: TestDifficulty,
): Question[] {
  const total = questions.length;
  if (total === 0) return [];
  const targetCount = limit === "all" ? total : Math.max(1, Math.min(limit, total));

  const tagged = questions.map((raw, idx) => {
    const score = scoreQuestionDifficulty(raw, idx, total);
    const level = classifyQuestionDifficulty(raw, idx, total);
    const prepared: Question = raw.type === "choice" ? { ...shuffleOptions(raw), difficulty: level } : { ...raw, difficulty: level };
    return { q: prepared, score, level };
  });

  if (!difficulty) {
    return shuffle(tagged)
      .slice(0, targetCount)
      .map((item) => item.q);
  }

  const easy = shuffle(tagged.filter((t) => t.level === "easy"));
  const medium = shuffle(tagged.filter((t) => t.level === "medium"));
  const hard = shuffle(tagged.filter((t) => t.level === "hard"));

  if (difficulty === "easy") {
    const restMedium = medium.slice().sort((a, b) => a.score - b.score);
    const restHard = hard.slice().sort((a, b) => a.score - b.score);
    return [...easy, ...restMedium, ...restHard].slice(0, targetCount).map((t) => t.q);
  }

  if (difficulty === "medium") {
    const restByCenter = [...easy, ...hard].sort((a, b) => Math.abs(a.score - 55) - Math.abs(b.score - 55));
    return [...medium, ...restByCenter].slice(0, targetCount).map((t) => t.q);
  }

  if (difficulty === "hard") {
    const restMedium = medium.slice().sort((a, b) => b.score - a.score);
    const restEasy = easy.slice().sort((a, b) => b.score - a.score);
    return [...hard, ...restMedium, ...restEasy].slice(0, targetCount).map((t) => t.q);
  }

  // "progressive" — osondan qiyingacha
  if (targetCount >= total) {
    return [
      ...easy.sort((a, b) => a.score - b.score),
      ...medium.sort((a, b) => a.score - b.score),
      ...hard.sort((a, b) => a.score - b.score),
    ].map((t) => t.q);
  }

  const wantEasy = Math.ceil(targetCount / 3);
  const wantMed = Math.ceil((targetCount - wantEasy) / 2);
  const wantHard = targetCount - wantEasy - wantMed;

  const pickedEasy = easy.slice(0, wantEasy);
  const pickedMed = medium.slice(0, wantMed);
  const pickedHard = hard.slice(0, wantHard);

  const selectedSet = new Set([...pickedEasy, ...pickedMed, ...pickedHard]);
  const missing = targetCount - selectedSet.size;
  if (missing > 0) {
    const leftovers = tagged
      .filter((t) => !selectedSet.has(t))
      .sort((a, b) => a.score - b.score);
    const extra = leftovers.slice(0, missing);
    for (const item of extra) {
      if (item.level === "easy") pickedEasy.push(item);
      else if (item.level === "medium") pickedMed.push(item);
      else pickedHard.push(item);
    }
  }

  return [...pickedEasy, ...pickedMed, ...pickedHard].slice(0, targetCount).map((t) => t.q);
}

/** Darslikning barcha mavzulari savollarini bitta butun kitob testiga birlashtiradi */
export function buildBookQuiz(
  subjectId: string,
  quizzes: Quiz[],
  subjectName: string,
  uz = true,
): Quiz | undefined {
  if (quizzes.length === 0) return undefined;
  const first = quizzes[0];
  const allQuestions: Question[] = [];
  const allCards: [string, string][] = [];
  const seenQ = new Set<string>();
  const seenC = new Set<string>();

  for (const quiz of quizzes) {
    for (const q of quiz.questions) {
      const k = normalize(q.q);
      if (!seenQ.has(k)) {
        seenQ.add(k);
        allQuestions.push(q);
      }
    }
    for (const pair of getCards(quiz)) {
      const k = `${normalize(pair[0])}::${normalize(pair[1])}`;
      if (!seenC.has(k)) {
        seenC.add(k);
        allCards.push(pair);
      }
    }
  }

  return {
    id: `book:${subjectId}`,
    subjectId,
    grade: first.grade,
    lang: first.lang,
    title: uz ? `${subjectName} — Butun kitob bo'yicha` : `${subjectName} — По всему учебнику`,
    source: uz
      ? `${quizzes.length} ta mavzu jamlanmasi (${allQuestions.length} savol)`
      : `Сборник по ${quizzes.length} темам (${allQuestions.length} вопр.)`,
    questions: allQuestions,
    cards: allCards,
  };
}

/** Yuklangan JSON to'g'ri tuzilganini tekshiradi (xato kontent saytni yiqitmasligi uchun) */
export function isValidQuiz(x: unknown): x is Quiz {
  if (!x || typeof x !== "object") return false;
  const obj = x as Record<string, unknown>;
  if (typeof obj.id !== "string" || typeof obj.title !== "string" || !Array.isArray(obj.questions)) return false;
  return obj.questions.every((raw: unknown) => {
    if (!raw || typeof raw !== "object") return false;
    const q = raw as Record<string, unknown>;
    if (typeof q.q !== "string") return false;
    if (q.type === "choice") {
      return (
        Array.isArray(q.options) &&
        q.options.length >= 2 &&
        typeof q.answer === "number" &&
        Number.isInteger(q.answer) &&
        q.answer >= 0 &&
        q.answer < q.options.length
      );
    }
    if (q.type === "truefalse") return typeof q.answer === "boolean";
    if (q.type === "fill") return typeof q.answer === "string" || (Array.isArray(q.answer) && q.answer.length > 0);
    return false;
  });
}

// ---------- Natijalarni saqlash (localStorage, xavfsiz) ----------
export interface GameResult {
  best: number;
  last: number;
  plays: number;
  bestTimeSec?: number;
}
type Store = Record<string, Partial<Record<GameId | string, GameResult>>>;
const KEY = "audio_darsliklar_quiz_results_v1";

function readStore(): Store {
  try {
    const raw = localStorage.getItem(KEY);
    const parsed = raw ? JSON.parse(raw) : {};
    return parsed && typeof parsed === "object" ? parsed : {};
  } catch {
    return {};
  }
}

export function useQuizResults() {
  const [store, setStore] = useState<Store>(readStore);

  useEffect(() => {
    const onStorage = (e: StorageEvent) => e.key === KEY && setStore(readStore());
    window.addEventListener("storage", onStorage);
    return () => window.removeEventListener("storage", onStorage);
  }, []);

  const record = useCallback((quizId: string, game: string, score: number, timeSec?: number) => {
    setStore((prev) => {
      const old = prev[quizId]?.[game];
      const next: Store = {
        ...prev,
        [quizId]: {
          ...prev[quizId],
          [game]: {
            best: Math.max(old?.best ?? 0, score),
            last: score,
            plays: (old?.plays ?? 0) + 1,
            bestTimeSec:
              timeSec !== undefined
                ? old?.bestTimeSec !== undefined
                  ? Math.min(old.bestTimeSec, timeSec)
                  : timeSec
                : old?.bestTimeSec,
          },
        },
      };
      try {
        localStorage.setItem(KEY, JSON.stringify(next));
      } catch {
        // ignore
      }
      return next;
    });
  }, []);

  return { results: store, record };
}

// ---------- O'qituvchi/foydalanuvchi yaratgan test to'plamlari ----------
const CUSTOM_KEY = "audio_darsliklar_custom_quizzes_v1";

export function readCustomQuizzes(): Quiz[] {
  try {
    const raw = localStorage.getItem(CUSTOM_KEY);
    const parsed = raw ? JSON.parse(raw) : [];
    if (!Array.isArray(parsed)) return [];
    return parsed.filter(isValidQuiz).map((q) => ({ ...q, custom: true }));
  } catch {
    return [];
  }
}

export function useCustomQuizzes() {
  const [customQuizzes, setCustomQuizzes] = useState<Quiz[]>(readCustomQuizzes);

  useEffect(() => {
    const sync = () => setCustomQuizzes(readCustomQuizzes());
    const onStorage = (e: StorageEvent) => {
      if (e.key === CUSTOM_KEY) sync();
    };
    window.addEventListener("storage", onStorage);
    window.addEventListener("custom-quizzes-updated", sync);
    return () => {
      window.removeEventListener("storage", onStorage);
      window.removeEventListener("custom-quizzes-updated", sync);
    };
  }, []);

  const saveCustomQuiz = useCallback((quiz: Quiz) => {
    const tagged: Quiz = { ...quiz, custom: true };
    setCustomQuizzes((prev) => {
      const idx = prev.findIndex((item) => item.id === tagged.id);
      const next = idx >= 0 ? prev.map((item, i) => (i === idx ? tagged : item)) : [tagged, ...prev];
      try {
        localStorage.setItem(CUSTOM_KEY, JSON.stringify(next));
        window.dispatchEvent(new Event("custom-quizzes-updated"));
      } catch {
        // ignore
      }
      return next;
    });
  }, []);

  const removeCustomQuiz = useCallback((id: string) => {
    setCustomQuizzes((prev) => {
      const next = prev.filter((item) => item.id !== id);
      try {
        localStorage.setItem(CUSTOM_KEY, JSON.stringify(next));
        window.dispatchEvent(new Event("custom-quizzes-updated"));
      } catch {
        // ignore
      }
      return next;
    });
  }, []);

  return { customQuizzes, saveCustomQuiz, removeCustomQuiz };
}
