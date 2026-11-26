import { useCallback, useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import { ArrowLeft, BookOpen, FlaskConical, ListChecks, Timer, Layers, Link2, ChevronLeft, ChevronRight, Gamepad2 } from "lucide-react";
import { ALL_SUBJECTS } from "../data";
import { useLanguage } from "../context/LanguageContext";
import { useReader } from "../context/ReaderContext";
import { getQuiz, getQuizzesBySubject } from "../quiz";
import type { GameId } from "../quiz";
import { buildBookQuiz, useQuizResults } from "../quiz/util";
import { useCloudCustomQuizzes } from "../quiz/useCustomQuizzes";
import { CardsGame, MatchGame, QuizGame, TimedGame } from "../quiz/games";

export default function TestDetail() {
  const { id } = useParams();
  const { language } = useLanguage();
  const uz = language === "uz";
  const { openReader } = useReader();
  const { results, record } = useQuizResults();
  const { customQuizzes } = useCloudCustomQuizzes();

  const navigate = useNavigate();

  let quiz = getQuiz(id) ?? customQuizzes.find((c) => c.id === id);
  if (!quiz && id?.startsWith("book:")) {
    const subjId = id.slice(5);
    const subj = ALL_SUBJECTS.find((s) => s.id === subjId);
    const list = getQuizzesBySubject(subjId);
    quiz = buildBookQuiz(subjId, list, subj?.name ?? "Darslik", uz);
  }

  const [game, setGame] = useState<GameId>("quiz");
  const [round, setRound] = useState(0);

  const restart = useCallback(() => setRound((r) => r + 1), []);
  const finish = useCallback(
    (score: number, elapsedSec?: number) => {
      if (quiz) record(quiz.id, game, score, elapsedSec);
    },
    [quiz, record, game],
  );

  if (!quiz) {
    return (
      <div className="pt-32 pb-20 min-h-screen bg-slate-50 dark:bg-slate-950 text-center px-4">
        <h1 className="text-2xl font-black text-slate-900 dark:text-white mb-3">{uz ? "Test topilmadi" : "Тест не найден"}</h1>
        <Link to="/tests" className="text-brand-primary dark:text-blue-300 font-bold underline">
          {uz ? "Test va o'yinlarga qaytish" : "Вернуться к тестам и играм"}
        </Link>
      </div>
    );
  }

  const subject = quiz.subjectId ? ALL_SUBJECTS.find((s) => s.id === quiz.subjectId) : undefined;
  const siblings = quiz.subjectId ? getQuizzesBySubject(quiz.subjectId) : [];
  const siblingIdx = siblings.findIndex((s) => s.id === quiz.id);
  const prevTopic = siblingIdx > 0 ? siblings[siblingIdx - 1] : undefined;
  const nextTopic = siblingIdx >= 0 && siblingIdx + 1 < siblings.length ? siblings[siblingIdx + 1] : undefined;
  const firstPdf = subject?.resources.find((r) => r.pdfUrl)?.pdfUrl ?? undefined;
  const res = results[quiz.id];

  const games: { id: GameId; label: string; icon: typeof ListChecks; unit: string }[] = [
    { id: "quiz", label: uz ? "Test (Vaqtli)" : "Тест", icon: ListChecks, unit: "%" },
    { id: "timed", label: uz ? "60s Tezkor" : "60с Блиц", icon: Timer, unit: "" },
    { id: "cards", label: uz ? "Kartochkalar" : "Карточки", icon: Layers, unit: "%" },
    { id: "match", label: uz ? "Juftlash" : "Пары", icon: Link2, unit: "" },
  ];

  const props = { quiz, uz, onFinish: finish, onRestart: restart };

  return (
    <div className="pt-28 pb-20 bg-slate-50 dark:bg-slate-950 min-h-screen">
      <div className="container mx-auto px-4 max-w-3xl">
        <div className="flex flex-wrap items-center justify-between gap-3 mb-5">
          <Link to="/tests" className="inline-flex items-center gap-1.5 text-sm font-bold text-slate-500 hover:text-brand-primary">
            <ArrowLeft size={15} /> {uz ? "Testlar va o'yinlar" : "Тесты и игры"}
          </Link>
          <Link
            to="/tests?section=games"
            className="inline-flex items-center gap-1.5 text-xs font-bold text-brand-primary dark:text-blue-300 hover:underline"
          >
            <Gamepad2 size={14} /> {uz ? "9 xil intellektual o'yinlar" : "9 интеллектуальных игр"}
          </Link>
        </div>

        <h1 className="text-2xl sm:text-4xl font-serif font-black text-slate-900 dark:text-white mb-2">{quiz.title}</h1>
        {quiz.source && <p className="text-sm text-slate-500 dark:text-slate-400 mb-4">{quiz.source}</p>}

        {quiz.sample && (
          <div className="mb-5 p-3 rounded-xl bg-amber-50 dark:bg-amber-950/30 border border-amber-200 dark:border-amber-900 text-amber-800 dark:text-amber-300 text-sm font-semibold flex items-center gap-2">
            <FlaskConical size={16} className="shrink-0" />
            {uz ? "Bu namuna test: tizim qanday ishlashini ko'rsatadi." : "Это образец теста для демонстрации."}
          </div>
        )}

        <div className="flex flex-wrap items-center gap-2.5 mb-6">
          {firstPdf && (
            <button
              type="button"
              onClick={() => openReader({ url: firstPdf, title: subject!.name })}
              className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 text-sm font-bold text-slate-800 dark:text-slate-200 hover:border-brand-primary"
            >
              <BookOpen size={15} className="text-brand-primary" />
              {uz ? "Darslikni o'qish" : "Читать учебник"}
            </button>
          )}
          {siblings.length > 1 && (
            <div className="flex items-center gap-1.5 flex-1 min-w-[220px]">
              {prevTopic && (
                <Link
                  to={`/tests/${prevTopic.id}`}
                  className="p-2 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-300 hover:border-brand-primary"
                  aria-label={uz ? "Oldingi mavzu" : "Предыдущая тема"}
                  title={prevTopic.title}
                >
                  <ChevronLeft size={16} />
                </Link>
              )}
              <select
                value={quiz.id}
                onChange={(e) => navigate(`/tests/${e.target.value}`)}
                aria-label={uz ? "Mavzuni tanlang" : "Выберите тему"}
                className="flex-1 min-w-0 px-3 py-2 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 text-xs sm:text-sm font-bold text-slate-800 dark:text-slate-200 focus:outline-none focus:ring-2 focus:ring-brand-primary"
              >
                {siblings.map((t) => (
                  <option key={t.id} value={t.id}>
                    {t.title} ({t.questions.length} {uz ? "savol" : "вопр."})
                  </option>
                ))}
              </select>
              {nextTopic && (
                <Link
                  to={`/tests/${nextTopic.id}`}
                  className="p-2 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-300 hover:border-brand-primary"
                  aria-label={uz ? "Keyingi mavzu" : "Следующая тема"}
                  title={nextTopic.title}
                >
                  <ChevronRight size={16} />
                </Link>
              )}
            </div>
          )}
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 mb-6">
          {games.map((g) => {
            const r = res?.[g.id];
            const Icon = g.icon;
            return (
              <button
                key={g.id}
                type="button"
                onClick={() => {
                  setGame(g.id);
                  setRound((n) => n + 1);
                }}
                className={`p-3 rounded-2xl border text-left transition-colors ${
                  game === g.id
                    ? "bg-brand-primary border-brand-primary text-white"
                    : "bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800 text-slate-800 dark:text-slate-200 hover:border-brand-primary"
                }`}
              >
                <Icon size={18} className="mb-1.5" />
                <p className="text-sm font-bold">{g.label}</p>
                <p className={`text-[11px] ${game === g.id ? "text-blue-100" : "text-slate-400"}`}>
                  {r ? `${uz ? "Eng yaxshi" : "Лучший"}: ${r.best}${g.unit}` : uz ? "Hali o'ynalmagan" : "Ещё не играли"}
                </p>
              </button>
            );
          })}
        </div>

        <div key={`${quiz.id}-${game}-${round}`}>
          {game === "quiz" && <QuizGame {...props} />}
          {game === "timed" && <TimedGame {...props} />}
          {game === "cards" && <CardsGame {...props} />}
          {game === "match" && <MatchGame {...props} />}
        </div>
      </div>
    </div>
  );
}
