/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import TextbookSection from "../components/TextbookSection";
import { useLanguage } from "../context/LanguageContext";

export default function Library() {
  const { language } = useLanguage();
  const uz = language === "uz";

  return (
    <div className="pt-16 min-h-screen bg-white dark:bg-slate-950 transition-colors">
      <section className="py-10 sm:py-12 bg-white dark:bg-slate-950 border-b border-slate-200 dark:border-slate-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6">
          <p className="text-xs font-bold uppercase tracking-wider text-brand-primary dark:text-blue-400 mb-2">
            {uz ? "Elektron Kutubxona · 1–11 sinflar" : "Электронная библиотека · 1–11 классы"}
          </p>
          <h1 className="text-3xl sm:text-4xl font-serif font-black text-slate-900 dark:text-white tracking-tight mb-2">
            {uz ? "Maktab darsliklari va audio resurslar" : "Школьные учебники и аудиоресурсы"}
          </h1>
          <p className="text-sm sm:text-base text-slate-600 dark:text-slate-400 max-w-2xl">
            {uz
              ? "O'zbek va rus tillaridagi barcha rasmiy PDF darsliklar, 8–9-sinf Adabiyot audio pleylistlari hamda AI TTS ovoz studiyasi bilan bir joyda."
              : "Официальные PDF-учебники на узбекском и русском языках, аудиоплейлисты и озвучка текста в одном месте."}
          </p>
        </div>
      </section>

      <div className="bg-slate-50 dark:bg-slate-950 transition-colors">
        <TextbookSection />
      </div>
    </div>
  );
}
