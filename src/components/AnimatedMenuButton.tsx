/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useEffect, useRef } from "react";
import lottie, { AnimationItem } from "lottie-web";
import menuAnimationData from "../data/menuAnimation.json";

interface AnimatedMenuButtonProps {
  isOpen: boolean;
  onClick: () => void;
  className?: string;
  id?: string;
}

export default function AnimatedMenuButton({
  isOpen,
  onClick,
  className = "",
  id = "animated-menu-toggle-btn",
}: AnimatedMenuButtonProps) {
  const containerRef = useRef<HTMLDivElement | null>(null);
  const animRef = useRef<AnimationItem | null>(null);
  const isFirstRender = useRef(true);

  useEffect(() => {
    if (!containerRef.current) return;

    // Initialize Lottie
    const anim = lottie.loadAnimation({
      container: containerRef.current,
      renderer: "svg",
      loop: false,
      autoplay: false,
      animationData: menuAnimationData,
    });

    anim.setSpeed(2.2); // Snappy, responsive animation
    animRef.current = anim;

    // If initial state is open, jump to end
    if (isOpen) {
      anim.goToAndStop(58, true);
    } else {
      anim.goToAndStop(0, true);
    }

    return () => {
      anim.destroy();
      animRef.current = null;
    };
  }, []);

  // Handle open / close animation updates
  useEffect(() => {
    if (!animRef.current) return;

    if (isFirstRender.current) {
      isFirstRender.current = false;
      return;
    }

    const anim = animRef.current;
    if (isOpen) {
      anim.setDirection(1);
      anim.playSegments([0, 58], true);
    } else {
      anim.setDirection(-1);
      anim.playSegments([58, 0], true);
    }
  }, [isOpen]);

  return (
    <button
      type="button"
      id={id}
      onClick={onClick}
      aria-expanded={isOpen}
      aria-label={isOpen ? "Menuni yopish" : "Menuni ochish"}
      className={`relative flex items-center justify-center p-2 rounded-2xl bg-white dark:bg-slate-800 border border-slate-200/80 dark:border-slate-700/80 shadow-sm hover:shadow-md hover:border-brand-primary/40 transition-all cursor-pointer group select-none ${className}`}
    >
      <div
        ref={containerRef}
        className="w-7 h-7 flex items-center justify-center [&>svg]:w-full [&>svg]:h-full dark:brightness-0 dark:invert transition-all group-hover:scale-105"
      />
    </button>
  );
}
