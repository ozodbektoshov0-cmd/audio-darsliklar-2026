/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { motion, AnimatePresence } from "motion/react";
import { useState, useMemo } from "react";
import { 
  FileText, 
  Youtube, 
  Search, 
  Sparkles, 
  GraduationCap, 
  Bookmark, 
  BookmarkCheck, 
  BookOpen, 
  Volume2, 
  Layers
} from "lucide-react";
import { TEXTBOOKS } from "../constants";
import { ALL_SUBJECTS, SubjectCategory, Language } from "../data";
import { useStudent, GradeNumber } from "../context/StudentContext";
import { useLanguage } from "../context/LanguageContext";
import { Link } from "react-router-dom";
import { getSafePdfUrl } from "../utils/pdfHelper";

const CATEGORY_NAMES: Record<SubjectCategory, { uz: string; ru: string }> = {
  "Boshlang'ich": { uz: "Boshlang'ich", ru: "Начальные классы" },
  "Ona tili va Adabiyot": { uz: "Ona tili va Adabiyot", ru: "Родной язык и литература" },
  "Aniq fanlar": { uz: "Aniq fanlar", ru: "Точные науки" },
  "Tabiiy fanlar": { uz: "Tabiiy fanlar", ru: "Естественные науки" },
  "Ijtimoiy-gumanitar": { uz: "Ijtimoiy-gumanitar", ru: "Социально-гуманитарные" },
  "Xorijiy tillar": { uz: "Xorijiy tillar", ru: "Иностранные языки" },
  "Amaliy va estetik": { uz: "Amaliy va estetik", ru: "Практические и эстетические" },
};

export default function TextbookSection() {
  const [searchTerm, setSearchTerm] = useState("");
  const [activeGradeFilter, setActiveGradeFilter] = useState<string>("all");
  const [activeCategoryFilter, setActiveCategoryFilter] = useState<string>("all");
  const [activeLangFilter, setActiveLangFilter] = useState<"all" | Language>("all");
  const [viewMode, setViewMode] = useState<"curated" | "all_subjects">("curated");

  const { 
    profile, 
    setGrade, 
    toggleBookmark, 
    isBookmarked,
    toggleBookmarkItem,
    isItemBookmarked 
  } = useStudent();
  const { t, language } = useLanguage();

  const [toast, setToast] = useState<{ message: string; type: "added" | "removed" } | null>(null);

  const handleToggleLink = (item: {
    id: string;
    type: "pdf" | "audio";
    title: string;
    url: string;
    grade: string;
    year?: string;
    subjectName?: string;
  }) => {
    const added = toggleBookmarkItem(item);
    setToast({
      message: added 
        ? (language === "uz" ? `"${item.title}" sevimlilarga saqlandi` : `"${item.title}" добавлено в избранное`)
        : (language === "uz" ? `"${item.title}" sevimlilardan o'chirildi` : `"${item.title}" удалено из избранного`),
      type: added ? "added" : "removed",
    });
    setTimeout(() => setToast(null), 3500);
  };

  const allGrades: GradeNumber[] = ["1", "2", "3", "4", "5", "6", "7", "8", "9", "10", "11"];

  const categories: SubjectCategory[] = [
    "Boshlang'ich",
    "Ona tili va Adabiyot",
    "Aniq fanlar",
    "Tabiiy fanlar",
    "Ijtimoiy-gumanitar",
    "Xorijiy tillar",
    "Amaliy va estetik",
  ];

  // Filtered Curated Textbooks (Adabiyot/Main list)
  const filteredCurated = useMemo(() => {
    return TEXTBOOKS.filter((item) => {
      const matchesSearch =
        item.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
        item.grade.includes(searchTerm) ||
        item.books.some((b) => b.year.includes(searchTerm));
      const matchesFilter = activeGradeFilter === "all" || item.grade === activeGradeFilter;
      return matchesSearch && matchesFilter;
    }).sort((a, b) => {
      if (profile.grade) {
        if (a.grade === profile.grade) return -1;
        if (b.grade === profile.grade) return 1;
      }
      return parseInt(a.grade) - parseInt(b.grade);
    });
  }, [searchTerm, activeGradeFilter, profile.grade]);

  // Filtered Full Catalog (ALL_SUBJECTS)
  const filteredCatalog = useMemo(() => {
    return ALL_SUBJECTS.filter((subj) => {
      const matchesSearch =
        subj.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        subj.grade.includes(searchTerm) ||
        subj.category.toLowerCase().includes(searchTerm.toLowerCase()) ||
        subj.resources.some((r) => r.title.toLowerCase().includes(searchTerm.toLowerCase()));
      
      const matchesGrade = activeGradeFilter === "all" || subj.grade === activeGradeFilter;
      const matchesCategory = activeCategoryFilter === "all" || subj.category === activeCategoryFilter;
      const matchesLang = activeLangFilter === "all" || subj.lang === activeLangFilter;

      return matchesSearch && matchesGrade && matchesCategory && matchesLang;
    }).sort((a, b) => {
      if (profile.grade) {
        if (a.grade === profile.grade && b.grade !== profile.grade) return -1;
        if (b.grade === profile.grade && a.grade !== profile.grade) return 1;
      }
      return parseInt(a.grade) - parseInt(b.grade);
    });
  }, [searchTerm, activeGradeFilter, activeCategoryFilter, activeLangFilter, profile.grade]);

  return (
    <section id="darsliklar" className="py-24 bg-slate-50 dark:bg-slate-950 relative z-10 transition-colors">
      <div className="container mx-auto px-4 max-w-7xl">
        
        {/* Header Section */}
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-8 mb-8 px-2">
          <div className="md:w-3/5">
            <div className="inline-flex items-center gap-2 px-3.5 py-1.5 bg-brand-primary/10 dark:bg-brand-primary/25 text-brand-primary dark:text-blue-300 rounded-full text-xs font-black uppercase tracking-widest mb-3">
              <GraduationCap size={14} />
              {t("sectionBadge")}
            </div>
            <motion.h2 
              initial={{ opacity: 0, x: -20 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              className="text-4xl md:text-5xl font-serif font-black text-slate-900 dark:text-white mb-3 tracking-tight"
            >
              {t("sectionTitle1")} <span className="text-brand-primary dark:text-blue-400">{t("sectionTitle2")}</span> {t("sectionTitle3")}
            </motion.h2>
            <p className="text-slate-600 dark:text-slate-400 text-sm md:text-base max-w-2xl font-medium">
              {t("sectionSubtitle")}
            </p>
          </div>
          
          {/* Search Box */}
          <div className="md:w-2/5 relative group">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 dark:text-slate-500 group-focus-within:text-brand-primary dark:group-focus-within:text-blue-400 transition-colors" size={20} />
            <input 
              type="text" 
              placeholder={t("searchPlaceholder")}
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-12 pr-4 py-3.5 bg-white dark:bg-slate-900 border-2 border-slate-200 dark:border-slate-800 rounded-2xl focus:border-brand-primary dark:focus:border-brand-primary outline-none transition-all font-medium text-slate-800 dark:text-slate-100 shadow-sm text-sm"
            />
          </div>
        </div>

        {/* View Mode Switcher */}
        <div className="px-2 mb-6 flex flex-wrap items-center justify-between gap-4">
          <div className="inline-flex p-1.5 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl shadow-sm">
            <button
              onClick={() => setViewMode("curated")}
              className={`flex items-center gap-2 px-5 py-2.5 rounded-xl text-xs font-black uppercase tracking-wider transition-all ${
                viewMode === "curated"
                  ? "bg-brand-primary text-white shadow-md shadow-brand-primary/20"
                  : "text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white"
              }`}
            >
              <Volume2 size={15} />
              {t("viewCurated")} ({TEXTBOOKS.length})
            </button>
            <button
              onClick={() => setViewMode("all_subjects")}
              className={`flex items-center gap-2 px-5 py-2.5 rounded-xl text-xs font-black uppercase tracking-wider transition-all ${
                viewMode === "all_subjects"
                  ? "bg-brand-primary text-white shadow-md shadow-brand-primary/20"
                  : "text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white"
              }`}
            >
              <Layers size={15} />
              {t("viewCatalog")} ({ALL_SUBJECTS.length}+ {language === "uz" ? "fan" : "предметов"})
            </button>
          </div>

          {/* Language filter for catalog */}
          {viewMode === "all_subjects" && (
            <div className="inline-flex p-1 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl text-xs font-bold">
              <button
                onClick={() => setActiveLangFilter("all")}
                className={`px-3 py-1.5 rounded-lg transition-all ${
                  activeLangFilter === "all" ? "bg-slate-900 dark:bg-slate-100 text-white dark:text-slate-900" : "text-slate-500"
                }`}
              >
                {t("allLangs")}
              </button>
              <button
                onClick={() => setActiveLangFilter("uz")}
                className={`px-3 py-1.5 rounded-lg transition-all flex items-center gap-1 ${
                  activeLangFilter === "uz" ? "bg-brand-primary text-white" : "text-slate-500"
                }`}
              >
                {t("langUz")}
              </button>
              <button
                onClick={() => setActiveLangFilter("ru")}
                className={`px-3 py-1.5 rounded-lg transition-all flex items-center gap-1 ${
                  activeLangFilter === "ru" ? "bg-brand-primary text-white" : "text-slate-500"
                }`}
              >
                {t("langRu")}
              </button>
            </div>
          )}
        </div>

        {/* Personalized Student Notice Bar */}
        <div className="px-2 mb-6">
          <div className="bg-white dark:bg-slate-900 p-4 sm:p-5 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-brand-primary/10 dark:bg-brand-primary/25 text-brand-primary dark:text-blue-300 flex items-center justify-center shrink-0">
                <GraduationCap size={20} />
              </div>
              <div>
                {profile.grade ? (
                  <p className="text-sm font-bold text-slate-800 dark:text-slate-200">
                    {t("studentNoticeWithGrade")}{" "}
                    <span className="text-brand-primary dark:text-blue-400 font-black">
                      {profile.grade}{t("gradeSuffix")}
                    </span>
                    . {profile.studentName ? `${profile.studentName}, ` : ""}{t("studentNoticeForYou")}
                  </p>
                ) : (
                  <p className="text-sm font-bold text-slate-800 dark:text-slate-200">
                    {t("studentNoticePrompt")}
                  </p>
                )}
              </div>
            </div>

            <div className="flex items-center gap-2 self-stretch sm:self-auto justify-end">
              <Link
                to="/profile"
                className="px-4 py-2 bg-brand-primary text-white text-xs font-black uppercase tracking-wider rounded-xl hover:bg-blue-700 transition-colors shrink-0 flex items-center gap-1.5 shadow-sm"
              >
                <Sparkles size={13} />
                {profile.grade ? t("btnViewProfile") : t("btnSelectGrade")}
              </Link>
            </div>
          </div>
        </div>

        {/* Grade Filter Pills (1 to 11) */}
        <div className="px-2 mb-6 overflow-x-auto pb-2 flex items-center gap-2 scrollbar-none">
          <button
            onClick={() => setActiveGradeFilter("all")}
            className={`px-4 py-2 rounded-xl text-xs font-black uppercase tracking-wider transition-all shrink-0 ${
              activeGradeFilter === "all"
                ? "bg-slate-900 dark:bg-brand-primary text-white shadow-md"
                : "bg-white dark:bg-slate-900 text-slate-600 dark:text-slate-300 border border-slate-200 dark:border-slate-800 hover:bg-slate-100 dark:hover:bg-slate-800"
            }`}
          >
            {t("allGradesBtn")}
          </button>
          {allGrades.map((g) => {
            const isStudentGrade = profile.grade === g;
            const isActive = activeGradeFilter === g;
            const hasAudioForGrade = g === "8" || g === "9";

            return (
              <button
                key={g}
                onClick={() => setActiveGradeFilter(g)}
                className={`px-3.5 py-2 rounded-xl text-xs font-bold transition-all shrink-0 flex items-center gap-1.5 ${
                  isActive
                    ? "bg-brand-primary text-white shadow-md shadow-brand-primary/25"
                    : isStudentGrade
                    ? "bg-blue-50 dark:bg-blue-950/40 text-brand-primary dark:text-blue-300 border border-brand-primary/30 dark:border-blue-800/60"
                    : "bg-white dark:bg-slate-900 text-slate-600 dark:text-slate-300 border border-slate-200 dark:border-slate-800 hover:bg-slate-100 dark:hover:bg-slate-800"
                }`}
              >
                {isStudentGrade && <Sparkles size={12} />}
                <span>{g}{t("gradeSuffix")}</span>
                {hasAudioForGrade && (
                  <span className="text-[10px] bg-red-100 dark:bg-red-950 text-red-600 dark:text-red-400 px-1 py-0.2 rounded font-black">
                    Audio
                  </span>
                )}
                {isStudentGrade && (
                  <span className="text-[10px] bg-brand-primary text-white px-1 py-0.2 rounded font-black">
                    {t("gradeYou")}
                  </span>
                )}
              </button>
            );
          })}
        </div>

        {/* Category Pills (Visible when Full Catalog is active) */}
        {viewMode === "all_subjects" && (
          <div className="px-2 mb-8 overflow-x-auto pb-2 flex items-center gap-2 scrollbar-none">
            <button
              onClick={() => setActiveCategoryFilter("all")}
              className={`px-3.5 py-1.5 rounded-lg text-xs font-bold shrink-0 transition-all ${
                activeCategoryFilter === "all"
                  ? "bg-brand-primary text-white"
                  : "bg-white dark:bg-slate-900 text-slate-600 dark:text-slate-400 border border-slate-200 dark:border-slate-800"
              }`}
            >
              {t("allCategories")}
            </button>
            {categories.map((cat) => (
              <button
                key={cat}
                onClick={() => setActiveCategoryFilter(cat)}
                className={`px-3.5 py-1.5 rounded-lg text-xs font-bold shrink-0 transition-all ${
                  activeCategoryFilter === cat
                    ? "bg-brand-primary text-white"
                    : "bg-white dark:bg-slate-900 text-slate-600 dark:text-slate-400 border border-slate-200 dark:border-slate-800 hover:bg-slate-100 dark:hover:bg-slate-800"
                }`}
              >
                {CATEGORY_NAMES[cat] ? CATEGORY_NAMES[cat][language] : cat}
              </button>
            ))}
          </div>
        )}

        {/* VIEW 1: CURATED ADABIYOT & AUDIO VIEW */}
        {viewMode === "curated" && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            <AnimatePresence mode="popLayout">
              {filteredCurated.map((item) => {
                const isMyGrade = profile.grade === item.grade;
                const bookmarked = isBookmarked(item.id);

                return (
                  <motion.div
                    layout
                    key={item.id}
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0, scale: 0.95 }}
                    transition={{ duration: 0.25 }}
                    className={`group flex flex-col h-full bg-white dark:bg-slate-900 rounded-3xl transition-all duration-300 overflow-hidden relative ${
                      isMyGrade 
                        ? "border-2 border-brand-primary shadow-xl shadow-brand-primary/10 ring-2 ring-brand-primary/10 dark:ring-brand-primary/20" 
                        : "border border-slate-200 dark:border-slate-800 hover:border-brand-primary/30 dark:hover:border-brand-primary/40 hover:shadow-xl"
                    }`}
                  >
                    {isMyGrade && (
                      <div className="bg-brand-primary text-white px-5 py-2 text-xs font-black uppercase tracking-widest flex items-center justify-between">
                        <span className="flex items-center gap-1.5">
                          <Sparkles size={13} />
                          {t("yourGradeBadge")}
                        </span>
                        <span className="text-[10px] bg-white/20 px-2 py-0.5 rounded-full font-bold">{t("selectedBadge")}</span>
                      </div>
                    )}

                    <div className="relative p-6 pb-3">
                      <div className="flex items-center justify-between mb-3">
                        <div className="flex items-center gap-2">
                          <span className={`w-9 h-9 rounded-xl flex items-center justify-center font-black text-base ${
                            isMyGrade 
                              ? "bg-brand-primary text-white" 
                              : "bg-brand-primary/10 dark:bg-brand-primary/20 text-brand-primary dark:text-blue-300"
                          }`}>
                            {item.grade}
                          </span>
                          <span className="text-xs font-black uppercase tracking-wider text-slate-400 dark:text-slate-500">
                            {parseInt(item.grade) <= 4 
                              ? (language === "uz" ? "Boshlang'ich sinf" : "Начальный класс") 
                              : (language === "uz" ? "O'rta / Yuqori sinf" : "Средний / Старший класс")}
                          </span>
                        </div>

                        <div className="flex items-center gap-1.5">
                          {item.audio && (
                            <span className="inline-flex items-center gap-1 px-2.5 py-1 bg-red-100 dark:bg-red-950/60 text-red-600 dark:text-red-400 rounded-lg text-xs font-black animate-pulse">
                              <Youtube size={13} />
                              {t("audioAvailableTag")}
                            </span>
                          )}
                          <button
                            onClick={() => toggleBookmark(item.id)}
                            title={bookmarked ? t("bookmarkRemove") : t("bookmarkAdd")}
                            className="p-2 rounded-xl text-slate-400 hover:text-brand-primary dark:hover:text-blue-400 transition-colors"
                          >
                            {bookmarked ? (
                              <BookmarkCheck size={18} className="text-brand-primary dark:text-blue-400 fill-brand-primary/20" />
                            ) : (
                              <Bookmark size={18} />
                            )}
                          </button>
                        </div>
                      </div>

                      <h3 className="text-xl font-serif font-bold text-slate-900 dark:text-white leading-snug group-hover:text-brand-primary dark:group-hover:text-blue-400 transition-colors mb-1">
                        {item.title}
                      </h3>

                      {!isMyGrade && (
                        <button
                          onClick={() => setGrade(item.grade as GradeNumber)}
                          className="text-[11px] text-brand-primary dark:text-blue-400 font-bold hover:underline"
                        >
                          {t("setAsMyGrade")}
                        </button>
                      )}
                    </div>

                    {/* Book resources list */}
                    <div className="flex-1 p-6 pt-2 space-y-4">
                      {item.books.map((book, bIdx) => {
                        const isPdfSaved = isItemBookmarked(book.pdf);
                        const isAudioSaved = book.audio ? isItemBookmarked(book.audio) : false;

                        return (
                          <div key={bIdx} className="bg-slate-50 dark:bg-slate-800/60 p-3.5 rounded-2xl border border-slate-100 dark:border-slate-800">
                            <div className="flex items-center justify-between gap-2 mb-2.5">
                              <span className="text-xs font-bold text-slate-700 dark:text-slate-300 flex items-center gap-1.5">
                                <span className="w-2 h-2 rounded-full bg-brand-primary"></span>
                                {book.year} {language === "uz" ? "nashri" : "год издания"}
                              </span>
                              {book.audio && (
                                <span className="text-[10px] font-black text-red-600 dark:text-red-400 uppercase tracking-wider flex items-center gap-1">
                                  <Volume2 size={11} /> YouTube Audio
                                </span>
                              )}
                            </div>

                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                              {/* PDF Link + Bookmark */}
                              <div className="flex items-center gap-1">
                                <a
                                  href={getSafePdfUrl(book.pdf)}
                                  target="_blank"
                                  rel="noreferrer"
                                  className="flex-1 flex items-center justify-center gap-2 px-3 py-2 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 hover:border-brand-primary text-slate-800 dark:text-slate-200 rounded-xl text-xs font-bold transition-all hover:bg-brand-primary hover:text-white group/btn shadow-xs"
                                >
                                  <FileText size={14} className="text-brand-primary group-hover/btn:text-white" />
                                  <span>{t("btnPdfBook")}</span>
                                </a>
                                <button
                                  type="button"
                                  onClick={() => handleToggleLink({
                                    id: `pdf-${book.pdf}`,
                                    type: "pdf",
                                    title: `${item.title} (${book.year})`,
                                    url: book.pdf,
                                    grade: item.grade,
                                    year: book.year,
                                    subjectName: item.title,
                                  })}
                                  title={isPdfSaved ? t("removeFromFavorites") : t("bookmarkPdfTooltip")}
                                  className={`p-2 rounded-xl border text-xs transition-colors shrink-0 ${
                                    isPdfSaved 
                                      ? "bg-amber-50 dark:bg-amber-950/60 border-amber-300 dark:border-amber-700 text-amber-600 dark:text-amber-400 shadow-xs" 
                                      : "bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-700 text-slate-400 hover:text-amber-500"
                                  }`}
                                >
                                  <Bookmark size={14} fill={isPdfSaved ? "currentColor" : "none"} />
                                </button>
                              </div>

                              {/* Audio Link + Bookmark */}
                              {book.audio ? (
                                <div className="flex items-center gap-1">
                                  <a
                                    href={book.audio}
                                    target="_blank"
                                    rel="noreferrer"
                                    className="flex-1 flex items-center justify-center gap-2 px-3 py-2 bg-red-600 hover:bg-red-700 text-white rounded-xl text-xs font-bold transition-all shadow-xs"
                                  >
                                    <Youtube size={14} />
                                    <span>{t("btnAudioListen")}</span>
                                  </a>
                                  <button
                                    type="button"
                                    onClick={() => handleToggleLink({
                                      id: `audio-${book.audio}`,
                                      type: "audio",
                                      title: `${item.title} (${book.year}) - Audio Pleylist`,
                                      url: book.audio!,
                                      grade: item.grade,
                                      year: book.year,
                                      subjectName: item.title,
                                    })}
                                    title={isAudioSaved ? t("removeFromFavorites") : t("bookmarkAudioTooltip")}
                                    className={`p-2 rounded-xl border text-xs transition-colors shrink-0 ${
                                      isAudioSaved 
                                        ? "bg-amber-50 dark:bg-amber-950/60 border-amber-300 dark:border-amber-700 text-amber-600 dark:text-amber-400 shadow-xs" 
                                        : "bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-700 text-slate-400 hover:text-amber-500"
                                    }`}
                                  >
                                    <Bookmark size={14} fill={isAudioSaved ? "currentColor" : "none"} />
                                  </button>
                                </div>
                              ) : (
                                <button
                                  disabled
                                  className="flex items-center justify-center gap-1.5 px-3 py-2 bg-slate-100 dark:bg-slate-800 text-slate-400 dark:text-slate-500 rounded-xl text-xs font-medium cursor-not-allowed opacity-60"
                                >
                                  <Volume2 size={13} />
                                  <span>{t("btnAudioPending")}</span>
                                </button>
                              )}
                            </div>
                          </div>
                        );
                      })}
                    </div>

                    <div className="px-6 py-3.5 bg-slate-50 dark:bg-slate-800/80 mt-auto flex items-center justify-between border-t border-slate-100 dark:border-slate-800 text-xs">
                      <span className="text-[11px] font-bold text-slate-500 dark:text-slate-400">
                        {item.books.length} {t("editionsCount")}
                      </span>
                      <div className="flex items-center gap-1 text-emerald-600 dark:text-emerald-400 font-bold text-[11px]">
                        <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></div>
                        {t("downloadOpen")}
                      </div>
                    </div>
                  </motion.div>
                );
              })}
            </AnimatePresence>
          </div>
        )}

        {/* VIEW 2: COMPREHENSIVE SUBJECTS CATALOG */}
        {viewMode === "all_subjects" && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            <AnimatePresence mode="popLayout">
              {filteredCatalog.map((subj) => {
                const isMyGrade = profile.grade === subj.grade;
                const bookmarked = isBookmarked(subj.id);

                return (
                  <motion.div
                    layout
                    key={subj.id}
                    initial={{ opacity: 0, scale: 0.97 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0, scale: 0.97 }}
                    transition={{ duration: 0.2 }}
                    className={`bg-white dark:bg-slate-900 rounded-2xl border transition-all p-5 flex flex-col justify-between ${
                      isMyGrade 
                        ? "border-brand-primary shadow-md ring-1 ring-brand-primary/20" 
                        : "border-slate-200 dark:border-slate-800 hover:border-brand-primary/40 hover:shadow-lg"
                    }`}
                  >
                    <div>
                      {/* Top Badges */}
                      <div className="flex items-center justify-between mb-3">
                        <div className="flex items-center gap-2">
                          <span className="w-7 h-7 rounded-lg bg-brand-primary/10 dark:bg-brand-primary/25 text-brand-primary dark:text-blue-300 font-black text-xs flex items-center justify-center">
                            {subj.grade}
                          </span>
                          <span className="text-[11px] font-bold px-2 py-0.5 rounded-md bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400">
                            {CATEGORY_NAMES[subj.category] ? CATEGORY_NAMES[subj.category][language] : subj.category}
                          </span>
                          <span className="text-[11px] font-bold px-2 py-0.5 rounded-md bg-blue-50 dark:bg-blue-950 text-brand-primary dark:text-blue-300">
                            {subj.lang === "uz" ? "O'zbek" : "Русский"}
                          </span>
                        </div>

                        <button
                          onClick={() => toggleBookmark(subj.id)}
                          title={bookmarked ? t("bookmarkRemove") : t("bookmarkAdd")}
                          className="p-1.5 text-slate-400 hover:text-brand-primary transition-colors"
                        >
                          {bookmarked ? (
                            <BookmarkCheck size={16} className="text-brand-primary fill-brand-primary/20" />
                          ) : (
                            <Bookmark size={16} />
                          )}
                        </button>
                      </div>

                      <h4 className="text-lg font-bold text-slate-900 dark:text-white mb-3">
                        {subj.name}
                      </h4>

                      {/* Resources inside this subject */}
                      <div className="space-y-2 mb-4">
                        {subj.resources.map((res, rIdx) => (
                          <div
                            key={rIdx}
                            className="p-2.5 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-100 dark:border-slate-800 flex items-center justify-between gap-2"
                          >
                            <div className="truncate pr-2">
                              <p className="text-xs font-bold text-slate-800 dark:text-slate-200 truncate">
                                {res.title}
                              </p>
                              {res.year && (
                                <p className="text-[10px] text-slate-400 font-semibold">
                                  {res.year}-{language === "uz" ? "yil" : "год"}
                                </p>
                              )}
                            </div>

                            <div className="flex items-center gap-1 shrink-0">
                              {res.pdfUrl && (
                                <div className="flex items-center">
                                  <a
                                    href={getSafePdfUrl(res.pdfUrl)}
                                    target="_blank"
                                    rel="noreferrer"
                                    title="PDF darslikni yuklab olish"
                                    className="p-1.5 bg-brand-primary text-white rounded-l-lg hover:bg-blue-700 transition-colors flex items-center gap-1 text-[11px] font-bold px-2"
                                  >
                                    <FileText size={12} />
                                    <span>PDF</span>
                                  </a>
                                  <button
                                    type="button"
                                    onClick={() => handleToggleLink({
                                      id: `pdf-${res.pdfUrl}`,
                                      type: "pdf",
                                      title: `${subj.name} - ${res.title}`,
                                      url: res.pdfUrl!,
                                      grade: subj.grade,
                                      year: res.year,
                                      subjectName: subj.name,
                                    })}
                                    title={isItemBookmarked(res.pdfUrl!) ? t("removeFromFavorites") : t("bookmarkPdfTooltip")}
                                    className={`p-1.5 rounded-r-lg border-y border-r text-[11px] transition-colors ${
                                      isItemBookmarked(res.pdfUrl!)
                                        ? "bg-amber-100 dark:bg-amber-950 text-amber-600 dark:text-amber-400 border-amber-300 dark:border-amber-700" 
                                        : "bg-blue-50 dark:bg-slate-800 text-slate-400 hover:text-amber-500 border-blue-200 dark:border-slate-700"
                                    }`}
                                  >
                                    <Bookmark size={11} fill={isItemBookmarked(res.pdfUrl!) ? "currentColor" : "none"} />
                                  </button>
                                </div>
                              )}
                              {res.audioUrl && (
                                <div className="flex items-center">
                                  <a
                                    href={res.audioUrl}
                                    target="_blank"
                                    rel="noreferrer"
                                    title="Audio pleylistni tinglash"
                                    className="p-1.5 bg-red-600 text-white rounded-l-lg hover:bg-red-700 transition-colors flex items-center gap-1 text-[11px] font-bold px-2"
                                  >
                                    <Youtube size={12} />
                                    <span>Audio</span>
                                  </a>
                                  <button
                                    type="button"
                                    onClick={() => handleToggleLink({
                                      id: `audio-${res.audioUrl}`,
                                      type: "audio",
                                      title: `${subj.name} - ${res.title} (Audio)`,
                                      url: res.audioUrl!,
                                      grade: subj.grade,
                                      year: res.year,
                                      subjectName: subj.name,
                                    })}
                                    title={isItemBookmarked(res.audioUrl!) ? t("removeFromFavorites") : t("bookmarkAudioTooltip")}
                                    className={`p-1.5 rounded-r-lg border-y border-r text-[11px] transition-colors ${
                                      isItemBookmarked(res.audioUrl!)
                                        ? "bg-amber-100 dark:bg-amber-950 text-amber-600 dark:text-amber-400 border-amber-300 dark:border-amber-700" 
                                        : "bg-red-50 dark:bg-slate-800 text-slate-400 hover:text-amber-500 border-red-200 dark:border-slate-700"
                                    }`}
                                  >
                                    <Bookmark size={11} fill={isItemBookmarked(res.audioUrl!) ? "currentColor" : "none"} />
                                  </button>
                                </div>
                              )}
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>

                    <div className="pt-3 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between text-[11px] text-slate-400">
                      <span>{subj.resources.length} {t("materialsAvailable")}</span>
                      <span className="font-semibold text-brand-primary dark:text-blue-400">
                        {subj.grade}{t("gradeSuffix")}
                      </span>
                    </div>
                  </motion.div>
                );
              })}
            </AnimatePresence>
          </div>
        )}

        {/* Empty state */}
        {((viewMode === "curated" && filteredCurated.length === 0) ||
          (viewMode === "all_subjects" && filteredCatalog.length === 0)) && (
          <div className="text-center py-20 bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800">
            <BookOpen size={48} className="mx-auto text-slate-300 dark:text-slate-600 mb-4" />
            <h3 className="text-xl font-bold text-slate-700 dark:text-slate-200 mb-2">
              {t("emptyTitle")}
            </h3>
            <p className="text-slate-500 text-sm max-w-md mx-auto mb-6">
              {t("emptyDesc")}
            </p>
            <button
              onClick={() => {
                setSearchTerm("");
                setActiveGradeFilter("all");
                setActiveCategoryFilter("all");
                setActiveLangFilter("all");
              }}
              className="px-6 py-2.5 bg-brand-primary text-white rounded-xl text-xs font-bold"
            >
              {t("btnClearFilters")}
            </button>
          </div>
        )}

      </div>

      {/* Interactive Toast Notification for Favorites */}
      <AnimatePresence>
        {toast && (
          <motion.div
            initial={{ opacity: 0, y: 20, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 20, scale: 0.95 }}
            className="fixed bottom-6 right-6 z-50 max-w-sm bg-slate-900 dark:bg-white text-white dark:text-slate-900 px-5 py-4 rounded-2xl shadow-2xl flex items-center gap-3 border border-slate-700 dark:border-slate-200"
          >
            <div className={`w-8 h-8 rounded-xl flex items-center justify-center shrink-0 ${
              toast.type === "added" 
                ? "bg-amber-500/20 text-amber-400 dark:text-amber-600" 
                : "bg-red-500/20 text-red-400 dark:text-red-600"
            }`}>
              <BookmarkCheck size={18} />
            </div>
            <div className="flex-1 text-xs font-semibold leading-snug">
              <p>{toast.message}</p>
              {toast.type === "added" && (
                <Link
                  to="/profile#my-favorites-section"
                  className="text-[11px] font-bold text-amber-400 dark:text-amber-600 hover:underline inline-block mt-0.5"
                >
                  {t("myFavorites")} →
                </Link>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </section>
  );
}
