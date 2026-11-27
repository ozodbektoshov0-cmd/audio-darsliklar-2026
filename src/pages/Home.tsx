/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import {
  ArrowRight,
  BookOpen,
  Bot,
  ChevronDown,
  ChevronLeft,
  ChevronRight,
  FileText,
  Gamepad2,
  GraduationCap,
  Headphones,
  Mic,
  Presentation,
  Printer,
  Sparkles,
} from "lucide-react";
import Hero from "../components/Hero";
import Features from "../components/Features";
import { INTERACTIVE_LESSONS } from "../data/lessonsData";
import { GAMES_SEARCH_INDEX, MATERIAL_TYPES, generateDeterministicMaterial } from "../utils/smartSearch";
import { ALL_SUBJECTS } from "../data";
import { useLanguage } from "../context/LanguageContext";
import { useStudent, type GradeNumber } from "../context/StudentContext";

const FEATURED_BOOK_IDS = [
  "g9-uz-adabiyot",
  "g8-uz-adabiyot",
  "g7-uz-algebra",
  "g8-uz-fizika",
  "g9-uz-biologiya",
  "g10-uz-ozbekiston-tarixi",
];

export default function Home() {
  const { language } = useLanguage();
  const uz = language === "uz";
  const navigate = useNavigate();
  const { profile, setGrade } = useStudent();

  // Live Interactive Slide Demo state
  const demoLesson = INTERACTIVE_LESSONS[0];
  const [demoSlideIdx, setDemoSlideIdx] = useState(0);
  const demoSlide = demoLesson.slides[demoSlideIdx] || demoLesson.slides[0];

  // Live Material Generator Preview state
  const [activeMatTab, setActiveMatTab] = useState(MATERIAL_TYPES[0].id);
  const previewMat = generateDeterministicMaterial({
    typeId: activeMatTab,
    grade: profile.grade || "9",
    subject: "Adabiyot",
    topic: "Alpomish dostoni",
    count: 5,
  });

  // FAQ accordion state
  const [openFaq, setOpenFaq] = useState<number | null>(0);

  const featuredBooks = FEATURED_BOOK_IDS.map((id) => ALL_SUBJECTS.find((s) => s.id === id)).filter(
    (s): s is NonNullable<typeof s> => Boolean(s),
  );

  const faqs = [
    {
      q: uz ? "Platformadan foydalanish haqiqatan ham 100% bepulmi?" : "Платформа действительно на 100% бесплатная?",
      a: uz
        ? "Ha. Barcha 1–11 sinf darsliklari, tayyor slayd darslar, 15 ta o'yin, AI material generatori hamda testlar hech qanday obuna yoki to'lovsiz ochiq."
        : "Да. Все учебники 1–11 классов, слайд-уроки, 15 игр и генератор материалов полностью бесплатны.",
    },
    {
      q: uz ? "O'qituvchi o'z testini yuklashi va o'yinga aylantirishi mumkinmi?" : "Может ли учитель загрузить свой тест для игр?",
      a: uz
        ? "Ha. Google akkaunt bilan kirib, «Yaratish» tugmasi orqali savollarni qo'lda kiriting yoki PDF, DOCX, TXT fayl yuklang — barcha 15 o'yin avtomatik ishlaydi."
        : "Да. Войдите через Google, нажмите «Создать» и введите вопросы или загрузите PDF, DOCX, TXT файл.",
    },
    {
      q: uz ? "BSB/ChSB va ishchi varaqlarni chop etsa bo'ladimi?" : "Можно ли распечатать СОР/СОЧ и рабочие листы?",
      a: uz
        ? "Ha. «Materiallar» bo'limida istalgan turdagi materialni tanlab, javoblar kalitini yoqing yoki yashiring va «Chop etish / PDF» tugmasini bosing."
        : "Да. В разделе «Материалы» выберите тип задания, настройте ключ ответов и нажмите «Печать / PDF».",
    },
    {
      q: uz ? "Audio darsliklar qaysi sinflar uchun mavjud?" : "Для каких классов доступны аудиоматериалы?",
      a: uz
        ? "8–9-sinf Adabiyot fanlari uchun tayyor YouTube audio pleylistlar biriktirilgan, shuningdek «TTS Studiya» orqali istalgan matnni ovozga aylantirib MP3 yuklash mumkin."
        : "Для Литературы 8–9 классов подключены аудиоплейлисты, а любой текст можно озвучить в TTS-студии.",
    },
  ];

  const grades: GradeNumber[] = ["1", "2", "3", "4", "5", "6", "7", "8", "9", "10", "11"];

  return (
    <div>
      <Hero />
      <Features />

      {/* 1. Interactive Slide Lesson Preview Section */}
      <section className="py-16 sm:py-20 bg-white dark:bg-slate-950 border-b border-slate-200 dark:border-slate-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6">
          <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 mb-8">
            <div>
              <p className="text-xs font-bold uppercase tracking-wider text-brand-primary dark:text-blue-400 mb-2">
                {uz ? "Jonli dars namunasi" : "Пример интерактивного урока"}
              </p>
              <h2 className="text-2xl sm:text-4xl font-serif font-black text-slate-900 dark:text-white tracking-tight">
                {uz ? "Slayd dars qanday ishlaydi?" : "Как устроен слайд-урок?"}
              </h2>
            </div>
            <Link
              to="/lessons"
              className="inline-flex items-center gap-1.5 text-sm font-bold text-brand-primary dark:text-blue-400 hover:underline whitespace-nowrap"
            >
              {uz ? "Barcha slayd darslarni ochish" : "Все слайд-уроки"} <ArrowRight size={16} />
            </Link>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-stretch">
            <div className="lg:col-span-5 p-6 rounded-2xl bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 flex flex-col justify-between">
              <div>
                <p className="text-xs font-bold text-brand-primary dark:text-blue-400 mb-1">
                  {demoLesson.grade}-{uz ? "sinf" : "кл"} · {demoLesson.subjectName} · {demoLesson.durationMin}{" "}
                  {uz ? "daq" : "мин"}
                </p>
                <h3 className="text-xl font-black text-slate-900 dark:text-white mb-4">{demoLesson.title}</h3>
                <div className="space-y-2">
                  {demoLesson.slides.map((s, idx) => (
                    <button
                      key={idx}
                      type="button"
                      onClick={() => setDemoSlideIdx(idx)}
                      className={`w-full text-left px-3.5 py-2.5 rounded-xl border text-xs sm:text-sm font-bold flex items-center justify-between gap-2 transition-colors ${
                        demoSlideIdx === idx
                          ? "bg-brand-primary border-brand-primary text-white"
                          : "bg-white dark:bg-slate-950 border-slate-200 dark:border-slate-800 text-slate-700 dark:text-slate-300 hover:border-brand-primary"
                      }`}
                    >
                      <span className="truncate">
                        {idx + 1}. {s.title}
                      </span>
                      <ChevronRight size={14} className="shrink-0" />
                    </button>
                  ))}
                </div>
              </div>

              <div className="pt-5 mt-5 border-t border-slate-200 dark:border-slate-800 flex items-center justify-between text-xs text-slate-500">
                <span>{uz ? "Metodik izoh + tekshiruv testi bilan" : "С методикой и мини-тестом"}</span>
                <Presentation size={16} className="text-brand-primary" />
              </div>
            </div>

            <div className="lg:col-span-7 p-6 sm:p-8 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xs flex flex-col justify-between">
              <div>
                <div className="flex items-center justify-between gap-2 mb-3">
                  <span className="text-xs font-bold uppercase tracking-wider text-brand-primary dark:text-blue-400">
                    {demoSlide.subtitle}
                  </span>
                  <span className="text-xs font-mono font-bold text-slate-400 tabular-nums">
                    {demoSlideIdx + 1} / {demoLesson.slides.length}
                  </span>
                </div>
                <h4 className="text-xl sm:text-2xl font-black text-slate-900 dark:text-white mb-3">{demoSlide.title}</h4>
                <p className="text-sm sm:text-base text-slate-600 dark:text-slate-300 leading-relaxed mb-4">
                  {demoSlide.body}
                </p>
                <ul className="space-y-2 mb-5">
                  {demoSlide.bullets.map((b, i) => (
                    <li key={i} className="text-sm text-slate-800 dark:text-slate-200 flex items-start gap-2">
                      <span className="font-mono font-bold text-brand-primary">0{i + 1}.</span>
                      <span>{b}</span>
                    </li>
                  ))}
                </ul>
              </div>

              <div className="flex flex-wrap items-center justify-between gap-3 pt-4 border-t border-slate-100 dark:border-slate-800">
                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    disabled={demoSlideIdx === 0}
                    onClick={() => setDemoSlideIdx((i) => Math.max(0, i - 1))}
                    className="p-2 rounded-lg border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-200 disabled:opacity-40"
                    aria-label={uz ? "Oldingi slayd" : "Предыдущий"}
                  >
                    <ChevronLeft size={16} />
                  </button>
                  <button
                    type="button"
                    disabled={demoSlideIdx >= demoLesson.slides.length - 1}
                    onClick={() => setDemoSlideIdx((i) => Math.min(demoLesson.slides.length - 1, i + 1))}
                    className="p-2 rounded-lg border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-200 disabled:opacity-40"
                    aria-label={uz ? "Keyingi slayd" : "Следующий"}
                  >
                    <ChevronRight size={16} />
                  </button>
                </div>

                <Link
                  to={`/lessons?id=${demoLesson.id}`}
                  className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-brand-primary hover:bg-blue-700 text-white text-xs sm:text-sm font-bold transition-colors"
                >
                  {uz ? "To'liq darsni ochish" : "Открыть урок полностью"} <ArrowRight size={15} />
                </Link>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 2. 15 Intellectual Games Showcase */}
      <section className="py-16 sm:py-20 bg-slate-50 dark:bg-slate-950 border-b border-slate-200 dark:border-slate-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6">
          <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 mb-8">
            <div>
              <p className="text-xs font-bold uppercase tracking-wider text-brand-primary dark:text-blue-400 mb-2">
                {uz ? "Sinf va yakka bellashuvlar" : "Игры для класса и соло"}
              </p>
              <h2 className="text-2xl sm:text-4xl font-serif font-black text-slate-900 dark:text-white tracking-tight">
                {uz ? "15 xil intellektual o'yin" : "15 интеллектуальных игр"}
              </h2>
            </div>
            <Link
              to="/tests?section=games"
              className="inline-flex items-center gap-1.5 text-sm font-bold text-brand-primary dark:text-blue-400 hover:underline whitespace-nowrap"
            >
              {uz ? "Barcha 15 o'yinni ochish" : "Открыть все 15 игр"} <ArrowRight size={16} />
            </Link>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {GAMES_SEARCH_INDEX.slice(0, 8).map((g, idx) => (
              <Link
                key={g.id}
                to={`/tests?section=games&game=${g.id}`}
                className="p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 hover:border-brand-primary transition-colors flex flex-col justify-between gap-3 group"
              >
                <div>
                  <div className="flex items-center justify-between text-xs font-mono font-bold text-slate-400 mb-2">
                    <span>{String(idx + 1).padStart(2, "0")}</span>
                    <Gamepad2 size={16} className="text-brand-primary" />
                  </div>
                  <h3 className="font-black text-base text-slate-900 dark:text-white group-hover:text-brand-primary transition-colors">
                    {uz ? g.titleUz : g.titleRu}
                  </h3>
                  <p className="text-xs text-slate-600 dark:text-slate-400 mt-1">{g.desc}</p>
                </div>
                <span className="text-xs font-bold text-brand-primary inline-flex items-center gap-1">
                  {uz ? "O'ynash" : "Играть"} <ArrowRight size={13} />
                </span>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* 3. AI Material Generator Interactive Preview */}
      <section className="py-16 sm:py-20 bg-white dark:bg-slate-950 border-b border-slate-200 dark:border-slate-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6">
          <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 mb-6">
            <div>
              <p className="text-xs font-bold uppercase tracking-wider text-brand-primary dark:text-blue-400 mb-2">
                {uz ? "Chop etishga tayyor A4 varaqlar" : "Готовые листы A4 для печати"}
              </p>
              <h2 className="text-2xl sm:text-4xl font-serif font-black text-slate-900 dark:text-white tracking-tight">
                {uz ? "AI Material Generatori" : "ИИ Генератор материалов"}
              </h2>
            </div>
            <Link
              to={`/materials?type=${activeMatTab}`}
              className="inline-flex items-center gap-1.5 px-4 py-2.5 rounded-xl bg-brand-primary hover:bg-blue-700 text-white text-xs sm:text-sm font-bold whitespace-nowrap transition-colors"
            >
              <Printer size={15} />
              {uz ? "Material yaratishni ochish" : "Создать материал"}
            </Link>
          </div>

          <div className="flex items-center gap-2 overflow-x-auto pb-4 scrollbar-none">
            {MATERIAL_TYPES.map((m) => (
              <button
                key={m.id}
                type="button"
                onClick={() => setActiveMatTab(m.id)}
                className={`px-3.5 py-2 rounded-xl text-xs font-bold whitespace-nowrap transition-colors ${
                  activeMatTab === m.id
                    ? "bg-slate-900 dark:bg-white text-white dark:text-slate-900"
                    : "bg-slate-100 dark:bg-slate-900 text-slate-600 dark:text-slate-300 border border-slate-200 dark:border-slate-800 hover:border-brand-primary"
                }`}
              >
                {uz ? m.titleUz : m.titleRu}
              </button>
            ))}
          </div>

          <div className="p-6 sm:p-8 rounded-2xl bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800">
            <div className="flex flex-wrap items-center justify-between gap-3 pb-4 mb-4 border-b border-slate-200 dark:border-slate-800">
              <div>
                <h3 className="font-serif font-black text-lg text-slate-900 dark:text-white">{previewMat.title}</h3>
                <p className="text-xs text-slate-500 mt-0.5">{previewMat.instructions}</p>
              </div>
              <Link
                to={`/materials?type=${activeMatTab}`}
                className="text-xs font-bold text-brand-primary hover:underline inline-flex items-center gap-1"
              >
                {uz ? "Tahrirlash va chop etish" : "Редактировать и печатать"} <ArrowRight size={13} />
              </Link>
            </div>
            <div className="grid sm:grid-cols-2 gap-3">
              {previewMat.blocks.slice(0, 4).map((b) => (
                <div
                  key={b.number}
                  className="p-3.5 rounded-xl bg-white dark:bg-slate-950 border border-slate-200 dark:border-slate-800 text-xs sm:text-sm"
                >
                  <p className="font-bold text-slate-900 dark:text-white line-clamp-2">
                    <span className="tabular-nums mr-1">{b.number}.</span>
                    {b.prompt}
                  </p>
                  <p className="text-xs text-emerald-600 dark:text-emerald-400 mt-1.5 font-semibold">
                    {uz ? "Kalit:" : "Ответ:"} {b.answer}
                  </p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* 4. Featured Textbooks + Audio + AI Tools */}
      <section className="py-16 sm:py-20 bg-slate-50 dark:bg-slate-950 border-b border-slate-200 dark:border-slate-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6">
          <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 mb-8">
            <div>
              <p className="text-xs font-bold uppercase tracking-wider text-brand-primary dark:text-blue-400 mb-2">
                {uz ? "Eng ko'p izlanadigan fanlar" : "Популярные учебники"}
              </p>
              <h2 className="text-2xl sm:text-3xl font-serif font-black text-slate-900 dark:text-white">
                {uz ? "Darsliklar va Audio Studiya" : "Учебники и Аудиостудия"}
              </h2>
            </div>
            <Link to="/library" className="text-sm font-bold text-brand-primary hover:underline inline-flex items-center gap-1">
              {uz ? "Barcha 718 fanni ko'rish" : "Все учебники"} <ArrowRight size={15} />
            </Link>
          </div>

          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4 mb-8">
            {featuredBooks.map((book) => {
              const hasAudio = Boolean(book.hasAudio || book.resources.some((r) => Boolean(r.audioUrl)));
              return (
                <Link
                  key={book.id}
                  to={`/library?grade=${book.grade}&q=${encodeURIComponent(book.name)}`}
                  className="p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 hover:border-brand-primary transition-colors flex items-center justify-between gap-3"
                >
                  <div className="min-w-0">
                    <p className="text-xs font-semibold text-slate-500 dark:text-slate-400">
                      {book.grade}-{uz ? "sinf" : "кл"} · {book.category}
                      {hasAudio ? " · Audio" : ""}
                    </p>
                    <h3 className="font-bold text-base text-slate-900 dark:text-white truncate mt-0.5">{book.name}</h3>
                  </div>
                  <div className="w-9 h-9 rounded-xl bg-blue-50 dark:bg-blue-950/60 text-brand-primary flex items-center justify-center shrink-0">
                    {hasAudio ? <Headphones size={17} /> : <FileText size={17} />}
                  </div>
                </Link>
              );
            })}
          </div>

          <div className="grid md:grid-cols-2 gap-4">
            <Link
              to="/tts"
              className="p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 hover:border-brand-primary transition-colors flex items-center justify-between gap-4"
            >
              <div className="flex items-center gap-3.5">
                <div className="w-11 h-11 rounded-xl bg-amber-50 dark:bg-amber-950/40 text-amber-600 flex items-center justify-center shrink-0">
                  <Mic size={20} />
                </div>
                <div>
                  <h4 className="font-black text-slate-900 dark:text-white text-sm sm:text-base">
                    {uz ? "TTS Audio Studiya (.wav)" : "Аудиостудия TTS (.wav)"}
                  </h4>
                  <p className="text-xs text-slate-500">
                    {uz ? "Istalgan dars matnini ovozga aylantirib yuklab oling" : "Озвучивайте тексты и скачивайте WAV"}
                  </p>
                </div>
              </div>
              <ArrowRight size={16} className="text-slate-400 shrink-0" />
            </Link>

            <Link
              to="/ai-tutor"
              className="p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 hover:border-brand-primary transition-colors flex items-center justify-between gap-4"
            >
              <div className="flex items-center gap-3.5">
                <div className="w-11 h-11 rounded-xl bg-blue-50 dark:bg-blue-950/60 text-brand-primary flex items-center justify-center shrink-0">
                  <Bot size={20} />
                </div>
                <div>
                  <h4 className="font-black text-slate-900 dark:text-white text-sm sm:text-base">
                    {uz ? "AI Ustoz (24/7 Repetitor)" : "AI Учитель 24/7"}
                  </h4>
                  <p className="text-xs text-slate-500">
                    {uz ? "Mavzu, formula va misollarni bir zumda tushuntirib beradi" : "Объясняет темы, формулы и задачи"}
                  </p>
                </div>
              </div>
              <ArrowRight size={16} className="text-slate-400 shrink-0" />
            </Link>
          </div>
        </div>
      </section>

      {/* 5. Quick Student Grade Bar & FAQ Accordion */}
      <section className="py-16 bg-white dark:bg-slate-950">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 space-y-14">
          {/* Student Grade Quick Select */}
          <div className="p-6 sm:p-8 rounded-2xl bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 flex flex-col lg:flex-row items-start lg:items-center justify-between gap-5">
            <div className="flex items-center gap-3.5">
              <div className="w-11 h-11 rounded-xl bg-brand-primary text-white flex items-center justify-center shrink-0">
                <GraduationCap size={22} />
              </div>
              <div>
                <h3 className="font-black text-base sm:text-lg text-slate-900 dark:text-white">
                  {profile.grade
                    ? uz
                      ? `Siz ${profile.grade}-sinfni tanlagansiz`
                      : `Выбран ${profile.grade} класс`
                    : uz
                      ? "O'z sinfingizni belgilang"
                      : "Выберите свой класс"}
                </h3>
                <p className="text-xs sm:text-sm text-slate-500">
                  {uz ? "Darsliklar va testlar sinfingizga moslab saralanadi." : "Учебники и тесты подстроятся под ваш класс."}
                </p>
              </div>
            </div>

            <div className="flex flex-wrap items-center gap-1.5">
              {grades.map((g) => (
                <button
                  key={g}
                  type="button"
                  onClick={() => {
                    setGrade(g);
                    navigate(`/library?grade=${g}`);
                  }}
                  className={`px-3 py-1.5 rounded-lg text-xs font-bold tabular-nums transition-colors ${
                    profile.grade === g
                      ? "bg-brand-primary text-white"
                      : "bg-white dark:bg-slate-950 border border-slate-200 dark:border-slate-800 text-slate-700 dark:text-slate-300 hover:border-brand-primary"
                  }`}
                >
                  {g}
                </button>
              ))}
            </div>
          </div>

          {/* FAQ */}
          <div>
            <h2 className="text-2xl sm:text-3xl font-serif font-black text-slate-900 dark:text-white mb-6 text-center">
              {uz ? "Ko'p beriladigan savollar" : "Частые вопросы"}
            </h2>
            <div className="divide-y divide-slate-200 dark:divide-slate-800 border border-slate-200 dark:border-slate-800 rounded-2xl overflow-hidden bg-white dark:bg-slate-900">
              {faqs.map((f, idx) => {
                const isOpen = openFaq === idx;
                return (
                  <div key={idx}>
                    <button
                      type="button"
                      onClick={() => setOpenFaq(isOpen ? null : idx)}
                      className="w-full px-5 py-4 text-left flex items-center justify-between gap-4 hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors"
                    >
                      <span className="font-bold text-sm sm:text-base text-slate-900 dark:text-white">{f.q}</span>
                      <ChevronDown
                        size={17}
                        className={`text-slate-400 shrink-0 transition-transform ${isOpen ? "rotate-180" : ""}`}
                      />
                    </button>
                    {isOpen && (
                      <div className="px-5 pb-4 text-xs sm:text-sm text-slate-600 dark:text-slate-300 leading-relaxed">
                        {f.a}
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
