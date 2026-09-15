/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from "react";
import { motion } from "motion/react";
import { 
  GraduationCap, 
  BookOpen, 
  FileText, 
  Youtube, 
  CheckCircle2, 
  ArrowRight, 
  User, 
  Sparkles, 
  Check, 
  Bookmark,
  BookmarkCheck,
  Share2,
  Headphones,
  ExternalLink
} from "lucide-react";
import { TEXTBOOKS } from "../constants";
import { useStudent, GradeNumber } from "../context/StudentContext";
import { useLanguage } from "../context/LanguageContext";
import { Link } from "react-router-dom";
import MyFavoritesSection from "../components/MyFavoritesSection";
import { getSafePdfUrl } from "../utils/pdfHelper";

const ALL_GRADES: GradeNumber[] = ["1", "2", "3", "4", "5", "6", "7", "8", "9", "10", "11"];

export default function StudentProfile() {
  const { 
    profile, 
    setGrade, 
    setStudentName, 
    toggleBookmark, 
    isBookmarked,
    toggleBookmarkItem,
    isItemBookmarked
  } = useStudent();
  
  const { language, t } = useLanguage();
  const [nameInput, setNameInput] = useState(profile.studentName);
  const [isEditingName, setIsEditingName] = useState(false);
  const [copiedLink, setCopiedLink] = useState(false);

  const handleSaveName = (e: React.FormEvent) => {
    e.preventDefault();
    setStudentName(nameInput.trim());
    setIsEditingName(false);
  };

  const handleShare = () => {
    if (navigator.clipboard) {
      navigator.clipboard.writeText(window.location.href);
      setCopiedLink(true);
      setTimeout(() => setCopiedLink(false), 2000);
    }
  };

  // Find user's specific textbook
  const userTextbook = profile.grade 
    ? TEXTBOOKS.find(t => t.grade === profile.grade)
    : null;

  // Other textbooks
  const otherTextbooks = profile.grade
    ? TEXTBOOKS.filter(t => t.grade !== profile.grade)
    : TEXTBOOKS;

  const totalSavedCount = profile.savedItems?.length || 0;

  return (
    <div className="min-h-screen bg-slate-50/50 dark:bg-slate-950 py-12 px-4 sm:px-6 lg:px-8 transition-colors">
      <div className="max-w-6xl mx-auto space-y-12">
        
        {/* Profile Card Header */}
        <div className="bg-white dark:bg-slate-900 rounded-[3rem] border border-slate-100 dark:border-slate-800 p-8 md:p-12 shadow-xl shadow-brand-primary/5 relative overflow-hidden transition-colors">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-8">
            <div className="flex items-start sm:items-center gap-6">
              <div className="w-20 h-20 md:w-24 md:h-24 rounded-3xl bg-brand-primary/10 dark:bg-brand-primary/20 text-brand-primary dark:text-blue-400 flex items-center justify-center shrink-0 shadow-inner">
                {profile.grade ? (
                  <span className="text-3xl md:text-4xl font-black font-serif">{profile.grade}</span>
                ) : (
                  <GraduationCap size={44} />
                )}
              </div>

              <div>
                {isEditingName ? (
                  <form onSubmit={handleSaveName} className="flex items-center gap-2">
                    <input
                      type="text"
                      value={nameInput}
                      onChange={(e) => setNameInput(e.target.value)}
                      placeholder={language === "uz" ? "Ismingizni kiriting..." : "Введите ваше имя..."}
                      autoFocus
                      className="px-4 py-2 border-2 border-brand-primary rounded-xl text-xl font-serif font-black text-slate-900 dark:text-white bg-white dark:bg-slate-800 outline-none"
                    />
                    <button
                      type="submit"
                      className="px-4 py-2 bg-brand-primary text-white font-bold rounded-xl text-sm hover:bg-blue-700 transition-colors"
                    >
                      {language === "uz" ? "Saqlash" : "Сохранить"}
                    </button>
                  </form>
                ) : (
                  <div className="flex items-center gap-3">
                    <h1 className="text-3xl md:text-5xl font-serif font-black text-slate-900 dark:text-white tracking-tight">
                      {profile.studentName 
                        ? profile.studentName 
                        : (profile.grade 
                            ? (language === "uz" ? `${profile.grade}-sinf o'quvchisi` : `Ученик ${profile.grade} класса`) 
                            : (language === "uz" ? "Hurmatli o'quvchi" : "Уважаемый ученик"))}
                    </h1>
                    <button
                      onClick={() => {
                        setNameInput(profile.studentName);
                        setIsEditingName(true);
                      }}
                      className="p-2 text-slate-400 dark:text-slate-400 hover:text-brand-primary dark:hover:text-blue-400 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-xl transition-colors"
                      title={language === "uz" ? "Ismni o'zgartirish" : "Изменить имя"}
                    >
                      <User size={18} />
                    </button>
                  </div>
                )}

                <p className="text-slate-500 dark:text-slate-300 font-medium mt-2 text-base md:text-lg">
                  {profile.grade 
                    ? (language === "uz" 
                        ? `${profile.grade}-sinf darsliklari va shaxsiy o'quv rejangiz.` 
                        : `Учебники ${profile.grade} класса и ваш персональный план.`)
                    : (language === "uz" 
                        ? "O'z sinfingizni tanlang va kerakli darsliklarni birinchi bo'lib ko'ring." 
                        : "Выберите свой класс, чтобы видеть нужные учебники в первую очередь.")}
                </p>
              </div>
            </div>

            {/* Action buttons */}
            <div className="flex flex-wrap items-center gap-3 self-start md:self-center">
              {/* Quick Jump to Favorites */}
              <a
                href="#my-favorites-section"
                className="flex items-center gap-2 px-5 py-3 bg-amber-50 dark:bg-amber-950/40 hover:bg-amber-100 dark:hover:bg-amber-900/50 text-amber-700 dark:text-amber-300 rounded-2xl font-bold text-sm border border-amber-200/80 dark:border-amber-800/80 transition-all shadow-xs"
              >
                <Bookmark size={16} fill="currentColor" />
                <span>{t("myFavorites")}</span>
                <span className="px-2 py-0.5 rounded-full bg-amber-200/60 dark:bg-amber-800/60 text-amber-900 dark:text-amber-100 text-xs font-black">
                  {totalSavedCount}
                </span>
              </a>

              <button
                onClick={handleShare}
                className="flex items-center gap-2 px-5 py-3 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 rounded-2xl font-bold text-sm transition-all"
              >
                {copiedLink ? <Check size={16} className="text-green-600 dark:text-green-400" /> : <Share2 size={16} />}
                <span>{copiedLink ? (language === "uz" ? "Nusxalandi!" : "Скопировано!") : (language === "uz" ? "Ulashish" : "Поделиться")}</span>
              </button>
            </div>
          </div>

          {/* Grade Selector Strip */}
          <div className="mt-10 pt-8 border-t border-slate-100 dark:border-slate-800">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-4">
              <span className="text-xs font-black uppercase tracking-widest text-slate-400 dark:text-slate-400">
                {language === "uz" ? "Sinfingizni tanlang (1-11):" : "Выберите класс (1-11):"}
              </span>
              {profile.grade && (
                <span className="text-xs font-bold text-brand-primary dark:text-blue-400 flex items-center gap-1">
                  <CheckCircle2 size={14} /> {language === "uz" ? `Tanlangan sinf: ${profile.grade}-sinf` : `Выбранный класс: ${profile.grade} класс`}
                </span>
              )}
            </div>

            <div className="grid grid-cols-6 sm:grid-cols-11 gap-2">
              {ALL_GRADES.map((g) => {
                const isCurrent = profile.grade === g;
                return (
                  <button
                    key={g}
                    onClick={() => setGrade(g)}
                    className={`h-12 rounded-2xl font-black text-sm flex items-center justify-center transition-all ${
                      isCurrent
                        ? "bg-brand-primary text-white shadow-lg shadow-brand-primary/30 scale-105 ring-2 ring-brand-primary/20"
                        : "bg-slate-50 dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-700"
                    }`}
                  >
                    {g}
                  </button>
                );
              })}
            </div>
          </div>
        </div>

        {/* ========================================================================= */}
        {/* DEDICATED 'MY FAVORITES' SECTION WITHIN USER PROFILE                     */}
        {/* ========================================================================= */}
        <MyFavoritesSection />

        {/* Class Textbook Section */}
        <div className="space-y-16">
          {profile.grade && userTextbook ? (
            <motion.section
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="relative"
            >
              <div className="flex items-center justify-between mb-8">
                <div>
                  <div className="inline-flex items-center gap-2 px-3 py-1 bg-green-100 dark:bg-green-950/50 text-green-700 dark:text-green-400 rounded-full text-xs font-black uppercase tracking-widest mb-2">
                    <Sparkles size={14} />
                    {language === "uz" ? "Sizning Sinfingiz Darsligi" : "Учебник вашего класса"}
                  </div>
                  <h2 className="text-3xl md:text-4xl font-serif font-black text-slate-900 dark:text-white tracking-tight">
                    {userTextbook.title}
                  </h2>
                </div>
                <div className="hidden sm:flex items-center gap-2 text-slate-500 dark:text-slate-300 font-bold text-sm bg-white dark:bg-slate-900 px-4 py-2 rounded-xl border border-slate-100 dark:border-slate-800 shadow-sm">
                  <span>{userTextbook.books.length} {language === "uz" ? "ta nashr" : "изданий"}</span>
                  {userTextbook.books.some(b => b.audio) && (
                    <span className="text-red-500 flex items-center gap-1 font-black">
                      • <Headphones size={14} /> {language === "uz" ? "Audio mavjud" : "Есть аудио"}
                    </span>
                  )}
                </div>
              </div>

              {/* Prominent High-Priority Card */}
              <div className="bg-gradient-to-br from-white via-white to-blue-50/40 dark:from-slate-900 dark:via-slate-900 dark:to-blue-950/20 rounded-[3rem] border-2 border-brand-primary/30 p-8 md:p-12 shadow-2xl shadow-brand-primary/10 relative overflow-hidden">
                <div className="absolute top-0 right-0 w-96 h-96 bg-brand-primary/10 rounded-full blur-3xl -z-0"></div>

                <div className="relative z-10 grid grid-cols-1 lg:grid-cols-12 gap-10 items-start">
                  <div className="lg:col-span-4 flex flex-col justify-between">
                    <div>
                      <div className="w-20 h-20 bg-brand-primary rounded-3xl flex items-center justify-center text-white font-black text-3xl mb-6 shadow-xl shadow-brand-primary/20">
                        {userTextbook.grade}
                      </div>
                      <h3 className="text-2xl md:text-3xl font-serif font-black text-slate-900 dark:text-white mb-3">
                        {userTextbook.title}
                      </h3>
                      <p className="text-slate-500 dark:text-slate-300 font-medium leading-relaxed mb-6">
                        {language === "uz"
                          ? "O'zbekiston maktablari uchun tasdiqlangan rasmiy darsliklar va audio materiallar."
                          : "Официальные учебники и аудиоматериалы, утвержденные для школ Узбекистана."}
                      </p>
                    </div>

                    <div className="p-4 bg-slate-50 dark:bg-slate-800/80 rounded-2xl border border-slate-100 dark:border-slate-700 text-xs font-bold text-slate-600 dark:text-slate-300 space-y-2">
                      <div className="flex items-center justify-between">
                        <span>Format:</span>
                        <span className="text-slate-900 dark:text-white font-black">PDF {userTextbook.books.some(b => b.audio) ? "+ Audio" : ""}</span>
                      </div>
                      <div className="flex items-center justify-between">
                        <span>Status:</span>
                        <span className="text-green-600 dark:text-green-400 font-black flex items-center gap-1">
                          <span className="w-2 h-2 rounded-full bg-green-500 animate-pulse"></span>
                          {language === "uz" ? "To'liq mavjud" : "Доступно"}
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Editions / Books List with specific link bookmark buttons */}
                  <div className="lg:col-span-8 space-y-5">
                    <h4 className="text-xs font-black uppercase tracking-widest text-slate-400 dark:text-slate-400 mb-2">
                      {language === "uz" ? "Mavjud nashrlar va materiallar:" : "Доступные издания и материалы:"}
                    </h4>

                    {userTextbook.books.map((book, idx) => {
                      const bookKey = `${userTextbook.id}-${book.year}`;
                      const isEditionBookmarked = isBookmarked(bookKey);
                      const isPdfSaved = isItemBookmarked(book.pdf);
                      const isAudioSaved = book.audio ? isItemBookmarked(book.audio) : false;

                      return (
                        <div
                          key={idx}
                          className="bg-white dark:bg-slate-850 dark:bg-slate-800 p-6 md:p-8 rounded-3xl border border-slate-100 dark:border-slate-700/80 hover:border-brand-primary/30 shadow-md hover:shadow-xl transition-all group"
                        >
                          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
                            <div className="flex items-center gap-3">
                              <div className="w-3 h-3 rounded-full bg-brand-primary"></div>
                              <h4 className="text-xl font-black text-slate-900 dark:text-white">
                                {book.year}-{language === "uz" ? "yil darsligi" : "год издания"}
                              </h4>
                            </div>

                            {/* Bookmark Whole Edition */}
                            <button
                              onClick={() => {
                                toggleBookmark(bookKey);
                                toggleBookmarkItem({
                                  id: `pdf-${book.pdf}`,
                                  type: "pdf",
                                  title: `${userTextbook.title} (${book.year})`,
                                  url: book.pdf,
                                  grade: userTextbook.grade,
                                  year: book.year,
                                  subjectName: userTextbook.title,
                                });
                                if (book.audio) {
                                  toggleBookmarkItem({
                                    id: `audio-${book.audio}`,
                                    type: "audio",
                                    title: `${userTextbook.title} (${book.year}) - Audio`,
                                    url: book.audio,
                                    grade: userTextbook.grade,
                                    year: book.year,
                                    subjectName: userTextbook.title,
                                  });
                                }
                              }}
                              className={`self-start sm:self-auto px-4 py-2 rounded-xl text-xs font-bold flex items-center gap-1.5 transition-colors ${
                                isEditionBookmarked || isPdfSaved
                                  ? "bg-amber-50 dark:bg-amber-950/40 text-amber-600 dark:text-amber-400 border border-amber-200 dark:border-amber-800" 
                                  : "bg-slate-50 dark:bg-slate-700/60 text-slate-400 dark:text-slate-300 hover:text-slate-600 dark:hover:text-white border border-slate-200 dark:border-slate-700"
                              }`}
                            >
                              <Bookmark size={15} fill={isEditionBookmarked || isPdfSaved ? "currentColor" : "none"} />
                              <span>{(isEditionBookmarked || isPdfSaved) ? (language === "uz" ? "Saqlangan" : "Сохранено") : (language === "uz" ? "Saqlash" : "Сохранить")}</span>
                            </button>
                          </div>

                          {/* Action links */}
                          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                            <a
                              href={getSafePdfUrl(book.pdf)}
                              target="_blank"
                              rel="noreferrer"
                              className="flex items-center justify-between px-5 py-4 bg-brand-primary text-white rounded-2xl font-bold text-sm hover:bg-blue-700 hover:shadow-lg hover:shadow-brand-primary/30 transition-all group/btn"
                            >
                              <span className="flex items-center gap-2.5">
                                <FileText size={18} />
                                {language === "uz" ? "PDF Darslik" : "Учебник PDF"}
                              </span>
                              <ArrowRight size={16} className="group-hover/btn:translate-x-1 transition-transform" />
                            </a>

                            {book.audio ? (
                              <a
                                href={book.audio}
                                target="_blank"
                                rel="noreferrer"
                                className="flex items-center justify-between px-5 py-4 bg-red-600 text-white rounded-2xl font-bold text-sm hover:bg-red-700 hover:shadow-lg hover:shadow-red-600/30 transition-all group/btn"
                              >
                                <span className="flex items-center gap-2.5">
                                  <Youtube size={20} />
                                  {language === "uz" ? "Audio Pleylist" : "Аудио плейлист"}
                                </span>
                                <ArrowRight size={16} className="group-hover/btn:translate-x-1 transition-transform" />
                              </a>
                            ) : (
                              <div className="flex items-center justify-center px-6 py-4 bg-slate-50 dark:bg-slate-700/50 text-slate-400 dark:text-slate-400 rounded-2xl font-bold text-xs">
                                {language === "uz" ? "Audio versiya hozircha kiritilmagan" : "Аудиоверсия в разработке"}
                              </div>
                            )}
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              </div>
            </motion.section>
          ) : (
            /* Prompt to select grade */
            <div className="bg-white dark:bg-slate-900 rounded-[3rem] border-2 border-dashed border-slate-200 dark:border-slate-800 p-12 text-center">
              <div className="w-16 h-16 bg-brand-primary/10 text-brand-primary rounded-2xl flex items-center justify-center mx-auto mb-4">
                <BookOpen size={28} />
              </div>
              <h3 className="text-2xl font-serif font-black text-slate-900 dark:text-white mb-2">
                {language === "uz" ? "Sinfingiz hali belgilanmagan" : "Класс еще не выбран"}
              </h3>
              <p className="text-slate-500 dark:text-slate-400 max-w-md mx-auto mb-6 text-sm">
                {language === "uz"
                  ? "Yuqoridagi 1-11 tugmalaridan o'z sinfingizni tanlang va barcha darsliklaringizni bitta joyda qulay foydalaning."
                  : "Выберите ваш класс с помощью кнопок 1–11 выше для персонального доступа к учебникам."}
              </p>
            </div>
          )}

          {/* Other grades list */}
          <section>
            <div className="flex items-center justify-between mb-8">
              <div>
                <h3 className="text-2xl md:text-3xl font-serif font-black text-slate-900 dark:text-white tracking-tight">
                  {profile.grade 
                    ? (language === "uz" ? "Boshqa sinflar darsliklari" : "Учебники других классов") 
                    : (language === "uz" ? "Barcha sinflar darsliklari" : "Все учебники")}
                </h3>
                <p className="text-slate-500 dark:text-slate-400 text-sm font-medium mt-1">
                  {language === "uz" ? "1-sinfdan 11-sinfgacha barcha darsliklar va audio materiallar" : "Учебники и аудиоматериалы с 1 по 11 классы"}
                </p>
              </div>

              <Link
                to="/library"
                className="text-brand-primary dark:text-blue-400 font-black text-sm uppercase tracking-widest flex items-center gap-2 hover:gap-3 transition-all"
              >
                {language === "uz" ? "To'liq kutubxona" : "Вся библиотека"} <ArrowRight size={16} />
              </Link>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {otherTextbooks.map((item) => (
                <div
                  key={item.id}
                  className="bg-white dark:bg-slate-900 rounded-[2.5rem] border border-slate-100 dark:border-slate-800 p-8 flex flex-col justify-between hover:border-brand-primary/20 dark:hover:border-brand-primary/40 hover:shadow-xl transition-all"
                >
                  <div>
                    <div className="flex items-center justify-between mb-4">
                      <div className="w-12 h-12 bg-slate-100 dark:bg-slate-800 rounded-2xl flex items-center justify-center text-slate-900 dark:text-white font-black text-xl">
                        {item.grade}
                      </div>
                      <span className="text-xs font-bold text-slate-500 dark:text-slate-400 bg-slate-100 dark:bg-slate-800 px-3 py-1 rounded-full">
                        {item.grade}-{language === "uz" ? "sinf" : "класс"}
                      </span>
                    </div>

                    <h4 className="text-xl font-serif font-bold text-slate-900 dark:text-white mb-2">
                      {item.title}
                    </h4>
                    <p className="text-xs text-slate-400 dark:text-slate-400 font-bold uppercase tracking-widest mb-6">
                      {item.books.length} {language === "uz" ? "ta nashr varianti" : "вариантов издания"}
                    </p>

                    <div className="space-y-3">
                      {item.books.map((b, bIdx) => (
                        <div key={bIdx} className="p-3.5 bg-slate-50 dark:bg-slate-800 rounded-xl flex items-center justify-between text-xs font-bold gap-2">
                          <span className="text-slate-700 dark:text-slate-300 shrink-0">
                            {b.year}-{language === "uz" ? "yil" : "год"}
                          </span>
                          <div className="flex items-center gap-2 shrink-0">
                            <a
                              href={getSafePdfUrl(b.pdf)}
                              target="_blank"
                              rel="noreferrer"
                              className="px-3 py-1.5 bg-white dark:bg-slate-700 border border-slate-200 dark:border-slate-600 hover:bg-brand-primary hover:text-white rounded-lg transition-colors text-slate-800 dark:text-slate-200 flex items-center gap-1.5"
                            >
                              <FileText size={13} />
                              PDF
                            </a>

                            {b.audio && (
                              <a
                                href={b.audio}
                                target="_blank"
                                rel="noreferrer"
                                className="px-3 py-1.5 bg-red-100 dark:bg-red-950/50 text-red-600 dark:text-red-300 hover:bg-red-600 hover:text-white rounded-lg transition-colors flex items-center gap-1.5"
                              >
                                <Youtube size={13} />
                                Audio
                              </a>
                            )}
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>

                  <div className="pt-6 mt-6 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between text-xs font-bold text-slate-400 dark:text-slate-400">
                    <span>{language === "uz" ? "O'zbek adabiyoti" : "Узбекская литература"}</span>
                    <button
                      onClick={() => setGrade(item.grade as GradeNumber)}
                      className="text-brand-primary dark:text-blue-400 font-black flex items-center gap-1 hover:gap-2 transition-all"
                    >
                      {language === "uz" ? "Sinfim qilib tanlash" : "Выбрать этот класс"} <ArrowRight size={13} />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </section>
        </div>
      </div>
    </div>
  );
}
