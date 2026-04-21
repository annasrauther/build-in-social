import * as React from "react";
import { AlertTriangle } from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/shadcn/button";

/**
 * Error state — full-surface error.
 *
 * Rules: what failed, why (if knowable), what to try. Never a raw
 * error dump. Calm voice; no "Oops!", no "Something went horribly
 * wrong!".
 */
export interface ErrorStateProps {
  title?: string;
  description?: string;
  onRetry?: () => void;
  retryLabel?: string;
  className?: string;
  /** Secondary action (e.g. "Contact support"). */
  secondary?: React.ReactNode;
}

export function ErrorState({
  title = "We couldn't load this.",
  description = "Check your connection and try again. If it keeps happening, we'll want to hear about it.",
  onRetry,
  retryLabel = "Try again",
  secondary,
  className,
}: ErrorStateProps) {
  return (
    <div
      className={cn(
        "flex flex-col items-center justify-center text-center",
        "px-6 py-12 gap-3",
        className
      )}
      role="alert"
    >
      <span
        className="inline-flex h-8 w-8 items-center justify-center rounded-[var(--radius-input)] bg-[color:var(--danger-subtle)] text-[color:var(--danger)]"
        aria-hidden="true"
      >
        <AlertTriangle size={16} strokeWidth={1.5} />
      </span>
      <div className="flex flex-col gap-1 max-w-sm">
        <h3 className="text-[14px] font-medium leading-tight text-text">
          {title}
        </h3>
        <p className="text-[13px] leading-snug text-text-secondary">
          {description}
        </p>
      </div>
      {(onRetry || secondary) && (
        <div className="flex items-center gap-2 mt-2">
          {onRetry ? (
            <Button variant="secondary" size="sm" onClick={onRetry}>
              {retryLabel}
            </Button>
          ) : null}
          {secondary}
        </div>
      )}
    </div>
  );
}
