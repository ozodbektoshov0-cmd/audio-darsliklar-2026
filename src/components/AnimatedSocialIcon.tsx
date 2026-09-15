/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from "react";
import { Instagram, Youtube, Send, Mail } from "lucide-react";

export type SocialIconType = "instagram" | "youtube" | "telegram" | "email";

interface AnimatedSocialIconProps {
  type: SocialIconType;
  size?: number | string;
  className?: string;
  playOnHover?: boolean;
  autoplay?: boolean;
  loop?: boolean;
  speed?: number;
}

export default function AnimatedSocialIcon({
  type,
  size = 24,
  className = "",
}: AnimatedSocialIconProps) {
  const iconSize = typeof size === "number" ? size : parseInt(size as string, 10) || 24;

  switch (type) {
    case "instagram":
      return (
        <Instagram
          size={iconSize}
          className={`shrink-0 transition-transform duration-300 group-hover:scale-110 text-pink-500 dark:text-pink-400 ${className}`}
        />
      );
    case "youtube":
      return (
        <Youtube
          size={iconSize}
          className={`shrink-0 transition-transform duration-300 group-hover:scale-110 text-red-500 dark:text-red-400 ${className}`}
        />
      );
    case "telegram":
      return (
        <Send
          size={iconSize}
          className={`shrink-0 transition-transform duration-300 group-hover:scale-110 text-sky-400 dark:text-sky-300 ${className}`}
        />
      );
    case "email":
      return (
        <Mail
          size={iconSize}
          className={`shrink-0 transition-transform duration-300 group-hover:scale-110 text-blue-400 dark:text-blue-300 ${className}`}
        />
      );
    default:
      return null;
  }
}
