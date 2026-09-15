/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import TextbookSection from "../components/TextbookSection";
import { motion } from "motion/react";
import { BookOpen } from "lucide-react";
import { useLanguage } from "../context/LanguageContext";

export default function Library() {
  const { language } = useLanguage();

  return (
    <div className="pt-20">
      <section className="relative py-32 bg-[#0f172a] overflow-hidden">
        {/* Sleek Gradient Canvas without any images */}
        <div className="absolute inset-0 bg-gradient-to-br from-[#0f172a] via-slate-900 to-blue-950">
          <div className="absolute inset-0 bg-dot-pattern opacity-10"></div>
          <div className="absolute -top-32 -right-32 w-96 h-96 bg-brand-primary/15 rounded-full blur-3xl"></div>
          <div className="absolute -bottom-32 -left-32 w-96 h-96 bg-blue-600/10 rounded-full blur-3xl"></div>
        </div>

        <div className="container mx-auto px-6 relative z-10">
          <motion.div
            initial={{ opacity: 0, x: -30 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.8 }}
            className="max-w-3xl"
          >
            <motion.div
              initial={{ scale: 0.8, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ delay: 0.2 }}
              className="inline-flex items-center gap-3 px-4 py-2 bg-brand-primary/20 backdrop-blur-md border border-brand-primary/30 rounded-full text-blue-300 font-black uppercase tracking-[0.3em] text-[10px] mb-8"
            >
              <BookOpen size={14} />
              {language === "uz" ? "Elektron Kutubxona" : "Электронная библиотека"}
            </motion.div>
            
            <h1 className="text-6xl md:text-8xl font-serif font-black text-white mb-8 leading-tight tracking-tight">
              {language === "uz" ? (
                <>Bilimlar <span className="text-brand-primary">Xazinasi</span>.</>
              ) : (
                <>Сокровищница <span className="text-brand-primary">Знаний</span>.</>
              )}
            </h1>
            
            <p className="text-xl text-slate-300 font-medium leading-relaxed max-w-2xl">
              {language === "uz" ? (
                "1-sinfdan 11-sinfgacha bo'lgan barcha maktab darsliklarining rasmiy PDF va audio versiyalarini bir joyda toping. Siz o'rganishingiz va yuklab olishingiz uchun barchasi qulay tartiblangan."
              ) : (
                "Найдите официальные PDF-учебники и аудиоверсии для всех предметов 1–11 классов в одном месте. Все материалы удобно структурированы для чтения и скачивания."
              )}
            </p>
          </motion.div>
        </div>

        {/* Decorative elements */}
        <div className="absolute bottom-0 left-0 w-full h-24 bg-gradient-to-t from-slate-50 dark:from-slate-950 to-transparent"></div>
      </section>
      
      <div className="bg-slate-50 dark:bg-slate-950 pt-10 transition-colors">
        <TextbookSection />
      </div>
    </div>
  );
}
