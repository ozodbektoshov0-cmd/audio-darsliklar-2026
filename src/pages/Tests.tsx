import { useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { Gamepad2, Search, CheckCircle2, Clock, FlaskConical } from "lucide-react";
import { ALL_SUBJECTS } from "../data";
import type { GradeNumber } from "../data";
import { useLanguage } from "../context/LanguageContext";
import { useStudent } from "../context/StudentContext";
import { QUIZZES, getQuizzesBySubject } from "../quiz";
import { useQuizResults } from "../quiz/util";

const GRADES: GradeNumber[] = ["1", "2", "3", "4", "5", "6", "7", "8", "9", "10", "11"];

export default function Tests() {
  const { language } = useLanguage();
  const uz = language === "uz";
  const { profile } = useStudent();
  const { results } = useQuizResults();

  const [grade, setGrade] = useState<GradeNumber>(profile.grade ?? "5");
  const [search, setSearch] = useState("");
  const [onlyReady, setOnlyReady] = useState(true);

  const samples = QUIZZES.filter((q) => q.sample);
  const readyCount = QUIZZES.filter((q) => !q.sample).length;

  const subjects = useMemo(() => {
    const term = search.trim().toLowerCase();
    return ALL_SUBJECTS.filter((s) => s.grade === grade)
      .filter((s) => !term || s.name.toLowerCase().includes(term))
      .map((s) => ({ s, quizzes: getQuizzesBySubject(s.id) }))
      .filter(({ quizzes }) => !onlyReady || quizzes.length > 0);
  }, [grade, search, onlyReady]);

  return (
    <div className="pt-28 pb-20 bg-slate-50 dark:bg-slate-950 min-h-screen">
      <div className="container mx-auto px-4 max-w-5xl">
        <div className="mb-8">
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 bg-brand-primary/10 text-brand-primary dark:text-blue-300 rounded-full text-xs font-black uppercase tracking-widest mb-3">
            <Gamepad2 size={14} />
            {uz ? "Test va o'yinlar" : "Тесты и игры"}
          </div>
          <h1 className="text-3xl sm:text-5xl font-serif font-black text-slate-900 dark:text-white mb-3">
            {uz ? "Bilimingizni sinang" : "Проверьте свои знания"}
          </h1>
          <p className="text-slate-600 dark:text-slate-300 max-w-2xl">
            {uz
              ? "Har bir darslik bo'yicha viktorina, vaqtga qarshi o'yin, kartochkalar va juftlash. Natijalaringiz qurilmangizda saqlanadi."
              : "По каждому учебнику: викторина, игра на время, карточки и соединение пар. Результаты сохраняются на вашем устройстве."}
          </p>
        </div>

        {samples.length > 0 && (
          <div className="mb-8 grid gap-3">
            {samples.map((q) => (
              <Link
                key={q.id}
                to={`/tests/${q.id}`}
                className="flex items-center gap-3 p-4 rounded-2xl bg-amber-50 dark:bg-amber-950/30 border border-amber-200 dark:border-amber-900 hover:shadow-md transition-shadow"
              >
                <FlaskConical className="text-amber-600 shrink-0" size={22} />
                <div className="min-w-0">
                  <p className="font-bold text-slate-900 dark:text-white truncate">{q.title}</p>
                  <p className="text-xs text-slate-600 dark:text-slate-400">
                    {uz ? "Tizimni sinab ko'rish uchun namuna" : "Образец для знакомства с системой"} · {q.questions.length}{" "}
                    {uz ? "savol" : "вопросов"}
                  </p>
                </div>
              </Link>
            ))}
          </div>
        )}

        <div className="flex flex-wrap gap-2 mb-5">
          {GRADES.map((g) => (
            <button
              key={g}
              type="button"
              onClick={() => setGrade(g)}
              className={`px-3.5 py-1.5 rounded-xl text-sm font-bold border transition-colors ${
                grade === g
                  ? "bg-brand-primary border-brand-primary text-white"
                  : "bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300 hover:border-brand-primary"
              }`}
            >
              {g}-{uz ? "sinf" : "класс"}
            </button>
          ))}
        </div>

        <div className="flex flex-col sm:flex-row gap-3 mb-6">
          <div className="relative flex-1">
            <Search size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
            <input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder={uz ? "Fan nomi bo'yicha qidirish..." : "Поиск по предмету..."}
              className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-sm text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-brand-primary"
            />
          </div>
          <label className="inline-flex items-center gap-2 text-sm font-semibold text-slate-700 dark:text-slate-300 select-none">
            <input type="checkbox" checked={onlyReady} onChange={(e) => setOnlyReady(e.target.checked)} className="accent-brand-primary w-4 h-4" />
            {uz ? "Faqat testi borlar" : "Только с тестами"}
          </label>
        </div>

        {subjects.length === 0 ? (
          <div className="p-10 rounded-3xl bg-white dark:bg-slate-900 border border-dashed border-slate-300 dark:border-slate-700 text-center text-slate-600 dark:text-slate-300">
            <Clock className="mx-auto mb-3 text-slate-400" size={32} />
            <p className="font-bold mb-1">
              {onlyReady
                ? uz
                  ? `${grade}-sinf uchun testlar hali qo'shilmagan`
                  : `Для ${grade} класса тесты пока не добавлены`
                : uz
                  ? "Hech narsa topilmadi"
                  : "Ничего не найдено"}
            </p>
            <p className="text-sm">
              {uz
                ? `Hozircha tayyor testlar soni: ${readyCount}. Yangilari darsliklar asosida qo'shilib boriladi.`
                : `Готовых тестов: ${readyCount}. Новые добавляются по мере подготовки.`}
            </p>
            {onlyReady && (
              <button type="button" onClick={() => setOnlyReady(false)} className="mt-4 text-sm font-bold text-brand-primary dark:text-blue-300 underline">
                {uz ? "Barcha fanlarni ko'rsatish" : "Показать все предметы"}
              </button>
            )}
          </div>
        ) : (
          <div className="grid sm:grid-cols-2 gap-4">
            {subjects.map(({ s, quizzes }) => (
              <div key={s.id} className="p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800">
                <h3 className="font-bold text-slate-900 dark:text-white mb-1">{s.name}</h3>
                <p className="text-xs text-slate-500 dark:text-slate-400 mb-3">
                  {s.category} · {s.lang === "uz" ? "O'zbek" : "Русский"}
                </p>
                {quizzes.length === 0 ? (
                  <p className="text-xs font-semibold text-slate-400 flex items-center gap-1.5">
                    <Clock size={13} /> {uz ? "Tez orada" : "Скоро"}
                  </p>
                ) : (
                  <div className="space-y-2">
                    {quizzes.map((q) => {
                      const best = results[q.id]?.quiz?.best;
                      return (
                        <Link
                          key={q.id}
                          to={`/tests/${q.id}`}
                          className="flex items-center justify-between gap-2 px-3 py-2 rounded-xl bg-blue-50 dark:bg-slate-800 hover:bg-brand-primary hover:text-white text-brand-primary dark:text-blue-300 text-sm font-bold transition-colors"
                        >
                          <span className="truncate">{q.title}</span>
                          <span className="shrink-0 flex items-center gap-1 text-xs">
                            {best !== undefined && (
                              <>
                                <CheckCircle2 size={13} /> {best}%
                              </>
                            )}
                            {best === undefined && `${q.questions.length} ${uz ? "savol" : "вопр."}`}
                          </span>
                        </Link>
                      );
                    })}
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
