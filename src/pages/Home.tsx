/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import Hero from "../components/Hero";
import Features from "../components/Features";
import { motion } from "motion/react";
import { ArrowRight, BookOpen, Headphones } from "lucide-react";
import { Link } from "react-router-dom";

export default function Home() {
  return (
    <div className="pt-20">
      <Hero />
      
      {/* Quick CTA Section */}
      <section className="py-20 bg-brand-primary">
        <div className="container mx-auto px-6">
          <div className="flex flex-col md:flex-row items-center justify-between gap-10">
            <div className="text-white">
              <h2 className="text-4xl font-serif font-black mb-4">O'qishni hoziroq boshlang</h2>
              <p className="text-brand-secondary-foreground/80 text-lg font-medium">Barcha darsliklar sizni kutmoqda.</p>
            </div>
            <Link 
              to="/library" 
              className="px-10 py-5 bg-white text-brand-primary rounded-2xl font-black text-xl hover:shadow-2xl transition-all flex items-center gap-3"
            >
              Kutubxonaga o'tish
              <ArrowRight size={24} />
            </Link>
          </div>
        </div>
      </section>

      <Features />

      {/* Modern Education Promo */}
      <section className="py-32 bg-slate-50 overflow-hidden">
        <div className="container mx-auto px-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-20 items-center">
            <motion.div
              initial={{ opacity: 0, x: -50 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              className="relative"
            >
              <div className="absolute -top-10 -left-10 w-40 h-40 bg-brand-primary/10 rounded-full blur-3xl"></div>
              <div className="relative z-10 bg-white p-10 rounded-[3rem] shadow-2xl border border-slate-100">
                <div className="flex gap-4 mb-8">
                  <div className="w-12 h-12 bg-red-100 text-red-600 rounded-2xl flex items-center justify-center">
                    <Headphones size={24} />
                  </div>
                  <div className="w-12 h-12 bg-blue-100 text-blue-600 rounded-2xl flex items-center justify-center">
                    <BookOpen size={24} />
                  </div>
                </div>
                <h3 className="text-3xl font-serif font-black text-slate-900 mb-6">Kelajak ta'limi — biz bilan</h3>
                <p className="text-slate-600 leading-relaxed text-lg mb-8">
                  Audio darsliklar nafaqat ko'rish qobiliyati cheklanganlar uchun, balki yo'lda, sayohatda yoki boshqa yumushlar bilan band bo'lgan o'quvchilar uchun ham juda foydali resursdir.
                </p>
                <ul className="space-y-4">
                  {["Sifatli audio ovozlar", "Doimiy yangilanib boruvchi baza", "Oson va tezkor yuklab olish"].map((item, i) => (
                    <li key={i} className="flex items-center gap-3 text-slate-700 font-bold">
                      <div className="w-5 h-5 bg-green-500 rounded-full flex items-center justify-center text-white">
                        <ArrowRight size={12} />
                      </div>
                      {item}
                    </li>
                  ))}
                </ul>
              </div>
            </motion.div>
            
            <motion.div
              initial={{ opacity: 0, x: 50 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
            >
              <h2 className="text-5xl font-serif font-black text-slate-900 mb-8 leading-tight">
                Zamonaviy <span className="text-brand-primary">texnologiyalar</span> orqali bilim oling.
              </h2>
              <p className="text-xl text-slate-500 font-medium mb-10 leading-relaxed">
                Biz o'quvchilarga eng yaxshi tajribani taqdim etish uchun eng so'nggi dizayn va texnologiyalardan foydalanamiz. Audio darsliklar — bilim olishning eng qulay usuli.
              </p>
              <Link to="/about" className="text-brand-primary font-black uppercase tracking-widest flex items-center gap-3 hover:gap-5 transition-all">
                Loyiha haqida batafsil <ArrowRight size={20} />
              </Link>
            </motion.div>
          </div>
        </div>
      </section>
    </div>
  );
}
