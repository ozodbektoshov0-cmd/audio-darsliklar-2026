/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "motion/react";
import { Link, useLocation } from "react-router-dom";
import {
  Sun,
  Moon,
  Home,
  BookOpen,
  Mic,
  Bot,
  Info,
  PhoneCall,
  ChevronRight,
  GraduationCap,
  Gamepad2,
  LogIn,
  LogOut,
  Presentation,
  FileSpreadsheet,
  Plus,
} from "lucide-react";
import { useStudent } from "../context/StudentContext";
import { useTheme } from "../context/ThemeContext";
import { useLanguage } from "../context/LanguageContext";
import { useAuth } from "../context/AuthContext";
import { SOCIAL_LINKS } from "../constants";
import AnimatedMenuButton from "./AnimatedMenuButton";
import AnimatedSocialButton from "./AnimatedSocialButton";

const GRADES = ["1", "2", "3", "4", "5", "6", "7", "8", "9", "10", "11"] as const;

export default function Navbar() {
  const [isScrolled, setIsScrolled] = useState(false);
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const location = useLocation();
  const { profile } = useStudent();
  const { theme, toggleTheme } = useTheme();
  const { language, setLanguage, t } = useLanguage();
  const { user, authBusy, loginWithGoogle, logout } = useAuth();
  const uz = language === "uz";

  useEffect(() => {
    const handleScroll = () => setIsScrolled(window.scrollY > 12);
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  useEffect(() => {
    setIsMenuOpen(false);
    window.scrollTo(0, 0);
  }, [location.pathname, location.search]);

  useEffect(() => {
    document.body.style.overflow = isMenuOpen ? "hidden" : "unset";
    return () => {
      document.body.style.overflow = "unset";
    };
  }, [isMenuOpen]);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") setIsMenuOpen(false);
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, []);

  const topNavLinks = [
    { key: "lessons", label: uz ? "Darslar" : "Уроки", href: "/lessons", activeMatch: "/lessons" },
    { key: "library", label: uz ? "Kutubxona" : "Библиотека", href: "/library", activeMatch: "/library" },
    { key: "games", label: uz ? "O'yinlar" : "Игры", href: "/tests?section=games", activeMatch: "/tests" },
    { key: "materials", label: uz ? "Materiallar" : "Материалы", href: "/materials", activeMatch: "/materials" },
    { key: "ai", label: uz ? "AI Ustoz" : "AI Учитель", href: "/ai-tutor", activeMatch: "/ai-tutor" },
  ];

  const drawerLinks = [
    { key: "home", name: t("navHome"), desc: uz ? "Bosh sahifa va tezkor qidiruv" : "Главная и умный поиск", href: "/", icon: Home },
    { key: "lessons", name: uz ? "Slayd darslar" : "Слайд-уроки", desc: uz ? "1–11 sinf tayyor interaktiv darslar" : "Готовые интерактивные уроки", href: "/lessons", icon: Presentation },
    { key: "library", name: t("navLibrary"), desc: uz ? "1–11 sinf PDF va audio darsliklar" : "Учебники PDF и аудио 1–11 кл.", href: "/library", icon: BookOpen },
    { key: "tests", name: t("navTests"), desc: uz ? "Testlar, Attestatsiya va 15 ta o'yin" : "Тесты, аттестация и 15 игр", href: "/tests", icon: Gamepad2 },
    { key: "materials", name: uz ? "AI Materiallar" : "ИИ Материалы", desc: uz ? "BSB/ChSB, krossvord va A4 varaqlar" : "СОР/СОЧ, кроссворды и листы A4", href: "/materials", icon: FileSpreadsheet },
    { key: "tts", name: t("navTts"), desc: uz ? "Matnni tabiiy ovozda tinglash va MP3" : "Озвучка текста и MP3", href: "/tts", icon: Mic },
    { key: "ai", name: t("navAiChat"), desc: uz ? "24/7 aqlli fan repetitori" : "Умный репетитор 24/7", href: "/ai-tutor", icon: Bot },
    { key: "profile", name: t("navProfile"), desc: uz ? "Sinf va saqlangan darsliklar" : "Класс и избранное", href: "/profile", icon: GraduationCap },
    { key: "about", name: t("navAbout"), desc: uz ? "Loyiha haqida ma'lumot" : "О платформе", href: "/about", icon: Info },
    { key: "contact", name: t("navContact"), desc: uz ? "Takliflar va bog'lanish" : "Обратная связь", href: "/contact", icon: PhoneCall },
  ];

  const savedCount = profile.savedItems?.length || 0;

  return (
    <>
      <nav
        className={`no-print fixed top-0 left-0 right-0 z-50 h-16 transition-colors duration-200 border-b ${
          isScrolled
            ? "bg-white/95 dark:bg-slate-950/95 backdrop-blur-md border-slate-200 dark:border-slate-800 shadow-xs"
            : "bg-white/90 dark:bg-slate-950/90 backdrop-blur-md border-slate-200/70 dark:border-slate-800/70"
        }`}
      >
        <div className="max-w-7xl mx-auto h-full px-3 sm:px-6 flex items-center justify-between gap-2">
          {/* Single-line Wordmark */}
          <Link to="/" className="flex items-center gap-2 shrink-0 min-w-0">
            <div className="w-8 h-8 sm:w-9 sm:h-9 rounded-xl overflow-hidden border border-slate-200 dark:border-slate-700 bg-slate-900 shrink-0">
              <img
                src="/logo.jpg"
                alt="Audio Darsliklar 2026"
                className="w-full h-full object-cover"
                referrerPolicy="no-referrer"
              />
            </div>
            <span className="text-sm sm:text-lg font-serif font-black text-slate-900 dark:text-white tracking-tight whitespace-nowrap">
              Audio <span className="text-brand-primary dark:text-blue-400">Darsliklar</span>
            </span>
          </Link>

          {/* Desktop 5-Link Navigation (strict single line) */}
          <div className="hidden lg:flex items-center gap-1">
            {topNavLinks.map((item) => {
              const isActive =
                item.activeMatch === "/tests"
                  ? location.pathname.startsWith("/tests")
                  : location.pathname === item.activeMatch;
              return (
                <Link
                  key={item.key}
                  to={item.href}
                  className={`px-3 py-1.5 rounded-lg text-sm font-semibold whitespace-nowrap transition-colors ${
                    isActive
                      ? "bg-blue-50 dark:bg-blue-950/60 text-brand-primary dark:text-blue-300"
                      : "text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-900"
                  }`}
                >
                  {item.label}
                </Link>
              );
            })}
          </div>

          {/* Right Action Cluster */}
          <div className="flex items-center gap-1.5 sm:gap-2 shrink-0">
            <Link
              to="/tests?create=1"
              className="hidden sm:inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-900 hover:border-brand-primary text-slate-800 dark:text-slate-200 text-xs font-bold whitespace-nowrap transition-colors"
            >
              <Plus size={14} className="text-brand-primary" />
              <span>{uz ? "Yaratish" : "Создать"}</span>
            </Link>

            {user ? (
              <div className="flex items-center gap-1.5 pl-1.5 pr-1 py-1 rounded-lg bg-slate-100 dark:bg-slate-900 border border-slate-200 dark:border-slate-700">
                {user.photoURL ? (
                  <img
                    src={user.photoURL}
                    alt={user.displayName || "Google"}
                    className="w-6 h-6 rounded-full object-cover"
                    referrerPolicy="no-referrer"
                  />
                ) : (
                  <span className="w-6 h-6 rounded-full bg-brand-primary text-white text-[11px] font-black flex items-center justify-center">
                    {(user.displayName || "G")[0].toUpperCase()}
                  </span>
                )}
                <span className="hidden xl:inline max-w-[95px] truncate text-xs font-bold text-slate-800 dark:text-slate-100">
                  {user.displayName || user.email}
                </span>
                <button
                  type="button"
                  onClick={() => void logout()}
                  title={uz ? "Chiqish" : "Выйти"}
                  aria-label={uz ? "Chiqish" : "Выйти"}
                  className="p-1 rounded-md text-slate-500 hover:text-red-600 transition-colors"
                >
                  <LogOut size={14} />
                </button>
              </div>
            ) : (
              <button
                type="button"
                disabled={authBusy}
                onClick={() => void loginWithGoogle()}
                className="inline-flex items-center gap-1 px-2.5 sm:px-3 py-1.5 rounded-lg bg-brand-primary hover:bg-blue-700 text-white font-bold text-xs whitespace-nowrap transition-colors"
              >
                <LogIn size={13} />
                <span>{uz ? "Kirish" : "Войти"}</span>
              </button>
            )}

            {/* Language Switcher */}
            <div className="inline-flex p-0.5 bg-slate-100 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-lg">
              <button
                type="button"
                onClick={() => setLanguage("uz")}
                className={`px-1.5 sm:px-2 py-1 rounded-md text-[11px] sm:text-xs font-bold transition-colors ${
                  language === "uz"
                    ? "bg-white dark:bg-slate-800 text-brand-primary dark:text-blue-300 shadow-xs"
                    : "text-slate-500 dark:text-slate-400"
                }`}
              >
                UZ
              </button>
              <button
                type="button"
                onClick={() => setLanguage("ru")}
                className={`px-1.5 sm:px-2 py-1 rounded-md text-[11px] sm:text-xs font-bold transition-colors ${
                  language === "ru"
                    ? "bg-white dark:bg-slate-800 text-brand-primary dark:text-blue-300 shadow-xs"
                    : "text-slate-500 dark:text-slate-400"
                }`}
              >
                RU
              </button>
            </div>

            {/* Theme Toggle (desktop bar; mobile users access it inside the drawer) */}
            <button
              type="button"
              onClick={toggleTheme}
              id="navbar-theme-toggle"
              aria-label={theme === "dark" ? "Yorug' rejimga o'tish" : "Tungi rejimga o'tish"}
              className="hidden sm:flex w-9 h-9 rounded-lg items-center justify-center bg-slate-100 hover:bg-slate-200 text-slate-700 dark:bg-slate-900 dark:hover:bg-slate-800 dark:text-amber-300 border border-slate-200 dark:border-slate-800 transition-colors shrink-0"
            >
              {theme === "dark" ? <Sun size={16} /> : <Moon size={16} />}
            </button>

            <AnimatedMenuButton
              isOpen={isMenuOpen}
              onClick={() => setIsMenuOpen(!isMenuOpen)}
              id="top-lottie-menu-btn"
            />
          </div>
        </div>
      </nav>

      {/* Slide-out Navigation Drawer */}
      <AnimatePresence>
        {isMenuOpen && (
          <div className="fixed inset-0 z-50 overflow-hidden">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.2 }}
              onClick={() => setIsMenuOpen(false)}
              className="fixed inset-0 bg-slate-950/60 backdrop-blur-xs"
            />

            <div className="fixed inset-y-0 right-0 max-w-full flex pl-10">
              <motion.div
                initial={{ x: "100%" }}
                animate={{ x: 0 }}
                exit={{ x: "100%" }}
                transition={{ type: "spring", damping: 30, stiffness: 300 }}
                className="w-screen max-w-md bg-white dark:bg-slate-900 shadow-2xl border-l border-slate-200 dark:border-slate-800 flex flex-col justify-between overflow-y-auto"
              >
                <div className="p-5 border-b border-slate-200 dark:border-slate-800 flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl overflow-hidden border border-slate-200 dark:border-slate-700 bg-slate-900 shrink-0">
                      <img src="/logo.jpg" alt="Audio Darsliklar" className="w-full h-full object-cover" referrerPolicy="no-referrer" />
                    </div>
                    <div>
                      <h3 className="font-serif font-black text-base text-slate-900 dark:text-white leading-tight">
                        Audio Darsliklar 2026
                      </h3>
                      <p className="text-xs text-slate-500">{uz ? "Barcha xizmatlar" : "Все разделы"}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <button
                      type="button"
                      onClick={toggleTheme}
                      aria-label={theme === "dark" ? "Yorug' rejimga o'tish" : "Tungi rejimga o'tish"}
                      className="w-9 h-9 rounded-lg flex items-center justify-center bg-slate-100 hover:bg-slate-200 text-slate-700 dark:bg-slate-800 dark:text-amber-300 border border-slate-200 dark:border-slate-700 transition-colors"
                    >
                      {theme === "dark" ? <Sun size={16} /> : <Moon size={16} />}
                    </button>
                    <AnimatedMenuButton isOpen={isMenuOpen} onClick={() => setIsMenuOpen(false)} id="drawer-close-lottie-btn" />
                  </div>
                </div>

                <div className="p-5 space-y-5 flex-1">
                  <Link
                    to="/profile"
                    onClick={() => setIsMenuOpen(false)}
                    className="flex items-center justify-between p-3.5 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700 hover:border-brand-primary transition-colors"
                  >
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-xl bg-brand-primary text-white flex items-center justify-center shrink-0">
                        <GraduationCap size={20} />
                      </div>
                      <div>
                        <p className="font-bold text-sm text-slate-900 dark:text-white">
                          {profile.studentName || (uz ? "O'quvchi profili" : "Профиль ученика")}
                          {profile.grade ? ` · ${profile.grade}${t("gradeSuffix")}` : ""}
                        </p>
                        <p className="text-xs text-slate-500">
                          {savedCount > 0
                            ? `${savedCount} ${uz ? "ta darslik saqlangan" : "сохранено"}`
                            : uz
                              ? "Sinfni tanlash va saqlash"
                              : "Выбрать класс"}
                        </p>
                      </div>
                    </div>
                    <ChevronRight size={16} className="text-slate-400" />
                  </Link>

                  <div className="space-y-1">
                    {drawerLinks.map((link) => {
                      const Icon = link.icon;
                      const isActive = location.pathname === link.href;
                      return (
                        <Link
                          key={link.key}
                          to={link.href}
                          onClick={() => setIsMenuOpen(false)}
                          className={`flex items-center justify-between p-3 rounded-xl transition-colors ${
                            isActive
                              ? "bg-brand-primary text-white"
                              : "hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-800 dark:text-slate-200"
                          }`}
                        >
                          <div className="flex items-center gap-3">
                            <Icon size={18} className={isActive ? "text-white" : "text-brand-primary dark:text-blue-400"} />
                            <div>
                              <p className="font-bold text-sm">{link.name}</p>
                              <p className={`text-xs ${isActive ? "text-blue-100" : "text-slate-500"}`}>{link.desc}</p>
                            </div>
                          </div>
                          <ChevronRight size={15} className={isActive ? "text-white" : "text-slate-400"} />
                        </Link>
                      );
                    })}
                  </div>

                  <div>
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-xs font-bold uppercase tracking-wider text-slate-400">
                        {uz ? "Sinflar (1–11)" : "Классы (1–11)"}
                      </span>
                      <Link to="/library" onClick={() => setIsMenuOpen(false)} className="text-xs font-bold text-brand-primary">
                        {uz ? "Barchasi" : "Все"}
                      </Link>
                    </div>
                    <div className="grid grid-cols-4 gap-2">
                      {GRADES.map((grade) => (
                        <Link
                          key={grade}
                          to={`/library?grade=${grade}`}
                          onClick={() => setIsMenuOpen(false)}
                          className="py-1.5 rounded-lg text-center text-xs font-bold bg-slate-50 dark:bg-slate-800 text-slate-700 dark:text-slate-300 border border-slate-200 dark:border-slate-700 hover:border-brand-primary"
                        >
                          {grade}-{uz ? "sinf" : "кл"}
                        </Link>
                      ))}
                    </div>
                  </div>
                </div>

                <div className="p-5 border-t border-slate-200 dark:border-slate-800 flex items-center justify-center gap-3">
                  <AnimatedSocialButton type="telegram" href={SOCIAL_LINKS.telegram} title="Telegram" size={18} className="!w-9 !h-9 rounded-xl" />
                  <AnimatedSocialButton type="youtube" href={SOCIAL_LINKS.youtube} title="YouTube" size={18} className="!w-9 !h-9 rounded-xl" />
                  <AnimatedSocialButton type="instagram" href={SOCIAL_LINKS.instagram} title="Instagram" size={18} className="!w-9 !h-9 rounded-xl" />
                  <AnimatedSocialButton type="email" href={`mailto:${SOCIAL_LINKS.email}`} title="Email" size={18} className="!w-9 !h-9 rounded-xl" />
                </div>
              </motion.div>
            </div>
          </div>
        )}
      </AnimatePresence>
    </>
  );
}
