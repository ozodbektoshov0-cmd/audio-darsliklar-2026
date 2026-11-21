import { useCallback, useEffect, useState } from "react";
import type { ChoiceQuestion, FillQuestion, GameId, Question, Quiz, TrueFalseQuestion } from "./types";

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

export function isFillCorrect(q: FillQuestion, input: string): boolean {
  const answers = Array.isArray(q.answer) ? q.answer : [q.answer];
  const n = normalize(input);
  return n.length > 0 && answers.some((a) => normalize(a) === n);
}

export function correctAnswerText(q: Question): string {
  if (q.type === "choice") return q.options[q.answer];
  if (q.type === "truefalse") return q.answer ? "To'g'ri" : "Noto'g'ri";
  return Array.isArray(q.answer) ? q.answer[0] : q.answer;
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

/** Yuklangan JSON to'g'ri tuzilganini tekshiradi (xato kontent saytni yiqitmasligi uchun) */
export function isValidQuiz(x: any): x is Quiz {
  if (!x || typeof x.id !== "string" || typeof x.title !== "string" || !Array.isArray(x.questions)) return false;
  return x.questions.every((q: any) => {
    if (!q || typeof q.q !== "string") return false;
    if (q.type === "choice") {
      return Array.isArray(q.options) && q.options.length >= 2 && Number.isInteger(q.answer) && q.answer >= 0 && q.answer < q.options.length;
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
}
type Store = Record<string, Partial<Record<GameId, GameResult>>>;
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

  const record = useCallback((quizId: string, game: GameId, score: number) => {
    setStore((prev) => {
      const old = prev[quizId]?.[game];
      const next: Store = {
        ...prev,
        [quizId]: {
          ...prev[quizId],
          [game]: { best: Math.max(old?.best ?? 0, score), last: score, plays: (old?.plays ?? 0) + 1 },
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
