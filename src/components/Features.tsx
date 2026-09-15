/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { motion } from "motion/react";
import { Headphones, Book, Gift, Smartphone, ShieldCheck, Zap } from "lucide-react";
import { FEATURES } from "../constants";
import { useLanguage } from "../context/LanguageContext";

const ICON_MAP = {
  headphones: Headphones,
  book: Book,
  gift: Gift,
  smartphone: Smartphone,
  shieldCheck: ShieldCheck,
  zap: Zap,
};

const FEATURES_RU = [
  {
    title: "100% Бесплатно",
    desc: "Платформа создана для бесплатного доступа каждого школьника к качественным учебным материалам без ограничений.",
    icon: "gift",
  },
  {
    title: "Качественное Аудио (TTS)",
    desc: "Аудиозаписи созданы с помощью современных голосовых технологий (TTS) и доступны в виде плейлистов на YouTube.",
    icon: "headphones",
  },
  {
    title: "Учебники 1–11 классов",
    desc: "Официальные версии школьных учебников, рабочих тетрадей и методических пособий в удобном формате PDF.",
    icon: "book",
  },
  {
    title: "Для мобильных устройств",
    desc: "Удобно учиться и слушать уроки прямо с вашего смартфона, планшета или компьютера в любом месте.",
    icon: "smartphone",
  },
  {
    title: "Официальная программа",
    desc: "Все учебники строго соответствуют утвержденным программам Министерства дошкольного и школьного образования.",
    icon: "shieldCheck",
  },
  {
    title: "Быстро и без регистрации",
    desc: "Мгновенное скачивание файлов и прослушивание аудио без заполнения форм и регистрации.",
    icon: "zap",
  },
];

export default function Features() {
  const { language } = useLanguage();
  const featuresList = language === "uz" ? FEATURES : FEATURES_RU;

  return (
    <section id="xususiyatlar" className="py-32 bg-white dark:bg-slate-900 relative overflow-hidden transition-colors">
      {/* Background patterns */}
      <div className="absolute top-0 left-0 w-full h-full bg-dot-pattern opacity-5 -z-10"></div>
      <div className="absolute -top-24 -right-24 w-96 h-96 bg-brand-primary/5 rounded-full blur-3xl"></div>

      <div className="container mx-auto px-6">
        <div className="flex flex-col items-center text-center mb-20">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="inline-block px-4 py-1.5 bg-brand-primary/10 dark:bg-brand-primary/25 rounded-full text-brand-primary dark:text-blue-300 text-xs font-black uppercase tracking-[0.2em] mb-6"
          >
            {language === "uz" ? "Imkoniyatlarimiz" : "Наши возможности"}
          </motion.div>
          <motion.h2 
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-4xl md:text-6xl font-serif font-black text-slate-900 dark:text-white mb-6 tracking-tight"
          >
            {language === "uz" ? (
              <>Nima uchun <span className="text-brand-primary dark:text-blue-400">Audio Darsliklar</span>?</>
            ) : (
              <>Почему <span className="text-brand-primary dark:text-blue-400">Аудио Учебники</span>?</>
            )}
          </motion.h2>
          <div className="w-20 h-1.5 bg-brand-primary"></div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-10">
          {featuresList.map((feature, idx) => {
            const Icon = ICON_MAP[feature.icon as keyof typeof ICON_MAP];
            return (
              <motion.div
                key={feature.title}
                initial={{ opacity: 0, scale: 0.9 }}
                whileInView={{ opacity: 1, scale: 1 }}
                viewport={{ once: true }}
                transition={{ delay: idx * 0.1, duration: 0.6 }}
                className="group relative p-12 rounded-[3.5rem] bg-slate-50 dark:bg-slate-800/70 border border-slate-100 dark:border-slate-700/60 hover:bg-white dark:hover:bg-slate-800 hover:border-brand-primary/20 dark:hover:border-brand-primary/40 hover:shadow-[0_40px_80px_-15px_rgba(30,64,175,0.1)] transition-all duration-700"
              >
                <div className="w-20 h-20 bg-white dark:bg-slate-900 rounded-3xl flex items-center justify-center mb-10 text-brand-primary dark:text-blue-400 shadow-xl shadow-brand-primary/5 group-hover:bg-brand-primary group-hover:text-white group-hover:rotate-12 transition-all duration-700">
                  <Icon size={36} />
                </div>
                <h3 className="text-2xl font-black text-slate-900 dark:text-white mb-4 transition-colors">{feature.title}</h3>
                <p className="text-slate-500 dark:text-slate-300 leading-relaxed font-medium">{feature.desc}</p>
                
                <div className="absolute bottom-10 right-10 text-slate-100 dark:text-slate-800/40 group-hover:text-brand-primary/5 transition-colors duration-700">
                  <Icon size={120} strokeWidth={1} />
                </div>
              </motion.div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
