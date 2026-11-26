import React, { useMemo, useRef, useState } from "react";
import {
  Check,
  FileText,
  Loader2,
  LogIn,
  Plus,
  Trash2,
  Upload,
  Wand2,
  X,
} from "lucide-react";
import { ALL_SUBJECTS } from "../data";
import type { GradeNumber, Language } from "../data/types";
import { auth } from "../lib/firebase";
import { useAuth } from "../context/AuthContext";
import { getQuizzesBySubject } from "../quiz";
import { parseTestContent } from "../quiz/parser";
import type { Question, Quiz } from "../quiz/types";

interface Props {
  uz: boolean;
  onClose: () => void;
  onSave: (quiz: Quiz) => Promise<void> | void;
}

const GRADES: GradeNumber[] = ["1", "2", "3", "4", "5", "6", "7", "8", "9", "10", "11"];

function fileToBase64(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(String(reader.result || ""));
    reader.onerror = () => reject(new Error("Faylni o'qib bo'lmadi"));
    reader.readAsDataURL(file);
  });
}

export default function CustomQuizCreator({ uz, onClose, onSave }: Props) {
  const { user, authBusy, authError, loginWithGoogle } = useAuth();
  const fileInputRef = useRef<HTMLInputElement | null>(null);

  const [grade, setGrade] = useState<GradeNumber | "all">("9");
  const [lang, setLang] = useState<Language>("uz");

  const availableSubjects = useMemo(() => {
    if (grade === "all") return [];
    return ALL_SUBJECTS.filter((s) => s.grade === grade && s.lang === lang);
  }, [grade, lang]);

  const [subjectId, setSubjectId] = useState<string>("g9-uz-adabiyot");
  const [customSubjectName, setCustomSubjectName] = useState<string>("");
  const [topicTitle, setTopicTitle] = useState<string>("");
  const [title, setTitle] = useState<string>("");

  const [questions, setQuestions] = useState<Question[]>([]);
  const [cards, setCards] = useState<[string, string][]>([]);
  const [tab, setTab] = useState<"manual" | "bulk" | "file">("manual");

  // Manual form fields
  const [qType, setQType] = useState<"choice" | "truefalse" | "fill">("choice");
  const [qText, setQText] = useState("");
  const [optCorrect, setOptCorrect] = useState("");
  const [opt2, setOpt2] = useState("");
  const [opt3, setOpt3] = useState("");
  const [opt4, setOpt4] = useState("");
  const [tfAnswer, setTfAnswer] = useState(true);
  const [explain, setExplain] = useState("");

  // Bulk & file import state
  const [bulkText, setBulkText] = useState("");
  const [importingFile, setImportingFile] = useState(false);
  const [importNotice, setImportNotice] = useState<string | null>(null);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const existingTopics = useMemo(() => {
    if (!subjectId || subjectId === "other") return [];
    return getQuizzesBySubject(subjectId);
  }, [subjectId]);

  const selectedSubjectObj = availableSubjects.find((s) => s.id === subjectId);

  const handleGradeChange = (nextGrade: GradeNumber | "all") => {
    setGrade(nextGrade);
    if (nextGrade === "all") {
      setSubjectId("other");
    } else {
      const list = ALL_SUBJECTS.filter((s) => s.grade === nextGrade && s.lang === lang);
      setSubjectId(list[0]?.id ?? "other");
    }
  };

  const handleLangChange = (nextLang: Language) => {
    setLang(nextLang);
    if (grade !== "all") {
      const list = ALL_SUBJECTS.filter((s) => s.grade === grade && s.lang === nextLang);
      setSubjectId(list[0]?.id ?? "other");
    }
  };

  const addManualQuestion = () => {
    setError(null);
    const trimmedQ = qText.trim();
    if (!trimmedQ) {
      setError(uz ? "Savol matnini kiriting." : "Введите текст вопроса.");
      return;
    }

    if (qType === "choice") {
      const opts = [optCorrect, opt2, opt3, opt4].map((o) => o.trim()).filter(Boolean);
      if (!optCorrect.trim() || opts.length < 2) {
        setError(uz ? "To'g'ri javob va kamida yana 1 ta variant kiriting." : "Укажите верный ответ и минимум 1 вариант.");
        return;
      }
      setQuestions((prev) => [
        ...prev,
        {
          type: "choice",
          q: trimmedQ,
          options: opts,
          answer: 0,
          explain: explain.trim() || undefined,
        },
      ]);
      if (optCorrect.trim().length <= 45) {
        setCards((prev) => [...prev, [optCorrect.trim(), trimmedQ]]);
      }
    } else if (qType === "truefalse") {
      setQuestions((prev) => [
        ...prev,
        {
          type: "truefalse",
          q: trimmedQ,
          answer: tfAnswer,
          explain: explain.trim() || undefined,
        },
      ]);
    } else {
      if (!optCorrect.trim()) {
        setError(uz ? "To'g'ri javob so'zini kiriting." : "Введите правильное слово.");
        return;
      }
      setQuestions((prev) => [
        ...prev,
        {
          type: "fill",
          q: trimmedQ,
          answer: optCorrect.trim(),
          explain: explain.trim() || undefined,
        },
      ]);
      if (optCorrect.trim().length <= 45) {
        setCards((prev) => [...prev, [optCorrect.trim(), trimmedQ]]);
      }
    }

    setQText("");
    setOptCorrect("");
    setOpt2("");
    setOpt3("");
    setOpt4("");
    setExplain("");
  };

  const importBulkLines = () => {
    setError(null);
    setImportNotice(null);
    const parsed = parseTestContent(bulkText);
    if (parsed.questions.length === 0) {
      setError(
        uz
          ? "Savollar aniqlanmadi. Masalan: «1. Savol? A) ... B) ... Javob: A» yoki «Savol | To'g'ri | Variant 2»"
          : "Вопросы не найдены. Пример: «1. Вопрос? A) ... B) ... Ответ: A»",
      );
      return;
    }

    setQuestions((prev) => [...prev, ...parsed.questions]);
    setCards((prev) => [...prev, ...parsed.cards]);
    setImportNotice(
      uz
        ? `${parsed.questions.length} ta savol avtomatik aniqlandi va ro'yxatga qo'shildi.`
        : `Распознано и добавлено вопросов: ${parsed.questions.length}.`,
    );
    setBulkText("");
  };

  const fillBulkSample = () => {
    setBulkText(
      [
        "1. O'zbekiston poytaxti qaysi shahar?",
        "A) Toshkent*",
        "B) Samarqand",
        "C) Buxoro",
        "D) Xiva",
        "",
        "2. «Xamsa» asari muallifi kim? | Alisher Navoiy | Bobur | Lutfiy | Ogahiy",
        "Algoritm = Masalani yechishning aniq ketma-ket qadamlari",
      ].join("\n"),
    );
  };

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setError(null);
    setImportNotice(null);

    if (file.size > 4 * 1024 * 1024) {
      setError(uz ? "Fayl hajmi 4 MB dan oshmasligi kerak." : "Файл не должен превышать 4 МБ.");
      return;
    }

    setImportingFile(true);
    try {
      const ext = file.name.slice(file.name.lastIndexOf(".")).toLowerCase();

      // Tezkor mahalliy tahlil (oddiy TXT/JSON/CSV/MD uchun)
      if ([".txt", ".csv", ".md", ".json"].includes(ext)) {
        const text = await file.text();
        const localParsed = parseTestContent(text);
        if (localParsed.questions.length > 0) {
          setQuestions((prev) => [...prev, ...localParsed.questions]);
          setCards((prev) => [...prev, ...localParsed.cards]);
          if (!topicTitle.trim()) {
            setTopicTitle(file.name.replace(/\.[^.]+$/, ""));
          }
          setImportNotice(
            uz
              ? `«${file.name}» faylidan ${localParsed.questions.length} ta test savoli avtomatik aniqlandi!`
              : `Из файла «${file.name}» распознано ${localParsed.questions.length} вопросов!`,
          );
          return;
        }
      }

      // Server orqali aqlli tahlil (PDF, DOC, DOCX yoki erkin formatdagi TXT)
      const base64Data = await fileToBase64(file);
      const token = await auth.currentUser?.getIdToken().catch(() => undefined);
      const headers: Record<string, string> = { "Content-Type": "application/json" };
      if (token) headers.Authorization = `Bearer ${token}`;

      const res = await fetch("/api/parse-tests", {
        method: "POST",
        headers,
        body: JSON.stringify({ fileName: file.name, base64Data }),
      });

      const rawText = await res.text();
      let data: any = null;
      try {
        data = rawText ? JSON.parse(rawText) : null;
      } catch {
        data = null;
      }

      if (!res.ok) {
        const fallbackMsg =
          res.status === 413
            ? uz
              ? "Fayl hajmi juda katta (maksimum 4 MB)."
              : "Слишком большой файл (макс. 4 МБ)."
            : uz
              ? `Server xatoligi (${res.status}): faylni tahlil qilib bo'lmadi.`
              : `Ошибка сервера (${res.status}).`;
        setError(data?.error || fallbackMsg);
        return;
      }

      if (!data) {
        setError(uz ? "Serverdan noto'g'ri javob qaytdi." : "Некорректный ответ сервера.");
        return;
      }

      const detected: Question[] = Array.isArray(data.questions) ? data.questions : [];
      const detectedCards: [string, string][] = Array.isArray(data.cards) ? data.cards : [];
      if (detected.length === 0) {
        setError(uz ? "Fayldan test savollari topilmadi." : "Вопросы в файле не найдены.");
        return;
      }

      setQuestions((prev) => [...prev, ...detected]);
      if (detectedCards.length > 0) setCards((prev) => [...prev, ...detectedCards]);
      if (!topicTitle.trim()) {
        setTopicTitle(file.name.replace(/\.[^.]+$/, ""));
      }
      setImportNotice(
        uz
          ? `«${file.name}» faylidan ${detected.length} ta test savoli avtomatik aniqlandi!`
          : `Из файла «${file.name}» распознано ${detected.length} вопросов!`,
      );
    } catch {
      setError(uz ? "Faylni yuklashda tarmoq xatoligi yuz berdi." : "Ошибка сети при загрузке файла.");
    } finally {
      setImportingFile(false);
      if (fileInputRef.current) fileInputRef.current.value = "";
    }
  };

  const handleUpload = async () => {
    setError(null);
    if (!user) {
      setError(uz ? "Yuklash uchun avval Google akkaunt bilan kiring." : "Сначала войдите через Google.");
      return;
    }
    const finalSubjectName =
      subjectId === "other"
        ? customSubjectName.trim() || (uz ? "Umumiy fan" : "Общий предмет")
        : selectedSubjectObj?.name || (uz ? "Umumiy fan" : "Общий предмет");
    const finalTopic = topicTitle.trim() || title.trim();
    const finalTitle = title.trim() || finalTopic;

    if (!finalTitle || finalTitle.length < 2) {
      setError(uz ? "Mavzu yoki test nomini kiriting." : "Введите название темы или теста.");
      return;
    }
    if (questions.length < 1) {
      setError(uz ? "Kamida 1 ta test savoli qo'shing yoki fayldan import qiling." : "Добавьте минимум 1 вопрос.");
      return;
    }

    const newQuiz: Quiz = {
      id: `custom-${Date.now()}`,
      title: finalTitle,
      grade: grade === "all" ? undefined : grade,
      lang,
      subjectId: subjectId === "other" ? undefined : subjectId,
      subjectName: finalSubjectName,
      topicTitle: finalTopic || finalTitle,
      source: `${finalSubjectName} · ${finalTopic || finalTitle}`,
      custom: true,
      ownerId: user.uid,
      authorName: user.displayName || user.email || "O'qituvchi",
      questions,
      cards: cards.length > 0 ? cards : undefined,
    };

    setUploading(true);
    try {
      await onSave(newQuiz);
    } catch (err: any) {
      setError(err?.message || (uz ? "Yuklashda xatolik yuz berdi." : "Ошибка при загрузке."));
    } finally {
      setUploading(false);
    }
  };

  return (
    <div
      className="fixed inset-0 z-50 bg-slate-950/65 flex items-center justify-center p-4 overflow-y-auto"
      role="dialog"
      aria-modal="true"
      aria-label={uz ? "Yangi test yaratish va yuklash" : "Создать и загрузить тест"}
    >
      <div className="w-full max-w-2xl bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-2xl p-5 sm:p-7 my-8 max-h-[92vh] overflow-y-auto">
        <div className="flex items-center justify-between gap-4 mb-5 pb-4 border-b border-slate-100 dark:border-slate-800">
          <div>
            <h2 className="text-xl sm:text-2xl font-serif font-black text-slate-900 dark:text-white">
              {uz ? "Test yaratish va yuklash" : "Создание и загрузка теста"}
            </h2>
            <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400">
              {uz
                ? "Sinf, darslik va mavzuni tanlang, savol yozing yoki PDF/DOC/TXT fayl import qiling."
                : "Выберите класс, учебник и тему, добавьте вопросы или импортируйте файл."}
            </p>
          </div>
          <button
            type="button"
            onClick={onClose}
            aria-label={uz ? "Yopish" : "Закрыть"}
            className="w-9 h-9 rounded-xl bg-slate-100 dark:bg-slate-800 flex items-center justify-center text-slate-600 dark:text-slate-300 hover:bg-slate-200"
          >
            <X size={18} />
          </button>
        </div>

        {/* GOOGLE AKKAUNT TALABI */}
        {!user ? (
          <div className="p-6 sm:p-8 rounded-2xl bg-blue-50/70 dark:bg-slate-800/80 border border-blue-200 dark:border-slate-700 text-center space-y-4">
            <div className="w-14 h-14 mx-auto rounded-2xl bg-brand-primary text-white flex items-center justify-center shadow-md">
              <LogIn size={26} />
            </div>
            <h3 className="text-lg sm:text-xl font-black text-slate-900 dark:text-white">
              {uz ? "Google akkaunt orqali kirish talab etiladi" : "Требуется вход через Google"}
            </h3>
            <p className="text-sm text-slate-600 dark:text-slate-300 max-w-md mx-auto">
              {uz
                ? "Test yaratish, PDF/DOC/TXT fayllardan test import qilish va platformaga yuklash uchun Google akkauntingiz bilan kiring."
                : "Войдите через Google, чтобы создавать, импортировать и загружать тесты на платформу."}
            </p>
            {authError && (
              <p className="text-xs font-bold text-red-600 dark:text-red-400">{authError}</p>
            )}
            <button
              type="button"
              disabled={authBusy}
              onClick={() => void loginWithGoogle()}
              className="inline-flex items-center gap-2.5 px-6 py-3 rounded-xl bg-brand-primary hover:bg-blue-700 text-white text-sm font-bold shadow-md transition-colors disabled:opacity-60"
            >
              {authBusy ? <Loader2 size={16} className="animate-spin" /> : <LogIn size={16} />}
              {uz ? "Google orqali kirish" : "Войти через Google"}
            </button>
          </div>
        ) : (
          <>
            {/* Foydalanuvchi holati */}
            <div className="flex items-center justify-between gap-3 px-3.5 py-2.5 rounded-2xl bg-emerald-50/70 dark:bg-emerald-950/30 border border-emerald-200 dark:border-emerald-900 mb-5">
              <div className="flex items-center gap-2.5 min-w-0">
                {user.photoURL ? (
                  <img
                    src={user.photoURL}
                    alt={user.displayName || "User"}
                    className="w-8 h-8 rounded-full object-cover shrink-0"
                    referrerPolicy="no-referrer"
                  />
                ) : (
                  <div className="w-8 h-8 rounded-full bg-emerald-600 text-white font-black text-xs flex items-center justify-center shrink-0">
                    {(user.displayName || "U")[0].toUpperCase()}
                  </div>
                )}
                <div className="min-w-0">
                  <p className="text-xs font-black text-slate-900 dark:text-white truncate">
                    {user.displayName || user.email}
                  </p>
                  <p className="text-[11px] text-emerald-700 dark:text-emerald-300 truncate">
                    {uz ? "Google akkaunt tasdiqlangan" : "Google аккаунт подтверждён"}
                  </p>
                </div>
              </div>
              <span className="text-[11px] font-bold text-emerald-700 dark:text-emerald-300 shrink-0">
                ✓ {uz ? "Tayyor" : "Готово"}
              </span>
            </div>

            {/* 1. SINF, TIL, DARSLIK VA MAVZU TANLASH */}
            <div className="grid sm:grid-cols-2 gap-3 mb-4">
              <div>
                <label className="block text-xs font-bold text-slate-600 dark:text-slate-300 mb-1">
                  {uz ? "Sinfni tanlang *" : "Выберите класс *"}
                </label>
                <div className="flex gap-2">
                  <select
                    value={grade}
                    onChange={(e) => handleGradeChange(e.target.value as GradeNumber | "all")}
                    className="flex-1 px-3 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-sm font-bold text-slate-900 dark:text-white"
                  >
                    <option value="all">{uz ? "Hamma sinflar" : "Все классы"}</option>
                    {GRADES.map((g) => (
                      <option key={g} value={g}>
                        {g}-{uz ? "sinf" : "класс"}
                      </option>
                    ))}
                  </select>
                  <select
                    value={lang}
                    onChange={(e) => handleLangChange(e.target.value as Language)}
                    className="px-3 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-sm font-bold text-slate-900 dark:text-white"
                  >
                    <option value="uz">O'zbek</option>
                    <option value="ru">Rus</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-600 dark:text-slate-300 mb-1">
                  {uz ? "Darslikni tanlang *" : "Выберите учебник *"}
                </label>
                <select
                  value={subjectId}
                  onChange={(e) => setSubjectId(e.target.value)}
                  className="w-full px-3 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-sm font-bold text-slate-900 dark:text-white"
                >
                  {availableSubjects.map((s) => (
                    <option key={s.id} value={s.id}>
                      {s.name}
                    </option>
                  ))}
                  <option value="other">{uz ? "Boshqa darslik / fan yozish" : "Указать другой предмет"}</option>
                </select>
              </div>
            </div>

            {subjectId === "other" && (
              <div className="mb-3">
                <input
                  value={customSubjectName}
                  onChange={(e) => setCustomSubjectName(e.target.value)}
                  placeholder={uz ? "Fan yoki darslik nomini yozing (masalan: Informatika)" : "Название предмета"}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-sm text-slate-900 dark:text-white"
                />
              </div>
            )}

            <div className="grid sm:grid-cols-2 gap-3 mb-5">
              <div>
                <label className="block text-xs font-bold text-slate-600 dark:text-slate-300 mb-1">
                  {uz ? "Mavzu nomi *" : "Название темы *"}
                </label>
                <input
                  list="existing-topics-list"
                  value={topicTitle}
                  onChange={(e) => {
                    setTopicTitle(e.target.value);
                    if (!title) setTitle(e.target.value);
                  }}
                  placeholder={uz ? "Mavzuni tanlang yoki yangisini yozing" : "Выберите или введите тему"}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-sm text-slate-900 dark:text-white"
                />
                <datalist id="existing-topics-list">
                  {existingTopics.map((t) => (
                    <option key={t.id} value={t.title} />
                  ))}
                </datalist>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-600 dark:text-slate-300 mb-1">
                  {uz ? "Test to'plami sarlavhasi *" : "Заголовок теста *"}
                </label>
                <input
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder={uz ? "Masalan: 1-bob nazorat testi" : "Например: Тест по 1 главе"}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-sm text-slate-900 dark:text-white"
                />
              </div>
            </div>

            {/* 2. SAVOL QO'SHISH USULLARI */}
            <div className="inline-flex flex-wrap p-1 rounded-xl bg-slate-100 dark:bg-slate-800 mb-4 gap-1">
              <button
                type="button"
                onClick={() => setTab("manual")}
                className={`px-3 py-1.5 rounded-lg text-xs font-bold ${
                  tab === "manual"
                    ? "bg-white dark:bg-slate-900 text-slate-900 dark:text-white shadow-xs"
                    : "text-slate-600 dark:text-slate-400"
                }`}
              >
                {uz ? "Qo'lda yozish" : "Вручную"}
              </button>
              <button
                type="button"
                onClick={() => setTab("bulk")}
                className={`px-3 py-1.5 rounded-lg text-xs font-bold ${
                  tab === "bulk"
                    ? "bg-white dark:bg-slate-900 text-slate-900 dark:text-white shadow-xs"
                    : "text-slate-600 dark:text-slate-400"
                }`}
              >
                {uz ? "Matndan aniqlash" : "Из текста"}
              </button>
              <button
                type="button"
                onClick={() => setTab("file")}
                className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold ${
                  tab === "file"
                    ? "bg-brand-primary text-white shadow-xs"
                    : "text-slate-600 dark:text-slate-400"
                }`}
              >
                <FileText size={13} />
                {uz ? "Fayldan import (PDF, DOC, TXT)" : "Импорт файла (PDF, DOC, TXT)"}
              </button>
            </div>

            {tab === "manual" && (
              <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/70 border border-slate-200 dark:border-slate-700 space-y-3 mb-5">
                <div className="flex flex-wrap gap-2">
                  {(["choice", "truefalse", "fill"] as const).map((t) => (
                    <button
                      key={t}
                      type="button"
                      onClick={() => setQType(t)}
                      className={`px-3 py-1.5 rounded-lg text-xs font-bold border ${
                        qType === t
                          ? "bg-brand-primary border-brand-primary text-white"
                          : "bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300"
                      }`}
                    >
                      {t === "choice"
                        ? uz
                          ? "Variantli"
                          : "Выбор"
                        : t === "truefalse"
                          ? uz
                            ? "To'g'ri / Noto'g'ri"
                            : "Верно / Неверно"
                          : uz
                            ? "Bo'sh joy"
                            : "Пропуск"}
                    </button>
                  ))}
                </div>

                <input
                  value={qText}
                  onChange={(e) => setQText(e.target.value)}
                  placeholder={uz ? "Savol matnini yozing..." : "Введите вопрос..."}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-sm text-slate-900 dark:text-white"
                />

                {qType === "choice" && (
                  <div className="grid sm:grid-cols-2 gap-2.5">
                    <input
                      value={optCorrect}
                      onChange={(e) => setOptCorrect(e.target.value)}
                      placeholder={uz ? "To'g'ri javob *" : "Правильный ответ *"}
                      className="px-3.5 py-2 rounded-xl border border-emerald-400 bg-white dark:bg-slate-900 text-sm text-slate-900 dark:text-white"
                    />
                    <input
                      value={opt2}
                      onChange={(e) => setOpt2(e.target.value)}
                      placeholder={uz ? "2-variant (noto'g'ri) *" : "Вариант 2 *"}
                      className="px-3.5 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-sm text-slate-900 dark:text-white"
                    />
                    <input
                      value={opt3}
                      onChange={(e) => setOpt3(e.target.value)}
                      placeholder={uz ? "3-variant (ixtiyoriy)" : "Вариант 3"}
                      className="px-3.5 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-sm text-slate-900 dark:text-white"
                    />
                    <input
                      value={opt4}
                      onChange={(e) => setOpt4(e.target.value)}
                      placeholder={uz ? "4-variant (ixtiyoriy)" : "Вариант 4"}
                      className="px-3.5 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-sm text-slate-900 dark:text-white"
                    />
                  </div>
                )}

                {qType === "truefalse" && (
                  <div className="flex gap-2">
                    <button
                      type="button"
                      onClick={() => setTfAnswer(true)}
                      className={`px-4 py-2 rounded-xl text-xs font-bold border ${
                        tfAnswer
                          ? "bg-emerald-600 border-emerald-600 text-white"
                          : "bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300"
                      }`}
                    >
                      {uz ? "To'g'ri" : "Верно"}
                    </button>
                    <button
                      type="button"
                      onClick={() => setTfAnswer(false)}
                      className={`px-4 py-2 rounded-xl text-xs font-bold border ${
                        !tfAnswer
                          ? "bg-red-600 border-red-600 text-white"
                          : "bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300"
                      }`}
                    >
                      {uz ? "Noto'g'ri" : "Неверно"}
                    </button>
                  </div>
                )}

                {qType === "fill" && (
                  <input
                    value={optCorrect}
                    onChange={(e) => setOptCorrect(e.target.value)}
                    placeholder={uz ? "To'g'ri so'z (javob) *" : "Правильное слово *"}
                    className="w-full px-3.5 py-2 rounded-xl border border-emerald-400 bg-white dark:bg-slate-900 text-sm text-slate-900 dark:text-white"
                  />
                )}

                <input
                  value={explain}
                  onChange={(e) => setExplain(e.target.value)}
                  placeholder={uz ? "Izoh (ixtiyoriy)" : "Пояснение (необязательно)"}
                  className="w-full px-3.5 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-xs sm:text-sm text-slate-900 dark:text-white"
                />

                <button
                  type="button"
                  onClick={addManualQuestion}
                  className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-slate-900 dark:bg-brand-primary text-white text-xs font-bold hover:opacity-90"
                >
                  <Plus size={15} /> {uz ? "Savolni qo'shish" : "Добавить вопрос"}
                </button>
              </div>
            )}

            {tab === "bulk" && (
              <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/70 border border-slate-200 dark:border-slate-700 space-y-3 mb-5">
                <div className="flex items-center justify-between gap-2">
                  <p className="text-xs text-slate-600 dark:text-slate-300">
                    {uz
                      ? "1. Savol? A) Javob* B) ... yoki Savol | To'g'ri | Variant 2 formatida yozing:"
                      : "Формат: 1. Вопрос? A) Верно* B) ... или Вопрос | Верно | Вариант 2:"}
                  </p>
                  <button
                    type="button"
                    onClick={fillBulkSample}
                    className="inline-flex items-center gap-1 text-xs font-bold text-brand-primary dark:text-blue-300 hover:underline shrink-0"
                  >
                    <Wand2 size={13} /> {uz ? "Namuna" : "Пример"}
                  </button>
                </div>
                <textarea
                  value={bulkText}
                  onChange={(e) => setBulkText(e.target.value)}
                  rows={6}
                  placeholder={"1. Navoiy qachon tug'ilgan?\nA) 1441*\nB) 1483\nC) 1336\nD) 1501"}
                  className="w-full p-3 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-xs sm:text-sm text-slate-900 dark:text-white"
                />
                <button
                  type="button"
                  onClick={importBulkLines}
                  className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-slate-900 dark:bg-brand-primary text-white text-xs font-bold"
                >
                  <Plus size={15} /> {uz ? "Avtomatik aniqlash va qo'shish" : "Распознать и добавить"}
                </button>
              </div>
            )}

            {tab === "file" && (
              <div className="p-5 rounded-2xl bg-slate-50 dark:bg-slate-800/70 border-2 border-dashed border-slate-300 dark:border-slate-600 text-center space-y-3 mb-5">
                <input
                  ref={fileInputRef}
                  type="file"
                  accept=".pdf,.doc,.docx,.txt,.csv,.md,.json"
                  onChange={(e) => void handleFileChange(e)}
                  className="hidden"
                  id="test-file-import-input"
                />
                <FileText className="mx-auto text-brand-primary dark:text-blue-300" size={34} />
                <div>
                  <p className="font-bold text-sm text-slate-900 dark:text-white">
                    {uz
                      ? "PDF, DOC, DOCX, TXT, CSV yoki JSON faylni tanlang"
                      : "Выберите файл PDF, DOC, DOCX, TXT, CSV или JSON"}
                  </p>
                  <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
                    {uz
                      ? "Hujjat ichidagi savollar avtomatik aniqlanib tayyor testga aylantiriladi (4 MB gacha)."
                      : "Вопросы внутри документа распознаются автоматически (до 4 МБ)."}
                  </p>
                </div>
                <label
                  htmlFor="test-file-import-input"
                  className={`inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-brand-primary hover:bg-blue-700 text-white text-xs sm:text-sm font-bold cursor-pointer transition-colors ${
                    importingFile ? "opacity-60 pointer-events-none" : ""
                  }`}
                >
                  {importingFile ? (
                    <>
                      <Loader2 size={16} className="animate-spin" />
                      {uz ? "Fayl tahlil qilinmoqda..." : "Анализ файла..."}
                    </>
                  ) : (
                    <>
                      <Upload size={16} />
                      {uz ? "Fayl tanlash (PDF / DOC / TXT)" : "Выбрать файл"}
                    </>
                  )}
                </label>
              </div>
            )}

            {importNotice && (
              <p className="mb-4 text-xs font-bold text-emerald-700 dark:text-emerald-300 bg-emerald-50 dark:bg-emerald-950/40 px-3.5 py-2.5 rounded-xl">
                ✓ {importNotice}
              </p>
            )}

            {error && (
              <p className="mb-4 text-xs font-bold text-red-600 dark:text-red-400 bg-red-50 dark:bg-red-950/40 px-3.5 py-2.5 rounded-xl">
                {error}
              </p>
            )}

            {/* Qo'shilgan / aniqlangan savollar ro'yxati */}
            <div className="mb-5">
              <p className="text-xs font-bold text-slate-500 dark:text-slate-400 mb-2 tabular-nums">
                {uz ? `Tayyor test savollari: ${questions.length} ta` : `Готовых вопросов: ${questions.length}`}
              </p>
              {questions.length > 0 && (
                <div className="max-h-44 overflow-y-auto space-y-1.5 pr-1">
                  {questions.map((item, idx) => (
                    <div
                      key={idx}
                      className="flex items-center justify-between gap-2 px-3 py-2 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-xs"
                    >
                      <span className="truncate font-semibold text-slate-800 dark:text-slate-200">
                        {idx + 1}. {item.q}
                      </span>
                      <button
                        type="button"
                        aria-label={uz ? `Savol ${idx + 1} ni o'chirish` : `Удалить вопрос ${idx + 1}`}
                        onClick={() => setQuestions((prev) => prev.filter((_, i) => i !== idx))}
                        className="text-slate-400 hover:text-red-600 shrink-0"
                      >
                        <Trash2 size={14} />
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>

            <div className="flex items-center justify-end gap-3 pt-4 border-t border-slate-100 dark:border-slate-800">
              <button
                type="button"
                onClick={onClose}
                className="px-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 text-sm font-bold text-slate-700 dark:text-slate-200"
              >
                {uz ? "Bekor qilish" : "Отмена"}
              </button>
              <button
                type="button"
                disabled={uploading || importingFile}
                onClick={() => void handleUpload()}
                className="inline-flex items-center gap-1.5 px-6 py-2.5 rounded-xl bg-brand-primary hover:bg-blue-700 text-white text-sm font-bold disabled:opacity-60"
              >
                {uploading ? <Loader2 size={16} className="animate-spin" /> : <Upload size={16} />}
                {uploading ? (uz ? "Yuklanmoqda..." : "Загрузка...") : uz ? "Yuklash" : "Загрузить"}
              </button>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
