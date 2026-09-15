/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import Hero from "../components/Hero";
import Features from "../components/Features";
import { motion } from "motion/react";
import { ArrowRight, BookOpen, Headphones, GraduationCap, Sparkles, CheckCircle2, Mic, Bot, Download } from "lucide-react";
import { Link, useNavigate } from "react-router-dom";
import { useStudent, GradeNumber } from "../context/StudentContext";
import { useLanguage } from "../context/LanguageContext";

export default function Home() {
  const { profile, setGrade } = useStudent();
  const { language } = useLanguage();
  const navigate = useNavigate();

  const handleSelectGrade = (g: GradeNumber) => {
    setGrade(g);
    navigate("/profile");
  };

  const grades: GradeNumber[] = ["5", "6", "7", "8", "9", "10", "11"];

  return (
    <div className="pt-20">
      <Hero />
      
      {/* Student Profile Quick Access Banner */}
      <section className="py-12 bg-white dark:bg-slate-900/50 border-y border-slate-100 dark:border-slate-800">
        <div className="container mx-auto px-6">
          <div className="bg-slate-50 dark:bg-slate-800/80 rounded-[2.5rem] p-8 md:p-10 border border-slate-200/80 dark:border-slate-700/80 shadow-sm flex flex-col lg:flex-row items-center justify-between gap-8">
            <div className="flex items-start sm:items-center gap-5">
              <div className="w-16 h-16 bg-brand-primary text-white rounded-2xl flex items-center justify-center shrink-0 shadow-lg shadow-brand-primary/20">
                <GraduationCap size={32} />
              </div>
              <div>
                <div className="inline-flex items-center gap-1.5 px-3 py-0.5 bg-brand-primary/10 dark:bg-brand-primary/25 text-brand-primary dark:text-blue-300 rounded-full text-xs font-black uppercase tracking-wider mb-1.5">
                  <Sparkles size={12} />
                  {language === "uz" ? "O'quvchi Profili" : "Профиль Ученика"}
                </div>
                <h3 className="text-2xl md:text-3xl font-serif font-black text-slate-900 dark:text-white">
                  {profile.grade 
                    ? (language === "uz" ? `Siz ${profile.grade}-sinf o'quvchisi sifatida tanlangansiz` : `Вы выбрали ${profile.grade} класс`)
                    : (language === "uz" ? "Sinfingizni tanlang va shaxsiy darsliklaringizni oling" : "Выберите свой класс для быстрого доступа")}
                </h3>
                <p className="text-slate-500 dark:text-slate-300 font-medium text-sm md:text-base mt-1">
                  {profile.grade 
                    ? (language === "uz" ? "Sizning darsliklaringiz shaxsiy profilingizda birinchi bo'lib turibdi." : "Учебники вашего класса закреплены в профиле для мгновенного чтения.")
                    : (language === "uz" ? "5-sinfdan 11-sinfgacha bo'lgan darsliklar ro'yxatida o'z sinfingizni birinchi o'ringa qo'ying." : "Закрепите нужный класс с 5 по 11, чтобы учебники всегда были под рукой.")}
                </p>
              </div>
            </div>

            <div className="flex flex-col sm:flex-row items-center gap-3 w-full lg:w-auto">
              <div className="flex items-center gap-1.5 bg-white dark:bg-slate-900 p-1.5 rounded-2xl border border-slate-200/80 dark:border-slate-700 shadow-xs overflow-x-auto max-w-full">
                {grades.map((g) => {
                  const isSelected = profile.grade === g;
                  return (
                    <button
                      key={g}
                      onClick={() => handleSelectGrade(g)}
                      className={`px-3.5 py-2 rounded-xl text-xs font-black transition-all ${
                        isSelected
                          ? "bg-brand-primary text-white shadow-md shadow-brand-primary/20"
                          : "text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800"
                      }`}
                    >
                      {g}{language === "uz" ? "-sinf" : " кл"}
                    </button>
                  );
                })}
              </div>

              <Link
                to="/profile"
                className="px-6 py-3.5 bg-brand-primary text-white rounded-2xl font-bold text-sm hover:bg-blue-700 transition-all flex items-center gap-2 whitespace-nowrap shadow-md shadow-brand-primary/20 shrink-0"
              >
                <span>{language === "uz" ? "Shaxsiy Profil" : "Мой Профиль"}</span>
                <ArrowRight size={16} />
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* New AI & TTS Tools Showcase */}
      <section className="py-20 bg-slate-100/70 dark:bg-slate-900/50 border-y border-slate-200/80 dark:border-slate-800">
        <div className="container mx-auto px-6">
          <div className="text-center max-w-2xl mx-auto mb-12">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-blue-100 dark:bg-blue-950 text-brand-primary dark:text-blue-400 text-xs font-bold uppercase tracking-wider mb-3">
              <Sparkles size={14} />
              <span>{language === "uz" ? "Yangi Imkoniyatlar" : "Новые Возможности"}</span>
            </div>
            <h2 className="text-3xl font-black text-slate-900 dark:text-white tracking-tight">
              {language === "uz" ? "AI Texnologiyalari Bilan Ta'limni Boyiting" : "Улучшайте обучение с технологиями ИИ"}
            </h2>
            <p className="text-slate-600 dark:text-slate-400 text-sm sm:text-base mt-2">
              {language === "uz"
                ? "Darsliklarni nafaqat o'qing, balki sun'iy intellekt yordamida ovozga aylantiring va virtual ustozdan savollaringizga bir zumda javob oling."
                : "Читайте учебники, озвучивайте текст с помощью ИИ и получайте мгновенные ответы на вопросы от виртуального репетитора."}
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 max-w-5xl mx-auto">
            {/* Card 1: TTS Studio */}
            <div className="bg-white dark:bg-slate-900 p-8 rounded-3xl border border-slate-200/80 dark:border-slate-800 shadow-sm hover:shadow-md transition-all flex flex-col justify-between group">
              <div>
                <div className="w-14 h-14 rounded-2xl bg-amber-500/10 text-amber-500 flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
                  <Mic size={28} />
                </div>
                <div className="flex items-center gap-2 mb-2">
                  <span className="px-2.5 py-0.5 rounded-full text-[10px] font-black uppercase bg-amber-100 text-amber-800 dark:bg-amber-950 dark:text-amber-300">
                    Text-to-Speech (TTS)
                  </span>
                  <span className="text-xs text-slate-400 font-semibold flex items-center gap-1">
                    <Download size={12} /> {language === "uz" ? ".mp3 fayl" : ".mp3 файл"}
                  </span>
                </div>
                <h3 className="text-xl font-black text-slate-900 dark:text-white mb-2">
                  {language === "uz" ? "Matn Yozish & .mp3 Audio Yuklab Olish" : "Озвучивание текста & скачивание .mp3"}
                </h3>
                <p className="text-slate-600 dark:text-slate-400 text-sm leading-relaxed mb-6">
                  {language === "uz" 
                    ? "Darslik qoidasi, konspekt yoki she'rlarni matn shaklida kiriting va ularni professional AI ovozda tinglab, bevosita .mp3 fayl qilib qurilmangizga yuklab oling."
                    : "Введите правила, конспекты или стихи текстом, прослушивайте их реалистичными голосами ИИ и сохраняйте в формате .mp3 на устройство."}
                </p>
              </div>
              <Link
                to="/tts"
                className="w-full py-3.5 px-6 rounded-2xl bg-amber-500 hover:bg-amber-600 text-white font-bold text-sm flex items-center justify-center gap-2 shadow-lg shadow-amber-500/20 transition-all"
              >
                <span>{language === "uz" ? "Audio Studiyaga O'tish" : "Перейти в Аудио Студию"}</span>
                <ArrowRight size={16} />
              </Link>
            </div>

            {/* Card 2: AI Tutor Chatbot */}
            <div className="bg-white dark:bg-slate-900 p-8 rounded-3xl border border-slate-200/80 dark:border-slate-800 shadow-sm hover:shadow-md transition-all flex flex-col justify-between group">
              <div>
                <div className="w-14 h-14 rounded-2xl bg-brand-primary/10 text-brand-primary flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
                  <Bot size={28} />
                </div>
                <div className="flex items-center gap-2 mb-2">
                  <span className="px-2.5 py-0.5 rounded-full text-[10px] font-black uppercase bg-blue-100 text-blue-800 dark:bg-blue-950 dark:text-blue-300">
                    {language === "uz" ? "AI Virtual Repetitor" : "ИИ Репетитор"}
                  </span>
                  <span className="text-xs text-slate-400 font-semibold">{language === "uz" ? "1-11 Sinflar" : "1-11 Классы"}</span>
                </div>
                <h3 className="text-xl font-black text-slate-900 dark:text-white mb-2">
                  {language === "uz" ? "AI Ustoz & Fanlar Repetitori" : "ИИ Учитель и Репетитор"}
                </h3>
                <p className="text-slate-600 dark:text-slate-400 text-sm leading-relaxed mb-6">
                  {language === "uz"
                    ? "Matematika, fizika, adabiyot, tarix va boshqa maktab fanlari bo'yicha tushunmagan mavzularingizni so'rang, misollar yechimini oling va testlarga tayyorlaning."
                    : "Задавайте вопросы по математике, физике, литературе, истории и другим школьным предметам, разбирайте задачи и готовьтесь к экзаменам."}
                </p>
              </div>
              <Link
                to="/ai-tutor"
                className="w-full py-3.5 px-6 rounded-2xl bg-brand-primary hover:bg-blue-700 text-white font-bold text-sm flex items-center justify-center gap-2 shadow-lg shadow-brand-primary/20 transition-all"
              >
                <span>{language === "uz" ? "AI Ustoz Bilan Suhbat" : "Чат с ИИ Учителем"}</span>
                <ArrowRight size={16} />
              </Link>
            </div>
          </div>
        </div>
      </section>

      <Features />

      {/* How it works - 3 Simple Steps */}
      <section className="py-28 bg-slate-50 dark:bg-slate-950/60 overflow-hidden transition-colors border-t border-slate-100 dark:border-slate-850">
        <div className="container mx-auto px-6">
          <div className="text-center max-w-2xl mx-auto mb-16">
            <span className="inline-block px-4 py-1.5 bg-brand-primary/10 dark:bg-brand-primary/20 rounded-full text-brand-primary dark:text-blue-300 text-xs font-black uppercase tracking-widest mb-4">
              {language === "uz" ? "Bosqichma-bosqich" : "Пошагово"}
            </span>
            <h2 className="text-3xl md:text-5xl font-serif font-black text-slate-900 dark:text-white mb-4 tracking-tight">
              {language === "uz" ? "Qanday foydalaniladi?" : "Как пользоваться?"}
            </h2>
            <p className="text-slate-600 dark:text-slate-400 font-medium">
              {language === "uz" 
                ? "Darsliklarni o'rganish va tinglash uchun uchta oddiy amal" 
                : "Три простых шага для чтения и прослушивания уроков"}
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {[
              {
                step: "01",
                icon: GraduationCap,
                title: language === "uz" ? "Sinfingizni tanlang" : "Выберите ваш класс",
                desc: language === "uz" 
                  ? "Profilingizda yoki asosiy sahifada 1-11 sinflardan birini belgilang." 
                  : "Укажите свой класс в профиле, чтобы сразу видеть нужные материалы."
              },
              {
                step: "02",
                icon: BookOpen,
                title: language === "uz" ? "O'qing yoki tinglang" : "Читайте или слушайте",
                desc: language === "uz" 
                  ? "Rasmiy PDF darslikni yuklang yoki uning audio variantini YouTube orqali eshiting." 
                  : "Скачивайте официальный PDF учебник или слушайте плейлист на YouTube."
              },
              {
                step: "03",
                icon: Bot,
                title: language === "uz" ? "AI Ustozdan so'rang" : "Спросите AI Учителя",
                desc: language === "uz" 
                  ? "Tushunarsiz qolgan mavzu va qoidalar yuzasidan sun'iy intellektdan izoh oling." 
                  : "Получайте моментальные подсказки и объяснения правил от ИИ-репетитора."
              }
            ].map((s, idx) => {
              const StepIcon = s.icon;
              return (
                <div 
                  key={idx}
                  className="bg-white dark:bg-slate-900 rounded-[2.5rem] p-8 border border-slate-200/80 dark:border-slate-800 shadow-sm relative flex flex-col justify-between"
                >
                  <div>
                    <div className="flex items-center justify-between mb-6">
                      <div className="w-14 h-14 bg-brand-primary/10 dark:bg-brand-primary/20 text-brand-primary dark:text-blue-400 rounded-2xl flex items-center justify-center">
                        <StepIcon size={26} />
                      </div>
                      <span className="text-3xl font-serif font-black text-slate-200 dark:text-slate-800">
                        {s.step}
                      </span>
                    </div>
                    <h3 className="text-xl font-bold text-slate-900 dark:text-white mb-3">
                      {s.title}
                    </h3>
                    <p className="text-slate-500 dark:text-slate-400 text-sm leading-relaxed">
                      {s.desc}
                    </p>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </section>
    </div>
  );
}
