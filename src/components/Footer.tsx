/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { Headphones, MessageCircle, ArrowUpRight } from "lucide-react";
import { Link } from "react-router-dom";
import { SOCIAL_LINKS } from "../constants";
import { useLanguage } from "../context/LanguageContext";
import AnimatedSocialButton from "./AnimatedSocialButton";
import AnimatedSocialIcon from "./AnimatedSocialIcon";

export default function Footer() {
  const { t, language } = useLanguage();

  const menuLinks = [
    { name: t("navHome"), href: "/" },
    { name: t("navLibrary"), href: "/library" },
    { name: t("navProfile"), href: "/profile" },
    { name: t("navAbout"), href: "/about" },
    { name: t("navContact"), href: "/contact" },
  ];

  return (
    <footer id="aloqa" className="bg-[#0f172a] text-slate-400 py-24 relative z-10 overflow-hidden">
      <div className="absolute top-0 left-0 w-full h-px bg-gradient-to-r from-transparent via-slate-700 to-transparent"></div>
      
      <div className="container mx-auto px-6">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-16 mb-20">
          {/* Brand */}
          <div className="col-span-1">
            <div className="flex items-center gap-3 mb-8">
              <div className="w-12 h-12 rounded-2xl overflow-hidden border border-slate-700 shadow-xl shrink-0 bg-slate-900">
                <img 
                  src="/logo.jpg" 
                  alt="Audio Darsliklar 2026" 
                  className="w-full h-full object-cover"
                  referrerPolicy="no-referrer"
                />
              </div>
              <div>
                <h3 className="text-2xl font-serif font-black text-white tracking-tight leading-tight">Audio Darsliklar</h3>
                <span className="text-xs text-brand-primary font-bold">O'zbekiston 2026</span>
              </div>
            </div>
            <p className="mb-8 leading-relaxed text-slate-400 font-medium">
              {t("footerMission")}
            </p>
            <div className="flex flex-wrap gap-3">
              <AnimatedSocialButton
                type="telegram"
                href={SOCIAL_LINKS.telegram}
                title="Telegram"
                id="footer-telegram-btn"
              />
              <AnimatedSocialButton
                type="youtube"
                href={SOCIAL_LINKS.youtube}
                title="YouTube"
                id="footer-youtube-btn"
              />
              <AnimatedSocialButton
                type="instagram"
                href={SOCIAL_LINKS.instagram}
                title="Instagram"
                id="footer-instagram-btn"
              />
            </div>
          </div>

          {/* Quick Links */}
          <div>
            <h4 className="text-white font-black uppercase tracking-widest text-xs mb-8">
              {language === "uz" ? "Menyu" : "Меню"}
            </h4>
            <ul className="space-y-4">
              {menuLinks.map((link) => (
                <li key={link.name}>
                  <Link 
                    to={link.href} 
                    className="group flex items-center justify-between text-slate-400 hover:text-white transition-colors font-medium py-1"
                  >
                    {link.name}
                    <ArrowUpRight size={14} className="opacity-0 group-hover:opacity-100 transition-opacity" />
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Contact */}
          <div>
            <h4 className="text-white font-black uppercase tracking-widest text-xs mb-8">
              {language === "uz" ? "Bog'lanish" : "Связь"}
            </h4>
            <div className="space-y-6">
              <div className="group">
                <p className="text-[10px] font-black uppercase tracking-widest text-slate-500 mb-2">
                  {language === "uz" ? "Elektron pochta" : "Электронная почта"}
                </p>
                <div className="flex flex-col gap-2">
                  <a href={`mailto:${SOCIAL_LINKS.email}`} className="text-slate-300 font-medium hover:text-brand-primary transition-colors flex items-center gap-2.5 text-sm group">
                    <AnimatedSocialIcon type="email" size={18} className="shrink-0" />
                    <span className="group-hover:translate-x-0.5 transition-transform">{SOCIAL_LINKS.email}</span>
                  </a>
                </div>
              </div>
              <div>
                <p className="text-[10px] font-black uppercase tracking-widest text-slate-500 mb-2">
                  {language === "uz" ? "Muallif" : "Автор проекта"}
                </p>
                <p className="text-slate-300 font-bold">Toshov Ozodbek</p>
              </div>
            </div>
          </div>

          {/* Newsletter / Notice */}
          <div>
            <h4 className="text-white font-black uppercase tracking-widest text-xs mb-8">
              {language === "uz" ? "Falsafa" : "Философия"}
            </h4>
            <div className="bg-slate-800/30 p-6 rounded-[2rem] border border-slate-700/50 backdrop-blur-sm">
              <p className="text-slate-400 font-medium italic leading-relaxed text-sm">
                {t("footerPhilosophy")}
              </p>
              <div className="mt-4 flex items-center gap-2">
                <div className="w-6 h-6 bg-brand-primary/20 rounded-full flex items-center justify-center">
                  <div className="w-2 h-2 rounded-full bg-brand-primary"></div>
                </div>
                <span className="text-xs font-black text-slate-500 uppercase tracking-widest">
                  {language === "uz" ? "Ta'lim 2026" : "Образование 2026"}
                </span>
              </div>
            </div>
          </div>
        </div>

        <div className="pt-12 border-t border-slate-800/50 flex flex-col md:flex-row justify-between items-center gap-6">
          <p className="text-slate-500 font-medium text-center md:text-left">
            © {new Date().getFullYear()} <strong>Audio Darsliklar 2026</strong>. {t("footerCopyright")}
          </p>
          <div className="flex gap-8 text-xs font-black uppercase tracking-widest text-slate-600">
            <span>Ozodbek Toshov</span>
            <span className="w-1 h-1 bg-slate-800 rounded-full my-auto"></span>
            <span>Uzb, 2026</span>
          </div>
        </div>
      </div>
    </footer>
  );
}
