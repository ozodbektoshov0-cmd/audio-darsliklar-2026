/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { motion } from "motion/react";
import { Headphones, Book, Gift, Smartphone, ShieldCheck, Zap } from "lucide-react";

const ICON_MAP = {
  headphones: Headphones,
  book: Book,
  gift: Gift,
  smartphone: Smartphone,
  shieldCheck: ShieldCheck,
  zap: Zap,
};

import { FEATURES } from "../constants";

export default function Features() {
  return (
    <section id="xususiyatlar" className="py-32 bg-white">
      <div className="container mx-auto px-4">
        <div className="flex flex-col items-center text-center mb-20">
          <motion.h2 
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-4xl md:text-5xl font-serif font-black text-slate-900 mb-6 tracking-tight"
          >
            Nima uchun <span className="text-brand-primary">Audio Darsliklar</span>?
          </motion.h2>
          <div className="w-20 h-1.5 bg-brand-primary"></div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-10">
          {FEATURES.map((feature, idx) => {
            const Icon = ICON_MAP[feature.icon as keyof typeof ICON_MAP];
            return (
              <motion.div
                key={feature.title}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: idx * 0.1, duration: 0.6 }}
                className="group relative p-10 rounded-[2.5rem] bg-slate-50 border border-slate-100 hover:bg-white hover:border-brand-primary/10 hover:shadow-2xl transition-all duration-500"
              >
                <div className="w-16 h-16 bg-white rounded-2xl flex items-center justify-center mb-8 text-brand-primary shadow-sm group-hover:bg-brand-primary group-hover:text-white group-hover:rotate-6 transition-all duration-500">
                  <Icon size={32} />
                </div>
                <h3 className="text-2xl font-bold text-slate-900 mb-4 group-hover:text-brand-primary transition-colors">{feature.title}</h3>
                <p className="text-slate-500 leading-relaxed font-medium">{feature.desc}</p>
                
                <div className="absolute bottom-8 right-8 text-slate-100 group-hover:text-brand-primary/10 transition-colors">
                  <Icon size={80} strokeWidth={1} />
                </div>
              </motion.div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
