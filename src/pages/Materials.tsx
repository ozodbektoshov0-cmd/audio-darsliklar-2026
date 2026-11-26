import { useEffect, useMemo, useState } from "react";
import { useSearchParams } from "react-router-dom";
import {
  CheckCircle2,
  Eye,
  EyeOff,
  FileText,
  Printer,
  Sparkles,
  Wand2,
} from "lucide-react";
import { ALL_SUBJECTS, type GradeNumber } from "../data";
import { useLanguage } from "../context/LanguageContext";
import { useAuth } from "../context/AuthContext";
import {
  MATERIAL_TYPES,
  generateDeterministicMaterial,
  type GeneratedMaterial,
} from "../utils/smartSearch";
import { buildCrosswordGrid, generateWordSearch } from "../quiz/gameEngines";

const GRADES: GradeNumber[] = ["1", "2", "3", "4", "5", "6", "7", "8", "9", "10", "11"];

function mapTypeToServerKind(typeId: string): string {
  if (typeId === "topic-test") return "theme-test";
  if (typeId === "slides") return "lesson-slides";
  return typeId;
}

export default function Materials() {
  const { language } = useLanguage();
  const uz = language === "uz";
  const { user } = useAuth();
  const [searchParams, setSearchParams] = useSearchParams();

  const initialType = searchParams.get("type");
  const validInitialType = MATERIAL_TYPES.some((m) => m.id === initialType) ? initialType! : "bsb";

  const [typeId, setTypeId] = useState<string>(validInitialType);
  const [grade, setGrade] = useState<GradeNumber>((searchParams.get("grade") as GradeNumber) || "9");
  const [subject, setSubject] = useState<string>(searchParams.get("subject") || "Adabiyot");
  const [topic, setTopic] = useState<string>(searchParams.get("topic") || "");
  const [count, setCount] = useState<number>(8);
  const [showAnswers, setShowAnswers] = useState<boolean>(false);
  const [aiBusy, setAiBusy] = useState<boolean>(false);
  const [notice, setNotice] = useState<string | null>(null);

  const [material, setMaterial] = useState<GeneratedMaterial>(() =>
    generateDeterministicMaterial({
      typeId: validInitialType,
      grade: (searchParams.get("grade") as GradeNumber) || "9",
      subject: searchParams.get("subject") || "Adabiyot",
      topic: searchParams.get("topic") || "",
      count: 8,
    }),
  );

  useEffect(() => {
    const pType = searchParams.get("type");
    if (pType && MATERIAL_TYPES.some((m) => m.id === pType) && pType !== typeId) {
      setTypeId(pType);
      setMaterial(
        generateDeterministicMaterial({
          typeId: pType,
          grade,
          subject,
          topic,
          count,
        }),
      );
    }
  }, [searchParams]);

  const gradeSubjects = useMemo(() => {
    const set = new Set<string>();
    for (const s of ALL_SUBJECTS) {
      if (s.grade === grade && s.lang === language) set.add(s.name);
    }
    return Array.from(set);
  }, [grade, language]);

  const activeMeta = useMemo(() => MATERIAL_TYPES.find((m) => m.id === typeId) || MATERIAL_TYPES[0], [typeId]);

  const handleSelectType = (nextType: string) => {
    setTypeId(nextType);
    setNotice(null);
    setSearchParams({ type: nextType }, { replace: true });
    setMaterial(
      generateDeterministicMaterial({
        typeId: nextType,
        grade,
        subject,
        topic,
        count,
      }),
    );
  };

  const handleGenerateDeterministic = () => {
    setNotice(null);
    setMaterial(
      generateDeterministicMaterial({
        typeId,
        grade,
        subject,
        topic,
        count,
      }),
    );
  };

  const handleGenerateAi = async () => {
    const effectiveTopic = topic.trim() || `${subject} (${grade}-sinf)`;
    setAiBusy(true);
    setNotice(null);

    try {
      const headers: Record<string, string> = { "Content-Type": "application/json" };
      if (user) {
        const token = await user.getIdToken();
        if (token) headers.Authorization = `Bearer ${token}`;
      }

      const res = await fetch("/api/generate-material", {
        method: "POST",
        headers,
        body: JSON.stringify({
          kind: mapTypeToServerKind(typeId),
          grade,
          lang: language,
          subject,
          topic: effectiveTopic,
          count,
        }),
      });

      const raw = await res.text();
      let data: any = null;
      try {
        data = JSON.parse(raw);
      } catch {
        data = null;
      }

      if (res.ok && data && Array.isArray(data.items) && data.items.length > 0) {
        const blocks = data.items.map((item: any, idx: number) => ({
          number: idx + 1,
          prompt: String(item.prompt || ""),
          options: Array.isArray(item.options) && item.options.length > 0 ? item.options.map(String) : undefined,
          answer: String(item.answer || ""),
          note: item.explanation ? String(item.explanation) : undefined,
          points: typeId === "bsb" ? (idx < 4 ? 2 : idx < 6 ? 3 : 5) : undefined,
        }));

        let wordGrid: string[][] | undefined;
        let crossword: ReturnType<typeof buildCrosswordGrid> | undefined;

        if (typeId === "crossword" || typeId === "word-search") {
          const wordPairs = blocks
            .map((b: any) => ({
              word: b.answer.replace(/[^a-zA-Z0-9\u0400-\u04FF]/g, "").toUpperCase(),
              displayWord: b.answer,
              hint: b.prompt,
            }))
            .filter((w: any) => w.word.length >= 3 && w.word.length <= 12);

          if (typeId === "crossword" && wordPairs.length >= 3) {
            crossword = buildCrosswordGrid(wordPairs, 6);
          } else if (typeId === "word-search" && wordPairs.length >= 3) {
            wordGrid = generateWordSearch(wordPairs, 10).grid;
          }
        }

        setMaterial({
          typeId,
          title: String(data.title || `${grade}-sinf · ${subject}`),
          subtitle: String(data.subtitle || effectiveTopic),
          grade,
          subject,
          topic: effectiveTopic,
          instructions: String(data.instructions || activeMeta.promptHint),
          blocks,
          wordGrid,
          crossword,
          generatedBy: "ai",
        });
        setAiBusy(false);
        return;
      }

      const fallback = generateDeterministicMaterial({
        typeId,
        grade,
        subject,
        topic: effectiveTopic,
        count,
      });
      setMaterial(fallback);
      setNotice(
        data?.error ||
          (uz
            ? "Serverda AI kaliti sozlanmaganligi sababli darslik dasturi asosidagi tezkor shablon yaratildi."
            : "Ключ ИИ на сервере не настроен — использован готовый шаблон программы."),
      );
    } catch {
      const fallback = generateDeterministicMaterial({
        typeId,
        grade,
        subject,
        topic: effectiveTopic,
        count,
      });
      setMaterial(fallback);
      setNotice(
        uz
          ? "Serverga ulanib bo'lmadi. Tezkor darslik shabloni yuklandi."
          : "Нет связи с сервером. Загружен шаблон из программы.",
      );
    } finally {
      setAiBusy(false);
    }
  };

  return (
    <div className="pt-24 pb-20 min-h-screen bg-slate-50 dark:bg-slate-950 transition-colors">
      <div className="max-w-7xl mx-auto px-4 sm:px-6">
        {/* Header (hidden on print) */}
        <div className="no-print pb-6 border-b border-slate-200 dark:border-slate-800">
          <p className="text-xs font-bold uppercase tracking-wider text-brand-primary dark:text-blue-400 mb-2">
            {uz ? "10 xil tarqatma material · A4 format" : "10 типов раздаточных материалов · A4"}
          </p>
          <h1 className="text-3xl sm:text-4xl font-serif font-black text-slate-900 dark:text-white tracking-tight">
            {uz ? "AI Material Generatori" : "ИИ Генератор материалов"}
          </h1>
          <p className="text-slate-600 dark:text-slate-400 text-sm sm:text-base mt-1.5 max-w-2xl">
            {uz
              ? "BSB/ChSB, mavzu testi, matematik varaq, krossvord va konspektlarni bir necha soniyada yarating hamda javoblar kaliti bilan chop eting."
              : "Создавайте СОР/СОЧ, тесты, математические листы, кроссворды и конспекты и печатайте их с ключом ответов."}
          </p>
        </div>

        {/* 10 Material Type Tabs (hidden on print) */}
        <div className="no-print py-5 flex items-center gap-2 overflow-x-auto scrollbar-none">
          {MATERIAL_TYPES.map((m) => {
            const active = m.id === typeId;
            return (
              <button
                key={m.id}
                type="button"
                onClick={() => handleSelectType(m.id)}
                className={`px-3.5 py-2 rounded-xl text-xs font-bold whitespace-nowrap transition-colors ${
                  active
                    ? "bg-brand-primary text-white"
                    : "bg-white dark:bg-slate-900 text-slate-700 dark:text-slate-300 border border-slate-200 dark:border-slate-800 hover:border-brand-primary"
                }`}
              >
                {uz ? m.titleUz : m.titleRu}
              </button>
            );
          })}
        </div>

        {/* Builder Controls Card (hidden on print) */}
        <div className="no-print rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-5 mb-6">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-12 gap-3 items-end">
            <div className="lg:col-span-2">
              <label className="block text-xs font-bold text-slate-500 mb-1">{uz ? "Sinf" : "Класс"}</label>
              <select
                value={grade}
                onChange={(e) => setGrade(e.target.value as GradeNumber)}
                className="w-full px-3 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-sm font-bold text-slate-900 dark:text-white"
              >
                {GRADES.map((g) => (
                  <option key={g} value={g}>
                    {g}-{uz ? "sinf" : "кл"}
                  </option>
                ))}
              </select>
            </div>

            <div className="lg:col-span-3">
              <label className="block text-xs font-bold text-slate-500 mb-1">{uz ? "Fan" : "Предмет"}</label>
              <input
                list="materials-subjects-datalist"
                value={subject}
                onChange={(e) => setSubject(e.target.value)}
                className="w-full px-3 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-sm font-bold text-slate-900 dark:text-white"
              />
              <datalist id="materials-subjects-datalist">
                {gradeSubjects.map((s) => (
                  <option key={s} value={s} />
                ))}
              </datalist>
            </div>

            <div className="lg:col-span-4">
              <label className="block text-xs font-bold text-slate-500 mb-1">
                {uz ? "Mavzu nomi" : "Тема задания"}
              </label>
              <input
                type="text"
                value={topic}
                onChange={(e) => setTopic(e.target.value)}
                placeholder={uz ? "Masalan: Kvadrat tenglamalar yoki Alpomish" : "Например: Квадратные уравнения"}
                className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-sm text-slate-900 dark:text-white"
              />
            </div>

            <div className="lg:col-span-1">
              <label className="block text-xs font-bold text-slate-500 mb-1">{uz ? "Soni" : "Кол-во"}</label>
              <select
                value={count}
                onChange={(e) => setCount(Number(e.target.value))}
                className="w-full px-2.5 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-sm font-bold text-slate-900 dark:text-white tabular-nums"
              >
                {[6, 8, 10, 12].map((n) => (
                  <option key={n} value={n}>
                    {n}
                  </option>
                ))}
              </select>
            </div>

            <div className="lg:col-span-2 flex gap-2">
              <button
                type="button"
                onClick={handleGenerateDeterministic}
                className="flex-1 inline-flex items-center justify-center gap-1.5 px-3.5 py-2.5 rounded-xl bg-brand-primary hover:bg-blue-700 text-white text-xs sm:text-sm font-bold transition-colors whitespace-nowrap"
              >
                <Wand2 size={15} />
                {uz ? "Yaratish" : "Создать"}
              </button>
              <button
                type="button"
                disabled={aiBusy}
                onClick={handleGenerateAi}
                title={uz ? "Gemini AI orqali yaratish" : "Создать через Gemini AI"}
                className="inline-flex items-center justify-center gap-1.5 px-3 py-2.5 rounded-xl border border-brand-primary text-brand-primary dark:text-blue-300 hover:bg-blue-50 dark:hover:bg-blue-950/40 text-xs font-bold transition-colors disabled:opacity-50 whitespace-nowrap"
              >
                <Sparkles size={14} />
                {aiBusy ? "..." : "AI"}
              </button>
            </div>
          </div>

          {/* Preview Actions Bar */}
          <div className="mt-4 pt-4 border-t border-slate-100 dark:border-slate-800 flex flex-wrap items-center justify-between gap-3">
            <div className="text-xs text-slate-500 dark:text-slate-400 flex items-center gap-2">
              <FileText size={14} className="text-brand-primary" />
              <span>{uz ? activeMeta.subtitleUz : activeMeta.subtitleRu}</span>
              <span>·</span>
              <span className="font-bold text-slate-700 dark:text-slate-300">
                {material.generatedBy === "ai" ? "AI" : uz ? "Darslik shabloni" : "Шаблон программы"}
              </span>
            </div>

            <div className="flex flex-wrap items-center gap-2">
              <button
                type="button"
                onClick={() => setShowAnswers((v) => !v)}
                className={`inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl border text-xs font-bold transition-colors ${
                  showAnswers
                    ? "bg-emerald-50 dark:bg-emerald-950/40 border-emerald-500 text-emerald-700 dark:text-emerald-300"
                    : "bg-slate-50 dark:bg-slate-800 border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-200"
                }`}
              >
                {showAnswers ? <EyeOff size={14} /> : <Eye size={14} />}
                {showAnswers ? (uz ? "Javoblar kalitini yashirish" : "Скрыть ответы") : uz ? "Javoblar kaliti" : "Ключ ответов"}
              </button>

              <button
                type="button"
                onClick={() => window.print()}
                className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-slate-900 dark:bg-white text-white dark:text-slate-900 text-xs font-bold hover:opacity-90 transition-opacity"
              >
                <Printer size={14} />
                {uz ? "Chop etish / PDF" : "Печать / PDF"}
              </button>
            </div>
          </div>
        </div>

        {notice && (
          <div className="no-print mb-6 p-4 rounded-xl bg-blue-50 dark:bg-blue-950/40 border border-blue-200 dark:border-blue-800 text-sm text-slate-800 dark:text-slate-200">
            {notice}
          </div>
        )}

        {/* A4 Print Sheet */}
        <div className="print-sheet max-w-4xl mx-auto rounded-2xl bg-white text-slate-900 border border-slate-200 shadow-sm p-6 sm:p-10">
          {/* Worksheet School Header */}
          <div className="flex flex-wrap items-center justify-between gap-4 pb-4 mb-5 border-b-2 border-slate-900 text-xs sm:text-sm">
            <div className="font-bold">
              {uz ? "O'quvchi F.I.Sh:" : "Ф.И.О. ученика:"} _____________________________
            </div>
            <div className="flex items-center gap-4 font-bold tabular-nums">
              <span>{uz ? "Sinf:" : "Класс:"} {material.grade}</span>
              <span>{uz ? "Sana:" : "Дата:"} ____.____.2026</span>
            </div>
          </div>

          <div className="mb-6">
            <h2 className="text-xl sm:text-2xl font-serif font-black text-slate-900">{material.title}</h2>
            <p className="text-sm font-semibold text-slate-600 mt-1">{material.subtitle}</p>
            <p className="text-xs sm:text-sm text-slate-600 mt-2 italic">{material.instructions}</p>
          </div>

          {/* Optional Crossword Matrix */}
          {material.crossword && (
            <div className="mb-6 overflow-x-auto">
              <table className="border-collapse mx-auto">
                <tbody>
                  {material.crossword.solutionGrid.map((row, r) => (
                    <tr key={r}>
                      {row.map((cell, c) => {
                        const starterNum = material.crossword!.numberGrid[r]?.[c];
                        return (
                          <td
                            key={c}
                            className={`w-8 h-8 text-center align-middle relative font-mono font-bold text-sm ${
                              cell ? "border border-slate-800 bg-white" : "bg-transparent"
                            }`}
                          >
                            {starterNum !== null && starterNum !== undefined && (
                              <span className="absolute top-0.5 left-0.5 text-[9px] leading-none text-slate-500">
                                {starterNum}
                              </span>
                            )}
                            {showAnswers ? cell || "" : ""}
                          </td>
                        );
                      })}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}

          {/* Optional Word Search Grid */}
          {material.wordGrid && (
            <div className="mb-6 overflow-x-auto">
              <table className="border-collapse mx-auto">
                <tbody>
                  {material.wordGrid.map((row, r) => (
                    <tr key={r}>
                      {row.map((letter, c) => (
                        <td
                          key={c}
                          className="w-7 h-7 sm:w-8 sm:h-8 border border-slate-300 text-center align-middle font-mono font-bold text-xs sm:text-sm text-slate-800"
                        >
                          {letter}
                        </td>
                      ))}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}

          {/* Numbered Material Blocks */}
          <div className="space-y-4">
            {material.blocks.map((block) => (
              <div key={block.number} className="pb-3 border-b border-slate-200 last:border-b-0">
                <div className="flex items-start justify-between gap-3">
                  <p className="text-sm sm:text-base font-bold text-slate-900">
                    <span className="tabular-nums mr-1.5">{block.number}.</span>
                    {block.prompt}
                  </p>
                  {block.points && (
                    <span className="shrink-0 text-xs font-mono font-bold text-slate-600 tabular-nums">
                      [{block.points} {uz ? "ball" : "б."}]
                    </span>
                  )}
                </div>

                {block.options && block.options.length > 0 && (
                  <div className="grid sm:grid-cols-2 gap-1.5 mt-2 pl-5">
                    {block.options.map((opt, idx) => (
                      <div key={idx} className="text-xs sm:text-sm text-slate-700 flex items-center gap-2">
                        <span className="font-mono font-bold text-slate-500">
                          {String.fromCharCode(65 + idx)})
                        </span>
                        <span>{opt}</span>
                      </div>
                    ))}
                  </div>
                )}

                {(!block.options || block.options.length === 0) && !material.crossword && !material.wordGrid && (
                  <div className="mt-2 pl-5 text-xs text-slate-400">
                    {uz ? "Javob:" : "Ответ:"} ________________________________________________
                  </div>
                )}
              </div>
            ))}
          </div>

          {/* Toggleable Answer Key */}
          {showAnswers && (
            <div className="mt-8 pt-6 border-t-2 border-dashed border-slate-400">
              <h3 className="text-sm font-black uppercase tracking-wider text-slate-900 mb-3 flex items-center gap-2">
                <CheckCircle2 size={16} className="text-emerald-600" />
                {uz ? "Javoblar kaliti (O'qituvchi uchun)" : "Ключ ответов (для учителя)"}
              </h3>
              <div className="grid sm:grid-cols-2 gap-2.5 text-xs sm:text-sm">
                {material.blocks.map((block) => (
                  <div key={block.number} className="p-2.5 rounded-lg bg-slate-50 border border-slate-200">
                    <span className="font-bold tabular-nums mr-1.5">{block.number}.</span>
                    <span className="font-bold text-emerald-700">{block.answer}</span>
                    {block.note && <p className="text-xs text-slate-500 mt-0.5">{block.note}</p>}
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
