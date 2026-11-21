import { isValidQuiz } from "./util";
import type { Quiz } from "./types";

export * from "./types";

/**
 * src/quiz/data/*.json fayllari avtomatik yuklanadi.
 * Yangi test qo'shish: shu papkaga JSON fayl tashlash kifoya (format: README yoki namuna-ona-tili.json).
 */
const modules = import.meta.glob("./data/*.json", { eager: true, import: "default" }) as Record<string, unknown>;

export const QUIZZES: Quiz[] = Object.entries(modules)
  .map(([path, mod]) => {
    if (!isValidQuiz(mod)) {
      console.warn(`[quiz] ${path} noto'g'ri formatda, o'tkazib yuborildi`);
      return null;
    }
    return mod;
  })
  .filter((q): q is Quiz => q !== null);

export function getQuiz(id: string | undefined): Quiz | undefined {
  return id ? QUIZZES.find((q) => q.id === id) : undefined;
}

export function getQuizzesBySubject(subjectId: string): Quiz[] {
  return QUIZZES.filter((q) => q.subjectId === subjectId);
}

/** Fan uchun test sahifasi manzili (test bo'lmasa undefined) */
export function getQuizHref(subjectId: string): string | undefined {
  const q = getQuizzesBySubject(subjectId)[0];
  return q ? `/tests/${q.id}` : undefined;
}
