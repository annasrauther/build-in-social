"use client";

import { motion } from "framer-motion";
import { EASE_SPRING } from "@/lib/constants/onboarding";

interface OnboardingHeadingProps {
  title: string;
  subtitle?: string;
}

const ease = [...EASE_SPRING] as [number, number, number, number];

export function OnboardingHeading({ title, subtitle }: OnboardingHeadingProps) {
  return (
    <div className="mb-6">
      <motion.h1
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.12, ease }}
        style={{
          fontSize: "var(--type-display-mobile)",
          letterSpacing: "-0.01em",
        }}
        className="text-gradient-brand tablet-sm:text-[length:var(--type-display-desktop)] font-bold leading-[1.15]"
      >
        {title}
      </motion.h1>

      {subtitle && (
        <motion.p
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.12, ease, delay: 0.04 }}
          className="mt-3 leading-relaxed max-w-[480px]"
          style={{
            fontSize: "var(--type-body-mobile)",
            color: "var(--text-secondary)",
          }}
        >
          {subtitle}
        </motion.p>
      )}
    </div>
  );
}
