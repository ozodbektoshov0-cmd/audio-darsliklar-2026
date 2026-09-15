/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { useState, useMemo } from "react";
import { motion, AnimatePresence } from "motion/react";
import { 
  Bookmark, 
  BookmarkCheck,
  FileText, 
  Youtube, 
  Trash2, 
  ExternalLink, 
  Copy, 
  Check, 
  Search, 
  Sparkles,
  ArrowUpRight,
  Filter,
  GraduationCap
} from "lucide-react";
import { useStudent, SavedBookmarkItem } from "../context/StudentContext";
import { useLanguage } from "../context/LanguageContext";
import { Link } from "react-router-dom";
import { getSafePdfUrl } from "../utils/pdfHelper";

export default function MyFavoritesSection() {
  const { profile, removeBookmarkItem, clearAllBookmarks } = useStudent();
  const { language, t } = useLanguage();
  
  const [filterType, setFilterType] = useState<"all" | "pdf" | "audio">("all");
  const [selectedGrade, setSelectedGrade] = useState<string>("all");
  const [searchQuery, setSearchQuery] = useState<string>("");
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const [showClearConfirm, setShowClearConfirm] = useState(false);

  const savedItems = profile.savedItems || [];

  // Available grades among saved items
  const availableGrades = useMemo(() => {
    const grades = new Set<string>();
    savedItems.forEach(item => {
      if (item.grade) grades.add(item.grade);
    });
    return Array.from(grades).sort((a, b) => parseInt(a) - parseInt(b));
  }, [savedItems]);

  // Filtered saved items
  const filteredItems = useMemo(() => {
    return savedItems.filter(item => {
      const matchesType = filterType === "all" || item.type === filterType;
      const matchesGrade = selectedGrade === "all" || item.grade === selectedGrade;
      const q = searchQuery.toLowerCase().trim();
      const matchesSearch = !q || 
        item.title.toLowerCase().includes(q) ||
        (item.subjectName && item.subjectName.toLowerCase().includes(q)) ||
        item.grade.includes(q) ||
        (item.year && item.year.toLowerCase().includes(q));

      return matchesType && matchesGrade && matchesSearch;
    });
  }, [savedItems, filterType, selectedGrade, searchQuery]);

  const pdfCount = useMemo(() => savedItems.filter(i => i.type === "pdf").length, [savedItems]);
  const audioCount = useMemo(() => savedItems.filter(i => i.type === "audio").length, [savedItems]);

  const handleCopyLink = (item: SavedBookmarkItem) => {
    if (navigator.clipboard) {
      navigator.clipboard.writeText(item.url);
      setCopiedId(item.id);
      setTimeout(() => setCopiedId(null), 2000);
    }
  };

  return (
    <section id="my-favorites-section" className="relative">
      <div className="bg-white dark:bg-slate-900 rounded-[2.5rem] border border-slate-100 dark:border-slate-800 shadow-xl shadow-brand-primary/5 p-6 md:p-10 transition-colors">
        
        {/* Section Header */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 pb-8 border-b border-slate-100 dark:border-slate-800">
          <div className="flex items-start gap-4">
            <div className="w-14 h-14 rounded-2xl bg-amber-500/10 dark:bg-amber-500/20 text-amber-500 dark:text-amber-400 flex items-center justify-center shrink-0">
              <BookmarkCheck size={28} className="fill-amber-500/20" />
            </div>
            <div>
              <div className="flex items-center gap-3">
                <h2 className="text-2xl md:text-3xl font-serif font-black text-slate-900 dark:text-white tracking-tight">
                  {t("myFavorites")}
                </h2>
                <span className="px-3 py-1 rounded-full text-xs font-black bg-amber-100 dark:bg-amber-950/60 text-amber-700 dark:text-amber-400">
                  {savedItems.length} {t("favoritesCount")}
                </span>
              </div>
              <p className="text-slate-500 dark:text-slate-400 text-sm font-medium mt-1">
                {t("favoritesSubtitle")}
              </p>
            </div>
          </div>

          {/* Action buttons */}
          {savedItems.length > 0 && (
            <div className="flex items-center gap-3 self-start md:self-center">
              {showClearConfirm ? (
                <div className="flex items-center gap-2 bg-red-50 dark:bg-red-950/50 p-1.5 rounded-xl border border-red-200 dark:border-red-900">
                  <span className="text-xs text-red-600 dark:text-red-400 font-bold px-2">
                    {language === "uz" ? "Ishonchingiz komilmi?" : "Удалить все?"}
                  </span>
                  <button
                    onClick={() => {
                      clearAllBookmarks();
                      setShowClearConfirm(false);
                    }}
                    className="px-3 py-1 bg-red-600 hover:bg-red-700 text-white rounded-lg text-xs font-bold transition-colors"
                  >
                    {language === "uz" ? "Ha, tozalash" : "Да"}
                  </button>
                  <button
                    onClick={() => setShowClearConfirm(false)}
                    className="px-3 py-1 bg-slate-200 dark:bg-slate-800 text-slate-700 dark:text-slate-300 hover:bg-slate-300 rounded-lg text-xs font-bold transition-colors"
                  >
                    {language === "uz" ? "Bekor" : "Отмена"}
                  </button>
                </div>
              ) : (
                <button
                  onClick={() => setShowClearConfirm(true)}
                  className="flex items-center gap-1.5 px-3.5 py-2 text-xs font-bold text-slate-400 hover:text-red-500 dark:hover:text-red-400 hover:bg-red-50 dark:hover:bg-red-950/30 rounded-xl transition-all"
                  title={t("clearAllFavorites")}
                >
                  <Trash2 size={14} />
                  <span>{t("clearAllFavorites")}</span>
                </button>
              )}
            </div>
          )}
        </div>

        {/* Filters & Search Controls if items exist */}
        {savedItems.length > 0 && (
          <div className="mt-6 flex flex-col md:flex-row gap-4 justify-between items-stretch md:items-center">
            {/* Filter Tabs */}
            <div className="flex items-center gap-2 overflow-x-auto pb-2 md:pb-0 scrollbar-none">
              <button
                onClick={() => setFilterType("all")}
                className={`px-4 py-2 rounded-xl text-xs font-black uppercase tracking-wider transition-all shrink-0 flex items-center gap-1.5 ${
                  filterType === "all"
                    ? "bg-slate-900 text-white dark:bg-white dark:text-slate-900 shadow-md"
                    : "bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 hover:bg-slate-200 dark:hover:bg-slate-700"
                }`}
              >
                <span>{t("tabAll")}</span>
                <span className="opacity-70 text-[10px]">({savedItems.length})</span>
              </button>

              <button
                onClick={() => setFilterType("pdf")}
                className={`px-4 py-2 rounded-xl text-xs font-black uppercase tracking-wider transition-all shrink-0 flex items-center gap-1.5 ${
                  filterType === "pdf"
                    ? "bg-brand-primary text-white shadow-md shadow-brand-primary/20"
                    : "bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 hover:bg-slate-200 dark:hover:bg-slate-700"
                }`}
              >
                <FileText size={13} />
                <span>{t("tabPdf")}</span>
                <span className="opacity-70 text-[10px]">({pdfCount})</span>
              </button>

              <button
                onClick={() => setFilterType("audio")}
                className={`px-4 py-2 rounded-xl text-xs font-black uppercase tracking-wider transition-all shrink-0 flex items-center gap-1.5 ${
                  filterType === "audio"
                    ? "bg-red-600 text-white shadow-md shadow-red-600/20"
                    : "bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 hover:bg-slate-200 dark:hover:bg-slate-700"
                }`}
              >
                <Youtube size={13} />
                <span>{t("tabAudio")}</span>
                <span className="opacity-70 text-[10px]">({audioCount})</span>
              </button>

              {/* Grade Selector Pill */}
              {availableGrades.length > 1 && (
                <div className="flex items-center gap-1.5 ml-2 border-l border-slate-200 dark:border-slate-800 pl-3">
                  <span className="text-[11px] font-bold text-slate-400 shrink-0">
                    <GraduationCap size={14} className="inline mr-1" />
                    {language === "uz" ? "Sinf:" : "Класс:"}
                  </span>
                  <select
                    value={selectedGrade}
                    onChange={(e) => setSelectedGrade(e.target.value)}
                    aria-label={language === "uz" ? "Sinf bo'yicha filtr" : "Фильтр по классу"}
                    className="bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 text-xs font-bold rounded-lg px-2 py-1.5 outline-none border border-transparent focus:border-brand-primary cursor-pointer"
                  >
                    <option value="all">{language === "uz" ? "Barcha sinflar" : "Все классы"}</option>
                    {availableGrades.map(g => (
                      <option key={g} value={g}>{g}-{language === "uz" ? "sinf" : "класс"}</option>
                    ))}
                  </select>
                </div>
              )}
            </div>

            {/* Quick Search */}
            <div className="relative min-w-[220px]">
              <Search size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder={language === "uz" ? "Sevimlilardan qidirish..." : "Поиск в избранном..."}
                className="w-full pl-9 pr-4 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700/80 rounded-xl text-xs font-medium text-slate-900 dark:text-white outline-none focus:border-brand-primary transition-colors placeholder:text-slate-400"
              />
            </div>
          </div>
        )}

        {/* Content list or Empty State */}
        <div className="mt-8">
          {savedItems.length === 0 ? (
            /* Empty State */
            <div className="py-16 px-6 text-center rounded-3xl bg-slate-50 dark:bg-slate-800/40 border border-dashed border-slate-200 dark:border-slate-700">
              <div className="w-16 h-16 rounded-3xl bg-amber-500/10 dark:bg-amber-500/20 text-amber-500 dark:text-amber-400 flex items-center justify-center mx-auto mb-4">
                <Bookmark size={32} strokeWidth={1.5} />
              </div>
              <h3 className="text-xl font-serif font-black text-slate-900 dark:text-white mb-2">
                {t("noFavoritesTitle")}
              </h3>
              <p className="text-slate-500 dark:text-slate-400 text-sm max-w-md mx-auto mb-6 leading-relaxed">
                {t("noFavoritesDesc")}
              </p>
              <Link
                to="/library"
                className="inline-flex items-center gap-2 px-6 py-3 bg-brand-primary text-white rounded-xl font-bold text-xs uppercase tracking-wider hover:bg-blue-700 hover:shadow-lg transition-all"
              >
                <span>{t("browseBooksBtn")}</span>
                <ArrowUpRight size={14} />
              </Link>
            </div>
          ) : filteredItems.length === 0 ? (
            /* Filter produced no results */
            <div className="py-12 text-center text-slate-400">
              <Filter size={32} className="mx-auto mb-2 opacity-40" />
              <p className="font-bold text-sm">
                {language === "uz" ? "Ushbu filtr bo'yicha hech narsa topilmadi." : "По данному фильтру ничего не найдено."}
              </p>
              <button
                onClick={() => {
                  setFilterType("all");
                  setSelectedGrade("all");
                  setSearchQuery("");
                }}
                className="mt-3 text-xs font-black text-brand-primary dark:text-blue-400 hover:underline"
              >
                {t("btnClearFilters")}
              </button>
            </div>
          ) : (
            /* List of Saved Bookmark Items */
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
              <AnimatePresence mode="popLayout">
                {filteredItems.map((item) => {
                  const isPdf = item.type === "pdf";
                  const isCopied = copiedId === item.id;

                  return (
                    <motion.div
                      layout
                      key={item.id}
                      initial={{ opacity: 0, scale: 0.95 }}
                      animate={{ opacity: 1, scale: 1 }}
                      exit={{ opacity: 0, scale: 0.95 }}
                      transition={{ duration: 0.2 }}
                      className="bg-slate-50 dark:bg-slate-800/80 rounded-2xl border border-slate-200/80 dark:border-slate-700/70 p-5 flex flex-col justify-between hover:border-brand-primary/30 dark:hover:border-brand-primary/50 hover:shadow-md transition-all group relative"
                    >
                      <div>
                        {/* Top Meta Bar */}
                        <div className="flex items-center justify-between gap-2 mb-3">
                          <div className="flex items-center gap-2">
                            {/* Type badge */}
                            {isPdf ? (
                              <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-blue-100 dark:bg-blue-950/70 text-brand-primary dark:text-blue-300 text-[11px] font-black uppercase tracking-wider">
                                <FileText size={12} /> PDF
                              </span>
                            ) : (
                              <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-red-100 dark:bg-red-950/70 text-red-600 dark:text-red-400 text-[11px] font-black uppercase tracking-wider">
                                <Youtube size={12} /> Audio
                              </span>
                            )}

                            {/* Grade badge */}
                            <span className="px-2 py-1 rounded-lg bg-slate-200/70 dark:bg-slate-700 text-slate-700 dark:text-slate-300 text-[11px] font-black">
                              {item.grade}-{language === "uz" ? "sinf" : "кл"}
                            </span>

                            {/* Year tag if present */}
                            {item.year && (
                              <span className="text-[10px] font-bold text-slate-400">
                                {item.year}
                              </span>
                            )}
                          </div>

                          {/* Quick Remove from favorites button */}
                          <button
                            onClick={() => removeBookmarkItem(item.id)}
                            title={t("removeFromFavorites")}
                            className="p-1.5 text-slate-400 hover:text-red-500 hover:bg-white dark:hover:bg-slate-700 rounded-lg transition-colors"
                          >
                            <Trash2 size={15} />
                          </button>
                        </div>

                        {/* Title */}
                        <h4 className="text-base font-serif font-bold text-slate-900 dark:text-white mb-2 leading-snug line-clamp-2">
                          {item.title}
                        </h4>

                        {item.subjectName && item.subjectName !== item.title && (
                          <p className="text-xs font-medium text-slate-500 dark:text-slate-400 mb-4 line-clamp-1">
                            {item.subjectName}
                          </p>
                        )}
                      </div>

                      {/* Bottom Direct Actions */}
                      <div className="mt-4 pt-3 border-t border-slate-200/60 dark:border-slate-700/60 flex items-center justify-between gap-2">
                        {/* Open Link in new tab */}
                        <a
                          href={isPdf ? getSafePdfUrl(item.url) : item.url}
                          target="_blank"
                          rel="noreferrer"
                          className={`flex-1 flex items-center justify-center gap-2 py-2.5 px-4 rounded-xl text-xs font-black transition-all shadow-xs ${
                            isPdf
                              ? "bg-brand-primary hover:bg-blue-700 text-white hover:shadow-brand-primary/20"
                              : "bg-red-600 hover:bg-red-700 text-white hover:shadow-red-600/20"
                          }`}
                        >
                          {isPdf ? (
                            <>
                              <FileText size={14} />
                              <span>{t("openPdfAction")}</span>
                            </>
                          ) : (
                            <>
                              <Youtube size={14} />
                              <span>{t("listenAudioAction")}</span>
                            </>
                          )}
                          <ExternalLink size={12} className="opacity-70" />
                        </a>

                        {/* Copy Link Button */}
                        <button
                          onClick={() => handleCopyLink(item)}
                          title={t("copyFavoriteLink")}
                          className="p-2.5 bg-white dark:bg-slate-700 hover:bg-slate-100 dark:hover:bg-slate-600 text-slate-600 dark:text-slate-300 rounded-xl border border-slate-200 dark:border-slate-600 transition-colors shrink-0"
                        >
                          {isCopied ? (
                            <Check size={14} className="text-green-600 dark:text-green-400" />
                          ) : (
                            <Copy size={14} />
                          )}
                        </button>
                      </div>
                    </motion.div>
                  );
                })}
              </AnimatePresence>
            </div>
          )}
        </div>

      </div>
    </section>
  );
}
