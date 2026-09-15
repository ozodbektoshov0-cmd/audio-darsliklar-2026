/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from "react";
import AnimatedSocialIcon, { SocialIconType } from "./AnimatedSocialIcon";

interface AnimatedSocialButtonProps {
  type: SocialIconType;
  href: string;
  title: string;
  size?: number;
  className?: string;
  variant?: "icon-only" | "card" | "pill";
  label?: string;
  sublabel?: string;
  id?: string;
}

export default function AnimatedSocialButton({
  type,
  href,
  title,
  size = 22,
  className = "",
  variant = "icon-only",
  label,
  sublabel,
  id,
}: AnimatedSocialButtonProps) {
  // Background style presets for branded colors
  const brandStyles = {
    instagram: "hover:border-pink-500/50 hover:bg-pink-500/10 hover:shadow-pink-500/10",
    youtube: "hover:border-red-500/50 hover:bg-red-500/10 hover:shadow-red-500/10",
    telegram: "hover:border-sky-500/50 hover:bg-sky-500/10 hover:shadow-sky-500/10",
    email: "hover:border-blue-500/50 hover:bg-blue-500/10 hover:shadow-blue-500/10",
  }[type];

  if (variant === "card") {
    return (
      <a
        id={id}
        href={href}
        target={href.startsWith("mailto:") ? undefined : "_blank"}
        rel={href.startsWith("mailto:") ? undefined : "noreferrer"}
        title={title}
        className={`flex items-center gap-5 p-5 md:p-6 bg-white dark:bg-slate-900 rounded-3xl border border-slate-100 dark:border-slate-800 hover:shadow-xl transition-all duration-300 group ${brandStyles} ${className}`}
      >
        <div className="w-14 h-14 bg-slate-50 dark:bg-slate-800 rounded-2xl flex items-center justify-center p-2.5 transition-transform duration-300 group-hover:scale-110 shrink-0 shadow-sm">
          <AnimatedSocialIcon type={type} size={28} />
        </div>
        <div className="min-w-0 flex-1">
          {label && (
            <p className="text-[11px] font-black uppercase tracking-widest text-slate-400 dark:text-slate-400 mb-1 truncate">
              {label}
            </p>
          )}
          <p className="text-base md:text-lg font-bold text-slate-900 dark:text-white truncate group-hover:text-brand-primary dark:group-hover:text-blue-400 transition-colors">
            {sublabel || title}
          </p>
        </div>
      </a>
    );
  }

  if (variant === "pill") {
    return (
      <a
        id={id}
        href={href}
        target={href.startsWith("mailto:") ? undefined : "_blank"}
        rel={href.startsWith("mailto:") ? undefined : "noreferrer"}
        title={title}
        className={`inline-flex items-center gap-3 px-6 py-3.5 rounded-2xl bg-white dark:bg-slate-800 border border-slate-200/80 dark:border-slate-700/80 text-slate-800 dark:text-white font-bold hover:shadow-md transition-all group ${brandStyles} ${className}`}
      >
        <div className="w-6 h-6 flex items-center justify-center shrink-0">
          <AnimatedSocialIcon type={type} size={20} />
        </div>
        <span className="truncate">{label || title}</span>
      </a>
    );
  }

  // Default: icon-only button (e.g. for footer or toolbar)
  return (
    <a
      id={id}
      href={href}
      target={href.startsWith("mailto:") ? undefined : "_blank"}
      rel={href.startsWith("mailto:") ? undefined : "noreferrer"}
      title={title}
      aria-label={title}
      className={`relative w-12 h-12 rounded-2xl bg-slate-800/70 dark:bg-slate-800/80 border border-slate-700/50 flex items-center justify-center text-slate-300 hover:text-white hover:bg-slate-700/90 hover:border-slate-600 hover:-translate-y-1 hover:shadow-lg transition-all duration-300 group ${className}`}
    >
      <div className="flex items-center justify-center transition-transform duration-300 group-hover:scale-110">
        <AnimatedSocialIcon type={type} size={size} />
      </div>
    </a>
  );
}
