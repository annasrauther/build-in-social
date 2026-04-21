"use client";

import { motion } from "motion/react";
import { EASE_SPRING, TOTAL_STEPS } from "@/lib/constants/onboarding";

const STEPS = Array.from({ length: TOTAL_STEPS }, (_, i) => i + 1);

interface StepProgressBarProps {
  currentStep: number;
}

export function StepProgressBar({ currentStep }: StepProgressBarProps) {
  return (
    <div className="flex items-center gap-1">
      {STEPS.map((step) => {
        const isCompleted = step < currentStep;
        const isCurrent = step === currentStep;

        return (
          <motion.div
            key={step}
            className="rounded-full"
            initial={false}
            animate={{
              width: isCurrent ? 24 : 6,
              height: 6,
              backgroundColor: isCompleted || isCurrent
                ? "var(--accent)"
                : "var(--border-default)",
              opacity: isCompleted ? 0.5 : 1,
            }}
            transition={{
              duration: 0.12,
              ease: [...EASE_SPRING],
            }}
          />
        );
      })}
    </div>
  );
}
