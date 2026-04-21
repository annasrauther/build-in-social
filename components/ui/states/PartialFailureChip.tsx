"use client";

import * as React from "react";
import { AlertCircle, RotateCw } from "lucide-react";
import { cn } from "@/lib/utils";

/**
 * Partial-failure chip — one section failed, the rest works.
 *
 * Rule: a failure on one cell should never error-page the whole
 * screen. Use this inline where the failure happened.
 *
 * ```tsx
 * <PartialFailureChip
 *   message="Couldn't generate this day."
 *   onRetry={() => regenerateDay(id)}
 * />
 * ```
 */
export interface PartialFailureChipProps {
  message: string;
  onRetry?: () => void;
  retryLabel?: string;
  className?: string;
}

export function PartialFailureChip({
  message,
  onRetry,
  retryLabel = "Retry",
  className,
}: PartialFailureChipProps) {
  return (
    <div
      className={cn(
        "inline-flex items-center gap-2",
        "h-7 px-2",
        "text-[12px] leading-none",
        "bg-[color:var(--danger-subtle)]",
        "text-[color:var(--danger)]",
        "border border-[color-mix(in_srgb,var(--danger)_20%,transparent)]",
        "rounded-[var(--radius-input)]",
        className
      )}
      role="alert"
    >
      <AlertCircle size={12} strokeWidth={1.5} aria-hidden="true" />
      <span className="truncate max-w-[24ch]">{message}</span>
      {onRetry ? (
        <button
          type="button"
          onClick={onRetry}
          className={cn(
            "inline-flex items-center gap-1",
            "text-[color:var(--danger)] hover:brightness-125",
            "transition-[filter] duration-fast ease-out-cubic",
            "focus-visible:outline-2 focus-visible:outline-offset-2",
            "focus-visible:[outline-color:var(--focus-ring)]",
            "rounded-[3px]"
          )}
        >
          <RotateCw size={12} strokeWidth={1.5} aria-hidden="true" />
          <span className="underline underline-offset-2">{retryLabel}</span>
        </button>
      ) : null}
    </div>
  );
}
