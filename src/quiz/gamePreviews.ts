import type { IntellectualGameId } from "./types";
import tugOfWarPreview from "../assets/images/game_tug_of_war_3d_1795787177812.jpg";
import mysteryBoxPreview from "../assets/images/game_mystery_box_3d_1795787178347.jpg";
import quizShowPreview from "../assets/images/game_quiz_show_1795787178285.jpg";
import wordMathPreview from "../assets/images/game_word_math_arena_1795787178765.jpg";

export interface GamePreviewMeta {
  image: string;
  badgeUz: string;
  badgeRu: string;
  accentClass: string;
  previewType: "3D" | "Show" | "Arena";
}

export const GAME_PREVIEWS: Record<IntellectualGameId, GamePreviewMeta> = {
  "tug-of-war": {
    image: tugOfWarPreview,
    badgeUz: "3D Jonli Arena",
    badgeRu: "3D Арена",
    accentClass: "from-blue-600/80 via-blue-950/30 to-transparent",
    previewType: "3D",
  },
  "mystery-box": {
    image: mysteryBoxPreview,
    badgeUz: "3D Qutilar",
    badgeRu: "3D Сундуки",
    accentClass: "from-emerald-600/80 via-emerald-950/30 to-transparent",
    previewType: "3D",
  },
  wheel: {
    image: quizShowPreview,
    badgeUz: "Televizion Shou",
    badgeRu: "Шоу Колесо",
    accentClass: "from-amber-600/80 via-slate-950/30 to-transparent",
    previewType: "Show",
  },
  jeopardy: {
    image: quizShowPreview,
    badgeUz: "Viktorina Doskasi",
    badgeRu: "Своя Игра",
    accentClass: "from-indigo-600/80 via-slate-950/30 to-transparent",
    previewType: "Show",
  },
  "quiz-race": {
    image: tugOfWarPreview,
    badgeUz: "Tezkor Poyga",
    badgeRu: "Быстрая Гонка",
    accentClass: "from-cyan-600/80 via-slate-950/30 to-transparent",
    previewType: "Arena",
  },
  "truefalse-blitz": {
    image: quizShowPreview,
    badgeUz: "45s Blits",
    badgeRu: "45с Блиц",
    accentClass: "from-orange-600/80 via-slate-950/30 to-transparent",
    previewType: "Show",
  },
  "math-duel": {
    image: wordMathPreview,
    badgeUz: "Hisob Dueli",
    badgeRu: "Мат. Дуэль",
    accentClass: "from-blue-700/80 via-slate-950/30 to-transparent",
    previewType: "Arena",
  },
  crossword: {
    image: wordMathPreview,
    badgeUz: "Krossvord",
    badgeRu: "Кроссворд",
    accentClass: "from-teal-700/80 via-slate-950/30 to-transparent",
    previewType: "Arena",
  },
  "memory-cards": {
    image: mysteryBoxPreview,
    badgeUz: "Xotira O'yini",
    badgeRu: "Память",
    accentClass: "from-violet-700/80 via-slate-950/30 to-transparent",
    previewType: "Arena",
  },
  "word-chain": {
    image: wordMathPreview,
    badgeUz: "Mantiqiy Zanjir",
    badgeRu: "Цепочка Слов",
    accentClass: "from-sky-700/80 via-slate-950/30 to-transparent",
    previewType: "Arena",
  },
  anagram: {
    image: wordMathPreview,
    badgeUz: "Harflar O'yini",
    badgeRu: "Анаграмма",
    accentClass: "from-amber-700/80 via-slate-950/30 to-transparent",
    previewType: "Arena",
  },
  "word-search": {
    image: wordMathPreview,
    badgeUz: "So'z Topish",
    badgeRu: "Поиск Слов",
    accentClass: "from-emerald-700/80 via-slate-950/30 to-transparent",
    previewType: "Arena",
  },
  "sentence-builder": {
    image: wordMathPreview,
    badgeUz: "Gap Tuzish",
    badgeRu: "Фразы",
    accentClass: "from-blue-700/80 via-slate-950/30 to-transparent",
    previewType: "Arena",
  },
  "fill-blank": {
    image: wordMathPreview,
    badgeUz: "Bo'sh Joy",
    badgeRu: "Пропуски",
    accentClass: "from-slate-700/80 via-slate-950/30 to-transparent",
    previewType: "Arena",
  },
  "cards-match": {
    image: mysteryBoxPreview,
    badgeUz: "Juftlash",
    badgeRu: "Карточки",
    accentClass: "from-indigo-700/80 via-slate-950/30 to-transparent",
    previewType: "Arena",
  },
};
