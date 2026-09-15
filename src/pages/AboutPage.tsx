/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { motion } from "motion/react";
import { Heart, Shield, Zap, Star, User, BookOpen, GraduationCap, Headphones, Sparkles, ArrowRight } from "lucide-react";
import { Link } from "react-router-dom";
import { useLanguage } from "../context/LanguageContext";

export default function AboutPage() {
  const { language } = useLanguage();

  const valuesUz = [
    { icon: Heart, title: "Beg'araz yordam", desc: "Bizning barcha resurslarimiz 100% bepul.", color: "text-red-500", bg: "bg-red-50 dark:bg-red-950/50" },
    { icon: Shield, title: "Xavfsizlik", desc: "Faqat tasdiqlangan rasmiy manbalar bilan ishlaymiz.", color: "text-blue-500", bg: "bg-blue-50 dark:bg-blue-950/50" },
    { icon: Zap, title: "Tezkorlik", desc: "Fayllar maksimal darajada optimallangan.", color: "text-yellow-500", bg: "bg-yellow-50 dark:bg-yellow-950/50" },
  ];

  const valuesRu = [
    { icon: Heart, title: "Бескорыстная помощь", desc: "Все наши ресурсы на 100% бесплатны для каждого.", color: "text-red-500", bg: "bg-red-50 dark:bg-red-950/50" },
    { icon: Shield, title: "Надежность", desc: "Работаем только с проверенными официальными источниками.", color: "text-blue-500", bg: "bg-blue-50 dark:bg-blue-950/50" },
    { icon: Zap, title: "Скорость", desc: "Файлы и ссылки максимально оптимизированы для быстрой загрузки.", color: "text-yellow-500", bg: "bg-yellow-50 dark:bg-yellow-950/50" },
  ];

  const currentValues = language === "uz" ? valuesUz : valuesRu;

  return (
    <div className="pt-20">
      <section className="relative py-32 bg-white dark:bg-slate-900 overflow-hidden bg-mesh transition-colors">
        <div className="absolute inset-0 bg-dot-pattern opacity-10"></div>
        <div className="container mx-auto px-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-20 items-center">
            <motion.div
              initial={{ opacity: 0, x: -50 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.8 }}
            >
              <motion.div
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                className="inline-flex items-center gap-2 px-4 py-2 bg-brand-primary/5 dark:bg-brand-primary/25 rounded-full text-brand-primary dark:text-blue-300 font-black text-[10px] uppercase tracking-[0.2em] mb-8"
              >
                <Star size={14} />
                {language === "uz" ? "Loyiha tarixi va maqsadi" : "История и цель проекта"}
              </motion.div>
              <h1 className="text-5xl md:text-7xl font-serif font-black text-slate-900 dark:text-white mb-8 tracking-tight leading-[1.1]">
                {language === "uz" ? (
                  <>Bilim hamma uchun <span className="text-brand-primary dark:text-blue-400">bepul</span>.</>
                ) : (
                  <>Знания доступны каждому <span className="text-brand-primary dark:text-blue-400">бесплатно</span>.</>
                )}
              </h1>
              <p className="text-lg md:text-xl text-slate-500 dark:text-slate-300 font-medium leading-relaxed mb-8">
                {language === "uz" ? (
                  "Audio Darsliklar 2026 loyihasi O'zbekiston maktablarining 1–11-sinf o'quvchilari uchun barcha fan darsliklarini rasmiy PDF va sifatli audio formatda bepul taqdim etuvchi zamonaviy ta'lim platformasidir."
                ) : (
                  "Проект «Audio Darsliklar 2026» — это современная образовательная платформа, предоставляющая официальные PDF-учебники и аудиоверсии уроков для учащихся 1–11 классов школ Узбекистана абсолютно бесплатно."
                )}
              </p>

              {/* Creator Card Badge */}
              <div className="p-5 rounded-2xl bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 mb-8 flex items-center gap-4">
                <div className="w-12 h-12 rounded-xl bg-brand-primary text-white flex items-center justify-center font-black">
                  <User size={22} />
                </div>
                <div>
                  <p className="text-xs uppercase tracking-wider font-bold text-slate-400">
                    {language === "uz" ? "Loyiha Yaratuvchisi" : "Создатель Проекта"}
                  </p>
                  <h4 className="text-lg font-black text-slate-900 dark:text-white">Toshov Ozodbek</h4>
                </div>
              </div>
              
              <div className="grid grid-cols-2 gap-6">
                <div>
                  <h4 className="text-4xl font-black text-brand-primary dark:text-blue-400 mb-1">300+</h4>
                  <p className="text-xs font-bold text-slate-400 uppercase tracking-widest">
                    {language === "uz" ? "Maktab Darsliklari" : "Учебных пособий"}
                  </p>
                </div>
                <div>
                  <h4 className="text-4xl font-black text-brand-primary dark:text-blue-400 mb-1">24/7</h4>
                  <p className="text-xs font-bold text-slate-400 uppercase tracking-widest">
                    {language === "uz" ? "Ochiq Kirish" : "Доступ онлайн"}
                  </p>
                </div>
              </div>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 1 }}
              className="relative"
            >
              <div className="aspect-square rounded-[3.5rem] bg-gradient-to-br from-slate-900 via-blue-950 to-slate-900 p-8 sm:p-12 text-white flex flex-col justify-between shadow-2xl border border-slate-800 relative overflow-hidden">
                <div className="absolute top-0 right-0 w-64 h-64 bg-brand-primary/20 blur-[90px] rounded-full"></div>
                <div className="flex items-center justify-between relative z-10">
                  <div className="w-14 h-14 rounded-2xl overflow-hidden border border-white/20 shadow-xl bg-slate-900">
                    <img 
                      src="/logo.jpg" 
                      alt="Audio Darsliklar 2026 Logo" 
                      className="w-full h-full object-cover" 
                      referrerPolicy="no-referrer" 
                    />
                  </div>
                  <span className="px-3.5 py-1.5 rounded-full bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 text-xs font-black uppercase tracking-wider">
                    {language === "uz" ? "Tasdiqlangan Ta'lim" : "Проверено"}
                  </span>
                </div>

                <div className="relative z-10 my-auto py-8">
                  <p className="text-xs font-black uppercase tracking-widest text-slate-400 mb-2">
                    {language === "uz" ? "Platforma missiyasi" : "Миссия платформы"}
                  </p>
                  <h3 className="text-3xl sm:text-4xl font-serif font-black text-white leading-tight">
                    {language === "uz" 
                      ? "O'zbekiston yoshlari uchun sifatli va ochiq ta'lim" 
                      : "Качественное и открытое образование для молодежи"}
                  </h3>
                </div>

                <div className="grid grid-cols-2 gap-4 relative z-10 pt-4 border-t border-white/10">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl bg-brand-primary/30 flex items-center justify-center text-blue-300 shrink-0">
                      <Headphones size={20} />
                    </div>
                    <div>
                      <p className="text-xs text-slate-400 font-bold">{language === "uz" ? "Audio Darslar" : "Аудиоуроки"}</p>
                      <p className="text-sm font-black text-white">100% TTS</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl bg-amber-500/20 flex items-center justify-center text-amber-300 shrink-0">
                      <GraduationCap size={20} />
                    </div>
                    <div>
                      <p className="text-xs text-slate-400 font-bold">{language === "uz" ? "Qamrov" : "Охват"}</p>
                      <p className="text-sm font-black text-white">1–11 Sinf</p>
                    </div>
                  </div>
                </div>
              </div>
            </motion.div>
          </div>
        </div>
      </section>

      <section className="py-32 bg-slate-50 dark:bg-slate-950 transition-colors">
        <div className="container mx-auto px-6">
          <div className="text-center mb-20">
            <h2 className="text-4xl font-serif font-black text-slate-900 dark:text-white mb-4">
              {language === "uz" ? "Qadriyatlarimiz" : "Наши ценности"}
            </h2>
            <div className="w-20 h-1.5 bg-brand-primary mx-auto"></div>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-10">
            {currentValues.map((stat, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.1 }}
                className="p-12 rounded-[3.5rem] bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 flex flex-col items-center text-center group hover:border-brand-primary/20 dark:hover:border-brand-primary/40 hover:shadow-2xl transition-all duration-500"
              >
                <div className={`w-20 h-20 ${stat.bg} ${stat.color} rounded-3xl flex items-center justify-center mb-8 group-hover:rotate-12 transition-all duration-500 shadow-sm`}>
                  <stat.icon size={36} />
                </div>
                <h3 className="text-2xl font-bold text-slate-900 dark:text-white mb-4">{stat.title}</h3>
                <p className="text-slate-500 dark:text-slate-300 font-medium leading-relaxed">{stat.desc}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      <section className="py-32 relative overflow-hidden">
        <div className="absolute inset-0 bg-brand-primary animate-gradient"></div>
        <div className="container mx-auto px-6 relative z-10 text-center text-white">
          <h2 className="text-5xl font-serif font-black mb-8">
            {language === "uz" ? "Loyihani qo'llab-quvvatlang" : "Поддержите проект"}
          </h2>
          <p className="text-xl text-white/80 max-w-2xl mx-auto mb-12 font-medium">
            {language === "uz" ? (
              "Agar sizda foydali darsliklar yoki takliflar bo'lsa, biz bilan bog'laning. Birgalikda ta'lim sifatini oshiramiz!"
            ) : (
              "Если у вас есть полезные учебные материалы или предложения, свяжитесь с нами. Вместе мы делаем образование лучше!"
            )}
          </p>
          <Link 
            to="/contact" 
            className="inline-flex items-center gap-4 px-12 py-6 bg-white text-brand-primary rounded-3xl font-black text-xl hover:shadow-2xl hover:-translate-y-1 transition-all group"
          >
            <span>{language === "uz" ? "Bog'lanish sahifasi" : "Страница контактов"}</span>
            <ArrowRight size={24} />
          </Link>
        </div>
      </section>
    </div>
  );
}
