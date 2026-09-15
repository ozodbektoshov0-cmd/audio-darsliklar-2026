/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useEffect, useRef, useState } from "react";
import { motion, AnimatePresence } from "motion/react";
import lottie from "lottie-web";
import loaderAnimationData from "../data/loaderAnimation.json";
import { Headphones, Sparkles } from "lucide-react";

interface PageLoaderProps {
  onFinish?: () => void;
  minDurationMs?: number;
}

export default function PageLoader({ onFinish, minDurationMs = 1800 }: PageLoaderProps) {
  const [isVisible, setIsVisible] = useState(true);
  const [progress, setProgress] = useState(15);
  const containerRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    let animInstance: any = null;
    if (containerRef.current) {
      animInstance = lottie.loadAnimation({
        container: containerRef.current,
        renderer: "svg",
        loop: true,
        autoplay: true,
        animationData: loaderAnimationData,
      });
    }

    // Smooth progress simulation
    const interval = setInterval(() => {
      setProgress((prev) => {
        if (prev >= 98) {
          clearInterval(interval);
          return 98;
        }
        return prev + Math.floor(Math.random() * 18 + 10);
      });
    }, 180);

    const timer = setTimeout(() => {
      setProgress(100);
      setTimeout(() => {
        setIsVisible(false);
        if (onFinish) onFinish();
      }, 350);
    }, minDurationMs);

    return () => {
      clearInterval(interval);
      clearTimeout(timer);
      if (animInstance) animInstance.destroy();
    };
  }, [minDurationMs, onFinish]);

  return (
    <AnimatePresence>
      {isVisible && (
        <motion.div
          key="site-preloader"
          initial={{ opacity: 1 }}
          exit={{ opacity: 0, scale: 1.03 }}
          transition={{ duration: 0.5, ease: "easeInOut" }}
          className="fixed inset-0 z-[9999] flex flex-col items-center justify-center bg-white/95 dark:bg-slate-950/95 backdrop-blur-xl select-none"
        >
          {/* Subtle decorative background glow */}
          <div className="absolute w-72 h-72 rounded-full bg-blue-500/10 dark:bg-blue-600/15 blur-3xl pointer-events-none"></div>

          <div className="relative z-10 flex flex-col items-center text-center px-6 max-w-sm w-full">
            {/* Lottie Animation Canvas */}
            <div className="relative w-44 h-44 sm:w-52 sm:h-52 mb-2 flex items-center justify-center">
              <div ref={containerRef} className="w-full h-full" />
              
              {/* Center icon badge */}
              <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                <div className="w-12 h-12 rounded-2xl bg-white dark:bg-slate-900 shadow-md border border-slate-100 dark:border-slate-800 flex items-center justify-center text-brand-primary">
                  <Headphones size={22} className="animate-pulse" />
                </div>
              </div>
            </div>

            {/* Title & Brand */}
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.15 }}
              className="space-y-1.5 mb-6"
            >
              <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-blue-50 dark:bg-blue-950/60 border border-blue-100 dark:border-blue-900 text-brand-primary dark:text-blue-400 text-[11px] font-black uppercase tracking-wider">
                <Sparkles size={12} />
                <span>O'zbekiston Maktab Darsliklari</span>
              </div>
              <h2 className="text-2xl sm:text-3xl font-serif font-black text-slate-900 dark:text-white tracking-tight">
                Audio <span className="text-brand-primary">Darsliklar</span> 2026
              </h2>
              <p className="text-xs text-slate-500 dark:text-slate-400 font-medium">
                Platforma yuklanmoqda... {progress}%
              </p>
            </motion.div>

            {/* Progress Bar */}
            <div className="w-full bg-slate-100 dark:bg-slate-800 rounded-full h-2 overflow-hidden border border-slate-200/60 dark:border-slate-700/60">
              <motion.div
                className="h-full bg-gradient-to-r from-brand-primary to-blue-400 rounded-full"
                initial={{ width: "15%" }}
                animate={{ width: `${progress}%` }}
                transition={{ ease: "easeOut", duration: 0.2 }}
              />
            </div>

            {/* Skip button if needed */}
            <button
              type="button"
              onClick={() => setIsVisible(false)}
              className="mt-6 text-[11px] text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 transition-colors uppercase tracking-widest font-semibold"
            >
              O'tkazib yuborish
            </button>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
