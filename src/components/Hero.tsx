/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { useEffect, useMemo, useRef, useState } from "react";
import { ArrowRight, Gamepad2, Search, X } from "lucide-react";
import { Link, useNavigate } from "react-router-dom";
import { useLanguage } from "../context/LanguageContext";
import { ALL_SUBJECTS } from "../data";
import { searchUnifiedCatalog, type SearchScope } from "../utils/smartSearch";

const QUICK_CHIPS = [
  { labelUz: "Alpomish", labelRu: "Алпомыш", query: "Alpomish" },
  { labelUz: "Chiziqli funksiya", labelRu: "Линейная функция", query: "Chiziqli funksiya" },
  { labelUz: "Arg'amchi tortish 3D", labelRu: "Перетягивание каната", query: "Arg'amchi" },
  { labelUz: "BSB / ChSB", labelRu: "СОР / СОЧ", query: "BSB" },
];

export default function Hero() {
  const { language } = useLanguage();
  const uz = language === "uz";
  const navigate = useNavigate();
  const inputRef = useRef<HTMLInputElement | null>(null);

  const [query, setQuery] = useState("");
  const [scope, setScope] = useState<SearchScope>("all");

  // Keyboard "/" focuses search input
  useEffect(() => {
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key !== "/" || e.ctrlKey || e.metaKey || e.altKey) return;
      const tag = (e.target as HTMLElement | null)?.tagName?.toLowerCase();
      if (tag === "input" || tag === "textarea" || tag === "select") return;
      e.preventDefault();
      inputRef.current?.focus();
    };
    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, []);

  const scopes: { id: SearchScope; label: string }[] = [
    { id: "all", label: uz ? "Hammasi" : "Всё" },
    { id: "lessons", label: uz ? "Interaktiv darslar" : "Слайд-уроки" },
    { id: "books", label: uz ? "Darsliklar" : "Учебники" },
    { id: "topics", label: uz ? "Mavzu testlari" : "Тесты по темам" },
    { id: "games", label: uz ? "O'yinlar" : "Игры" },
    { id: "materials", label: uz ? "Materiallar" : "Материалы" },
    { id: "audio", label: uz ? "Audio" : "Аудио" },
  ];

  const hits = useMemo(
    () => searchUnifiedCatalog(query, scope, language, 10),
    [query, scope, language],
  );

  const handleSubmitSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (hits.length > 0) {
      navigate(hits[0].href);
      return;
    }
    if (query.trim()) {
      navigate(`/library?q=${encodeURIComponent(query.trim())}`);
    } else {
      navigate("/library");
    }
  };

  return (
    <section
      id="asosiy"
      className="pt-28 pb-16 sm:pt-32 sm:pb-20 bg-white dark:bg-slate-950 edubaza-hero-glow border-b border-slate-200 dark:border-slate-800 transition-colors"
    >
      <div className="max-w-5xl mx-auto px-4 sm:px-6 text-center">
        <p className="text-xs sm:text-sm font-bold text-brand-primary dark:text-blue-400 uppercase tracking-wider mb-4">
          {uz
            ? "O'qituvchi, o'quvchi va ota-onalar uchun yagona ta'lim platformasi"
            : "Единая образовательная платформа для учителей, учеников и родителей"}
        </p>

        <h1 className="text-3xl sm:text-5xl lg:text-6xl font-serif font-black text-slate-900 dark:text-white tracking-tight leading-[1.12] mb-5">
          {uz ? (
            <>
              1–11 sinflar uchun darsliklar, slayd darslar va{" "}
              <span className="text-brand-primary dark:text-blue-400">ta'limiy o'yinlar</span>
            </>
          ) : (
            <>
              Учебники, слайд-уроки и{" "}
              <span className="text-brand-primary dark:text-blue-400">обучающие игры</span> для 1–11 классов
            </>
          )}
        </h1>

        <p className="text-base sm:text-lg text-slate-600 dark:text-slate-300 max-w-2xl mx-auto mb-8 leading-relaxed">
          {uz
            ? "Rasmiy PDF va audio darsliklar, tayyor slayd darslar, 15 xil intellektual o'yin, AI material generatori hamda virtual ustoz — 100% bepul."
            : "Официальные PDF и аудиоучебники, готовые презентации, 15 интеллектуальных игр, ИИ-генератор материалов и репетитор — 100% бесплатно."}
        </p>

        {/* Unified Smart Search Box */}
        <div className="max-w-3xl mx-auto text-left mb-7">
          <form
            onSubmit={handleSubmitSearch}
            className="flex items-center gap-2 p-1.5 rounded-2xl bg-white dark:bg-slate-900 border-2 border-slate-200 dark:border-slate-700 focus-within:border-brand-primary shadow-sm transition-colors"
          >
            <Search size={19} className="ml-3 text-slate-400 shrink-0" />
            <input
              ref={inputRef}
              type="text"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder={
                uz
                  ? "Fan, mavzu, darslik, o'yin yoki material qidiring... (masalan: Alpomish)"
                  : "Поиск предмета, темы, учебника, игры или материала..."
              }
              className="flex-1 bg-transparent py-2.5 px-2 text-sm sm:text-base text-slate-900 dark:text-white placeholder:text-slate-400 outline-none min-w-0"
            />
            {query && (
              <button
                type="button"
                onClick={() => setQuery("")}
                aria-label={uz ? "Tozalash" : "Очистить"}
                className="p-1.5 text-slate-400 hover:text-slate-700 dark:hover:text-white"
              >
                <X size={16} />
              </button>
            )}
            <kbd className="hidden sm:inline-flex items-center justify-center px-2 py-0.5 text-[11px] font-mono font-bold text-slate-400 border border-slate-200 dark:border-slate-700 rounded-md">
              /
            </kbd>
            <button
              type="submit"
              className="px-4 sm:px-5 py-2.5 rounded-xl bg-brand-primary hover:bg-blue-700 text-white text-sm font-bold whitespace-nowrap transition-colors"
            >
              {uz ? "Qidirish" : "Найти"}
            </button>
          </form>

          {/* Scope Tabs */}
          <div className="flex items-center gap-1.5 overflow-x-auto py-3 scrollbar-none">
            {scopes.map((s) => (
              <button
                key={s.id}
                type="button"
                onClick={() => setScope(s.id)}
                className={`px-3 py-1.5 rounded-lg text-xs font-bold whitespace-nowrap transition-colors ${
                  scope === s.id
                    ? "bg-slate-900 dark:bg-white text-white dark:text-slate-900"
                    : "bg-slate-100 dark:bg-slate-900 text-slate-600 dark:text-slate-300 border border-slate-200 dark:border-slate-800 hover:border-slate-300"
                }`}
              >
                {s.label}
              </button>
            ))}
          </div>

          {/* Interactive Search Suggestions when empty vs Live Typo-Tolerant Results */}
          {query.trim() === "" ? (
            <div className="flex flex-wrap items-center justify-center sm:justify-start gap-2 text-xs text-slate-500">
              <span>{uz ? "Tezkor qidiruv:" : "Примеры:"}</span>
              {QUICK_CHIPS.map((chip) => (
                <button
                  key={chip.query}
                  type="button"
                  onClick={() => setQuery(chip.query)}
                  className="px-2.5 py-1 rounded-md bg-slate-100 dark:bg-slate-900 hover:bg-blue-50 dark:hover:bg-blue-950/50 text-slate-700 dark:text-slate-300 hover:text-brand-primary font-semibold transition-colors"
                >
                  {uz ? chip.labelUz : chip.labelRu}
                </button>
              ))}
            </div>
          ) : (
            <div className="mt-1 rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-lg divide-y divide-slate-100 dark:divide-slate-800 max-h-80 overflow-y-auto">
              {hits.length === 0 ? (
                <div className="p-4 text-sm text-slate-500 text-center">
                  {uz
                    ? `«${query}» bo'yicha natija topilmadi. Boshqa so'z yoki bo'limni sinab ko'ring.`
                    : `По запросу «${query}» ничего не найдено.`}
                </div>
              ) : (
                hits.map((hit) => (
                  <Link
                    key={hit.id}
                    to={hit.href}
                    className="flex items-center justify-between gap-3 px-4 py-3 hover:bg-slate-50 dark:hover:bg-slate-800/70 transition-colors"
                  >
                    <div className="min-w-0">
                      <p className="font-bold text-sm text-slate-900 dark:text-white truncate">{hit.title}</p>
                      <p className="text-xs text-slate-500 dark:text-slate-400 truncate">
                        {hit.badge} · {hit.subtitle}
                      </p>
                    </div>
                    <ArrowRight size={15} className="text-brand-primary shrink-0" />
                  </Link>
                ))
              )}
            </div>
          )}
        </div>

        {/* Clean Metrics Line (zero rounded pill badges) */}
        <p className="text-xs sm:text-sm font-semibold text-slate-500 dark:text-slate-400 mb-7 tabular-nums">
          <strong className="text-slate-900 dark:text-white">{ALL_SUBJECTS.length}</strong>{" "}
          {uz ? "darslik" : "учебников"} ·{" "}
          <strong className="text-slate-900 dark:text-white">15</strong>{" "}
          {uz ? "ta'limiy o'yin" : "обучающих игр"} ·{" "}
          <strong className="text-slate-900 dark:text-white">10</strong>{" "}
          {uz ? "AI material turi" : "ИИ материалов"} ·{" "}
          <strong className="text-emerald-600 dark:text-emerald-400">100%</strong>{" "}
          {uz ? "bepul" : "бесплатно"}
        </p>

        {/* Primary & Secondary CTAs */}
        <div className="flex flex-col sm:flex-row items-center justify-center gap-3">
          <Link
            to="/lessons"
            id="hero-start-lessons-btn"
            className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-6 py-3.5 rounded-xl bg-brand-primary hover:bg-blue-700 text-white font-bold text-sm sm:text-base shadow-sm transition-colors"
          >
            <span>{uz ? "Hoziroq bepul boshlash" : "Начать бесплатно сейчас"}</span>
            <ArrowRight size={17} />
          </Link>
          <Link
            to="/tests?section=games"
            id="hero-games-btn"
            className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-6 py-3.5 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 hover:border-brand-primary text-slate-900 dark:text-white font-bold text-sm sm:text-base transition-colors"
          >
            <Gamepad2 size={17} className="text-brand-primary dark:text-blue-400" />
            <span>{uz ? "O'yinlarni ko'rish" : "Смотреть игры"}</span>
          </Link>
        </div>
      </div>
    </section>
  );
}
