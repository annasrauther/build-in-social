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
    <div className="mb-8">
      <motion.h1
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.12, ease }}
        style={{
          fontFamily: "var(--font-heading)",
          fontWeight: 400,
          fontSize: "var(--type-display-mobile)",
          lineHeight: 1.15,
          letterSpacing: "-0.01em",
          color: "var(--text-primary)",
        }}
        className="tablet-sm:text-[length:var(--type-display-desktop)]"
      >
        {title}
      </motion.h1>

      {subtitle && (
        <motion.p
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.12, ease, delay: 0.04 }}
          className="mt-3"
          style={{
            fontSize: "var(--type-body-mobile)",
            lineHeight: 1.6,
            color: "var(--text-secondary)",
            maxWidth: 480,
          }}
        >
          {subtitle}
        </motion.p>
      )}
    </div>
  );
}
