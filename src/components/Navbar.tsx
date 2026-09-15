/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "motion/react";
import { Link, useLocation } from "react-router-dom";
import { 
  Headphones, 
  Send, 
  GraduationCap, 
  Sun, 
  Moon, 
  Globe, 
  Home, 
  BookOpen, 
  Mic, 
  Bot, 
  Info, 
  PhoneCall, 
  ChevronRight,
  Sparkles,
  Bookmark
} from "lucide-react";
import { useStudent } from "../context/StudentContext";
import { useTheme } from "../context/ThemeContext";
import { useLanguage } from "../context/LanguageContext";
import { SOCIAL_LINKS } from "../constants";
import AnimatedMenuButton from "./AnimatedMenuButton";
import AnimatedSocialIcon from "./AnimatedSocialIcon";
import AnimatedSocialButton from "./AnimatedSocialButton";

const GRADES = ["1", "2", "3", "4", "5", "6", "7", "8", "9", "10", "11"] as const;

export default function Navbar() {
  const [isScrolled, setIsScrolled] = useState(false);
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const location = useLocation();
  const { profile } = useStudent();
  const { theme, toggleTheme } = useTheme();
  const { language, setLanguage, t } = useLanguage();

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 20);
    };
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  // Close menu & scroll to top on route change
  useEffect(() => {
    setIsMenuOpen(false);
    window.scrollTo(0, 0);
  }, [location.pathname]);

  // Prevent body scroll when menu is open
  useEffect(() => {
    if (isMenuOpen) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "unset";
    }
    return () => {
      document.body.style.overflow = "unset";
    };
  }, [isMenuOpen]);

  // Handle ESC key to close
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        setIsMenuOpen(false);
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, []);

  const navLinks = [
    { 
      key: "navHome", 
      name: t("navHome"), 
      desc: language === "uz" ? "Bosh sahifa va asosiy tavsiyalar" : "Главная страница и рекомендации",
      href: "/", 
      icon: Home 
    },
    { 
      key: "navLibrary", 
      name: t("navLibrary"), 
      desc: language === "uz" ? "1-11 sinf barcha fan audio darsliklari" : "Аудиоучебники для 1-11 классов",
      href: "/library", 
      icon: BookOpen 
    },
    { 
      key: "navTts", 
      name: t("navTts"), 
      desc: language === "uz" ? "Istalgan matnni ovozga aylantirish" : "Озвучивание любого текста",
      href: "/tts", 
      icon: Mic 
    },
    { 
      key: "navAiChat", 
      name: t("navAiChat"), 
      desc: language === "uz" ? "24/7 aqlli ta'lim yordamchisi" : "24/7 умный помощник по учебе",
      href: "/ai-tutor", 
      icon: Bot 
    },
    { 
      key: "navProfile", 
      name: t("navProfile"), 
      desc: language === "uz" ? "Tanlangan sinf va saqlangan darsliklar" : "Выбранный класс и закладки",
      href: "/profile", 
      icon: GraduationCap 
    },
    { 
      key: "navAbout", 
      name: t("navAbout"), 
      desc: language === "uz" ? "Loyiha, maqsadlar va audio standartlar" : "О проекте и стандартах аудио",
      href: "/about", 
      icon: Info 
    },
    { 
      key: "navContact", 
      name: t("navContact"), 
      desc: language === "uz" ? "Takliflar va texnik yordam" : "Предложения и поддержка",
      href: "/contact", 
      icon: PhoneCall 
    },
  ];

  const savedCount = profile.savedItems?.length || 0;

  return (
    <>
      <nav 
        className={`fixed top-0 left-0 right-0 z-50 transition-all duration-500 ${
          isScrolled 
            ? "bg-white/90 dark:bg-slate-900/90 backdrop-blur-xl shadow-sm border-b border-slate-200/60 dark:border-slate-800/80 py-3.5" 
            : "bg-transparent py-5 sm:py-7"
        }`}
      >
        <div className="container mx-auto px-4 sm:px-6 flex items-center justify-between">
          {/* Brand Logo */}
          <Link to="/" className="flex items-center gap-3 group">
            <div className="relative w-10 h-10 sm:w-11 sm:h-11 rounded-2xl overflow-hidden shadow-lg shadow-brand-primary/25 border border-brand-primary/30 group-hover:scale-105 group-hover:shadow-brand-primary/40 transition-all duration-300 shrink-0 bg-slate-900">
              <img 
                src="/logo.jpg" 
                alt="Audio Darsliklar 2026 Logo" 
                className="w-full h-full object-cover"
                referrerPolicy="no-referrer"
              />
            </div>
            <div className="flex flex-col">
              <span className="text-xl sm:text-2xl font-serif font-black text-slate-900 dark:text-white tracking-tight leading-tight">
                Audio <span className="text-brand-primary">Darsliklar</span>
              </span>
              <span className="text-[10px] font-bold text-slate-400 dark:text-slate-500 tracking-wider uppercase hidden sm:block">
                O'zbekiston 2026
              </span>
            </div>
          </Link>

          {/* Top Right Action Controls + Animated Menu Button */}
          <div className="flex items-center gap-2 sm:gap-3">
            {/* Quick Profile / Grade Pill (if selected) */}
            {profile.grade && (
              <Link
                to="/profile"
                className="hidden sm:flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-blue-50 dark:bg-blue-950/40 border border-blue-100 dark:border-blue-900/60 text-brand-primary dark:text-blue-300 font-bold text-xs hover:bg-blue-100 transition-colors"
                title="Sizning sinfingiz"
              >
                <GraduationCap size={14} />
                <span>{profile.grade}{t("gradeSuffix")}</span>
                {savedCount > 0 && (
                  <span className="ml-1 px-1.5 py-0.2 rounded-full text-[10px] font-black bg-amber-500 text-white">
                    {savedCount}
                  </span>
                )}
              </Link>
            )}

            {/* Quick Language Switcher */}
            <div className="inline-flex p-1 bg-slate-100 dark:bg-slate-800/90 border border-slate-200/80 dark:border-slate-700 rounded-2xl shadow-xs">
              <button
                type="button"
                onClick={() => setLanguage("uz")}
                className={`px-2.5 py-1 rounded-xl text-xs font-black transition-all ${
                  language === "uz"
                    ? "bg-brand-primary text-white shadow-xs"
                    : "text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white"
                }`}
                title="O'zbek tili"
              >
                UZ
              </button>
              <button
                type="button"
                onClick={() => setLanguage("ru")}
                className={`px-2.5 py-1 rounded-xl text-xs font-black transition-all ${
                  language === "ru"
                    ? "bg-brand-primary text-white shadow-xs"
                    : "text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white"
                }`}
                title="Русский язык"
              >
                RU
              </button>
            </div>

            {/* Theme Toggle Button */}
            <button
              type="button"
              onClick={toggleTheme}
              id="navbar-theme-toggle"
              aria-label={theme === "dark" ? "Yorug' rejimga o'tish" : "Tungi rejimga o'tish"}
              title={theme === "dark" ? "Yorug' rejim" : "Tungi rejim"}
              className="w-10 h-10 rounded-2xl flex items-center justify-center transition-all bg-slate-100 hover:bg-slate-200 text-slate-700 dark:bg-slate-800 dark:hover:bg-slate-700 dark:text-amber-300 border border-slate-200/80 dark:border-slate-700 shadow-xs cursor-pointer"
            >
              {theme === "dark" ? (
                <Sun size={18} className="text-amber-400 animate-pulse" />
              ) : (
                <Moon size={18} className="text-slate-700" />
              )}
            </button>

            {/* ANIMATED LOTTIE MENU TOGGLE BUTTON */}
            <AnimatedMenuButton 
              isOpen={isMenuOpen} 
              onClick={() => setIsMenuOpen(!isMenuOpen)} 
              id="top-lottie-menu-btn"
            />
          </div>
        </div>
      </nav>

      {/* FULL MENU OVERLAY & SLIDE-OUT DRAWER */}
      <AnimatePresence>
        {isMenuOpen && (
          <div className="fixed inset-0 z-50 overflow-hidden">
            {/* Backdrop */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.3 }}
              onClick={() => setIsMenuOpen(false)}
              className="fixed inset-0 bg-slate-950/60 backdrop-blur-md"
            />

            {/* Slide-over Drawer */}
            <div className="fixed inset-y-0 right-0 max-w-full flex pl-10">
              <motion.div
                initial={{ x: "100%" }}
                animate={{ x: 0 }}
                exit={{ x: "100%" }}
                transition={{ type: "spring", damping: 28, stiffness: 280 }}
                className="w-screen max-w-md bg-white dark:bg-slate-900 shadow-2xl border-l border-slate-100 dark:border-slate-800 flex flex-col justify-between overflow-y-auto"
              >
                {/* Menu Header */}
                <div className="p-6 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="w-11 h-11 rounded-2xl overflow-hidden border border-brand-primary/30 shadow-md shadow-brand-primary/15 shrink-0 bg-slate-900">
                      <img 
                        src="/logo.jpg" 
                        alt="Audio Darsliklar 2026" 
                        className="w-full h-full object-cover"
                        referrerPolicy="no-referrer"
                      />
                    </div>
                    <div>
                      <h3 className="font-serif font-black text-lg text-slate-900 dark:text-white leading-tight">
                        Audio Darsliklar 2026
                      </h3>
                      <p className="text-xs text-slate-400 font-medium">
                        {language === "uz" ? "Barcha xizmatlar va darsliklar" : "Все сервисы и учебники"}
                      </p>
                    </div>
                  </div>

                  <AnimatedMenuButton 
                    isOpen={isMenuOpen} 
                    onClick={() => setIsMenuOpen(false)} 
                    id="drawer-close-lottie-btn"
                  />
                </div>

                {/* Menu Body */}
                <div className="p-6 space-y-6 flex-1">
                  {/* Student Status Card */}
                  <Link
                    to="/profile"
                    onClick={() => setIsMenuOpen(false)}
                    className="flex items-center justify-between p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-100 dark:border-slate-700/60 hover:border-brand-primary/30 transition-all group"
                  >
                    <div className="flex items-center gap-3">
                      <div className="w-11 h-11 rounded-xl bg-brand-primary text-white flex items-center justify-center shadow-md shadow-brand-primary/20">
                        <GraduationCap size={22} />
                      </div>
                      <div>
                        <div className="flex items-center gap-2">
                          <span className="font-bold text-sm text-slate-900 dark:text-white">
                            {profile.studentName || (language === "uz" ? "O'quvchi profili" : "Профиль ученика")}
                          </span>
                          {profile.grade && (
                            <span className="px-2 py-0.5 rounded-full text-[10px] font-black bg-brand-primary text-white">
                              {profile.grade}{t("gradeSuffix")}
                            </span>
                          )}
                        </div>
                        <p className="text-xs text-slate-500 dark:text-slate-400">
                          {savedCount > 0 
                            ? `${savedCount} ${language === "uz" ? "ta darslik saqlangan" : "сохраненных книг"}`
                            : (language === "uz" ? "Darsliklarni sozlash va saqlash" : "Настроить и сохранять")}
                        </p>
                      </div>
                    </div>
                    <ChevronRight size={18} className="text-slate-400 group-hover:translate-x-1 transition-transform" />
                  </Link>

                  {/* Navigation Links List */}
                  <div className="space-y-1.5">
                    <p className="text-xs font-black uppercase tracking-wider text-slate-400 dark:text-slate-500 px-3 mb-2">
                      {language === "uz" ? "Asosiy bo'limlar" : "Основные разделы"}
                    </p>

                    {navLinks.map((link) => {
                      const Icon = link.icon;
                      const isActive = location.pathname === link.href;

                      return (
                        <Link
                          key={link.key}
                          to={link.href}
                          onClick={() => setIsMenuOpen(false)}
                          className={`group flex items-center justify-between p-3.5 rounded-2xl transition-all ${
                            isActive
                              ? "bg-brand-primary text-white shadow-lg shadow-brand-primary/25"
                              : "hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-200"
                          }`}
                        >
                          <div className="flex items-center gap-3.5">
                            <div className={`w-10 h-10 rounded-xl flex items-center justify-center transition-colors ${
                              isActive 
                                ? "bg-white/20 text-white" 
                                : "bg-slate-100 dark:bg-slate-800 text-brand-primary dark:text-blue-400 group-hover:bg-brand-primary group-hover:text-white"
                            }`}>
                              <Icon size={20} />
                            </div>
                            <div>
                              <p className="font-bold text-sm leading-tight">
                                {link.name}
                              </p>
                              <p className={`text-xs mt-0.5 line-clamp-1 ${
                                isActive ? "text-white/80" : "text-slate-400 dark:text-slate-500"
                              }`}>
                                {link.desc}
                              </p>
                            </div>
                          </div>
                          <ChevronRight 
                            size={16} 
                            className={`transition-transform group-hover:translate-x-1 ${
                              isActive ? "text-white" : "text-slate-400"
                            }`} 
                          />
                        </Link>
                      );
                    })}
                  </div>

                  {/* Quick Grades Selector */}
                  <div className="pt-2">
                    <div className="flex items-center justify-between px-3 mb-2.5">
                      <p className="text-xs font-black uppercase tracking-wider text-slate-400 dark:text-slate-500">
                        {language === "uz" ? "Sinflar bo'yicha tezkor o'tish" : "Быстрый переход по классам"}
                      </p>
                      <Link 
                        to="/library" 
                        onClick={() => setIsMenuOpen(false)}
                        className="text-xs font-bold text-brand-primary dark:text-blue-400 hover:underline"
                      >
                        {language === "uz" ? "Barchasi" : "Все"}
                      </Link>
                    </div>
                    <div className="grid grid-cols-4 sm:grid-cols-6 gap-2">
                      {GRADES.map((grade) => (
                        <Link
                          key={grade}
                          to={`/library?grade=${grade}`}
                          onClick={() => setIsMenuOpen(false)}
                          className={`py-2 rounded-xl text-center text-xs font-black transition-all border ${
                            profile.grade === grade
                              ? "bg-brand-primary text-white border-brand-primary shadow-sm"
                              : "bg-slate-50 dark:bg-slate-800/80 hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-300 border-slate-200/60 dark:border-slate-700"
                          }`}
                        >
                          {grade}-{language === "uz" ? "sinf" : "кл"}
                        </Link>
                      ))}
                    </div>
                  </div>
                </div>

                {/* Menu Footer with Quick Links */}
                <div className="p-6 border-t border-slate-100 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-900/50 space-y-4">
                  {/* Contact / Feedback Action Link */}
                  <Link
                    to="/contact"
                    onClick={() => setIsMenuOpen(false)}
                    className="w-full flex items-center justify-center gap-2 py-3 bg-brand-primary text-white rounded-2xl font-bold text-sm shadow-md shadow-brand-primary/20 hover:bg-blue-700 transition-all"
                  >
                    <PhoneCall size={16} />
                    <span>{language === "uz" ? "Taklif va Murojaatlar" : "Обратная связь"}</span>
                  </Link>

                  {/* Social Buttons Row */}
                  <div className="flex items-center justify-center gap-3 pt-1">
                    <AnimatedSocialButton
                      type="telegram"
                      href={SOCIAL_LINKS.telegram}
                      title="Telegram"
                      size={20}
                      className="!w-10 !h-10 rounded-xl"
                    />
                    <AnimatedSocialButton
                      type="youtube"
                      href={SOCIAL_LINKS.youtube}
                      title="YouTube"
                      size={20}
                      className="!w-10 !h-10 rounded-xl"
                    />
                    <AnimatedSocialButton
                      type="instagram"
                      href={SOCIAL_LINKS.instagram}
                      title="Instagram"
                      size={20}
                      className="!w-10 !h-10 rounded-xl"
                    />
                    <AnimatedSocialButton
                      type="email"
                      href={`mailto:${SOCIAL_LINKS.email}`}
                      title="Email"
                      size={20}
                      className="!w-10 !h-10 rounded-xl"
                    />
                  </div>

                  {/* Copyright & Info note */}
                  <div className="text-center">
                    <p className="text-[11px] text-slate-400 dark:text-slate-500 font-medium">
                      Audio Darsliklar 2026 • Maktab ta'limi audio platformasi
                    </p>
                  </div>
                </div>
              </motion.div>
            </div>
          </div>
        )}
      </AnimatePresence>
    </>
  );
}
