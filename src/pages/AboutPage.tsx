/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import Features from "../components/Features";
import { motion } from "motion/react";
import { Heart, Shield, Zap, Star } from "lucide-react";

export default function AboutPage() {
  return (
    <div className="pt-20">
      <section className="py-24 bg-white overflow-hidden">
        <div className="container mx-auto px-6">
          <div className="max-w-4xl mx-auto text-center mb-20">
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              className="inline-flex items-center gap-2 px-4 py-2 bg-brand-primary/5 rounded-full text-brand-primary font-black text-xs uppercase tracking-widest mb-8"
            >
              <Star size={14} />
              Bizning missiyamiz
            </motion.div>
            <h1 className="text-5xl md:text-7xl font-serif font-black text-slate-900 mb-8 tracking-tight">
              Ta'limni hamma uchun <span className="text-brand-primary">ochiq</span> qilamiz.
            </h1>
            <p className="text-xl text-slate-500 font-medium leading-relaxed">
              Audio Darsliklar 2026 loyihasi O'zbekistonning barcha o'quvchilari uchun adabiyot fanidan sifatli o'quv materiallarini oson va qulay formatda taqdim etishni maqsad qilgan.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {[
              { icon: Heart, title: "Beg'araz yordam", desc: "Resurslarimiz 100% bepul.", color: "text-red-500", bg: "bg-red-50" },
              { icon: Shield, title: "Xavfsizlik", desc: "Faqat tasdiqlangan rasmiy manbalar.", color: "text-blue-500", bg: "bg-blue-50" },
              { icon: Zap, title: "Tezkorlik", desc: "Fayllar maksimal darajada optimallangan.", color: "text-yellow-500", bg: "bg-yellow-50" },
            ].map((stat, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.1 }}
                className="p-10 rounded-[3rem] bg-slate-50 border border-slate-100 flex flex-col items-center text-center group hover:bg-white hover:shadow-2xl transition-all duration-500"
              >
                <div className={`w-16 h-16 ${stat.bg} ${stat.color} rounded-2xl flex items-center justify-center mb-6 group-hover:rotate-12 transition-transform`}>
                  <stat.icon size={32} />
                </div>
                <h3 className="text-2xl font-bold text-slate-900 mb-4">{stat.title}</h3>
                <p className="text-slate-500 font-medium">{stat.desc}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      <Features />

      <section className="py-24 bg-slate-900 text-white text-center">
        <div className="container mx-auto px-6">
          <h2 className="text-4xl font-serif font-black mb-8">Loyihani qo'llab-quvvatlang</h2>
          <p className="text-xl text-slate-400 max-w-2xl mx-auto mb-12">
            Agar sizda foydali darsliklar yoki takliflar bo'lsa, biz bilan bog'laning. Birgalikda ta'lim sifatini oshiramiz!
          </p>
          <a href="https://t.me/Audio_Darsliklar_2026" className="inline-flex items-center gap-3 px-10 py-5 bg-brand-primary rounded-2xl font-black text-xl hover:shadow-2xl transition-all">
            Telegram orqali bog'lanish
          </a>
        </div>
      </section>
    </div>
  );
}
