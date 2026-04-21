"use client";

import * as React from "react";
import { X } from "lucide-react";
import { cn } from "@/lib/utils";
import { hasSeen, markSeen } from "@/lib/seen";

/**
 * First-run hint — a quiet, dismissible row shown the first time a
 * user encounters a capability. Not a coach-mark, not a modal.
 *
 * Voice rule: product voice, not tutorial voice. Say "Type a theme to
 * draft 7 cards" — not "Great! Let's plan your first week.".
 *
 * Hidden after first interaction (or explicit dismissal) via
 * `lib/seen.ts` localStorage flags.
 *
 * ```tsx
 * <FirstRunHint
 *   capability="plan.empty-week"
 *   message="Type a theme to draft 7 cards."
 * />
 * ```
 */
export interface FirstRunHintProps {
  /** Stable capability id, e.g. "plan.empty-week". Persisted in localStorage. */
  capability: string;
  message: React.ReactNode;
  /** Show only when this returns true (in addition to the seen check). */
  when?: () => boolean;
  className?: string;
}

export function FirstRunHint({
  capability,
  message,
  when,
  className,
}: FirstRunHintProps) {
  const [visible, setVisible] = React.useState(false);

  React.useEffect(() => {
    if (when && !when()) return;
    if (!hasSeen(capability)) setVisible(true);
  }, [capability, when]);

  const dismiss = React.useCallback(() => {
    markSeen(capability);
    setVisible(false);
  }, [capability]);

  if (!visible) return null;

  return (
    <div
      className={cn(
        "flex items-center justify-between gap-2",
        "px-3 h-8",
        "text-[12px] leading-none text-text-secondary",
        "bg-[color-mix(in_srgb,var(--accent)_8%,transparent)]",
        "border border-[color-mix(in_srgb,var(--accent)_20%,transparent)]",
        "rounded-[var(--radius-input)]",
        "animate-fade-in",
        className
      )}
      role="note"
    >
      <span className="truncate">{message}</span>
      <button
        type="button"
        onClick={dismiss}
        className={cn(
          "inline-flex h-5 w-5 items-center justify-center",
          "rounded-[4px] text-text-tertiary",
          "hover:text-text hover:bg-[color-mix(in_srgb,var(--gray-12)_6%,transparent)]",
          "transition-colors duration-fast ease-out-cubic",
          "focus-visible:outline-2 focus-visible:outline-offset-2",
          "focus-visible:[outline-color:var(--focus-ring)]"
        )}
        aria-label="Dismiss"
      >
        <X size={12} strokeWidth={1.5} aria-hidden="true" />
      </button>
    </div>
  );
}
