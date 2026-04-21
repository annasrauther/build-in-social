import * as React from "react";
import Link from "next/link";
import { Wordmark } from "@/components/ui/Wordmark";
import { cn } from "@/lib/utils";

/**
 * Onboarding layout — shared chrome across the 3 steps (Context /
 * Preview / Voice).
 *
 * Progress affordance is a thin iris bar at the top (no labeled stepper).
 * Step labels accessible via aria-label on the bar so screen readers still
 * announce progress.
 */

export interface OnboardingLayoutProps {
  step: 1 | 2 | 3;
  children: React.ReactNode;
  /** Override the default aria-label (falls back to "Step N of 3"). */
  ariaLabel?: string;
  /** Optional subtle brand / skip affordance in the top-right. */
  topRight?: React.ReactNode;
}

const TOTAL = 3;

export function OnboardingLayout({
  step,
  children,
  ariaLabel,
  topRight,
}: OnboardingLayoutProps) {
  const pct = (step / TOTAL) * 100;

  return (
    <div className="min-h-[100dvh] bg-bg text-text flex flex-col">
      {/* Progress bar — iris fill on grayDark.3 track. */}
      <div
        role="progressbar"
        aria-valuenow={step}
        aria-valuemin={1}
        aria-valuemax={TOTAL}
        aria-label={ariaLabel ?? `Step ${step} of ${TOTAL}`}
        className="h-[2px] w-full bg-elevated"
      >
        <div
          className="h-full bg-accent transition-[width] duration-default ease-out-cubic"
          style={{ width: `${pct}%` }}
        />
      </div>

      {/* Top bar: wordmark + optional right slot. */}
      <div className="flex items-center justify-between px-6 py-4">
        <Link href="/onboarding" aria-label="Onboarding home">
          <Wordmark size={16} />
        </Link>
        <div className="flex items-center gap-2">
          <StepDots step={step} />
          {topRight}
        </div>
      </div>

      {/* Body — constrained width, vertically centered-ish. */}
      <main className="flex-1 w-full">
        <div className="mx-auto w-full max-w-xl px-4 sm:px-6 py-8">
          {children}
        </div>
      </main>
    </div>
  );
}

function StepDots({ step }: { step: number }) {
  return (
    <span
      className="inline-flex items-center gap-1 font-mono text-[11px] text-text-tertiary tabular-nums"
      aria-hidden="true"
    >
      {Array.from({ length: TOTAL }).map((_, i) => {
        const n = i + 1;
        const state = n < step ? "done" : n === step ? "current" : "pending";
        return (
          <span
            key={n}
            className={cn(
              "inline-block h-1.5 w-1.5 rounded-full transition-colors duration-fast ease-out-cubic",
              state === "done" && "bg-accent",
              state === "current" && "bg-text",
              state === "pending" && "bg-[color:var(--border)]"
            )}
          />
        );
      })}
      <span className="ml-2">
        {step} / {TOTAL}
      </span>
    </span>
  );
}
