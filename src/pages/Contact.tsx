/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { motion } from "motion/react";
import { MessageCircle } from "lucide-react";
import { SOCIAL_LINKS } from "../constants";
import { useLanguage } from "../context/LanguageContext";
import AnimatedSocialIcon, { SocialIconType } from "../components/AnimatedSocialIcon";
import AnimatedSocialButton from "../components/AnimatedSocialButton";

export default function Contact() {
  const { language } = useLanguage();

  const contactInfo: Array<{
    type?: SocialIconType;
    icon?: any;
    label: string;
    value: string;
    href: string;
  }> = [
    { 
      type: "email", 
      label: language === "uz" ? "Elektron pochta" : "Электронная почта", 
      value: SOCIAL_LINKS.email, 
      href: `mailto:${SOCIAL_LINKS.email}` 
    },
    { 
      type: "telegram", 
      label: "Telegram Kanal", 
      value: "@audiodarsliklar2026", 
      href: SOCIAL_LINKS.telegram 
    },
    { 
      type: "youtube", 
      label: "YouTube Kanal", 
      value: "@audiodarsliklar2026", 
      href: SOCIAL_LINKS.youtube 
    },
    { 
      type: "instagram", 
      label: "Instagram", 
      value: "@ozodbek_toshov_", 
      href: SOCIAL_LINKS.instagram 
    },
    { 
      icon: MessageCircle, 
      label: "TikTok", 
      value: "@ozodbek.toshov_uz", 
      href: SOCIAL_LINKS.tiktok 
    },
  ];

  return (
    <div className="pt-20">
      <section className="py-24 bg-slate-50 dark:bg-slate-950 min-h-screen relative overflow-hidden transition-colors">
        {/* Background Patterns */}
        <div className="absolute inset-0 bg-dot-pattern opacity-5"></div>
        <div className="absolute -top-48 -left-48 w-[600px] h-[600px] bg-brand-primary/5 rounded-full blur-[120px]"></div>
        
        <div className="container mx-auto px-6 relative z-10">
          <div className="max-w-6xl mx-auto">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-20">
              {/* Text Part */}
              <motion.div
                initial={{ opacity: 0, x: -30 }}
                animate={{ opacity: 1, x: 0 }}
              >
                <div className="inline-flex items-center gap-2 px-4 py-2 bg-brand-primary/5 dark:bg-brand-primary/25 rounded-full text-brand-primary dark:text-blue-300 font-black text-xs uppercase tracking-widest mb-8">
                  {language === "uz" ? "Bog'lanish" : "Контакты"}
                </div>
                <h1 className="text-5xl md:text-7xl font-serif font-black text-slate-900 dark:text-white mb-8 leading-tight">
                  {language === "uz" ? (
                    <>Savollaringiz bormi? <span className="text-brand-primary dark:text-blue-400">Yozing</span>.</>
                  ) : (
                    <>Есть вопросы? <span className="text-brand-primary dark:text-blue-400">Напишите нам</span>.</>
                  )}
                </h1>
                <p className="text-xl text-slate-500 dark:text-slate-300 font-medium mb-12 leading-relaxed">
                  {language === "uz" ? (
                    "Loyiha haqida takliflar, hamkorlik yoki darsliklar bo'yicha murojaatlaringiz bo'lsa, quyidagi rasmiy manzillar orqali bog'lanishingiz mumkin."
                  ) : (
                    "Если у вас есть предложения по проекту, сотрудничеству или учебным материалам, свяжитесь с нами по официальным контактам ниже."
                  )}
                </p>

                <div className="space-y-6">
                  {contactInfo.map((item, i) => (
                    <a 
                      key={i} 
                      href={item.href}
                      target="_blank"
                      rel="noreferrer"
                      className="flex items-start gap-6 p-6 bg-white dark:bg-slate-900 rounded-3xl border border-slate-100 dark:border-slate-800 hover:border-brand-primary/30 dark:hover:border-brand-primary/50 hover:shadow-xl transition-all group"
                    >
                      <div className="w-14 h-14 bg-slate-50 dark:bg-slate-800 rounded-2xl flex items-center justify-center p-2.5 group-hover:scale-105 transition-all shrink-0">
                        {item.type ? (
                          <AnimatedSocialIcon
                            type={item.type}
                            size={30}
                          />
                        ) : (
                          <item.icon size={26} className="text-brand-primary dark:text-blue-400 group-hover:text-white" />
                        )}
                      </div>
                      <div className="min-w-0">
                        <p className="text-xs font-black uppercase tracking-widest text-slate-400 dark:text-slate-400 mb-1">{item.label}</p>
                        <p className="text-lg md:text-xl font-bold text-slate-900 dark:text-white truncate">{item.value}</p>
                      </div>
                    </a>
                  ))}
                </div>
              </motion.div>

              {/* Author Card Part */}
              <motion.div
                initial={{ opacity: 0, x: 30 }}
                animate={{ opacity: 1, x: 0 }}
                className="relative"
              >
                <div className="bg-brand-primary rounded-[3rem] p-12 text-white relative z-10 shadow-2xl overflow-hidden min-h-[420px] flex flex-col justify-end">
                  <div className="absolute top-0 right-0 w-64 h-64 bg-white/10 blur-[80px] rounded-full -translate-y-1/2 translate-x-1/2"></div>
                  <div className="mb-auto">
                    <span className="px-3 py-1 bg-white/20 rounded-full text-xs font-black uppercase tracking-wider">
                      {language === "uz" ? "Loyiha Yaratuvchisi" : "Создатель проекта"}
                    </span>
                  </div>
                  <h2 className="text-4xl font-serif font-black mb-4">Toshov Ozodbek</h2>
                  <p className="text-white/80 mb-8 text-lg font-medium leading-relaxed">
                    {language === "uz" ? (
                      "Loyiha asoschisi. O'zbekiston ta'lim tizimini raqamlashtirish va har bir o'quvchiga darsliklarni bepul yetkazish bosh maqsadimizdir."
                    ) : (
                      "Основатель проекта. Цифровизация школьного образования Узбекистана и бесплатный доступ к учебникам для каждого ученика — наша главная цель."
                    )}
                  </p>
                  
                  <div className="flex flex-wrap items-center gap-3 pt-4 border-t border-white/15">
                    <span className="px-3.5 py-1.5 rounded-xl bg-white/15 text-white text-xs font-bold">
                      {language === "uz" ? "Toshkent, O'zbekiston" : "Ташкент, Узбекистан"}
                    </span>
                    <span className="px-3.5 py-1.5 rounded-xl bg-white/15 text-white text-xs font-bold">
                      {language === "uz" ? "Ta'lim Tashabbusi" : "Образовательная инициатива"}
                    </span>
                  </div>
                </div>
                <div className="absolute -bottom-10 -right-10 w-full h-full border-4 border-slate-200 dark:border-slate-800 rounded-[3rem] -z-10"></div>
              </motion.div>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
