import type { GradeNumber, Language } from "../data/types";

export interface ChoiceQuestion {
  type: "choice";
  q: string;
  options: string[];
  /** To'g'ri variant indeksi (0 dan boshlanadi) */
  answer: number;
  explain?: string;
}

export interface TrueFalseQuestion {
  type: "truefalse";
  q: string;
  answer: boolean;
  explain?: string;
}

export interface FillQuestion {
  type: "fill";
  /** Savol matni; bo'sh joy "___" bilan belgilanishi mumkin */
  q: string;
  /** Qabul qilinadigan javob(lar) */
  answer: string | string[];
  explain?: string;
}

export type Question = ChoiceQuestion | TrueFalseQuestion | FillQuestion;

export interface Quiz {
  /** Noyob id; URL: /tests/:id */
  id: string;
  /** src/data'dagi fan id'si (masalan "g9-uz-adabiyot"); namunalar uchun bo'sh */
  subjectId?: string;
  title: string;
  grade?: GradeNumber;
  lang?: Language;
  /** Manba (qaysi kitob, nashr yili, boblar) */
  source?: string;
  /** Namuna / tekshirilmagan kontent belgisi */
  sample?: boolean;
  /** Foydalanuvchi yaratgan test belgisi */
  custom?: boolean;
  /** Yaratuvchi Firebase UID */
  ownerId?: string;
  /** Yaratuvchi ismi */
  authorName?: string;
  /** Darslik nomi */
  subjectName?: string;
  /** Mavzu nomi */
  topicTitle?: string;
  questions: Question[];
  /** Kartochkalar va juftlash o'yini uchun [old, orqa] juftliklar */
  cards?: [string, string][];
}

export type GameId = "quiz" | "timed" | "cards" | "match";

export type IntellectualGameId =
  | "mystery-box"
  | "wheel"
  | "tug-of-war"
  | "jeopardy"
  | "anagram"
  | "word-search"
  | "sentence-builder"
  | "fill-blank"
  | "cards-match"
  | "quiz-race"
  | "truefalse-blitz"
  | "math-duel"
  | "crossword"
  | "memory-cards"
  | "word-chain";

export type PlayMode = "solo" | "teams" | "class";

export interface QuizAnswerReview {
  question: Question;
  userAnswer: string;
  correctAnswer: string;
  isCorrect: boolean;
  explanation: string;
}
