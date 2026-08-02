/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "motion/react";
import { Link, useLocation } from "react-router-dom";
import { Menu, X, Headphones, Send } from "lucide-react";

export default function Navbar() {
  const [isScrolled, setIsScrolled] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const location = useLocation();

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 20);
    };
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  // Scroll to top on route change
  useEffect(() => {
    window.scrollTo(0, 0);
  }, [location.pathname]);

  const navLinks = [
    { name: "Asosiy", href: "/" },
    { name: "Kutubxona", href: "/library" },
    { name: "Loyiha", href: "/about" },
    { name: "Aloqa", href: "/contact" },
  ];

  return (
    <nav 
      className={`fixed top-0 left-0 right-0 z-50 transition-all duration-500 ${
        isScrolled ? "bg-white/70 backdrop-blur-xl shadow-sm py-4" : "bg-transparent py-8"
      }`}
    >
      <div className="container mx-auto px-6 flex items-center justify-between">
        <Link to="/" className="flex items-center gap-3 group">
          <div className="bg-brand-primary p-2.5 rounded-2xl text-white group-hover:rotate-12 transition-all duration-500 shadow-lg shadow-brand-primary/20">
            <Headphones size={24} />
          </div>
          <span className="text-2xl font-serif font-black text-slate-900 tracking-tight">Audio Darsliklar 2026</span>
        </Link>

        {/* Desktop Links */}
        <div className="hidden md:flex items-center gap-10">
          {navLinks.map((link) => (
            <Link 
              key={link.name} 
              to={link.href}
              className={`font-bold text-sm tracking-widest uppercase transition-all relative group ${
                location.pathname === link.href ? "text-brand-primary" : "text-slate-500 hover:text-brand-primary"
              }`}
            >
              {link.name}
              <span className={`absolute -bottom-2 left-1/2 -translate-x-1/2 h-1 bg-brand-primary rounded-full transition-all ${
                location.pathname === link.href ? "w-1.5" : "w-0 group-hover:w-1.5"
              }`}></span>
            </Link>
          ))}
          <a 
            href="https://t.me/Audio_Darsliklar_2026" 
            target="_blank" 
            rel="noreferrer"
            className="flex items-center gap-2 pl-6 pr-5 py-3.5 bg-brand-primary text-white rounded-2xl font-bold text-sm hover:shadow-xl hover:shadow-brand-primary/30 transition-all group"
          >
            Telegram
            <Send size={16} className="group-hover:translate-x-1 group-hover:-translate-y-1 transition-transform" />
          </a>
        </div>

        {/* Mobile Toggle */}
        <button 
          className="md:hidden w-12 h-12 flex items-center justify-center bg-white rounded-2xl shadow-sm text-slate-900"
          onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
        >
          {isMobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
        </button>
      </div>

      {/* Mobile Menu */}
      <AnimatePresence>
        {isMobileMenuOpen && (
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: -10 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: -10 }}
            className="md:hidden absolute top-full left-4 right-4 mt-2 bg-white rounded-[2rem] border border-slate-100 shadow-2xl overflow-hidden"
          >
            <div className="flex flex-col p-6 gap-2">
              {navLinks.map((link) => (
                <Link 
                  key={link.name} 
                  to={link.href}
                  onClick={() => setIsMobileMenuOpen(false)}
                  className={`text-lg font-bold px-4 py-3 rounded-2xl transition-colors ${
                    location.pathname === link.href ? "bg-brand-primary/5 text-brand-primary" : "text-slate-600 hover:bg-slate-50"
                  }`}
                >
                  {link.name}
                </Link>
              ))}
              <div className="h-px bg-slate-100 my-2"></div>
              <a 
                href="https://t.me/Audio_Darsliklar_2026" 
                target="_blank" 
                rel="noreferrer"
                className="w-full py-4 bg-brand-primary text-white rounded-2xl text-center font-black"
              >
                Telegram Kanal
              </a>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </nav>
  );
}

