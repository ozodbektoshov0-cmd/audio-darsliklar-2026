/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import TextbookSection from "../components/TextbookSection";
import { motion } from "motion/react";
import { BookOpen, Search } from "lucide-react";

export default function Library() {
  return (
    <div className="pt-20">
      <section className="bg-slate-900 py-24 relative overflow-hidden">
        <div className="absolute top-0 right-0 w-1/3 h-full bg-brand-primary/20 blur-[120px] rounded-full"></div>
        <div className="container mx-auto px-6 relative z-10">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="max-w-3xl"
          >
            <div className="flex items-center gap-3 text-brand-secondary font-black uppercase tracking-[0.3em] text-xs mb-4">
              <BookOpen size={16} />
                Elektron Kutubxona
            </div>
            <h1 className="text-5xl md:text-7xl font-serif font-black text-white mb-8 leading-tight tracking-tight">
              Barcha darsliklar bir <span className="text-brand-primary">joyda</span>.
            </h1>
            <p className="text-xl text-slate-400 font-medium leading-relaxed">
              5-sinfdan 11-sinfgacha bo'lgan barcha adabiyot darsliklarining PDF va audio versiyalarini yuklab oling yoki onlayn tinglang.
            </p>
          </motion.div>
        </div>
      </section>
      <TextbookSection />
    </div>
  );
}
