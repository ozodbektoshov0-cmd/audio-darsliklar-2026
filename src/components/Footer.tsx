/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { ArrowUpRight } from "lucide-react";
import { Link } from "react-router-dom";
import { SOCIAL_LINKS } from "../constants";
import { useLanguage } from "../context/LanguageContext";
import AnimatedSocialButton from "./AnimatedSocialButton";
import AnimatedSocialIcon from "./AnimatedSocialIcon";

export default function Footer() {
  const { t, language } = useLanguage();
  const uz = language === "uz";

  const platformLinks = [
    { name: uz ? "Slayd darslar" : "Слайд-уроки", href: "/lessons" },
    { name: uz ? "Kutubxona (1–11)" : "Библиотека (1–11)", href: "/library" },
    { name: uz ? "15 ta'limiy o'yin" : "15 обучающих игр", href: "/tests?section=games" },
    { name: uz ? "AI Material Generatori" : "ИИ Генератор материалов", href: "/materials" },
    { name: uz ? "Attestatsiya va Testlar" : "Тесты и аттестация", href: "/tests" },
  ];

  const toolLinks = [
    { name: t("navAiChat"), href: "/ai-tutor" },
    { name: t("navTts"), href: "/tts" },
    { name: t("navProfile"), href: "/profile" },
    { name: t("navAbout"), href: "/about" },
    { name: t("navContact"), href: "/contact" },
  ];

  return (
    <footer id="aloqa" className="no-print bg-slate-950 text-slate-400 py-16 border-t border-slate-800">
      <div className="max-w-7xl mx-auto px-4 sm:px-6">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-10 mb-12">
          <div>
            <div className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 rounded-xl overflow-hidden border border-slate-700 bg-slate-900 shrink-0">
                <img src="/logo.jpg" alt="Audio Darsliklar 2026" className="w-full h-full object-cover" referrerPolicy="no-referrer" />
              </div>
              <div>
                <h3 className="text-lg font-serif font-black text-white leading-tight">Audio Darsliklar</h3>
                <span className="text-xs text-blue-400 font-semibold">O'zbekiston 2026</span>
              </div>
            </div>
            <p className="text-sm text-slate-400 leading-relaxed mb-5">{t("footerMission")}</p>
            <div className="flex flex-wrap gap-2.5">
              <AnimatedSocialButton type="telegram" href={SOCIAL_LINKS.telegram} title="Telegram" id="footer-telegram-btn" />
              <AnimatedSocialButton type="youtube" href={SOCIAL_LINKS.youtube} title="YouTube" id="footer-youtube-btn" />
              <AnimatedSocialButton type="instagram" href={SOCIAL_LINKS.instagram} title="Instagram" id="footer-instagram-btn" />
            </div>
          </div>

          <div>
            <h4 className="text-white font-bold uppercase tracking-wider text-xs mb-4">
              {uz ? "Asosiy bo'limlar" : "Основные разделы"}
            </h4>
            <ul className="space-y-2.5 text-sm">
              {platformLinks.map((link) => (
                <li key={link.href}>
                  <Link to={link.href} className="group flex items-center justify-between hover:text-white transition-colors">
                    <span>{link.name}</span>
                    <ArrowUpRight size={13} className="opacity-0 group-hover:opacity-100 transition-opacity" />
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          <div>
            <h4 className="text-white font-bold uppercase tracking-wider text-xs mb-4">
              {uz ? "Qo'shimcha xizmatlar" : "Сервисы"}
            </h4>
            <ul className="space-y-2.5 text-sm">
              {toolLinks.map((link) => (
                <li key={link.href}>
                  <Link to={link.href} className="group flex items-center justify-between hover:text-white transition-colors">
                    <span>{link.name}</span>
                    <ArrowUpRight size={13} className="opacity-0 group-hover:opacity-100 transition-opacity" />
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          <div>
            <h4 className="text-white font-bold uppercase tracking-wider text-xs mb-4">
              {uz ? "Bog'lanish" : "Контакты"}
            </h4>
            <div className="space-y-4 text-sm">
              <a
                href={`mailto:${SOCIAL_LINKS.email}`}
                className="text-slate-300 hover:text-blue-400 transition-colors flex items-center gap-2"
              >
                <AnimatedSocialIcon type="email" size={16} className="shrink-0" />
                <span>{SOCIAL_LINKS.email}</span>
              </a>
              <p className="text-xs text-slate-500 leading-relaxed">{t("footerPhilosophy")}</p>
            </div>
          </div>
        </div>

        <div className="pt-8 border-t border-slate-800/80 flex flex-col sm:flex-row justify-between items-center gap-4 text-xs text-slate-500">
          <p>
            © {new Date().getFullYear()} <strong className="text-slate-300">Audio Darsliklar 2026</strong> · {t("footerCopyright")}
          </p>
          <span>Ozodbek Toshov · Uzb 2026</span>
        </div>
      </div>
    </footer>
  );
}
