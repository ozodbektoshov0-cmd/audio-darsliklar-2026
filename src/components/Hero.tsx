/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { motion } from "motion/react";
import { Headphones, CheckCircle2, Sparkles, BookOpen, Bot } from "lucide-react";
import { useNavigate, Link } from "react-router-dom";
import { useLanguage } from "../context/LanguageContext";
import RadialRevealButton from "./RadialRevealButton";

export default function Hero() {
  const { t, language } = useLanguage();
  const navigate = useNavigate();

  const handleBrowseTextbooks = (e?: React.MouseEvent) => {
    if (e) e.preventDefault();
    navigate("/library");
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const badges = language === "uz" ? [
    "Maktab Dasturi",
    "Onlayn va Oflayn",
    "Qulay Foydalanish",
  ] : [
    "Школьная программа",
    "Онлайн и офлайн",
    "Удобно и просто",
  ];

  return (
    <section id="asosiy" className="relative min-h-screen flex flex-col justify-center pt-24 pb-20 overflow-hidden bg-mesh">
      {/* Background Decorative Elements */}
      <div className="absolute inset-0 bg-dot-pattern opacity-[0.4] -z-10"></div>
      
      {/* Floating Animated Shapes */}
      <motion.div 
        animate={{ 
          y: [0, -20, 0],
          rotate: [0, 5, 0]
        }}
        transition={{ duration: 6, repeat: Infinity, ease: "easeInOut" }}
        className="absolute top-1/4 right-[10%] w-24 h-24 bg-brand-primary/10 rounded-3xl blur-sm hidden lg:block"
      />
      <motion.div 
        animate={{ 
          y: [0, 20, 0],
          rotate: [0, -5, 0]
        }}
        transition={{ duration: 8, repeat: Infinity, ease: "easeInOut", delay: 1 }}
        className="absolute bottom-1/4 left-[5%] w-32 h-32 bg-brand-secondary/10 rounded-full blur-sm hidden lg:block"
      />

      <div className="container mx-auto px-6">
        <div className="max-w-4xl mx-auto flex flex-col items-center text-center">
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            className="flex items-center gap-2 px-4 py-2 bg-white dark:bg-slate-800 shadow-xl shadow-brand-primary/5 border border-brand-primary/10 dark:border-brand-primary/20 rounded-full text-brand-primary dark:text-blue-300 font-bold text-sm mb-8"
          >
            <Sparkles size={16} />
            <span>{t("heroBadge")}</span>
          </motion.div>

          <motion.h1 
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1, duration: 0.8 }}
            className="text-5xl md:text-7xl xl:text-8xl font-serif font-black text-slate-900 dark:text-white leading-[1.1] mb-8 tracking-tight"
          >
            Audio <span className="text-transparent bg-clip-text bg-gradient-to-r from-brand-primary via-blue-600 to-brand-secondary animate-gradient">Darsliklar</span> 2026
          </motion.h1>

          <motion.p 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2, duration: 0.8 }}
            className="text-lg md:text-xl text-slate-600 dark:text-slate-300 mb-10 leading-relaxed max-w-2xl font-medium"
          >
            {t("heroSubtitle")}
          </motion.p>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-5 mb-10 w-full sm:w-auto">
            <RadialRevealButton
              label={t("heroCtaBrowse")}
              onClick={handleBrowseTextbooks}
              addIcon={true}
              icon={{
                type: "symbol",
                symbol: "🎧",
                size: 20,
                side: "right",
                color: "#FFFFFF",
                hoverColor: "#FFFFFF",
              }}
              colors={{
                fill: "#0052FF",
                hoverFill: "#003bb5",
                textColor: "#FFFFFF",
                hoverTextColor: "#FFFFFF",
              }}
              font={{
                fontWeight: 700,
                fontSize: 18,
              }}
              padding="18px 36px"
              rounded={20}
              className="w-full sm:w-auto shadow-xl shadow-brand-primary/30 hover:shadow-2xl hover:shadow-brand-primary/45 hover:-translate-y-0.5 transition-all"
              id="hero-browse-textbooks-btn"
            />
            <Link 
              to="/ai-tutor" 
              className="w-full sm:w-auto flex items-center justify-center gap-3 px-8 py-4 bg-white dark:bg-slate-800 text-slate-900 dark:text-white border-2 border-slate-200/80 dark:border-slate-700 rounded-2xl font-bold text-lg hover:border-brand-primary/40 hover:bg-slate-50 dark:hover:bg-slate-700/60 transition-all focus:ring-4 focus:ring-brand-primary/10 outline-none group shadow-xs"
              id="hero-ai-tutor-btn"
            >
              <Bot size={22} className="text-brand-primary dark:text-blue-400 group-hover:scale-110 transition-transform" />
              <span>{language === "uz" ? "AI Ustoz" : "AI Репетитор"}</span>
            </Link>
          </div>

          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.4 }}
            className="flex flex-wrap justify-center gap-3 mb-10"
          >
            {badges.map((badge, idx) => (
              <div key={idx} className="flex items-center gap-2 px-4 py-2 bg-white dark:bg-slate-800 shadow-sm border border-slate-100 dark:border-slate-700 rounded-full text-slate-600 dark:text-slate-300 text-xs font-black uppercase tracking-widest">
                <CheckCircle2 size={13} className="text-brand-primary dark:text-blue-400" />
                {badge}
              </div>
            ))}
          </motion.div>

          {/* Sleek Stats Strip */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.5 }}
            className="grid grid-cols-2 sm:grid-cols-3 gap-4 sm:gap-8 p-6 rounded-3xl bg-white/80 dark:bg-slate-800/80 backdrop-blur-md border border-slate-100 dark:border-slate-700/60 shadow-lg shadow-brand-primary/5 max-w-2xl w-full"
          >
            <div className="text-center">
              <p className="text-2xl sm:text-3xl font-black text-brand-primary dark:text-blue-400">300+</p>
              <p className="text-xs font-bold text-slate-500 dark:text-slate-400 mt-1">{t("heroStatBooks")}</p>
            </div>
            <div className="text-center border-x border-slate-100 dark:border-slate-700/60 px-2">
              <p className="text-2xl sm:text-3xl font-black text-slate-900 dark:text-white">1 - 11</p>
              <p className="text-xs font-bold text-slate-500 dark:text-slate-400 mt-1">
                {language === "uz" ? "Sinflar Darsliklari" : "Классы школы"}
              </p>
            </div>
            <div className="col-span-2 sm:col-span-1 text-center">
              <p className="text-2xl sm:text-3xl font-black text-emerald-500">100%</p>
              <p className="text-xs font-bold text-slate-500 dark:text-slate-400 mt-1">
                {language === "uz" ? "Bepul & Onlayn" : "Бесплатно"}
              </p>
            </div>
          </motion.div>
        </div>
      </div>
    </section>
  );
}
