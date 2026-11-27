import { useEffect, useMemo, useState } from "react";
import { Link, useSearchParams } from "react-router-dom";
import {
  BookOpen,
  CheckCircle2,
  ChevronLeft,
  ChevronRight,
  Clock,
  Eye,
  EyeOff,
  FileText,
  Gamepad2,
  Lightbulb,
  Maximize2,
  Minimize2,
  Plus,
  Search,
  Sparkles,
  Trash2,
  X,
  XCircle,
} from "lucide-react";
import { ALL_SUBJECTS, type GradeNumber } from "../data";
import { INTERACTIVE_LESSONS, type InteractiveLesson } from "../data/lessonsData";
import { useLanguage } from "../context/LanguageContext";
import { useStudent } from "../context/StudentContext";
import { getSlideHeroImage } from "../utils/slideHelper";
import SlideDiagramRenderer from "../components/SlideDiagramRenderer";

const GRADES: GradeNumber[] = ["1", "2", "3", "4", "5", "6", "7", "8", "9", "10", "11"];
const SAVED_DECKS_KEY = "audio_darsliklar_ai_lessons_v1";

export default function Lessons() {
  const { language } = useLanguage();
  const uz = language === "uz";
  const { profile } = useStudent();
  const [searchParams, setSearchParams] = useSearchParams();

  const [customLessons, setCustomLessons] = useState<InteractiveLesson[]>(() => {
    try {
      const raw = localStorage.getItem(SAVED_DECKS_KEY);
      const parsed = raw ? JSON.parse(raw) : [];
      return Array.isArray(parsed) ? parsed : [];
    } catch {
      return [];
    }
  });

  useEffect(() => {
    try {
      localStorage.setItem(SAVED_DECKS_KEY, JSON.stringify(customLessons.slice(0, 15)));
    } catch {
      // ignore storage overflow
    }
  }, [customLessons]);

  const [gradeFilter, setGradeFilter] = useState<string>("all");
  const [searchTerm, setSearchTerm] = useState("");
  const [presenterMode, setPresenterMode] = useState(false);

  const allLessons = useMemo(() => [...customLessons, ...INTERACTIVE_LESSONS], [customLessons]);

  const paramId = searchParams.get("id");
  const [activeLessonId, setActiveLessonId] = useState<string>(paramId || INTERACTIVE_LESSONS[0].id);
  const [slideIdx, setSlideIdx] = useState(0);
  const [showTeacherNote, setShowTeacherNote] = useState(true);
  const [pickedOption, setPickedOption] = useState<number | null>(null);

  // AI Slide Presentation Generator Modal State
  const [genOpen, setGenOpen] = useState(false);
  const [genGrade, setGenGrade] = useState<GradeNumber>(profile.grade || "9");
  const [genSubject, setGenSubject] = useState("Adabiyot");
  const [genTopic, setGenTopic] = useState("");
  const [genSlideCount, setGenSlideCount] = useState(5);
  const [genBusy, setGenBusy] = useState(false);
  const [genError, setGenError] = useState<string | null>(null);

  useEffect(() => {
    if (paramId && allLessons.some((l) => l.id === paramId)) {
      setActiveLessonId(paramId);
      setSlideIdx(0);
      setPickedOption(null);
    }
  }, [paramId, allLessons]);

  const filteredLessons = useMemo(() => {
    const q = searchTerm.trim().toLowerCase();
    return allLessons.filter((l) => {
      if (gradeFilter !== "all" && l.grade !== gradeFilter) return false;
      if (!q) return true;
      return (
        l.title.toLowerCase().includes(q) ||
        l.subjectName.toLowerCase().includes(q) ||
        l.keyTerms.some((k) => k.term.toLowerCase().includes(q))
      );
    });
  }, [allLessons, gradeFilter, searchTerm]);

  const activeLesson = useMemo(
    () => allLessons.find((l) => l.id === activeLessonId) || filteredLessons[0] || allLessons[0],
    [allLessons, activeLessonId, filteredLessons],
  );

  const currentSlide = activeLesson.slides[Math.min(slideIdx, activeLesson.slides.length - 1)] || activeLesson.slides[0];
  const slideHeroImage = currentSlide.imageUrl || getSlideHeroImage(currentSlide.visualTheme, activeLesson.subjectName);

  const selectLesson = (lesson: InteractiveLesson) => {
    setActiveLessonId(lesson.id);
    setSlideIdx(0);
    setPickedOption(null);
    setSearchParams({ id: lesson.id }, { replace: true });
  };

  const goSlide = (nextIdx: number) => {
    if (nextIdx < 0 || nextIdx >= activeLesson.slides.length) return;
    setSlideIdx(nextIdx);
    setPickedOption(null);
  };

  const subjectSuggestions = useMemo(() => {
    const set = new Set<string>();
    for (const s of ALL_SUBJECTS) {
      if (s.grade === genGrade && s.lang === language) set.add(s.name);
    }
    return Array.from(set);
  }, [genGrade, language]);

  const handleGenerateSlides = async (e: React.FormEvent) => {
    e.preventDefault();
    const cleanTopic = genTopic.trim();
    if (!cleanTopic) return;
    setGenBusy(true);
    setGenError(null);

    try {
      const res = await fetch("/api/slides", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          grade: genGrade,
          lang: language,
          subject: genSubject.trim() || "Adabiyot",
          topic: cleanTopic,
          slideCount: genSlideCount,
        }),
      });

      const data = await res.json().catch(() => ({}));
      if (!res.ok || !Array.isArray(data.slides) || data.slides.length === 0) {
        setGenError(
          data.error ||
            (uz
              ? "AI taqdimot yaratishda xatolik yuz berdi. Qayta urinib ko'ring."
              : "Ошибка при создании AI-презентации."),
        );
        return;
      }

      const newLesson: InteractiveLesson = {
        id: String(data.id || `ai-deck-${Date.now()}`),
        grade: genGrade,
        subjectName: String(data.subjectName || genSubject),
        lang: language,
        title: String(data.title || cleanTopic),
        durationMin: Number(data.durationMin) || 45,
        objectives: Array.isArray(data.objectives) ? data.objectives : [],
        keyTerms: Array.isArray(data.keyTerms) ? data.keyTerms : [],
        slides: data.slides.map((s: any) => ({
          title: String(s.title),
          subtitle: s.subtitle ? String(s.subtitle) : undefined,
          body: String(s.body || ""),
          bullets: Array.isArray(s.bullets) ? s.bullets.map(String) : [],
          highlight: s.highlight ? String(s.highlight) : undefined,
          teacherNote: String(s.teacherNote || ""),
          visualTheme: s.visualTheme === "stem" || s.visualTheme === "humanities" ? s.visualTheme : undefined,
          imageUrl: getSlideHeroImage(s.visualTheme, genSubject),
          diagram: s.diagram,
          checkQuestion: s.checkQuestion,
        })),
      };

      setCustomLessons((prev) => [newLesson, ...prev]);
      selectLesson(newLesson);
      setGenOpen(false);
      setGenTopic("");
    } catch {
      setGenError(
        uz
          ? "Tarmoq xatoligi yuz berdi. Qayta urinib ko'ring."
          : "Ошибка сети. Попробуйте ещё раз.",
      );
    } finally {
      setGenBusy(false);
    }
  };

  const deleteCustomLesson = (id: string) => {
    setCustomLessons((prev) => prev.filter((l) => l.id !== id));
    if (activeLessonId === id) {
      setActiveLessonId(INTERACTIVE_LESSONS[0].id);
      setSlideIdx(0);
    }
  };

  return (
    <div className="pt-24 pb-20 min-h-screen bg-white dark:bg-slate-950 transition-colors">
      <div className="max-w-7xl mx-auto px-4 sm:px-6">
        {/* Top Header */}
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 pb-8 border-b border-slate-200 dark:border-slate-800">
          <div>
            <p className="text-xs font-bold uppercase tracking-wider text-brand-primary dark:text-blue-400 mb-2">
              {uz ? "1–11 sinf · AI Taqdimot va Slayd Darslar" : "1–11 классы · AI Презентации и Слайд-уроки"}
            </p>
            <h1 className="text-3xl sm:text-4xl font-serif font-black text-slate-900 dark:text-white tracking-tight">
              {uz ? "Taqdimotlar va slayd darslar" : "Презентации и слайд-уроки"}
            </h1>
            <p className="text-slate-600 dark:text-slate-400 text-sm sm:text-base mt-2 max-w-2xl">
              {uz
                ? "AI yordamida mavzuga mos rasmli taqdimot va ko'rgazmali sxemalar yarating yoki tayyor interaktiv darslardan foydalaning."
                : "Создавайте презентации с иллюстрациями и схемами с помощью ИИ или используйте готовые уроки."}
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-2.5">
            <button
              type="button"
              onClick={() => {
                setGenError(null);
                setGenOpen(true);
              }}
              data-testid="open-ai-slide-creator"
              className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-brand-primary hover:bg-blue-700 text-white text-sm font-bold transition-colors whitespace-nowrap"
            >
              <Sparkles size={16} />
              {uz ? "AI Taqdimot yaratish" : "Создать AI презентацию"}
            </button>
            <Link
              to="/materials?type=slides"
              className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-900 text-slate-800 dark:text-slate-200 text-sm font-bold hover:border-brand-primary transition-colors whitespace-nowrap"
            >
              <FileText size={16} />
              {uz ? "Slayd rejasi (A4)" : "План слайдов (A4)"}
            </Link>
          </div>
        </div>

        {/* Filters */}
        <div className="py-6 flex flex-col lg:flex-row lg:items-center justify-between gap-4">
          <div className="flex items-center gap-1.5 overflow-x-auto pb-1 scrollbar-none">
            <button
              type="button"
              onClick={() => setGradeFilter("all")}
              className={`px-3.5 py-2 rounded-lg text-xs font-bold whitespace-nowrap transition-colors ${
                gradeFilter === "all"
                  ? "bg-slate-900 dark:bg-white text-white dark:text-slate-900"
                  : "bg-slate-100 dark:bg-slate-900 text-slate-600 dark:text-slate-300 border border-slate-200 dark:border-slate-800"
              }`}
            >
              {uz ? "Barcha sinflar" : "Все классы"}
            </button>
            {GRADES.map((g) => (
              <button
                key={g}
                type="button"
                onClick={() => setGradeFilter(g)}
                className={`px-3 py-2 rounded-lg text-xs font-bold whitespace-nowrap tabular-nums transition-colors ${
                  gradeFilter === g
                    ? "bg-brand-primary text-white"
                    : "bg-slate-100 dark:bg-slate-900 text-slate-600 dark:text-slate-300 border border-slate-200 dark:border-slate-800 hover:border-brand-primary"
                }`}
              >
                {g}-{uz ? "sinf" : "кл"}
              </button>
            ))}
          </div>

          <div className="relative w-full lg:w-72">
            <Search size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder={uz ? "Mavzu yoki fan qidirish..." : "Поиск темы или предмета..."}
              className="w-full pl-10 pr-4 py-2 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-900 text-sm text-slate-900 dark:text-white outline-none focus:border-brand-primary"
            />
          </div>
        </div>

        {/* Main Workspace: Lesson Sidebar + Interactive Slide Deck Stage */}
        <div className={`grid grid-cols-1 ${presenterMode ? "" : "lg:grid-cols-12"} gap-6 items-start`}>
          {/* Left: Lesson List */}
          {!presenterMode && (
            <div className="lg:col-span-4 space-y-2.5 max-h-[760px] overflow-y-auto pr-1">
              {filteredLessons.length === 0 ? (
                <div className="p-6 rounded-2xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-900 text-center text-sm text-slate-500">
                  {uz ? "Bu filtr bo'yicha dars topilmadi." : "Уроки по фильтру не найдены."}
                </div>
              ) : (
                filteredLessons.map((lesson) => {
                  const isSelected = lesson.id === activeLesson.id;
                  const isCustom = lesson.id.startsWith("ai-deck-");
                  return (
                    <div
                      key={lesson.id}
                      className={`rounded-2xl border transition-colors flex items-center gap-2 pr-2 ${
                        isSelected
                          ? "bg-blue-50/80 dark:bg-blue-950/40 border-brand-primary text-slate-900 dark:text-white"
                          : "bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800 hover:border-slate-300 dark:hover:border-slate-700 text-slate-800 dark:text-slate-200"
                      }`}
                    >
                      <button type="button" onClick={() => selectLesson(lesson)} className="flex-1 text-left p-4 min-w-0">
                        <div className="text-xs font-bold text-slate-500 dark:text-slate-400 mb-1 flex items-center gap-1.5 tabular-nums">
                          <span className="text-brand-primary dark:text-blue-400">
                            {lesson.grade}-{uz ? "sinf" : "кл"}
                          </span>
                          <span>·</span>
                          <span className="truncate">{lesson.subjectName}</span>
                          <span>·</span>
                          <span>
                            {lesson.slides.length} {uz ? "slayd" : "сл."}
                          </span>
                        </div>
                        <h3 className="font-bold text-sm leading-snug line-clamp-2">{lesson.title}</h3>
                      </button>

                      {isCustom && (
                        <button
                          type="button"
                          onClick={() => deleteCustomLesson(lesson.id)}
                          aria-label={uz ? "Taqdimotni o'chirish" : "Удалить"}
                          className="p-2 rounded-lg text-slate-400 hover:text-red-600 shrink-0"
                        >
                          <Trash2 size={14} />
                        </button>
                      )}
                    </div>
                  );
                })
              )}
            </div>
          )}

          {/* Right: Active Slide Viewer */}
          <div className={`${presenterMode ? "max-w-5xl mx-auto w-full" : "lg:col-span-8"} space-y-5`}>
            <div className="rounded-3xl border border-slate-200 dark:border-slate-800 bg-slate-50/70 dark:bg-slate-900 p-5 sm:p-8">
              {/* Deck Header */}
              <div className="flex flex-wrap items-center justify-between gap-3 pb-5 border-b border-slate-200 dark:border-slate-800">
                <div>
                  <div className="flex flex-wrap items-center gap-2 text-xs font-bold text-slate-500 dark:text-slate-400 mb-1 tabular-nums">
                    <span className="text-brand-primary dark:text-blue-400">
                      {activeLesson.grade}-{uz ? "sinf" : "класс"}
                    </span>
                    <span>·</span>
                    <span>{activeLesson.subjectName}</span>
                    <span>·</span>
                    <span className="inline-flex items-center gap-1">
                      <Clock size={13} /> {activeLesson.durationMin} {uz ? "daq" : "мин"}
                    </span>
                  </div>
                  <h2 className="text-xl sm:text-2xl font-serif font-black text-slate-900 dark:text-white">
                    {activeLesson.title}
                  </h2>
                </div>

                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() => setPresenterMode((v) => !v)}
                    className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-xs font-bold text-slate-700 dark:text-slate-200"
                  >
                    {presenterMode ? <Minimize2 size={14} /> : <Maximize2 size={14} />}
                    {presenterMode ? (uz ? "Oddiy ko'rinish" : "Обычный вид") : uz ? "Taqdimot rejimi" : "Режим показа"}
                  </button>
                  <button
                    type="button"
                    onClick={() => setShowTeacherNote((v) => !v)}
                    className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-xs font-bold text-slate-700 dark:text-slate-200"
                  >
                    {showTeacherNote ? <EyeOff size={14} /> : <Eye size={14} />}
                    {uz ? "Metodik izoh" : "Заметка"}
                  </button>
                </div>
              </div>

              {/* Slide Progress Bar */}
              <div className="flex items-center justify-between gap-4 py-4">
                <span className="text-xs font-mono font-bold text-slate-500 dark:text-slate-400 tabular-nums">
                  {uz ? "Slayd" : "Слайд"} {slideIdx + 1} / {activeLesson.slides.length}
                </span>
                <div className="flex-1 h-1.5 rounded-full bg-slate-200 dark:bg-slate-800 overflow-hidden">
                  <div
                    className="h-full bg-brand-primary transition-all duration-300"
                    style={{ width: `${((slideIdx + 1) / activeLesson.slides.length) * 100}%` }}
                  />
                </div>
              </div>

              {/* Slide Canvas */}
              <div
                data-tts-readable="active"
                className="rounded-2xl bg-white dark:bg-slate-950 border border-slate-200 dark:border-slate-800 p-5 sm:p-8 shadow-xs space-y-5"
              >
                <SlideDiagramRenderer
                  heroImage={slideHeroImage}
                  diagram={currentSlide.diagram}
                  slideTitle={currentSlide.title}
                />

                <div>
                  {currentSlide.subtitle && (
                    <p className="text-xs font-bold uppercase tracking-wider text-brand-primary dark:text-blue-400 mb-2">
                      {currentSlide.subtitle}
                    </p>
                  )}
                  <h3 data-tts-question="true" className="text-xl sm:text-2xl font-black text-slate-900 dark:text-white mb-3">
                    {currentSlide.title}
                  </h3>
                  <p className="text-slate-700 dark:text-slate-300 text-sm sm:text-base leading-relaxed">
                    {currentSlide.body}
                  </p>
                </div>

                {currentSlide.bullets.length > 0 && (
                  <ul className="space-y-2.5">
                    {currentSlide.bullets.map((b, idx) => (
                      <li key={idx} className="flex items-start gap-2.5 text-sm text-slate-800 dark:text-slate-200">
                        <span className="w-5 h-5 rounded-md bg-blue-50 dark:bg-blue-950/60 text-brand-primary dark:text-blue-300 text-xs font-black flex items-center justify-center shrink-0 mt-0.5 tabular-nums">
                          {idx + 1}
                        </span>
                        <span data-tts-option="true">{b}</span>
                      </li>
                    ))}
                  </ul>
                )}

                {currentSlide.highlight && (
                  <div className="p-4 rounded-xl bg-blue-50/70 dark:bg-blue-950/30 border border-blue-200/80 dark:border-blue-900/60 text-sm font-semibold text-slate-900 dark:text-blue-100">
                    {currentSlide.highlight}
                  </div>
                )}

                {showTeacherNote && currentSlide.teacherNote && (
                  <div className="p-4 rounded-xl bg-amber-50/70 dark:bg-amber-950/20 border border-amber-200/80 dark:border-amber-900/50 text-xs sm:text-sm text-slate-700 dark:text-amber-100 flex items-start gap-2.5">
                    <Lightbulb size={16} className="text-amber-600 dark:text-amber-400 shrink-0 mt-0.5" />
                    <div>
                      <span className="font-bold text-slate-900 dark:text-amber-200">
                        {uz ? "O'qituvchi uchun tavsiya: " : "Рекомендация учителю: "}
                      </span>
                      {currentSlide.teacherNote}
                    </div>
                  </div>
                )}

                {/* Inline Slide Check Quiz */}
                {currentSlide.checkQuestion && (
                  <div className="pt-5 border-t border-slate-200 dark:border-slate-800">
                    <p className="text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400 mb-2">
                      {uz ? "Tezkor mustahkamlash savoli" : "Быстрая проверка"}
                    </p>
                    <p className="font-bold text-sm sm:text-base text-slate-900 dark:text-white mb-3">
                      {currentSlide.checkQuestion.q}
                    </p>
                    <div className="grid sm:grid-cols-2 gap-2.5">
                      {currentSlide.checkQuestion.options.map((opt, idx) => {
                        const isPicked = pickedOption === idx;
                        const isCorrect = idx === currentSlide.checkQuestion!.answer;
                        let style =
                          "bg-slate-50 dark:bg-slate-900 border-slate-200 dark:border-slate-800 text-slate-800 dark:text-slate-200 hover:border-brand-primary";
                        if (pickedOption !== null) {
                          if (isCorrect) {
                            style =
                              "bg-emerald-50 dark:bg-emerald-950/40 border-emerald-500 text-emerald-900 dark:text-emerald-200";
                          } else if (isPicked) {
                            style = "bg-red-50 dark:bg-red-950/40 border-red-500 text-red-900 dark:text-red-200";
                          }
                        }
                        return (
                          <button
                            key={idx}
                            type="button"
                            disabled={pickedOption !== null}
                            onClick={() => setPickedOption(idx)}
                            className={`p-3 rounded-xl border text-left text-xs sm:text-sm font-bold flex items-center justify-between gap-2 transition-colors ${style}`}
                          >
                            <span>{opt}</span>
                            {pickedOption !== null && isCorrect && (
                              <CheckCircle2 size={15} className="text-emerald-600 shrink-0" />
                            )}
                            {pickedOption !== null && isPicked && !isCorrect && (
                              <XCircle size={15} className="text-red-600 shrink-0" />
                            )}
                          </button>
                        );
                      })}
                    </div>
                    {pickedOption !== null && (
                      <p className="mt-3 text-xs sm:text-sm text-slate-600 dark:text-slate-300 bg-slate-50 dark:bg-slate-900 p-3 rounded-xl border border-slate-200 dark:border-slate-800">
                        {currentSlide.checkQuestion.explain}
                      </p>
                    )}
                  </div>
                )}
              </div>

              {/* Slide Controls */}
              <div className="flex flex-wrap items-center justify-between gap-3 mt-5">
                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    disabled={slideIdx === 0}
                    onClick={() => goSlide(slideIdx - 1)}
                    className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-sm font-bold text-slate-800 dark:text-slate-200 disabled:opacity-40"
                  >
                    <ChevronLeft size={16} />
                    {uz ? "Oldingi" : "Назад"}
                  </button>
                  <button
                    type="button"
                    disabled={slideIdx >= activeLesson.slides.length - 1}
                    onClick={() => goSlide(slideIdx + 1)}
                    className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-brand-primary hover:bg-blue-700 text-white text-sm font-bold disabled:opacity-40"
                  >
                    {uz ? "Keyingi slayd" : "Следующий"}
                    <ChevronRight size={16} />
                  </button>
                </div>

                <div className="flex flex-wrap items-center gap-2">
                  {activeLesson.quizId && (
                    <Link
                      to={`/tests/${activeLesson.quizId}`}
                      className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-xs font-bold text-slate-800 dark:text-slate-200 hover:border-brand-primary"
                    >
                      <BookOpen size={14} />
                      {uz ? "Mavzu testi" : "Тест по теме"}
                    </Link>
                  )}
                  <Link
                    to="/tests?section=games"
                    className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-slate-900 dark:bg-white text-white dark:text-slate-900 text-xs font-bold hover:opacity-90"
                  >
                    <Gamepad2 size={14} />
                    {uz ? "O'yinlarda mustahkamlash" : "Закрепить в играх"}
                  </Link>
                </div>
              </div>
            </div>

            {/* Objectives & Key Terms */}
            {(activeLesson.objectives.length > 0 || activeLesson.keyTerms.length > 0) && (
              <div className="grid sm:grid-cols-2 gap-4">
                {activeLesson.objectives.length > 0 && (
                  <div className="p-5 rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900">
                    <h4 className="text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400 mb-3">
                      {uz ? "Dars maqsadlari" : "Цели урока"}
                    </h4>
                    <ul className="space-y-2 text-xs sm:text-sm text-slate-700 dark:text-slate-300">
                      {activeLesson.objectives.map((obj, i) => (
                        <li key={i} className="flex items-start gap-2">
                          <CheckCircle2 size={15} className="text-brand-primary shrink-0 mt-0.5" />
                          <span>{obj}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                )}

                {activeLesson.keyTerms.length > 0 && (
                  <div className="p-5 rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900">
                    <h4 className="text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400 mb-3">
                      {uz ? "Tayanch atamalar" : "Ключевые термины"}
                    </h4>
                    <dl className="space-y-2.5 text-xs sm:text-sm">
                      {activeLesson.keyTerms.map((kt, i) => (
                        <div key={i}>
                          <dt className="font-bold text-slate-900 dark:text-white">{kt.term}</dt>
                          <dd className="text-slate-600 dark:text-slate-400">{kt.def}</dd>
                        </div>
                      ))}
                    </dl>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* AI Taqdimot Generator Modal */}
      {genOpen && (
        <div
          role="dialog"
          aria-modal="true"
          className="fixed inset-0 z-50 bg-slate-950/60 backdrop-blur-xs flex items-center justify-center p-4"
        >
          <div className="w-full max-w-lg rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-6 shadow-2xl">
            <div className="flex items-center justify-between mb-4">
              <div>
                <p className="text-xs font-bold uppercase tracking-wider text-brand-primary dark:text-blue-400 mb-0.5">
                  {uz ? "Gemini AI · Rasmli va sxemali slaydlar" : "Gemini AI · Слайды с иллюстрациями"}
                </p>
                <h3 className="text-lg font-serif font-black text-slate-900 dark:text-white">
                  {uz ? "AI Taqdimot yaratish" : "Создать AI презентацию"}
                </h3>
              </div>
              <button
                type="button"
                onClick={() => setGenOpen(false)}
                aria-label={uz ? "Yopish" : "Закрыть"}
                className="text-slate-400 hover:text-slate-700 dark:hover:text-white"
              >
                <X size={20} />
              </button>
            </div>

            <form onSubmit={handleGenerateSlides} className="space-y-4">
              <div className="grid grid-cols-3 gap-3">
                <div>
                  <label className="block text-xs font-bold text-slate-500 mb-1">{uz ? "Sinf" : "Класс"}</label>
                  <select
                    value={genGrade}
                    onChange={(e) => setGenGrade(e.target.value as GradeNumber)}
                    className="w-full px-3 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-sm font-bold text-slate-900 dark:text-white"
                  >
                    {GRADES.map((g) => (
                      <option key={g} value={g}>
                        {g}-{uz ? "sinf" : "кл"}
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-500 mb-1">{uz ? "Fan" : "Предмет"}</label>
                  <input
                    list="lesson-subjects-list"
                    value={genSubject}
                    onChange={(e) => setGenSubject(e.target.value)}
                    className="w-full px-3 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-sm font-bold text-slate-900 dark:text-white"
                  />
                  <datalist id="lesson-subjects-list">
                    {subjectSuggestions.map((s) => (
                      <option key={s} value={s} />
                    ))}
                  </datalist>
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-500 mb-1">{uz ? "Slaydlar" : "Слайдов"}</label>
                  <select
                    value={genSlideCount}
                    onChange={(e) => setGenSlideCount(Number(e.target.value))}
                    className="w-full px-3 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-sm font-bold text-slate-900 dark:text-white"
                  >
                    {[4, 5, 6, 7, 8].map((n) => (
                      <option key={n} value={n}>
                        {n} {uz ? "ta" : "шт."}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-500 mb-1">
                  {uz ? "Taqdimot mavzusi" : "Тема презентации"}
                </label>
                <input
                  type="text"
                  required
                  value={genTopic}
                  onChange={(e) => setGenTopic(e.target.value)}
                  placeholder={uz ? "Masalan: Pifagor teoremasi yoki Alisher Navoiy" : "Например: Теорема Пифагора"}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-sm text-slate-900 dark:text-white"
                />
              </div>

              {genError && (
                <div className="p-3 rounded-xl bg-red-50 dark:bg-red-950/40 border border-red-200 dark:border-red-900 text-xs font-semibold text-red-700 dark:text-red-300">
                  {genError}
                </div>
              )}

              <div className="flex justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setGenOpen(false)}
                  className="px-4 py-2 rounded-xl border border-slate-200 dark:border-slate-700 text-sm font-bold text-slate-700 dark:text-slate-300"
                >
                  {uz ? "Bekor qilish" : "Отмена"}
                </button>
                <button
                  type="submit"
                  disabled={genBusy}
                  data-testid="submit-ai-slide-creator"
                  className="inline-flex items-center gap-2 px-5 py-2 rounded-xl bg-brand-primary hover:bg-blue-700 text-white text-sm font-bold disabled:opacity-50"
                >
                  <Plus size={16} />
                  {genBusy ? (uz ? "AI tuzmoqda..." : "Создаётся...") : uz ? "Yaratish" : "Создать"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
