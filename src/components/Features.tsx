/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { Link } from "react-router-dom";
import {
  ArrowRight,
  BookOpen,
  CheckCircle2,
  FileSpreadsheet,
  Gamepad2,
  GraduationCap,
  Presentation,
  Users,
} from "lucide-react";
import { useLanguage } from "../context/LanguageContext";

export default function Features() {
  const { language } = useLanguage();
  const uz = language === "uz";

  const pillars = [
    {
      icon: Presentation,
      title: uz ? "Interaktiv slayd darslar" : "Интерактивные слайд-уроки",
      meta: uz ? "1–11 sinf · Metodik izoh" : "1–11 кл. · Методика",
      desc: uz
        ? "Har bir mavzu bo'yicha tayyor slaydlar, asosiy tushunchalar, tekshiruv savoli va AI bilan yangi dars yaratish imkoniyati."
        : "Готовые слайды по темам, ключевые термины, проверочные вопросы и генератор новых уроков.",
      href: "/lessons",
    },
    {
      icon: BookOpen,
      title: uz ? "1–11 Sinf Kutubxonasi" : "Библиотека 1–11 классов",
      meta: uz ? "718 fan · PDF va Audio" : "718 предметов · PDF и Аудио",
      desc: uz
        ? "O'zbek va rus tillaridagi barcha maktab darsliklari, 8–9-sinf Adabiyot audio pleylistlari hamda TTS ovoz studiyasi."
        : "Официальные учебники на узбекском и русском языках, аудиоплейлисты и озвучка текста.",
      href: "/library",
    },
    {
      icon: Gamepad2,
      title: uz ? "15 Ta'limiy O'yinlar" : "15 Обучающих игр",
      meta: uz ? "3D arena · Jamoaviy rejim" : "3D арена · Команды",
      desc: uz
        ? "Arg'amchi tortish 3D, Sirli quti 3D, Jeopardy, Omad charxi, Krossvord, Matematik duel va Attestatsiya sinovlari."
        : "Перетягивание каната 3D, Тайный ящик, Своя игра, Колесо, Кроссворд и тесты.",
      href: "/tests?section=games",
    },
    {
      icon: FileSpreadsheet,
      title: uz ? "AI Material Generatori" : "ИИ Генератор материалов",
      meta: uz ? "10 tur · Chop etish (A4)" : "10 типов · Печать A4",
      desc: uz
        ? "BSB/ChSB nazorat ishlari, matematik varaqlar, krossvordlar, so'z qidirish va javoblar kalitini bir zumda tayyorlang."
        : "Создавайте СОР/СОЧ, математические листы, кроссворды и ключи ответов для печати.",
      href: "/materials",
    },
  ];

  return (
    <section id="xususiyatlar" className="py-16 sm:py-20 bg-slate-50 dark:bg-slate-950 border-b border-slate-200 dark:border-slate-800 transition-colors">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 space-y-16">
        {/* Platformada nima bor? */}
        <div>
          <div className="max-w-2xl mb-10">
            <p className="text-xs font-bold uppercase tracking-wider text-brand-primary dark:text-blue-400 mb-2">
              {uz ? "Platforma imkoniyatlari" : "Возможности платформы"}
            </p>
            <h2 className="text-2xl sm:text-4xl font-serif font-black text-slate-900 dark:text-white tracking-tight">
              {uz ? "Platformada nima bor?" : "Что есть на платформе?"}
            </h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-5">
            {pillars.map((p) => {
              const Icon = p.icon;
              return (
                <Link
                  key={p.href}
                  to={p.href}
                  className="group p-6 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 hover:border-brand-primary transition-colors flex flex-col justify-between gap-5"
                >
                  <div>
                    <div className="w-11 h-11 rounded-xl bg-blue-50 dark:bg-blue-950/60 text-brand-primary dark:text-blue-400 flex items-center justify-center mb-4">
                      <Icon size={22} />
                    </div>
                    <p className="text-xs font-semibold text-slate-500 dark:text-slate-400 mb-1.5">{p.meta}</p>
                    <h3 className="text-lg font-black text-slate-900 dark:text-white mb-2 group-hover:text-brand-primary transition-colors">
                      {p.title}
                    </h3>
                    <p className="text-sm text-slate-600 dark:text-slate-400 leading-relaxed">{p.desc}</p>
                  </div>
                  <span className="inline-flex items-center gap-1 text-xs font-bold text-brand-primary dark:text-blue-400">
                    {uz ? "Ochish" : "Открыть"} <ArrowRight size={14} />
                  </span>
                </Link>
              );
            })}
          </div>
        </div>

        {/* Kimlar uchun? */}
        <div>
          <div className="max-w-2xl mb-8">
            <h2 className="text-2xl sm:text-3xl font-serif font-black text-slate-900 dark:text-white tracking-tight">
              {uz ? "Kimlar uchun mo'ljallangan?" : "Для кого создана платформа?"}
            </h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="p-6 sm:p-8 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800">
              <div className="flex items-center gap-3 mb-4">
                <div className="w-11 h-11 rounded-xl bg-blue-50 dark:bg-blue-950/60 text-brand-primary dark:text-blue-400 flex items-center justify-center">
                  <Users size={22} />
                </div>
                <div>
                  <h3 className="text-xl font-black text-slate-900 dark:text-white">
                    {uz ? "O'qituvchilar uchun" : "Для учителей"}
                  </h3>
                  <p className="text-xs text-slate-500">
                    {uz ? "Dars tayyorlash va sinf musobaqalari" : "Подготовка уроков и игры в классе"}
                  </p>
                </div>
              </div>
              <ul className="space-y-2.5 text-sm text-slate-700 dark:text-slate-300 mb-6">
                {[
                  uz ? "Tayyor slayd darslar va metodik izohlar" : "Готовые слайд-уроки и методические заметки",
                  uz ? "BSB/ChSB, krossvord va A4 tarqatma materiallar" : "СОР/СОЧ, кроссворды и материалы формата A4",
                  uz ? "PDF, DOCX, TXT fayllardan bir zumda test va 3D o'yin yaratish" : "Импорт тестов из PDF/DOCX/TXT в 3D игры",
                ].map((line, i) => (
                  <li key={i} className="flex items-start gap-2">
                    <CheckCircle2 size={16} className="text-brand-primary shrink-0 mt-0.5" />
                    <span>{line}</span>
                  </li>
                ))}
              </ul>
              <Link to="/materials" className="inline-flex items-center gap-1.5 text-sm font-bold text-brand-primary hover:underline">
                {uz ? "Material yaratishga o'tish" : "Перейти к материалам"} <ArrowRight size={15} />
              </Link>
            </div>

            <div className="p-6 sm:p-8 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800">
              <div className="flex items-center gap-3 mb-4">
                <div className="w-11 h-11 rounded-xl bg-emerald-50 dark:bg-emerald-950/60 text-emerald-600 dark:text-emerald-400 flex items-center justify-center">
                  <GraduationCap size={22} />
                </div>
                <div>
                  <h3 className="text-xl font-black text-slate-900 dark:text-white">
                    {uz ? "O'quvchilar va ota-onalar uchun" : "Для учеников и родителей"}
                  </h3>
                  <p className="text-xs text-slate-500">
                    {uz ? "Mustaqil o'rganish va bilimlarni sinash" : "Самостоятельное обучение и тесты"}
                  </p>
                </div>
              </div>
              <ul className="space-y-2.5 text-sm text-slate-700 dark:text-slate-300 mb-6">
                {[
                  uz ? "1–11 sinf rasmiy PDF darsliklari va audio pleylistlar" : "Официальные PDF учебники и аудио 1–11 кл.",
                  uz ? "Izohli va vaqtli mavzu testlari hamda Attestatsiya rejimi" : "Тесты по темам с разбором ошибок и таймером",
                  uz ? "24/7 AI Ustoz repetitor va matnni ovozda tinglash (TTS)" : "AI Репетитор 24/7 и озвучивание текстов (TTS)",
                ].map((line, i) => (
                  <li key={i} className="flex items-start gap-2">
                    <CheckCircle2 size={16} className="text-emerald-600 shrink-0 mt-0.5" />
                    <span>{line}</span>
                  </li>
                ))}
              </ul>
              <Link to="/library" className="inline-flex items-center gap-1.5 text-sm font-bold text-emerald-600 dark:text-emerald-400 hover:underline">
                {uz ? "Kutubxonani ochish" : "Открыть библиотеку"} <ArrowRight size={15} />
              </Link>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
