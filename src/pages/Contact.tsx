/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { motion } from "motion/react";
import { Send, Mail, MapPin, Youtube, Instagram, MessageCircle, Phone } from "lucide-react";
import { SOCIAL_LINKS } from "../constants";

export default function Contact() {
  const contactInfo = [
    { icon: Mail, label: "Email", value: SOCIAL_LINKS.email, href: `mailto:${SOCIAL_LINKS.email}` },
    { icon: Send, label: "Telegram", value: "@Audio_Darsliklar_2026", href: SOCIAL_LINKS.telegram },
    { icon: Youtube, label: "YouTube", value: "@audiodarsliklar2025", href: SOCIAL_LINKS.youtube },
  ];

  return (
    <div className="pt-20">
      <section className="py-24 bg-slate-50 min-h-screen">
        <div className="container mx-auto px-6">
          <div className="max-w-6xl mx-auto">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-20">
              {/* Text Part */}
              <motion.div
                initial={{ opacity: 0, x: -30 }}
                animate={{ opacity: 1, x: 0 }}
              >
                <div className="inline-flex items-center gap-2 px-4 py-2 bg-brand-primary/5 rounded-full text-brand-primary font-black text-xs uppercase tracking-widest mb-8">
                  Bog'lanish
                </div>
                <h1 className="text-5xl md:text-7xl font-serif font-black text-slate-900 mb-8 leading-tight">
                  Savollaringiz bormi? <span className="text-brand-primary">Yozing</span>.
                </h1>
                <p className="text-xl text-slate-500 font-medium mb-12 leading-relaxed">
                  Loyiha haqida takliflar, hamkorlik yoki darsliklar bo'yicha murojaatlaringiz bo'lsa, pastdagi manzillar orqali bog'lanishingiz mumkin.
                </p>

                <div className="space-y-8">
                  {contactInfo.map((item, i) => (
                    <a 
                      key={i} 
                      href={item.href}
                      target="_blank"
                      rel="noreferrer"
                      className="flex items-start gap-6 p-6 bg-white rounded-3xl border border-slate-100 hover:border-brand-primary/30 hover:shadow-xl transition-all group"
                    >
                      <div className="w-14 h-14 bg-slate-50 rounded-2xl flex items-center justify-center text-brand-primary group-hover:bg-brand-primary group-hover:text-white transition-all">
                        <item.icon size={28} />
                      </div>
                      <div>
                        <p className="text-xs font-black uppercase tracking-widest text-slate-400 mb-1">{item.label}</p>
                        <p className="text-xl font-bold text-slate-900">{item.value}</p>
                      </div>
                    </a>
                  ))}
                </div>
              </motion.div>

              {/* Decorative Part */}
              <motion.div
                initial={{ opacity: 0, x: 30 }}
                animate={{ opacity: 1, x: 0 }}
                className="relative"
              >
                <div className="bg-brand-primary rounded-[3rem] p-12 text-white relative z-10 shadow-2xl overflow-hidden min-h-[400px] flex flex-col justify-end">
                  <div className="absolute top-0 right-0 w-64 h-64 bg-white/10 blur-[80px] rounded-full -translate-y-1/2 translate-x-1/2"></div>
                  <h2 className="text-4xl font-serif font-black mb-6">Toshov Ozodbek</h2>
                  <p className="text-brand-secondary-foreground overflow-hidden h-14 mb-8 text-xl font-medium">Loyiha asoschisi va dasturchi. Ta'lim tizimini raqamlashtirishni maqsad qilganmiz.</p>
                  
                  <div className="flex gap-4">
                    {[Instagram, MessageCircle].map((Icon, i) => (
                      <div key={i} className="w-12 h-12 bg-white/20 rounded-xl flex items-center justify-center">
                        <Icon size={24} />
                      </div>
                    ))}
                  </div>
                </div>
                <div className="absolute -bottom-10 -right-10 w-full h-full border-4 border-slate-200 rounded-[3rem] -z-10"></div>
              </motion.div>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
