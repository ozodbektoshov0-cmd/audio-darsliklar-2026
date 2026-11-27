import { useMemo, useState } from "react";
import { useSearchParams } from "react-router-dom";
import {
  ArrowLeft,
  Award,
  BookOpen,
  Calculator,
  CheckCircle2,
  ChevronRight,
  Clock,
  Flag,
  Flame,
  FlaskConical,
  Gamepad2,
  Grid3X3,
  Layers,
  Link2,
  ListChecks,
  Package,
  Plus,
  RotateCcw,
  Sparkles,
  Trash2,
  Trophy,
  Users,
  Wand2,
} from "lucide-react";
import { ALL_SUBJECTS } from "../data";
import type { GradeNumber, Language, SubjectItem } from "../data";
import { useLanguage } from "../context/LanguageContext";
import { useReader } from "../context/ReaderContext";
import { useAuth } from "../context/AuthContext";
import { QUIZZES, getQuizzesBySubject } from "../quiz";
import type { IntellectualGameId, PlayMode, Quiz, TestDifficulty } from "../quiz/types";
import { buildBookQuiz, shuffle, summarizeQuizDifficulties, useQuizResults } from "../quiz/util";
import { useCloudCustomQuizzes } from "../quiz/useCustomQuizzes";
import { GENERAL_INTELLECTUAL_CATEGORIES, GENERAL_INTELLECTUAL_QUIZ } from "../quiz/generalGamesPack";
import { QuizGame } from "../quiz/games";
import {
  AnagramGame,
  CardsAndMatchGame,
  CrosswordGame,
  FillBlankGame,
  INTELLECTUAL_GAMES_META,
  JeopardyGame,
  MathDuelGame,
  MemoryCardsGame,
  MysteryBoxGame,
  QuizRaceGame,
  SentenceBuilderGame,
  TrueFalseBlitzGame,
  TugOfWarGame,
  WordChainGame,
  WordSearchGame,
  WheelOfFortuneGame,
} from "../quiz/intellectualGames";
import CustomQuizCreator from "../components/CustomQuizCreator";
import { GAME_PREVIEWS } from "../quiz/gamePreviews";

const GRADES: GradeNumber[] = ["1", "2", "3", "4", "5", "6", "7", "8", "9", "10", "11"];

type SectionMode = "entry" | "tests" | "games";
type GameScope = "general" | "textbook" | "custom";

function buildAttestatsiyaQuiz(uz: boolean): Quiz {
  const bySubject = new Map<string, Quiz["questions"]>();
  for (const quiz of QUIZZES) {
    const key = quiz.subjectId || quiz.id;
    const arr = bySubject.get(key) ?? [];
    arr.push(...quiz.questions);
    bySubject.set(key, arr);
  }
  const perSubject = Math.max(3, Math.floor(24 / Math.max(1, bySubject.size)));
  const pool: Quiz["questions"] = [];
  for (const qs of bySubject.values()) {
    pool.push(...shuffle(qs).slice(0, perSubject));
  }
  pool.push(...shuffle(GENERAL_INTELLECTUAL_QUIZ.questions).slice(0, 10));
  return {
    id: "attestatsiya-30",
    title: uz ? "Attestatsiya va Nazorat sinovi (30 savol)" : "Аттестация и Контрольный экзамен (30 вопр.)",
    grade: "9",
    lang: uz ? "uz" : "ru",
    source: uz ? "Fanlararo umumiy attestatsiya to'plami" : "Межпредметный экзаменационный сборник",
    questions: shuffle(pool).slice(0, 30),
  };
}

function getQuestionCountOptions(total: number): (number | "all")[] {
  const presets = [10, 20, 30, 50, 100, 200, 300].filter((n) => n < total);
  return [...presets, "all"];
}

export default function Tests() {
  const { language } = useLanguage();
  const uz = language === "uz";
  const { openReader } = useReader();
  const { results, record } = useQuizResults();
  const { user } = useAuth();
  const { customQuizzes, saveCustomQuiz, removeCustomQuiz } = useCloudCustomQuizzes();
  const [searchParams] = useSearchParams();

  const initialSectionParam = searchParams.get("section");
  const initialGameParam = searchParams.get("game") as IntellectualGameId | null;
  const initialModeParam = searchParams.get("mode");
  const initialCreateParam = searchParams.get("create") === "1";

  const validInitialGame =
    initialGameParam && INTELLECTUAL_GAMES_META.some((g) => g.id === initialGameParam) ? initialGameParam : null;

  const initialSection: SectionMode =
    validInitialGame || initialSectionParam === "games"
      ? "games"
      : initialModeParam === "attestatsiya" || initialSectionParam === "tests"
        ? "tests"
        : "entry";

  const [section, setSection] = useState<SectionMode>(initialSection);

  // ---- TESTLAR BOSQICHMA-BOSQICH HOLATI ----
  const [testGrade, setTestGrade] = useState<GradeNumber | null>(initialModeParam === "attestatsiya" ? "9" : null);
  const [testLang, setTestLang] = useState<Language | null>(initialModeParam === "attestatsiya" ? "uz" : null);
  const [testSubject, setTestSubject] = useState<SubjectItem | null>(null);
  const [selectedTestQuiz, setSelectedTestQuiz] = useState<Quiz | null>(
    initialModeParam === "attestatsiya" ? buildAttestatsiyaQuiz(uz) : null,
  );
  const [questionLimit, setQuestionLimit] = useState<number | "all" | null>(
    initialModeParam === "attestatsiya" ? 30 : null,
  );
  const [testDifficulty, setTestDifficulty] = useState<TestDifficulty | null>(
    initialModeParam === "attestatsiya" ? "progressive" : null,
  );
  const [testRound, setTestRound] = useState(0);

  // ---- O'YINLAR HOLATI ----
  const [gameScope, setGameScope] = useState<GameScope>("general");
  const [gameGrade, setGameGrade] = useState<GradeNumber>("9");
  const [gameLang, setGameLang] = useState<Language>("uz");
  const [gameSubjectId, setGameSubjectId] = useState<string>("g9-uz-adabiyot");
  const [gameTopicId, setGameTopicId] = useState<string>("book:g9-uz-adabiyot");
  const [customSelectedId, setCustomSelectedId] = useState<string>("");
  const [playMode, setPlayMode] = useState<PlayMode>("solo");
  const [activeGameId, setActiveGameId] = useState<IntellectualGameId | null>(validInitialGame);
  const [gameRound, setGameRound] = useState(0);

  // ---- YARATISH MODALI ----
  const [creatorOpen, setCreatorOpen] = useState(initialCreateParam);

  // Sinf va til bo'yicha testlar statistikasi
  const gradeQuizCounts = useMemo(() => {
    const map: Record<string, number> = {};
    for (const g of GRADES) {
      map[g] = QUIZZES.filter((q) => !q.sample && q.grade === g).length + customQuizzes.filter((q) => q.grade === g).length;
    }
    return map;
  }, [customQuizzes]);

  const langCountsForTestGrade = useMemo(() => {
    if (!testGrade) return { uzBooks: 0, ruBooks: 0, uzQuizzes: 0, ruQuizzes: 0 };
    const subjects = ALL_SUBJECTS.filter((s) => s.grade === testGrade);
    return {
      uzBooks: subjects.filter((s) => s.lang === "uz").length,
      ruBooks: subjects.filter((s) => s.lang === "ru").length,
      uzQuizzes: QUIZZES.filter((q) => q.grade === testGrade && q.lang === "uz").length + customQuizzes.filter((q) => q.grade === testGrade && q.lang === "uz").length,
      ruQuizzes: QUIZZES.filter((q) => q.grade === testGrade && q.lang === "ru").length + customQuizzes.filter((q) => q.grade === testGrade && q.lang === "ru").length,
    };
  }, [testGrade, customQuizzes]);

  const testSubjectsList = useMemo(() => {
    if (!testGrade || !testLang) return [];
    return ALL_SUBJECTS.filter((s) => s.grade === testGrade && s.lang === testLang);
  }, [testGrade, testLang]);

  const subjectQuizzes = useMemo(() => {
    if (!testSubject) return [];
    const builtIn = getQuizzesBySubject(testSubject.id);
    const uploaded = customQuizzes.filter((q) => q.subjectId === testSubject.id);
    return [...uploaded, ...builtIn];
  }, [testSubject, customQuizzes]);

  const subjectBookQuiz = useMemo(() => {
    if (!testSubject || subjectQuizzes.length === 0) return undefined;
    return buildBookQuiz(testSubject.id, subjectQuizzes, testSubject.name, uz);
  }, [testSubject, subjectQuizzes, uz]);

  const matchingCustomForGradeLang = useMemo(() => {
    if (!testGrade || !testLang) return [];
    return customQuizzes.filter((q) => (!q.grade || q.grade === testGrade) && (!q.lang || q.lang === testLang));
  }, [customQuizzes, testGrade, testLang]);

  const selectedDifficultySummary = useMemo(
    () => (selectedTestQuiz ? summarizeQuizDifficulties(selectedTestQuiz.questions) : null),
    [selectedTestQuiz],
  );

  // ---- O'YINLAR UCHUN MANBA HISOBLASH ----
  const gameSubjectsForGradeLang = useMemo(() => {
    const all = ALL_SUBJECTS.filter((s) => s.grade === gameGrade && s.lang === gameLang);
    // Testi bor fanlarni birinchi o'ringa chiqaramiz
    return [...all].sort((a, b) => getQuizzesBySubject(b.id).length - getQuizzesBySubject(a.id).length);
  }, [gameGrade, gameLang]);

  const gameSubjectQuizzes = useMemo(() => {
    const builtIn = getQuizzesBySubject(gameSubjectId);
    const uploaded = customQuizzes.filter((q) => q.subjectId === gameSubjectId);
    return [...uploaded, ...builtIn];
  }, [gameSubjectId, customQuizzes]);

  const activeGameData = useMemo<{ quiz: Quiz; related?: Quiz[] }>(() => {
    if (gameScope === "custom" && customQuizzes.length > 0) {
      const found = customQuizzes.find((c) => c.id === customSelectedId) ?? customQuizzes[0];
      return { quiz: found };
    }
    if (gameScope === "textbook" && gameSubjectQuizzes.length > 0) {
      const subj = ALL_SUBJECTS.find((s) => s.id === gameSubjectId);
      if (gameTopicId === `book:${gameSubjectId}`) {
        const bookQ = buildBookQuiz(gameSubjectId, gameSubjectQuizzes, subj?.name ?? "Darslik", uz);
        if (bookQ) return { quiz: bookQ, related: gameSubjectQuizzes };
      }
      const topicQ = gameSubjectQuizzes.find((q) => q.id === gameTopicId);
      if (topicQ) return { quiz: topicQ, related: gameSubjectQuizzes };
    }
    return {
      quiz: GENERAL_INTELLECTUAL_QUIZ,
      related: Object.values(GENERAL_INTELLECTUAL_CATEGORIES),
    };
  }, [gameScope, customQuizzes, customSelectedId, gameSubjectQuizzes, gameSubjectId, gameTopicId, uz]);

  const resetTestStepsTo = (step: "entry" | "grade" | "lang" | "subject" | "topic" | "count" | "difficulty") => {
    if (step === "entry") {
      setSection("entry");
      setTestGrade(null);
      setTestLang(null);
      setTestSubject(null);
      setSelectedTestQuiz(null);
      setQuestionLimit(null);
      setTestDifficulty(null);
    } else if (step === "grade") {
      setTestGrade(null);
      setTestLang(null);
      setTestSubject(null);
      setSelectedTestQuiz(null);
      setQuestionLimit(null);
      setTestDifficulty(null);
    } else if (step === "lang") {
      setTestLang(null);
      setTestSubject(null);
      setSelectedTestQuiz(null);
      setQuestionLimit(null);
      setTestDifficulty(null);
    } else if (step === "subject") {
      setTestSubject(null);
      setSelectedTestQuiz(null);
      setQuestionLimit(null);
      setTestDifficulty(null);
    } else if (step === "topic") {
      setSelectedTestQuiz(null);
      setQuestionLimit(null);
      setTestDifficulty(null);
    } else if (step === "count") {
      setQuestionLimit(null);
      setTestDifficulty(null);
    } else if (step === "difficulty") {
      setTestDifficulty(null);
    }
  };

  const handleSaveCustom = async (newQuiz: Quiz) => {
    const saved = await saveCustomQuiz(newQuiz);
    setCreatorOpen(false);
    setCustomSelectedId(saved.id);
    if (section === "tests") {
      if (saved.grade) setTestGrade(saved.grade);
      if (saved.lang) setTestLang(saved.lang);
      if (saved.subjectId) {
        const subj = ALL_SUBJECTS.find((s) => s.id === saved.subjectId);
        if (subj) setTestSubject(subj);
      }
      setSelectedTestQuiz(saved);
      setQuestionLimit(null);
      setTestDifficulty(null);
    } else {
      setSection("games");
      setGameScope("custom");
      setActiveGameId("tug-of-war");
      setGameRound((r) => r + 1);
    }
  };

  const startAttestatsiya = () => {
    const att = buildAttestatsiyaQuiz(uz);
    setSection("tests");
    setActiveGameId(null);
    setTestGrade("9");
    setTestLang(uz ? "uz" : "ru");
    setTestSubject(null);
    setSelectedTestQuiz(att);
    setQuestionLimit(30);
    setTestDifficulty("progressive");
    setTestRound((r) => r + 1);
  };

  const gameIcons: Record<IntellectualGameId, typeof Package> = {
    "mystery-box": Package,
    wheel: Sparkles,
    "tug-of-war": Users,
    jeopardy: Grid3X3,
    "quiz-race": Flag,
    "truefalse-blitz": Flame,
    "math-duel": Calculator,
    crossword: Grid3X3,
    "memory-cards": Layers,
    "word-chain": Link2,
    anagram: Wand2,
    "word-search": Grid3X3,
    "sentence-builder": ListChecks,
    "fill-blank": BookOpen,
    "cards-match": Layers,
  };

  const isPlayingGame = section === "games" && activeGameId !== null;
  const activeGameMeta = activeGameId ? INTELLECTUAL_GAMES_META.find((m) => m.id === activeGameId) : undefined;

  return (
    <div className={`${isPlayingGame ? "pt-20 sm:pt-24 pb-24" : "pt-28 pb-20"} bg-slate-50 dark:bg-slate-950 min-h-screen`}>
      <div className="container mx-auto px-4 max-w-5xl">
        {/* Sarlavha (o'yin ichida ixcham rejimda yashiriladi) */}
        {!isPlayingGame && (
          <div className="flex flex-wrap items-end justify-between gap-4 mb-8">
            <div>
              <p className="text-xs font-bold uppercase tracking-wider text-brand-primary dark:text-blue-300 mb-2">
                {uz ? "Bilim va musobaqa markazi" : "Центр знаний и соревнований"}
              </p>
              <h1 className="text-3xl sm:text-5xl font-serif font-black text-slate-900 dark:text-white tracking-tight">
                {uz ? "Testlar va intellektual o'yinlar" : "Тесты и интеллектуальные игры"}
              </h1>
              <p className="text-slate-600 dark:text-slate-300 max-w-2xl mt-2 text-sm sm:text-base">
                {uz
                  ? "1–11-sinf darsliklari bo'yicha vaqtli testlar, Attestatsiya sinovini yeching yoki yakka, jamoaviy hamda butun sinf uchun 15 xil intellektual o'yinlarda bellashing."
                  : "Решайте тесты и аттестацию по учебникам 1–11 классов или соревнуйтесь в 15 интеллектуальных играх."}
              </p>
            </div>

            <button
              type="button"
              onClick={() => setCreatorOpen(true)}
              className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-slate-900 dark:bg-white text-white dark:text-slate-900 text-sm font-bold hover:opacity-90 transition-opacity whitespace-nowrap shrink-0"
            >
              <Plus size={16} />
              {uz ? "Yaratish" : "Создать"}
            </button>
          </div>
        )}

        {/* 1-BOSQICH: KIRISH TUGMALARI (TESTLAR, ATTESTATSIYA YOKI O'YINLAR) */}
        {section === "entry" ? (
          <div className="grid sm:grid-cols-3 gap-4 mb-8">
            <button
              type="button"
              onClick={() => {
                setSection("tests");
                setActiveGameId(null);
              }}
              className="text-left p-6 rounded-3xl border bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800 text-slate-900 dark:text-white hover:border-brand-primary transition-colors duration-150 flex items-start justify-between gap-4"
            >
              <div>
                <div className="w-12 h-12 rounded-2xl flex items-center justify-center mb-4 bg-blue-50 dark:bg-slate-800 text-brand-primary dark:text-blue-300">
                  <ListChecks size={24} />
                </div>
                <h2 className="text-xl font-serif font-black mb-1">{uz ? "Testlar" : "Тесты"}</h2>
                <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-400">
                  {uz
                    ? "1–11 sinf · O'zbek va rus · Mavzu yoki butun kitob bo'yicha sinov"
                    : "1–11 классы · По темам или всему учебнику"}
                </p>
              </div>
              <ChevronRight size={20} className="shrink-0 mt-1" />
            </button>

            <button
              type="button"
              onClick={startAttestatsiya}
              className="text-left p-6 rounded-3xl border bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800 text-slate-900 dark:text-white hover:border-emerald-500 transition-colors duration-150 flex items-start justify-between gap-4"
            >
              <div>
                <div className="w-12 h-12 rounded-2xl flex items-center justify-center mb-4 bg-emerald-50 dark:bg-slate-800 text-emerald-600 dark:text-emerald-400">
                  <Award size={24} />
                </div>
                <h2 className="text-xl font-serif font-black mb-1">{uz ? "Attestatsiya" : "Аттестация"}</h2>
                <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-400">
                  {uz
                    ? "30 ta fanlararo nazorat savollari · Vaqt hisobi va tahlil"
                    : "30 межпредметных вопросов · Таймер и разбор"}
                </p>
              </div>
              <ChevronRight size={20} className="shrink-0 mt-1" />
            </button>

            <button
              type="button"
              onClick={() => {
                setSection("games");
                setActiveGameId(null);
              }}
              className="text-left p-6 rounded-3xl border bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800 text-slate-900 dark:text-white hover:border-brand-primary transition-colors duration-150 flex items-start justify-between gap-4"
            >
              <div>
                <div className="w-12 h-12 rounded-2xl flex items-center justify-center mb-4 bg-amber-50 dark:bg-slate-800 text-amber-600 dark:text-amber-300">
                  <Gamepad2 size={24} />
                </div>
                <h2 className="text-xl font-serif font-black mb-1">{uz ? "15 ta O'yin" : "15 Игр"}</h2>
                <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-400">
                  {uz
                    ? "3D Arg'amchi tortish, Sirli quti, Jeopardy, Krossvord, Matematik duel va boshqalar"
                    : "3D Канат, Тайный ящик, Своя игра, Кроссворд и другие"}
                </p>
              </div>
              <ChevronRight size={20} className="shrink-0 mt-1" />
            </button>
          </div>
        ) : !isPlayingGame ? (
          <div className="flex flex-wrap items-center justify-between gap-3 mb-6">
            <div className="inline-flex p-1 rounded-2xl bg-slate-200/70 dark:bg-slate-800 border border-slate-200 dark:border-slate-700">
              <button
                type="button"
                onClick={() => {
                  setSection("tests");
                  setActiveGameId(null);
                }}
                className={`inline-flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-bold transition-colors duration-150 ${
                  section === "tests"
                    ? "bg-brand-primary text-white shadow-xs"
                    : "text-slate-700 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white"
                }`}
              >
                <ListChecks size={16} />
                {uz ? "Testlar" : "Тесты"}
              </button>
              <button
                type="button"
                onClick={() => {
                  setSection("games");
                  setActiveGameId(null);
                }}
                className={`inline-flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-bold transition-colors duration-150 ${
                  section === "games"
                    ? "bg-brand-primary text-white shadow-xs"
                    : "text-slate-700 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white"
                }`}
              >
                <Gamepad2 size={16} />
                {uz ? "O'yinlar" : "Игры"}
              </button>
            </div>

            <button
              type="button"
              onClick={() => resetTestStepsTo("entry")}
              className="inline-flex items-center gap-1.5 text-xs font-bold text-slate-500 hover:text-brand-primary"
            >
              <ArrowLeft size={14} /> {uz ? "Asosiy tanlovga qaytish" : "Назад к выбору"}
            </button>
          </div>
        ) : null}

        {/* ENTRY HOLATI: FOYDALI YO'RIQNOMA VA O'QITUVCHI UCHUN IMKONIYATLAR */}
        {section === "entry" && (
          <div className="p-6 sm:p-8 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800">
            <h3 className="text-lg sm:text-xl font-serif font-black text-slate-900 dark:text-white mb-2">
              {uz ? "Yo'nalishni tanlang" : "Выберите раздел"}
            </h3>
            <p className="text-sm text-slate-600 dark:text-slate-300 mb-6">
              {uz
                ? "Yuqoridagi «Testlar» tugmasini bosib 1–11 sinf darsliklaridan savollar yeching, «Attestatsiya» sinovini boshlang yoki «15 ta O'yin» bo'limida bellashing."
                : "Нажмите «Тесты» для пошагового выбора класса, «Аттестация» для общего экзамена или «15 Игр» для запуска соревнований."}
            </p>
            <div className="grid sm:grid-cols-3 gap-4 text-sm">
              <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/70 border border-slate-200/70 dark:border-slate-700/70">
                <p className="font-bold text-slate-900 dark:text-white mb-1">{uz ? "Qiziqishni oshiradi" : "Повышает интерес"}</p>
                <p className="text-xs text-slate-600 dark:text-slate-300">
                  {uz
                    ? "Oddiy savol-javob o'rniga Sirli quti, Omad charxi va Jeopardy kabi musobaqa muhitini yaratadi."
                    : "Создаёт атмосферу соревнования вместо обычного опроса."}
                </p>
              </div>
              <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/70 border border-slate-200/70 dark:border-slate-700/70">
                <p className="font-bold text-slate-900 dark:text-white mb-1">{uz ? "Jamoaviy ishlash" : "Командная работа"}</p>
                <p className="text-xs text-slate-600 dark:text-slate-300">
                  {uz
                    ? "Yakka, 2 jamoa yoki Butun sinf rejimlarida o'quvchilar birgalikda fikrlaydi."
                    : "Режимы для одного, двух команд или всего класса."}
                </p>
              </div>
              <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/70 border border-slate-200/70 dark:border-slate-700/70">
                <p className="font-bold text-slate-900 dark:text-white mb-1">{uz ? "Tayyorlash oson" : "Легко создать"}</p>
                <p className="text-xs text-slate-600 dark:text-slate-300">
                  {uz
                    ? "«Yaratish» tugmasi orqali o'qituvchi o'z testini kiritadi va platforma uni barcha o'yinlarga moslaydi."
                    : "Кнопка «Создать» превращает любой ваш набор во все игры."}
                </p>
              </div>
            </div>
          </div>
        )}

        {/* ==================== TESTLAR BOSQICHMA-BOSQICH OQIMI ==================== */}
        {section === "tests" && (
          <div className="space-y-6">
            {/* Breadcrumb navigator */}
            <nav aria-label="Breadcrumb" className="flex flex-wrap items-center gap-1.5 text-xs sm:text-sm font-bold">
              <button
                type="button"
                onClick={() => resetTestStepsTo("grade")}
                className={`px-2.5 py-1 rounded-lg transition-colors ${
                  testGrade === null
                    ? "bg-brand-primary text-white"
                    : "bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-200 hover:border-brand-primary"
                }`}
              >
                {uz ? "Sinflar (1–11)" : "Классы (1–11)"}
              </button>

              {testGrade && (
                <>
                  <ChevronRight size={14} className="text-slate-400" />
                  <button
                    type="button"
                    onClick={() => resetTestStepsTo("lang")}
                    className={`px-2.5 py-1 rounded-lg transition-colors ${
                      testLang === null
                        ? "bg-brand-primary text-white"
                        : "bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-200 hover:border-brand-primary"
                    }`}
                  >
                    {testGrade}-{uz ? "sinf" : "класс"}
                  </button>
                </>
              )}

              {testLang && (
                <>
                  <ChevronRight size={14} className="text-slate-400" />
                  <button
                    type="button"
                    onClick={() => resetTestStepsTo("subject")}
                    className={`px-2.5 py-1 rounded-lg transition-colors ${
                      testSubject === null
                        ? "bg-brand-primary text-white"
                        : "bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-200 hover:border-brand-primary"
                    }`}
                  >
                    {testLang === "uz" ? (uz ? "O'zbek tili" : "Узбекский") : uz ? "Rus tili" : "Русский"}
                  </button>
                </>
              )}

              {testSubject && (
                <>
                  <ChevronRight size={14} className="text-slate-400" />
                  <button
                    type="button"
                    onClick={() => resetTestStepsTo("topic")}
                    className={`px-2.5 py-1 rounded-lg transition-colors ${
                      selectedTestQuiz === null
                        ? "bg-brand-primary text-white"
                        : "bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-200 hover:border-brand-primary"
                    }`}
                  >
                    {testSubject.name}
                  </button>
                </>
              )}

              {selectedTestQuiz && (
                <>
                  <ChevronRight size={14} className="text-slate-400" />
                  <button
                    type="button"
                    onClick={() => resetTestStepsTo("count")}
                    className={`px-2.5 py-1 rounded-lg max-w-[220px] truncate transition-colors ${
                      questionLimit === null
                        ? "bg-brand-primary text-white"
                        : "bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-200 hover:border-brand-primary"
                    }`}
                  >
                    {selectedTestQuiz.title}
                  </button>
                </>
              )}

              {selectedTestQuiz && questionLimit !== null && (
                <>
                  <ChevronRight size={14} className="text-slate-400" />
                  <button
                    type="button"
                    onClick={() => resetTestStepsTo("difficulty")}
                    className={`px-2.5 py-1 rounded-lg transition-colors tabular-nums ${
                      testDifficulty === null
                        ? "bg-brand-primary text-white"
                        : "bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-200 hover:border-brand-primary"
                    }`}
                  >
                    {questionLimit === "all"
                      ? uz
                        ? `Barchasi (${selectedTestQuiz.questions.length})`
                        : `Все (${selectedTestQuiz.questions.length})`
                      : `${questionLimit} ${uz ? "ta savol" : "вопр."}`}
                  </button>
                </>
              )}
            </nav>

            {/* STEP 1: 1-sinfdan 11-sinfgacha sinflar tugmalari */}
            {testGrade === null && (
              <div className="p-6 sm:p-8 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800">
                <h2 className="text-xl sm:text-2xl font-serif font-black text-slate-900 dark:text-white mb-2">
                  {uz ? "1. Sinfni tanlang" : "1. Выберите класс"}
                </h2>
                <p className="text-sm text-slate-500 dark:text-slate-400 mb-5">
                  {uz ? "1-sinfdan 11-sinfgacha kerakli sinfni bosing." : "Нажмите нужный класс с 1 по 11."}
                </p>

                <div className="grid grid-cols-2 sm:grid-cols-4 md:grid-cols-6 gap-3">
                  {GRADES.map((g) => {
                    const ready = gradeQuizCounts[g];
                    return (
                      <button
                        key={g}
                        type="button"
                        onClick={() => setTestGrade(g)}
                        className="p-4 rounded-2xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 hover:border-brand-primary hover:bg-blue-50 dark:hover:bg-slate-700 text-left transition-colors"
                      >
                        <p className="text-lg font-black text-slate-900 dark:text-white tabular-nums">
                          {g}-{uz ? "sinf" : "класс"}
                        </p>
                        <p className="text-xs text-slate-500 dark:text-slate-400 mt-1 tabular-nums">
                          {ready > 0
                            ? `${ready} ${uz ? "ta test tayyor" : "тестов готово"}`
                            : `${ALL_SUBJECTS.filter((s) => s.grade === g).length} ${uz ? "ta darslik" : "учебн."}`}
                        </p>
                      </button>
                    );
                  })}
                </div>

                {/* Shaxsiy va namuna testlarga tezkor kirish */}
                {customQuizzes.length > 0 && (
                  <div className="mt-8 pt-6 border-t border-slate-100 dark:border-slate-800">
                    <h3 className="text-sm font-black uppercase tracking-wider text-slate-500 mb-3">
                      {uz ? "Siz yaratgan testlar" : "Ваши созданные тесты"}
                    </h3>
                    <div className="grid sm:grid-cols-2 gap-3">
                      {customQuizzes.map((cq) => (
                        <div
                          key={cq.id}
                          className="flex items-center justify-between gap-2 p-3.5 rounded-2xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800"
                        >
                          <button
                            type="button"
                            onClick={() => {
                              setTestGrade(cq.grade ?? "9");
                              setTestLang(cq.lang ?? "uz");
                              setSelectedTestQuiz(cq);
                              setQuestionLimit(null);
                              setTestDifficulty(null);
                            }}
                            className="text-left min-w-0 flex-1"
                          >
                            <p className="font-bold text-sm text-slate-900 dark:text-white truncate">{cq.title}</p>
                            <p className="text-xs text-slate-500 tabular-nums">
                              {cq.questions.length} {uz ? "savol" : "вопр."}
                            </p>
                          </button>
                          {(!cq.ownerId || (user && cq.ownerId === user.uid)) && (
                            <button
                              type="button"
                              aria-label={uz ? `${cq.title} ni o'chirish` : `Удалить ${cq.title}`}
                              onClick={() => void removeCustomQuiz(cq.id)}
                              className="p-2 text-slate-400 hover:text-red-600"
                            >
                              <Trash2 size={15} />
                            </button>
                          )}
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            )}

            {/* STEP 2: O'ZBEK VA RUS TUGMALARI */}
            {testGrade !== null && testLang === null && (
              <div className="p-6 sm:p-8 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800">
                <button
                  type="button"
                  onClick={() => resetTestStepsTo("grade")}
                  className="inline-flex items-center gap-1.5 text-xs font-bold text-slate-500 hover:text-brand-primary mb-4"
                >
                  <ArrowLeft size={14} /> {uz ? "Sinfni o'zgartirish" : "Сменить класс"}
                </button>
                <h2 className="text-xl sm:text-2xl font-serif font-black text-slate-900 dark:text-white mb-2">
                  {uz ? `${testGrade}-sinf: Ta'lim tilini tanlang` : `${testGrade} класс: Выберите язык`}
                </h2>
                <p className="text-sm text-slate-500 dark:text-slate-400 mb-5">
                  {uz ? "O'zbek yoki rus tilidagi darsliklarni ko'rish uchun tanlang." : "Выберите язык учебников."}
                </p>

                <div className="grid sm:grid-cols-2 gap-4">
                  <button
                    type="button"
                    onClick={() => setTestLang("uz")}
                    className="p-6 rounded-2xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 hover:border-brand-primary hover:bg-blue-50 dark:hover:bg-slate-700 text-left transition-colors"
                  >
                    <p className="text-xl font-black text-slate-900 dark:text-white mb-1">
                      {uz ? "O'zbek" : "Узбекский"}
                    </p>
                    <p className="text-sm text-slate-600 dark:text-slate-300 tabular-nums">
                      {langCountsForTestGrade.uzBooks} {uz ? "ta darslik" : "учебников"}
                      {langCountsForTestGrade.uzQuizzes > 0 && ` · ${langCountsForTestGrade.uzQuizzes} ${uz ? "ta test to'plami" : "тестов"}`}
                    </p>
                  </button>

                  <button
                    type="button"
                    onClick={() => setTestLang("ru")}
                    className="p-6 rounded-2xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 hover:border-brand-primary hover:bg-blue-50 dark:hover:bg-slate-700 text-left transition-colors"
                  >
                    <p className="text-xl font-black text-slate-900 dark:text-white mb-1">
                      {uz ? "Rus" : "Русский"}
                    </p>
                    <p className="text-sm text-slate-600 dark:text-slate-300 tabular-nums">
                      {langCountsForTestGrade.ruBooks} {uz ? "ta darslik" : "учебников"}
                      {langCountsForTestGrade.ruQuizzes > 0 && ` · ${langCountsForTestGrade.ruQuizzes} ${uz ? "ta test to'plami" : "тестов"}`}
                    </p>
                  </button>
                </div>
              </div>
            )}

            {/* STEP 3: TANLANGAN SINF VA TILDAGI DARSLIKLAR */}
            {testGrade !== null && testLang !== null && testSubject === null && selectedTestQuiz === null && (
              <div className="p-6 sm:p-8 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800">
                <button
                  type="button"
                  onClick={() => resetTestStepsTo("lang")}
                  className="inline-flex items-center gap-1.5 text-xs font-bold text-slate-500 hover:text-brand-primary mb-4"
                >
                  <ArrowLeft size={14} /> {uz ? "Tilni o'zgartirish" : "Сменить язык"}
                </button>
                <h2 className="text-xl sm:text-2xl font-serif font-black text-slate-900 dark:text-white mb-2">
                  {testGrade}-{uz ? "sinf" : "класс"} · {testLang === "uz" ? (uz ? "O'zbek tili" : "Узбекский") : uz ? "Rus tili" : "Русский"}
                </h2>
                <p className="text-sm text-slate-500 dark:text-slate-400 mb-5">
                  {uz ? "Test yechish uchun darslikni tanlang:" : "Выберите учебник для прохождения теста:"}
                </p>

                <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-3">
                  {testSubjectsList.map((subj) => {
                    const qList = [...customQuizzes.filter((q) => q.subjectId === subj.id), ...getQuizzesBySubject(subj.id)];
                    const totalQ = qList.reduce((acc, q) => acc + q.questions.length, 0);
                    return (
                      <button
                        key={subj.id}
                        type="button"
                        onClick={() => setTestSubject(subj)}
                        className={`p-4 rounded-2xl border text-left transition-colors flex flex-col justify-between gap-2 ${
                          qList.length > 0
                            ? "bg-blue-50/70 dark:bg-slate-800 border-brand-primary/40 hover:border-brand-primary"
                            : "bg-slate-50 dark:bg-slate-800/60 border-slate-200 dark:border-slate-700 hover:border-slate-400"
                        }`}
                      >
                        <div>
                          <p className="font-bold text-base text-slate-900 dark:text-white">{subj.name}</p>
                          <p className="text-xs text-slate-500 dark:text-slate-400">{subj.category}</p>
                        </div>
                        <p
                          className={`text-xs font-bold tabular-nums ${
                            qList.length > 0 ? "text-brand-primary dark:text-blue-300" : "text-slate-400"
                          }`}
                        >
                          {qList.length > 0
                            ? `${qList.length} ${uz ? "mavzu" : "тем"} · ${totalQ} ${uz ? "savol" : "вопр."}`
                            : uz
                              ? "Tez orada"
                              : "Скоро"}
                        </p>
                      </button>
                    );
                  })}
                </div>

                {matchingCustomForGradeLang.length > 0 && (
                  <div className="mt-6 pt-5 border-t border-slate-100 dark:border-slate-800">
                    <h3 className="text-xs font-bold uppercase tracking-wider text-slate-500 mb-3">
                      {uz ? "Yaratilgan test to'plamlari" : "Созданные наборы"}
                    </h3>
                    <div className="grid sm:grid-cols-2 gap-3">
                      {matchingCustomForGradeLang.map((cq) => (
                        <button
                          key={cq.id}
                          type="button"
                          onClick={() => setSelectedTestQuiz(cq)}
                          className="p-4 rounded-2xl border border-emerald-300 dark:border-emerald-800 bg-emerald-50/60 dark:bg-emerald-950/20 text-left hover:border-emerald-500"
                        >
                          <p className="font-bold text-slate-900 dark:text-white">{cq.title}</p>
                          <p className="text-xs text-emerald-700 dark:text-emerald-300 tabular-nums">
                            {cq.questions.length} {uz ? "savol" : "вопр."}
                          </p>
                        </button>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            )}

            {/* STEP 4: DARSLIKDAGI BARCHA MAVZULAR YOKI BUTUN KITOB BO'YICHA TEST */}
            {testSubject !== null && selectedTestQuiz === null && (
              <div className="p-6 sm:p-8 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800">
                <div className="flex flex-wrap items-center justify-between gap-3 mb-4">
                  <button
                    type="button"
                    onClick={() => resetTestStepsTo("subject")}
                    className="inline-flex items-center gap-1.5 text-xs font-bold text-slate-500 hover:text-brand-primary"
                  >
                    <ArrowLeft size={14} /> {uz ? "Darslikni o'zgartirish" : "Сменить учебник"}
                  </button>
                  {testSubject.resources.find((r) => r.pdfUrl)?.pdfUrl && (
                    <button
                      type="button"
                      onClick={() =>
                        openReader({
                          url: testSubject.resources.find((r) => r.pdfUrl)!.pdfUrl!,
                          title: testSubject.name,
                        })
                      }
                      className="inline-flex items-center gap-1.5 text-xs font-bold text-brand-primary dark:text-blue-300 hover:underline"
                    >
                      <BookOpen size={14} /> {uz ? "Darslik PDF ni ochish" : "Открыть учебник"}
                    </button>
                  )}
                </div>

                <h2 className="text-xl sm:text-2xl font-serif font-black text-slate-900 dark:text-white mb-2">
                  {testSubject.name} ({testGrade}-{uz ? "sinf" : "класс"})
                </h2>

                {subjectQuizzes.length === 0 ? (
                  <div className="mt-4 p-8 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-dashed border-slate-300 dark:border-slate-700 text-center">
                    <Clock className="mx-auto text-slate-400 mb-3" size={32} />
                    <p className="font-bold text-slate-900 dark:text-white mb-1">
                      {uz
                        ? `${testGrade}-sinf «${testSubject.name}» darsligi bo'yicha testlar hali qo'shilmoqda`
                        : `Тесты по учебнику «${testSubject.name}» (${testGrade} кл.) ещё готовятся`}
                    </p>
                    <p className="text-sm text-slate-600 dark:text-slate-300 mb-5">
                      {uz
                        ? "Siz hoziroq o'z savollaringizni yaratishingiz yoki tayyor 9-sinf Adabiyot (1 478 savol) hamda Namuna testini yechishingiz mumkin."
                        : "Вы можете создать свой набор или пройти готовые тесты."}
                    </p>
                    <div className="flex flex-wrap items-center justify-center gap-3">
                      <button
                        type="button"
                        onClick={() => setCreatorOpen(true)}
                        className="inline-flex items-center gap-1.5 px-4 py-2.5 rounded-xl bg-brand-primary text-white text-sm font-bold"
                      >
                        <Plus size={15} /> {uz ? "Yaratish" : "Создать"}
                      </button>
                      <button
                        type="button"
                        onClick={() => {
                          const sample = QUIZZES.find((q) => q.sample);
                          if (sample) setSelectedTestQuiz(sample);
                        }}
                        className="inline-flex items-center gap-1.5 px-4 py-2.5 rounded-xl border border-slate-300 dark:border-slate-600 text-sm font-bold text-slate-700 dark:text-slate-200"
                      >
                        <FlaskConical size={15} /> {uz ? "Namuna testni yechish" : "Пробный тест"}
                      </button>
                      <button
                        type="button"
                        onClick={() => {
                          const adabiyotSubj = ALL_SUBJECTS.find((s) => s.id === "g9-uz-adabiyot");
                          if (adabiyotSubj) {
                            setTestGrade("9");
                            setTestLang("uz");
                            setTestSubject(adabiyotSubj);
                          }
                        }}
                        className="text-sm font-bold text-brand-primary dark:text-blue-300 underline"
                      >
                        {uz ? "9-sinf Adabiyot testlariga o'tish" : "Перейти к Литературе 9 кл."}
                      </button>
                    </div>
                  </div>
                ) : (
                  <div className="space-y-6 mt-5">
                    {/* Butun kitob bo'yicha testlar yechish */}
                    {subjectBookQuiz && (
                      <button
                        type="button"
                        onClick={() => setSelectedTestQuiz(subjectBookQuiz)}
                        className="w-full p-5 rounded-2xl bg-brand-primary text-white hover:bg-blue-700 transition-colors flex flex-wrap items-center justify-between gap-4 text-left"
                      >
                        <div>
                          <p className="text-xs font-bold uppercase tracking-wider text-blue-100 mb-1">
                            {uz ? "Umumiy sinov" : "Общий экзамен"}
                          </p>
                          <p className="text-lg sm:text-xl font-black">
                            {uz ? "Butun kitob bo'yicha testlar yechish" : "Решать тесты по всему учебнику"}
                          </p>
                          <p className="text-xs sm:text-sm text-blue-100 mt-0.5 tabular-nums">
                            {subjectQuizzes.length} {uz ? "ta mavzudan jamlangan" : "тем"} · {subjectBookQuiz.questions.length}{" "}
                            {uz ? "ta savol" : "вопросов"}
                          </p>
                        </div>
                        <ChevronRight size={22} className="shrink-0" />
                      </button>
                    )}

                    {/* Mavzular ro'yxati */}
                    <div>
                      <p className="text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400 mb-3">
                        {uz ? `Mavzular bo'yicha (${subjectQuizzes.length} ta mavzu)` : `По темам (${subjectQuizzes.length})`}
                      </p>
                      <div className="grid sm:grid-cols-2 gap-2.5">
                        {subjectQuizzes.map((q) => {
                          const best = results[q.id]?.quiz?.best;
                          return (
                            <button
                              key={q.id}
                              type="button"
                              onClick={() => setSelectedTestQuiz(q)}
                              className="min-w-0 flex items-center justify-between gap-3 p-3.5 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 hover:border-brand-primary hover:bg-blue-50 dark:hover:bg-slate-700 text-left transition-colors"
                            >
                              <span className="font-bold text-sm text-slate-900 dark:text-white truncate">{q.title}</span>
                              <span className="shrink-0 text-xs font-bold text-brand-primary dark:text-blue-300 tabular-nums flex items-center gap-1">
                                {best !== undefined && <CheckCircle2 size={13} className="text-emerald-600" />}
                                {q.questions.length} {uz ? "savol" : "вопр."}
                              </span>
                            </button>
                          );
                        })}
                      </div>
                    </div>
                  </div>
                )}
              </div>
            )}

            {/* STEP 5: TEST SONI NECHTA BO'LISHINI TANLASH */}
            {selectedTestQuiz !== null && questionLimit === null && (
              <div className="p-6 sm:p-8 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 max-w-2xl mx-auto">
                <button
                  type="button"
                  onClick={() => resetTestStepsTo("topic")}
                  className="inline-flex items-center gap-1.5 text-xs font-bold text-slate-500 hover:text-brand-primary mb-4"
                >
                  <ArrowLeft size={14} /> {uz ? "Mavzuni o'zgartirish" : "Сменить тему"}
                </button>
                <p className="text-xs font-bold text-brand-primary dark:text-blue-300 mb-1">{selectedTestQuiz.title}</p>
                <h2 className="text-xl sm:text-2xl font-serif font-black text-slate-900 dark:text-white mb-2">
                  {uz ? "Nechta test savolini yechmoqchisiz?" : "Сколько вопросов хотите решить?"}
                </h2>
                <p className="text-sm text-slate-600 dark:text-slate-300 mb-6">
                  {uz
                    ? "Savollar sonini tanlaganingizdan so'ng test darajasini belgilaysiz."
                    : "После выбора количества вы выберете уровень сложности теста."}
                </p>

                <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                  {getQuestionCountOptions(selectedTestQuiz.questions.length).map((opt) => (
                    <button
                      key={String(opt)}
                      type="button"
                      onClick={() => {
                        setQuestionLimit(opt);
                        setTestDifficulty(null);
                      }}
                      className="p-4 rounded-2xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 hover:border-brand-primary hover:bg-brand-primary hover:text-white text-slate-900 dark:text-white font-black text-base transition-colors tabular-nums"
                    >
                      {opt === "all"
                        ? uz
                          ? `Barchasi (${selectedTestQuiz.questions.length})`
                          : `Все (${selectedTestQuiz.questions.length})`
                        : `${opt} ${uz ? "ta savol" : "вопр."}`}
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* STEP 6: TEST DARAJASINI TANLASH */}
            {selectedTestQuiz !== null && questionLimit !== null && testDifficulty === null && (
              <div className="p-6 sm:p-8 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 max-w-2xl mx-auto">
                <button
                  type="button"
                  onClick={() => resetTestStepsTo("count")}
                  className="inline-flex items-center gap-1.5 text-xs font-bold text-slate-500 hover:text-brand-primary mb-4"
                >
                  <ArrowLeft size={14} /> {uz ? "Savollar sonini o'zgartirish" : "Изменить количество"}
                </button>
                <p className="text-xs font-bold text-brand-primary dark:text-blue-300 mb-1 tabular-nums">
                  {selectedTestQuiz.title} ·{" "}
                  {questionLimit === "all"
                    ? uz
                      ? `Barchasi (${selectedTestQuiz.questions.length} ta savol)`
                      : `Все (${selectedTestQuiz.questions.length} вопр.)`
                    : `${questionLimit} ${uz ? "ta savol" : "вопр."}`}
                </p>
                <h2 className="text-xl sm:text-2xl font-serif font-black text-slate-900 dark:text-white mb-2">
                  {uz ? "Test darajasini tanlang" : "Выберите уровень сложности"}
                </h2>
                <p className="text-sm text-slate-600 dark:text-slate-300 mb-6">
                  {uz
                    ? "Darajani tanlashingiz bilan test va vaqt hisobi boshlanadi."
                    : "Сразу после выбора уровня начнётся тест и пойдёт отсчёт времени."}
                </p>

                <div className="grid sm:grid-cols-2 gap-3.5">
                  {(
                    [
                      {
                        id: "easy" as const,
                        title: uz ? "Oson" : "Лёгкий",
                        desc: uz
                          ? "Asosiy tushunchalar, ta'riflar va tezkor savollar"
                          : "Базовые определения и быстрые вопросы",
                        countLabel: selectedDifficultySummary
                          ? `${selectedDifficultySummary.easy} ${uz ? "ta oson savol" : "лёгких"}`
                          : "",
                        accent: "hover:border-emerald-500 hover:bg-emerald-50/70 dark:hover:bg-emerald-950/30",
                        badgeColor: "text-emerald-700 dark:text-emerald-300",
                      },
                      {
                        id: "medium" as const,
                        title: uz ? "O'rtacha" : "Средний",
                        desc: uz
                          ? "Darslikdagi asosiy mashqlar va standart masalalar"
                          : "Основные упражнения и стандартные задачи",
                        countLabel: selectedDifficultySummary
                          ? `${selectedDifficultySummary.medium} ${uz ? "ta o'rtacha savol" : "средних"}`
                          : "",
                        accent: "hover:border-amber-500 hover:bg-amber-50/70 dark:hover:bg-amber-950/30",
                        badgeColor: "text-amber-700 dark:text-amber-300",
                      },
                      {
                        id: "hard" as const,
                        title: uz ? "Qiyin" : "Сложный",
                        desc: uz
                          ? "Chuqurlashtirilgan, ko'p bosqichli va yozma topshiriqlar"
                          : "Углублённые задачи и открытые ответы",
                        countLabel: selectedDifficultySummary
                          ? `${selectedDifficultySummary.hard} ${uz ? "ta qiyin savol" : "сложных"}`
                          : "",
                        accent: "hover:border-rose-500 hover:bg-rose-50/70 dark:hover:bg-rose-950/30",
                        badgeColor: "text-rose-700 dark:text-rose-300",
                      },
                      {
                        id: "progressive" as const,
                        title: uz ? "Osondan qiyingacha" : "От лёгкого к сложному",
                        desc: uz
                          ? "Oddiy savollardan boshlanib, bosqichma-bosqich qiyinlashadi"
                          : "Начинается с простых вопросов и постепенно усложняется",
                        countLabel: uz ? "Bosqichli tartib" : "По нарастающей",
                        accent: "hover:border-brand-primary hover:bg-blue-50/80 dark:hover:bg-slate-700",
                        badgeColor: "text-brand-primary dark:text-blue-300",
                      },
                    ]
                  ).map((item) => (
                    <button
                      key={item.id}
                      type="button"
                      onClick={() => {
                        setTestDifficulty(item.id);
                        setTestRound((r) => r + 1);
                      }}
                      className={`p-5 rounded-2xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-left transition-colors flex flex-col justify-between gap-2 ${item.accent}`}
                    >
                      <div>
                        <p className="text-lg font-black text-slate-900 dark:text-white mb-1">{item.title}</p>
                        <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-300">{item.desc}</p>
                      </div>
                      {item.countLabel && (
                        <p className={`text-xs font-bold tabular-nums ${item.badgeColor}`}>{item.countLabel}</p>
                      )}
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* STEP 7: FAOL TEST JARAYONI */}
            {selectedTestQuiz !== null && questionLimit !== null && testDifficulty !== null && (
              <div className="max-w-3xl mx-auto">
                <div className="flex flex-wrap items-center justify-between gap-2 mb-4">
                  <div>
                    <h2 className="text-lg sm:text-xl font-serif font-black text-slate-900 dark:text-white">
                      {selectedTestQuiz.title}
                    </h2>
                    <p className="text-xs text-slate-500 dark:text-slate-400">
                      {selectedTestQuiz.source ? `${selectedTestQuiz.source} · ` : ""}
                      {testDifficulty === "easy"
                        ? uz
                          ? "Daraja: Oson"
                          : "Уровень: Лёгкий"
                        : testDifficulty === "medium"
                          ? uz
                            ? "Daraja: O'rtacha"
                            : "Уровень: Средний"
                          : testDifficulty === "hard"
                            ? uz
                              ? "Daraja: Qiyin"
                              : "Уровень: Сложный"
                            : uz
                              ? "Daraja: Osondan qiyingacha"
                              : "Уровень: От лёгкого к сложному"}
                    </p>
                  </div>
                  <button
                    type="button"
                    onClick={() => resetTestStepsTo("difficulty")}
                    className="inline-flex items-center gap-1.5 text-xs font-bold text-slate-500 hover:text-brand-primary"
                  >
                    <ArrowLeft size={14} /> {uz ? "Darajani o'zgartirish" : "Сменить уровень"}
                  </button>
                </div>

                <QuizGame
                  key={`${selectedTestQuiz.id}-${questionLimit}-${testDifficulty}-${testRound}`}
                  quiz={selectedTestQuiz}
                  uz={uz}
                  initialLimit={questionLimit}
                  initialDifficulty={testDifficulty}
                  onFinish={(score, sec) => record(selectedTestQuiz.id, "quiz", score, sec)}
                  onRestart={() => setTestRound((r) => r + 1)}
                />
              </div>
            )}
          </div>
        )}

        {/* ==================== O'YINLAR BO'LIMI ==================== */}
        {section === "games" && (
          <div className="space-y-6">
            {/* Manba va rejim sozlamalari (o'yin tanlanmaganda ko'rinadi) */}
            {activeGameId === null ? (
              <>
                <div className="p-5 sm:p-6 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 space-y-5">
                  <div>
                    <h2 className="text-lg sm:text-xl font-serif font-black text-slate-900 dark:text-white">
                      {uz ? "O'yin manbasi va rejimini sozlang" : "Настройте тему и режим игры"}
                    </h2>
                    <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400">
                      {uz
                        ? "Hamma sinf uchun umumiy bilimlarni yoki ma'lum bir sinf, darslik va mavzuni tanlang."
                        : "Выберите общие знания или конкретный класс, учебник и тему."}
                    </p>
                  </div>

                  {/* Manba turi */}
                  <div className="grid sm:grid-cols-3 gap-2.5">
                    <button
                      type="button"
                      onClick={() => setGameScope("general")}
                      className={`p-3.5 rounded-2xl border text-left transition-colors ${
                        gameScope === "general"
                          ? "bg-brand-primary border-brand-primary text-white"
                          : "bg-slate-50 dark:bg-slate-800 border-slate-200 dark:border-slate-700 text-slate-800 dark:text-slate-200"
                      }`}
                    >
                      <p className="font-bold text-sm">{uz ? "Hamma sinflar (Umumiy)" : "Все классы (Общие)"}</p>
                      <p className={`text-xs mt-0.5 ${gameScope === "general" ? "text-blue-100" : "text-slate-500 dark:text-slate-400"}`}>
                        {uz ? "Fanlararo qiziqarli savollar" : "Межпредметная подборка"}
                      </p>
                    </button>

                    <button
                      type="button"
                      onClick={() => setGameScope("textbook")}
                      className={`p-3.5 rounded-2xl border text-left transition-colors ${
                        gameScope === "textbook"
                          ? "bg-brand-primary border-brand-primary text-white"
                          : "bg-slate-50 dark:bg-slate-800 border-slate-200 dark:border-slate-700 text-slate-800 dark:text-slate-200"
                      }`}
                    >
                      <p className="font-bold text-sm">{uz ? "Sinf va darslik bo'yicha" : "По классу и учебнику"}</p>
                      <p className={`text-xs mt-0.5 ${gameScope === "textbook" ? "text-blue-100" : "text-slate-500 dark:text-slate-400"}`}>
                        {uz ? "Aniq mavzu yoki butun kitob" : "Конкретная тема или вся книга"}
                      </p>
                    </button>

                    <button
                      type="button"
                      onClick={() => {
                        if (customQuizzes.length === 0) setCreatorOpen(true);
                        else setGameScope("custom");
                      }}
                      className={`p-3.5 rounded-2xl border text-left transition-colors ${
                        gameScope === "custom"
                          ? "bg-brand-primary border-brand-primary text-white"
                          : "bg-slate-50 dark:bg-slate-800 border-slate-200 dark:border-slate-700 text-slate-800 dark:text-slate-200"
                      }`}
                    >
                      <p className="font-bold text-sm">
                        {uz ? `Yaratilganlar (${customQuizzes.length})` : `Мои наборы (${customQuizzes.length})`}
                      </p>
                      <p className={`text-xs mt-0.5 ${gameScope === "custom" ? "text-blue-100" : "text-slate-500 dark:text-slate-400"}`}>
                        {customQuizzes.length > 0
                          ? uz
                            ? "O'qituvchi kiritgan to'plamlar"
                            : "Ваши сохранённые наборы"
                          : uz
                            ? "Yangi to'plam qo'shish uchun bosing"
                            : "Нажмите, чтобы создать"}
                      </p>
                    </button>
                  </div>

                  {/* Agar darslik tanlansa — Sinf / Til / Darslik / Mavzu */}
                  {gameScope === "textbook" && (
                    <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-3 pt-2">
                      <div>
                        <label className="block text-xs font-bold text-slate-500 mb-1">{uz ? "Sinf" : "Класс"}</label>
                        <select
                          value={gameGrade}
                          onChange={(e) => {
                            const nextG = e.target.value as GradeNumber;
                            setGameGrade(nextG);
                            const list = ALL_SUBJECTS.filter((s) => s.grade === nextG && s.lang === gameLang);
                            const withQ = list.find((s) => getQuizzesBySubject(s.id).length > 0) ?? list[0];
                            if (withQ) {
                              setGameSubjectId(withQ.id);
                              setGameTopicId(`book:${withQ.id}`);
                            }
                          }}
                          className="w-full px-3 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-sm font-bold text-slate-900 dark:text-white"
                        >
                          {GRADES.map((g) => (
                            <option key={g} value={g}>
                              {g}-{uz ? "sinf" : "класс"}{" "}
                              {gradeQuizCounts[g] > 0 ? `(${gradeQuizCounts[g]})` : ""}
                            </option>
                          ))}
                        </select>
                      </div>

                      <div>
                        <label className="block text-xs font-bold text-slate-500 mb-1">{uz ? "Til" : "Язык"}</label>
                        <select
                          value={gameLang}
                          onChange={(e) => {
                            const nextL = e.target.value as Language;
                            setGameLang(nextL);
                            const list = ALL_SUBJECTS.filter((s) => s.grade === gameGrade && s.lang === nextL);
                            const withQ = list.find((s) => getQuizzesBySubject(s.id).length > 0) ?? list[0];
                            if (withQ) {
                              setGameSubjectId(withQ.id);
                              setGameTopicId(`book:${withQ.id}`);
                            }
                          }}
                          className="w-full px-3 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-sm font-bold text-slate-900 dark:text-white"
                        >
                          <option value="uz">{uz ? "O'zbek" : "Узбекский"}</option>
                          <option value="ru">{uz ? "Rus" : "Русский"}</option>
                        </select>
                      </div>

                      <div>
                        <label className="block text-xs font-bold text-slate-500 mb-1">{uz ? "Darslik" : "Учебник"}</label>
                        <select
                          value={gameSubjectId}
                          onChange={(e) => {
                            setGameSubjectId(e.target.value);
                            setGameTopicId(`book:${e.target.value}`);
                          }}
                          className="w-full px-3 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-sm font-bold text-slate-900 dark:text-white"
                        >
                          {gameSubjectsForGradeLang.map((s) => {
                            const qCnt = getQuizzesBySubject(s.id).length;
                            return (
                              <option key={s.id} value={s.id}>
                                {s.name} {qCnt > 0 ? `(${qCnt} mavzu)` : ""}
                              </option>
                            );
                          })}
                        </select>
                      </div>

                      <div>
                        <label className="block text-xs font-bold text-slate-500 mb-1">{uz ? "Mavzu" : "Тема"}</label>
                        <select
                          value={gameTopicId}
                          onChange={(e) => setGameTopicId(e.target.value)}
                          disabled={gameSubjectQuizzes.length === 0}
                          className="w-full px-3 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-sm font-bold text-slate-900 dark:text-white disabled:opacity-60"
                        >
                          {gameSubjectQuizzes.length === 0 ? (
                            <option value="fallback">{uz ? "Umumiy to'plam ishlatiladi" : "Общий набор"}</option>
                          ) : (
                            <>
                              <option value={`book:${gameSubjectId}`}>
                                {uz ? "Butun kitob bo'yicha" : "Весь учебник"}
                              </option>
                              {gameSubjectQuizzes.map((q) => (
                                <option key={q.id} value={q.id}>
                                  {q.title}
                                </option>
                              ))}
                            </>
                          )}
                        </select>
                      </div>
                    </div>
                  )}

                  {gameScope === "custom" && customQuizzes.length > 0 && (
                    <div className="pt-2">
                      <label className="block text-xs font-bold text-slate-500 mb-1">
                        {uz ? "Yaratilgan to'plamni tanlang" : "Выберите созданный набор"}
                      </label>
                      <select
                        value={customSelectedId || customQuizzes[0].id}
                        onChange={(e) => setCustomSelectedId(e.target.value)}
                        className="w-full sm:max-w-md px-3.5 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-sm font-bold text-slate-900 dark:text-white"
                      >
                        {customQuizzes.map((c) => (
                          <option key={c.id} value={c.id}>
                            {c.title} ({c.questions.length} {uz ? "savol" : "вопр."})
                          </option>
                        ))}
                      </select>
                    </div>
                  )}

                  {/* Rejim tanlash: Yakka / Jamoaviy / Butun sinf */}
                  <div className="flex flex-wrap items-center justify-between gap-3 pt-2 border-t border-slate-100 dark:border-slate-800">
                    <div className="flex flex-wrap items-center gap-2">
                      <span className="text-xs font-bold text-slate-500 dark:text-slate-400">
                        {uz ? "Ishtirok rejimi:" : "Режим участия:"}
                      </span>
                      {(
                        [
                          { id: "solo", label: uz ? "Yakka" : "Один игрок" },
                          { id: "teams", label: uz ? "Jamoaviy (2 jamoa)" : "Команды (2)" },
                          { id: "class", label: uz ? "Butun sinf" : "Весь класс" },
                        ] as const
                      ).map((m) => (
                        <button
                          key={m.id}
                          type="button"
                          onClick={() => setPlayMode(m.id)}
                          className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-colors ${
                            playMode === m.id
                              ? "bg-brand-primary text-white"
                              : "bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 hover:bg-slate-200"
                          }`}
                        >
                          {m.label}
                        </button>
                      ))}
                    </div>

                    <p className="text-xs font-semibold text-slate-500 dark:text-slate-400">
                      {uz ? "Faol to'plam:" : "Активный набор:"}{" "}
                      <span className="font-bold text-slate-800 dark:text-slate-200">{activeGameData.quiz.title}</span>
                    </p>
                  </div>
                </div>

                {/* 15 TA INTELLEKTUAL O'YIN RO'YXATI */}
                <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
                  {INTELLECTUAL_GAMES_META.map((g) => {
                    const Icon = gameIcons[g.id];
                    const best = results[activeGameData.quiz.id]?.[g.id]?.best;
                    const preview = GAME_PREVIEWS[g.id];
                    return (
                      <button
                        key={g.id}
                        type="button"
                        onClick={() => {
                          setActiveGameId(g.id);
                          setGameRound((r) => r + 1);
                        }}
                        className="text-left rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 hover:border-brand-primary transition-all flex flex-col justify-between overflow-hidden group shadow-xs hover:shadow-md"
                      >
                        <div className="w-full">
                          <div className="relative h-36 w-full overflow-hidden bg-slate-900">
                            <img
                              src={preview.image}
                              alt={uz ? g.titleUz : g.titleRu}
                              className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                              loading="lazy"
                            />
                            <div className={`absolute inset-0 bg-gradient-to-t ${preview.accentClass}`} />
                            <div className="absolute top-3 left-3 w-9 h-9 rounded-xl bg-slate-950/75 text-white flex items-center justify-center border border-white/15">
                              <Icon size={18} />
                            </div>
                            <span className="absolute bottom-2.5 left-3 text-[11px] font-bold tracking-wide text-white drop-shadow">
                              {uz ? preview.badgeUz : preview.badgeRu}
                            </span>
                            <span className="absolute bottom-2.5 right-3 text-[11px] font-semibold text-white/90 drop-shadow">
                              {g.teamCapable ? (uz ? "Yakka / Jamoaviy" : "Соло / Команды") : uz ? "Mantiqiy" : "Логика"}
                            </span>
                          </div>

                          <div className="p-4 sm:p-5 pb-2">
                            <h3 className="text-lg font-black text-slate-900 dark:text-white mb-1 group-hover:text-brand-primary transition-colors">
                              {uz ? g.titleUz : g.titleRu}
                            </h3>
                            <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-300 line-clamp-2">
                              {uz ? g.descUz : g.descRu}
                            </p>
                          </div>
                        </div>

                        <div className="w-full px-4 sm:px-5 pb-4 pt-3 mt-2 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between text-xs font-bold">
                          <span className="text-brand-primary dark:text-blue-300 inline-flex items-center gap-1">
                            {uz ? "O'ynash" : "Играть"} <ChevronRight size={14} />
                          </span>
                          {best !== undefined && (
                            <span className="text-emerald-600 dark:text-emerald-400 inline-flex items-center gap-1 tabular-nums">
                              <Trophy size={13} /> {best}
                            </span>
                          )}
                        </div>
                      </button>
                    );
                  })}
                </div>
              </>
            ) : (
              /* FAOL O'YIN ARENASI */
              <div className={activeGameId === "tug-of-war" ? "max-w-5xl mx-auto" : "max-w-4xl mx-auto"}>
                <div className="flex flex-wrap items-center justify-between gap-2.5 mb-3">
                  <div className="flex flex-wrap items-center gap-3">
                    <button
                      type="button"
                      onClick={() => setActiveGameId(null)}
                      className="inline-flex items-center gap-1.5 text-sm font-bold text-slate-600 dark:text-slate-300 hover:text-brand-primary"
                    >
                      <ArrowLeft size={16} /> {uz ? "Barcha o'yinlarga qaytish" : "Ко всем играм"}
                    </button>
                    <h2 className="text-lg sm:text-xl font-serif font-black text-slate-900 dark:text-white">
                      {uz ? activeGameMeta?.titleUz : activeGameMeta?.titleRu}
                    </h2>
                  </div>

                  <div className="flex flex-wrap items-center gap-2">
                    {activeGameMeta?.teamCapable && (
                      <div className="inline-flex p-0.5 rounded-xl bg-slate-200/75 dark:bg-slate-800 border border-slate-200 dark:border-slate-700">
                        {(
                          [
                            { id: "solo", label: uz ? "Yakka" : "Соло" },
                            { id: "teams", label: uz ? "2 jamoa" : "2 команды" },
                            { id: "class", label: uz ? "Butun sinf" : "Класс" },
                          ] as const
                        ).map((m) => (
                          <button
                            key={m.id}
                            type="button"
                            onClick={() => {
                              setPlayMode(m.id);
                              setGameRound((r) => r + 1);
                            }}
                            className={`px-2.5 py-1 rounded-lg text-xs font-bold transition-colors ${
                              playMode === m.id
                                ? "bg-brand-primary text-white"
                                : "text-slate-700 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white"
                            }`}
                          >
                            {m.label}
                          </button>
                        ))}
                      </div>
                    )}
                    <span className="hidden sm:inline text-xs font-semibold text-slate-500 dark:text-slate-400">
                      {activeGameData.quiz.title}
                    </span>
                    <button
                      type="button"
                      onClick={() => setGameRound((r) => r + 1)}
                      className="inline-flex items-center gap-1 px-3 py-1.5 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 text-xs font-bold text-slate-700 dark:text-slate-200 hover:border-brand-primary"
                    >
                      <RotateCcw size={13} /> {uz ? "Qayta" : "Заново"}
                    </button>
                  </div>
                </div>

                <div key={`${activeGameId}-${activeGameData.quiz.id}-${playMode}-${gameRound}`}>
                  {activeGameId === "mystery-box" && (
                    <MysteryBoxGame
                      quiz={activeGameData.quiz}
                      uz={uz}
                      playMode={playMode}
                      onFinish={(s) => record(activeGameData.quiz.id, activeGameId, s)}
                      onRestart={() => setGameRound((r) => r + 1)}
                    />
                  )}
                  {activeGameId === "wheel" && (
                    <WheelOfFortuneGame
                      quiz={activeGameData.quiz}
                      uz={uz}
                      playMode={playMode}
                      onFinish={(s) => record(activeGameData.quiz.id, activeGameId, s)}
                      onRestart={() => setGameRound((r) => r + 1)}
                    />
                  )}
                  {activeGameId === "tug-of-war" && (
                    <TugOfWarGame
                      quiz={activeGameData.quiz}
                      uz={uz}
                      playMode={playMode}
                      onFinish={(s) => record(activeGameData.quiz.id, activeGameId, s)}
                      onRestart={() => setGameRound((r) => r + 1)}
                    />
                  )}
                  {activeGameId === "jeopardy" && (
                    <JeopardyGame
                      quiz={activeGameData.quiz}
                      relatedQuizzes={activeGameData.related}
                      uz={uz}
                      playMode={playMode}
                      onFinish={(s) => record(activeGameData.quiz.id, activeGameId, s)}
                      onRestart={() => setGameRound((r) => r + 1)}
                    />
                  )}
                  {activeGameId === "quiz-race" && (
                    <QuizRaceGame
                      quiz={activeGameData.quiz}
                      uz={uz}
                      playMode={playMode}
                      onFinish={(s) => record(activeGameData.quiz.id, activeGameId, s)}
                      onRestart={() => setGameRound((r) => r + 1)}
                    />
                  )}
                  {activeGameId === "truefalse-blitz" && (
                    <TrueFalseBlitzGame
                      quiz={activeGameData.quiz}
                      uz={uz}
                      playMode={playMode}
                      onFinish={(s) => record(activeGameData.quiz.id, activeGameId, s)}
                      onRestart={() => setGameRound((r) => r + 1)}
                    />
                  )}
                  {activeGameId === "math-duel" && (
                    <MathDuelGame
                      quiz={activeGameData.quiz}
                      uz={uz}
                      playMode={playMode}
                      onFinish={(s) => record(activeGameData.quiz.id, activeGameId, s)}
                      onRestart={() => setGameRound((r) => r + 1)}
                    />
                  )}
                  {activeGameId === "crossword" && (
                    <CrosswordGame
                      quiz={activeGameData.quiz}
                      uz={uz}
                      playMode={playMode}
                      onFinish={(s) => record(activeGameData.quiz.id, activeGameId, s)}
                      onRestart={() => setGameRound((r) => r + 1)}
                    />
                  )}
                  {activeGameId === "memory-cards" && (
                    <MemoryCardsGame
                      quiz={activeGameData.quiz}
                      uz={uz}
                      playMode={playMode}
                      onFinish={(s) => record(activeGameData.quiz.id, activeGameId, s)}
                      onRestart={() => setGameRound((r) => r + 1)}
                    />
                  )}
                  {activeGameId === "word-chain" && (
                    <WordChainGame
                      quiz={activeGameData.quiz}
                      uz={uz}
                      playMode={playMode}
                      onFinish={(s) => record(activeGameData.quiz.id, activeGameId, s)}
                      onRestart={() => setGameRound((r) => r + 1)}
                    />
                  )}
                  {activeGameId === "anagram" && (
                    <AnagramGame
                      quiz={activeGameData.quiz}
                      uz={uz}
                      playMode={playMode}
                      onFinish={(s) => record(activeGameData.quiz.id, activeGameId, s)}
                      onRestart={() => setGameRound((r) => r + 1)}
                    />
                  )}
                  {activeGameId === "word-search" && (
                    <WordSearchGame
                      quiz={activeGameData.quiz}
                      uz={uz}
                      playMode={playMode}
                      onFinish={(s) => record(activeGameData.quiz.id, activeGameId, s)}
                      onRestart={() => setGameRound((r) => r + 1)}
                    />
                  )}
                  {activeGameId === "sentence-builder" && (
                    <SentenceBuilderGame
                      quiz={activeGameData.quiz}
                      uz={uz}
                      playMode={playMode}
                      onFinish={(s) => record(activeGameData.quiz.id, activeGameId, s)}
                      onRestart={() => setGameRound((r) => r + 1)}
                    />
                  )}
                  {activeGameId === "fill-blank" && (
                    <FillBlankGame
                      quiz={activeGameData.quiz}
                      uz={uz}
                      playMode={playMode}
                      onFinish={(s) => record(activeGameData.quiz.id, activeGameId, s)}
                      onRestart={() => setGameRound((r) => r + 1)}
                    />
                  )}
                  {activeGameId === "cards-match" && (
                    <CardsAndMatchGame
                      quiz={activeGameData.quiz}
                      uz={uz}
                      playMode={playMode}
                      onFinish={(s) => record(activeGameData.quiz.id, activeGameId, s)}
                      onRestart={() => setGameRound((r) => r + 1)}
                    />
                  )}
                </div>
              </div>
            )}
          </div>
        )}
      </div>

      {creatorOpen && <CustomQuizCreator uz={uz} onClose={() => setCreatorOpen(false)} onSave={handleSaveCustom} />}
    </div>
  );
}
