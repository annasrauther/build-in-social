"use client";

import { motion, AnimatePresence } from "framer-motion";
import { PageHeader } from "@/components/ui/PageHeader";
import { StickyBar } from "@/components/ui/StickyBar";
import { Button, KIND, SIZE } from "baseui/button";
import { StepProgressBar } from "./StepProgressBar";
import { EASE_SPRING } from "@/lib/constants/onboarding";

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
  continueLabel = "Continue",
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
    <div
      className="h-dvh flex flex-col relative"
      style={{ backgroundColor: "var(--bg-page)" }}
    >
      {/* ─── Header ─── */}
      <PageHeader
        border
        right={<StepProgressBar currentStep={step} />}
        className="relative z-10 shrink-0"
      />

      {/* ─── Content zone ─── */}
      <main className="flex-1 overflow-y-auto relative z-10 flex items-center justify-center">
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
            className="w-full px-4 tablet-sm:px-8 my-auto py-8 mx-auto"
            style={{ maxWidth: wide ? 960 : 480 }}
          >
            {children}
          </motion.div>
        </AnimatePresence>
      </main>

      {/* ─── Fixed footer ─── */}
      <footer
        className="shrink-0 relative z-10 px-4 tablet-sm:px-8 py-5"
        style={{ borderTop: "1px solid var(--border-default)" }}
      >
        <div className="mx-auto flex flex-col gap-3" style={{ maxWidth: 480 }}>
          {/* Back + Continue in one row */}
          <div className="flex items-center gap-2">
            {showBack && onBack && (
              <Button
                kind={KIND.tertiary}
                onClick={onBack}
                overrides={{ BaseButton: { style: { flexShrink: 0 } } }}
              >
                Back
              </Button>
            )}

            {showContinue && (
              <Button
                disabled={continueDisabled}
                onClick={onContinue}
                overrides={{ BaseButton: { style: { width: "100%" } } }}
              >
                {continueLabel}
              </Button>
            )}
          </div>

          {/* Skip row */}
          {onSkip && (
            <div className="flex justify-end">
              <Button kind={KIND.tertiary} size={SIZE.compact} onClick={onSkip}>
                Skip for now
              </Button>
            </div>
          )}

          {/* Helper text */}
          {helperText && (
            <p
              className="text-center text-[12px]"
              style={{ color: "var(--text-disabled)" }}
            >
              {helperText}
            </p>
          )}
        </div>
      </footer>
    </div>
  );
}
