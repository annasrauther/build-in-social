"use client";

import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { EASE_SPRING } from "@/lib/constants/onboarding";

interface TrustLineProps {
  /** Static single line or array of rotating lines */
  lines: string | string[];
  /** Rotation interval in ms (default: 4000) */
  interval?: number;
  className?: string;
}

export function TrustLine({ lines, interval = 4000, className = "" }: TrustLineProps) {
  const items = typeof lines === "string" ? [lines] : lines;
  const [index, setIndex] = useState(0);

  useEffect(() => {
    if (items.length <= 1) return;

    const id = setInterval(() => {
      setIndex((prev) => (prev + 1) % items.length);
    }, interval);

    return () => clearInterval(id);
  }, [items.length, interval]);

  return (
    <div
      className={`h-5 overflow-hidden ${className}`}
      style={{ minHeight: 20 }}
    >
      <AnimatePresence mode="wait">
        <motion.p
          key={index}
          initial={{ opacity: 0, y: 6 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -6 }}
          transition={{ duration: 0.35, ease: [...EASE_SPRING] }}
          style={{
            fontSize: 13,
            color: "var(--text-tertiary)",
            fontWeight: 400,
            lineHeight: 1.4,
          }}
        >
          {items[index]}
        </motion.p>
      </AnimatePresence>
    </div>
  );
}
