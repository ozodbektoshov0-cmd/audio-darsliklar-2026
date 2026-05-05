/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { motion } from "motion/react";
import { Headphones, Send, CheckCircle2, Sparkles, GraduationCap, BookOpen, Music, Heart } from "lucide-react";
import { STATS } from "../constants";

const STAT_ICONS = {
  graduation: GraduationCap,
  bookOpen: BookOpen,
  music: Music,
  heart: Heart,
};

export default function Hero() {
  const badges = [
    "100% Bepul",
    "Yuqori Sifatli Audio",
    "Rasmiy Darsliklar",
  ];

  return (
    <section id="asosiy" className="relative min-h-screen flex flex-col justify-center pt-24 pb-20 overflow-hidden">
      {/* Background Decorative Elements */}
      <div className="absolute top-1/4 -left-20 w-96 h-96 bg-brand-primary/5 rounded-full blur-3xl -z-10 animate-pulse"></div>
      <div className="absolute bottom-1/4 -right-20 w-80 h-80 bg-brand-secondary/5 rounded-full blur-3xl -z-10 animate-pulse" style={{ animationDelay: '1s' }}></div>

      <div className="container mx-auto px-4">
        <div className="flex flex-col items-center text-center max-w-4xl mx-auto mb-20">
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            className="flex items-center gap-2 px-4 py-2 bg-brand-primary/5 border border-brand-primary/10 rounded-full text-brand-primary font-bold text-sm mb-8"
          >
            <Sparkles size={16} />
            <span>Bilim — kelajak poydevori!</span>
          </motion.div>

          <motion.h1 
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1, duration: 0.8 }}
            className="text-5xl md:text-8xl font-serif font-black text-slate-900 leading-[1.1] mb-8 tracking-tight"
          >
            Audio <span className="text-transparent bg-clip-text bg-gradient-to-r from-brand-primary to-brand-secondary">Darsliklar</span> 2026
          </motion.h1>

          <motion.p 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2, duration: 0.8 }}
            className="text-lg md:text-xl text-slate-600 mb-10 leading-relaxed max-w-2xl font-medium"
          >
            O‘zbek adabiyoti darsliklarining eng sifatli audio va PDF versiyalari. 
            Innovatsion ta'lim resurslari bilan bilimlaringizni boyiting.
          </motion.p>

          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3, duration: 0.8 }}
            className="flex flex-wrap justify-center gap-3 mb-10"
          >
            {badges.map((badge, idx) => (
              <div key={idx} className="flex items-center gap-2 px-4 py-1.5 bg-slate-50 border border-slate-200 rounded-full text-slate-700 text-sm font-semibold">
                <CheckCircle2 size={14} className="text-brand-primary" />
                {badge}
              </div>
            ))}
          </motion.div>

          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4, duration: 0.8 }}
            className="flex flex-col sm:flex-row items-center gap-5"
          >
            <a 
              href="#darsliklar" 
              className="flex items-center gap-3 px-10 py-5 bg-brand-primary text-white rounded-2xl font-bold text-lg hover:shadow-2xl hover:shadow-brand-primary/40 hover:-translate-y-1 transition-all group"
            >
              Darsliklarni Ko'rish
              <Headphones size={22} className="group-hover:rotate-12 transition-transform" />
            </a>
            <a 
              href="https://t.me/Audio_Darsliklar_2026" 
              target="_blank" 
              rel="noreferrer"
              className="flex items-center gap-3 px-10 py-5 bg-white text-slate-900 border-2 border-slate-100 rounded-2xl font-bold text-lg hover:border-brand-primary/20 hover:bg-slate-50 transition-all focus:ring-4 focus:ring-brand-primary/10 outline-none"
            >
              Telegram Kanal
              <Send size={22} className="text-brand-primary" />
            </a>
          </motion.div>
        </div>

        {/* Stats Section */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 md:gap-8 max-w-5xl mx-auto">
          {STATS.map((stat, idx) => {
            const Icon = STAT_ICONS[stat.icon as keyof typeof STAT_ICONS];
            return (
              <motion.div
                key={idx}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: 0.5 + idx * 0.1 }}
                className="bg-white p-6 rounded-3xl border border-slate-100 shadow-sm text-center group hover:border-brand-primary/50 transition-colors"
              >
                <div className="w-12 h-12 bg-slate-50 rounded-2xl flex items-center justify-center mx-auto mb-4 text-brand-primary group-hover:bg-brand-primary group-hover:text-white transition-all">
                  <Icon size={24} />
                </div>
                <div className="text-2xl font-black text-slate-900 mb-1">{stat.value}</div>
                <div className="text-sm font-medium text-slate-500 uppercase tracking-wider">{stat.label}</div>
              </motion.div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
