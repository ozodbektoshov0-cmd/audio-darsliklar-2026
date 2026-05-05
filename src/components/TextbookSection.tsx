/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { motion, AnimatePresence } from "motion/react";
import { useState } from "react";
import { FileText, Youtube, Search, ArrowRight, BookOpen } from "lucide-react";
import { TEXTBOOKS } from "../constants";

export default function TextbookSection() {
  const [searchTerm, setSearchTerm] = useState("");

  const filteredTextbooks = TEXTBOOKS.filter(item => 
    item.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
    item.grade.includes(searchTerm)
  );

  return (
    <section id="darsliklar" className="py-32 bg-slate-50 relative z-10">
      <div className="container mx-auto px-4">
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-8 mb-16 px-4">
          <div className="md:w-1/2">
            <motion.h2 
              initial={{ opacity: 0, x: -20 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              className="text-4xl md:text-5xl font-serif font-black text-slate-900 mb-6 tracking-tight"
            >
              Sinflar bo'yicha <span className="text-brand-primary">darsliklar</span>
            </motion.h2>
            <div className="w-20 h-1.5 bg-brand-primary"></div>
          </div>
          
          <div className="md:w-1/3 relative group">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-brand-primary transition-colors" size={20} />
            <input 
              type="text" 
              placeholder="Sinf yoki kitob nomi..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-12 pr-4 py-4 bg-white border-2 border-slate-100 rounded-2xl focus:border-brand-primary/30 outline-none transition-all font-medium text-slate-700 shadow-sm"
            />
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-10">
          <AnimatePresence mode="popLayout">
            {filteredTextbooks.map((item, idx) => (
              <motion.div
                layout
                key={item.id}
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.9 }}
                transition={{ duration: 0.3 }}
                className="group flex flex-col h-full bg-white rounded-[2.5rem] border border-slate-100 hover:border-brand-primary/20 hover:shadow-2xl hover:shadow-brand-primary/10 transition-all duration-500 overflow-hidden"
              >
                <div className="relative p-8 pb-4">
                  <div className="absolute top-8 right-8 w-12 h-12 bg-brand-primary/5 rounded-2xl flex items-center justify-center text-brand-primary font-black text-xl group-hover:bg-brand-primary group-hover:text-white transition-all duration-500">
                    {item.grade}
                  </div>
                  <h3 className="text-2xl font-serif font-bold text-slate-900 pr-12 leading-snug group-hover:text-brand-primary transition-colors">
                    {item.title}
                  </h3>
                  <p className="text-slate-400 font-bold mt-2 tracking-widest text-xs uppercase">
                    O'zbek Adabiyoti
                  </p>
                </div>

                <div className="flex-1 p-8 pt-0">
                  <div className="space-y-6">
                    {item.books.map((book, bIdx) => (
                      <div key={bIdx} className="relative">
                        <div className="flex items-center gap-3 mb-4">
                          <div className="w-1.5 h-1.5 rounded-full bg-brand-primary"></div>
                          <span className="font-bold text-sm text-slate-600 tracking-wide">{book.year}-yil darsligi</span>
                        </div>
                        <div className="flex flex-col gap-3">
                          <a
                            href={book.pdf}
                            target="_blank"
                            rel="noreferrer"
                            className="flex items-center justify-between px-6 py-4 bg-slate-50 hover:bg-brand-primary hover:text-white rounded-2xl text-sm font-bold transition-all group/btn"
                          >
                            <span className="flex items-center gap-3">
                              <FileText size={18} className="text-brand-primary group-hover/btn:text-white transition-colors" />
                              PDF Yuklab olish
                            </span>
                            <ArrowRight size={16} className="opacity-0 group-hover/btn:opacity-100 -translate-x-2 group-hover/btn:translate-x-0 transition-all" />
                          </a>
                          {book.audio && (
                            <a
                              href={book.audio}
                              target="_blank"
                              rel="noreferrer"
                              className="flex items-center justify-between px-6 py-4 bg-red-50 hover:bg-red-600 hover:text-white rounded-2xl text-sm font-bold transition-all group/btn"
                            >
                              <span className="flex items-center gap-3">
                                <Youtube size={18} className="text-red-600 group-hover/btn:text-white transition-colors" />
                                Audio Versiya
                              </span>
                              <ArrowRight size={16} className="opacity-0 group-hover/btn:opacity-100 -translate-x-2 group-hover/btn:translate-x-0 transition-all" />
                            </a>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
                
                <div className="px-8 py-6 bg-slate-50 mt-auto flex items-center justify-between">
                  <span className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400">Status: Mavjud</span>
                  <div className="w-2 h-2 rounded-full bg-green-500 animate-pulse"></div>
                </div>
              </motion.div>
            ))}
          </AnimatePresence>
        </div>
      </div>
    </section>
  );
}
