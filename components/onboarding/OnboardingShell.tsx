"use client";

import { motion, AnimatePresence } from "framer-motion";
import { PageHeader } from "@/components/ui/PageHeader";
import { Button } from "@/components/tremor/Button";
import { StepProgressBar } from "./StepProgressBar";
import { APP } from "@/content/app";

interface OnboardingShellProps {
  step: number;
  children: React.ReactNode;
  showBack?: boolean;
  continueLabel?: string;
  continueDisabled?: boolean;
  onContinue?: () => void;
  onBack?: () => void;
  showContinue?: boolean;
  /** Optional helper text below buttons (e.g. "Press Enter ↵") */
  helperText?: React.ReactNode;
  /** Optional skip handler — renders "Skip for now" link */
  onSkip?: () => void;
  /** Animation direction for content transitions */
  direction?: "forward" | "back";
  /** Wide layout — expands content zone to 960px (footer stays at 480px) */
  wide?: boolean;
}

const slideVariants = {
  enter: (direction: "forward" | "back") => ({
    x: direction === "forward" ? 32 : -32,
    opacity: 0,
  }),
  center: {
    x: 0,
    opacity: 1,
  },
  exit: (direction: "forward" | "back") => ({
    x: direction === "forward" ? -32 : 32,
    opacity: 0,
  }),
};

export function OnboardingShell({
  step,
  children,
  showBack = true,
  continueLabel = APP.ONBOARDING.common.continueLabel,
  continueDisabled = false,
  onContinue,
  onBack,
  showContinue = true,
  helperText,
  onSkip,
  direction = "forward",
  wide = false,
}: OnboardingShellProps) {
  return (
    <div className="h-dvh flex flex-col relative bg-anthropic-light dark:bg-anthropic-dark">
      {/* ─── Header ─── */}
      <PageHeader
        border
        right={<StepProgressBar currentStep={step} />}
        className="relative z-10 shrink-0"
      />

      {/* ─── Content zone ─── */}
      <main className="flex-1 overflow-y-auto relative z-10">
        <div className="min-h-full flex flex-col items-center justify-center py-5">
          <AnimatePresence mode="wait" custom={direction}>
            <motion.div
              key={step}
              custom={direction}
              variants={slideVariants}
              initial="enter"
              animate="center"
              exit="exit"
              transition={{
                x: { type: "spring", stiffness: 400, damping: 35 },
                opacity: { duration: 0.12 },
              }}
              className={
                wide
                  ? "w-full px-4 tablet-sm:px-6 mx-auto max-w-[960px]"
                  : "w-full px-4 tablet-sm:px-6 mx-auto max-w-lg sm:max-w-xl lg:max-w-2xl"
              }
            >
              {children}
            </motion.div>
          </AnimatePresence>
        </div>
      </main>

      {/* ─── Fixed footer ─── */}
      <footer className="shrink-0 relative z-10 px-4 tablet-sm:px-8 py-5 border-t border-anthropic-lightGray/40 dark:border-anthropic-midGray/30">
        <div className="mx-auto flex flex-col gap-3 max-w-[480px]">
          {/* Back + Continue in one row */}
          <div className="flex items-center gap-2">
            {showBack && onBack && (
              <Button
                variant="ghost"
                onClick={onBack}
                className="shrink-0"
              >
                {APP.ONBOARDING.common.back}
              </Button>
            )}

            {showContinue && (
              <Button
                disabled={continueDisabled}
                onClick={onContinue}
                className="w-full disabled:dark:bg-gray-700/60 disabled:dark:border-gray-600/50 disabled:dark:text-gray-400"
              >
                {continueLabel}
              </Button>
            )}
          </div>

          {/* Skip row */}
          {onSkip && (
            <div className="flex justify-end">
              <Button variant="ghost" className="text-sm" onClick={onSkip}>
                {APP.ONBOARDING.common.skipForNow}
              </Button>
            </div>
          )}

          {/* Helper text */}
          {helperText && (
            <p className="text-center text-[12px] text-anthropic-midGray/70 dark:text-anthropic-lightGray/50">
              {helperText}
            </p>
          )}
        </div>
      </footer>
    </div>
  );
}
