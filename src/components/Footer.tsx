/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { Mail, Send, Youtube, Instagram, MessageCircle, ArrowUpRight } from "lucide-react";
import { Link } from "react-router-dom";
import { SOCIAL_LINKS } from "../constants";

export default function Footer() {
  return (
    <footer id="aloqa" className="bg-[#0f172a] text-slate-400 py-24 relative z-10 overflow-hidden">
      <div className="absolute top-0 left-0 w-full h-px bg-gradient-to-r from-transparent via-slate-700 to-transparent"></div>
      
      <div className="container mx-auto px-6">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-16 mb-20">
          {/* Brand */}
          <div className="col-span-1">
            <div className="flex items-center gap-3 mb-8">
              <div className="w-10 h-10 bg-brand-primary rounded-xl flex items-center justify-center text-white shadow-lg">
                <Send size={20} />
              </div>
              <h3 className="text-2xl font-serif font-black text-white tracking-tight">Audio Darsliklar 2026</h3>
            </div>
            <p className="mb-8 leading-relaxed text-slate-400 font-medium">
              O'zbekiston maktablarining 5-11 sinf o'quvchilari uchun sifatli darsliklarni bepul yetkazib berish innovatsion loyihasi.
            </p>
            <div className="flex gap-4">
              {[
                { icon: Send, href: SOCIAL_LINKS.telegram },
                { icon: Youtube, href: SOCIAL_LINKS.youtube },
                { icon: Instagram, href: SOCIAL_LINKS.instagram },
                { icon: MessageCircle, href: SOCIAL_LINKS.tiktok }
              ].map((social, i) => (
                <a 
                  key={i}
                  href={social.href} 
                  className="w-12 h-12 rounded-2xl bg-slate-800/50 flex items-center justify-center text-slate-400 hover:bg-brand-primary hover:text-white hover:-translate-y-1 transition-all duration-300"
                  target="_blank" 
                  rel="noreferrer"
                >
                  <social.icon size={20} />
                </a>
              ))}
            </div>
          </div>

          {/* Quick Links */}
          <div>
            <h4 className="text-white font-black uppercase tracking-widest text-xs mb-8">Menyu</h4>
            <ul className="space-y-4">
              {[
                { name: "Bosh sahifa", href: "/" },
                { name: "Kutubxona", href: "/library" },
                { name: "Loyiha", href: "/about" },
                { name: "Aloqa", href: "/contact" }
              ].map((link) => (
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
            <h4 className="text-white font-black uppercase tracking-widest text-xs mb-8">Bog'lanish</h4>
            <div className="space-y-6">
              <div className="group">
                <p className="text-[10px] font-black uppercase tracking-widest text-slate-500 mb-2">Elektron pochta</p>
                <a href={`mailto:${SOCIAL_LINKS.email}`} className="text-slate-300 font-bold hover:text-brand-primary transition-colors flex items-center gap-2">
                  <Mail size={16} />
                  {SOCIAL_LINKS.email}
                </a>
              </div>
              <div>
                <p className="text-[10px] font-black uppercase tracking-widest text-slate-500 mb-2">Muallif</p>
                <p className="text-slate-300 font-bold">Toshov Ozodbek</p>
              </div>
            </div>
          </div>

          {/* Newsletter / Notice */}
          <div>
            <h4 className="text-white font-black uppercase tracking-widest text-xs mb-8">Falsafa</h4>
            <div className="bg-slate-800/30 p-6 rounded-[2rem] border border-slate-700/50 backdrop-blur-sm">
              <p className="text-slate-400 font-medium italic leading-relaxed text-sm">
                "Bilim — bu insonning eng katta boyligi. Uni ulashish esa baxtdir."
              </p>
              <div className="mt-4 flex items-center gap-2">
                <div className="w-6 h-6 bg-brand-primary/20 rounded-full flex items-center justify-center">
                  <div className="w-2 h-2 rounded-full bg-brand-primary"></div>
                </div>
                <span className="text-xs font-black text-slate-500 uppercase tracking-widest">Audio Darsliklar 2026</span>
              </div>
            </div>
          </div>
        </div>

        <div className="pt-12 border-t border-slate-800/50 flex flex-col md:flex-row justify-between items-center gap-6">
          <p className="text-slate-500 font-medium text-center md:text-left">
            © {new Date().getFullYear()} <strong>Audio Darsliklar 2026</strong>. Hamma resurslar foydalanish uchun ochiq.
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

