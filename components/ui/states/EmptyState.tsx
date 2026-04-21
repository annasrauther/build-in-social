import * as React from "react";
import type { LucideIcon } from "lucide-react";
import { cn } from "@/lib/utils";

/**
 * Empty state — every screen gets one.
 *
 * Rules: one icon, one sentence of context, one primary CTA. Second
 * person, present tense. No exclamation marks. No "Great!".
 */
export interface EmptyStateProps {
  icon?: LucideIcon;
  title: string;
  description?: string;
  action?: React.ReactNode;
  /** Optional secondary affordance (e.g. link to a guide). */
  secondary?: React.ReactNode;
  className?: string;
}

export function EmptyState({
  icon: Icon,
  title,
  description,
  action,
  secondary,
  className,
}: EmptyStateProps) {
  return (
    <div
      className={cn(
        "flex flex-col items-center justify-center text-center",
        "px-6 py-12 gap-3",
        "text-text",
        className
      )}
      role="status"
    >
      {Icon ? (
        <span
          className={cn(
            "inline-flex h-8 w-8 items-center justify-center",
            "rounded-[var(--radius-input)]",
            "bg-[color-mix(in_srgb,var(--gray-12)_4%,transparent)]",
            "text-text-tertiary"
          )}
          aria-hidden="true"
        >
          <Icon size={16} strokeWidth={1.5} />
        </span>
      ) : null}
      <div className="flex flex-col gap-1 max-w-sm">
        <h3 className="text-[14px] font-medium leading-tight text-text">
          {title}
        </h3>
        {description ? (
          <p className="text-[13px] leading-snug text-text-secondary">
            {description}
          </p>
        ) : null}
      </div>
      {action || secondary ? (
        <div className="flex items-center gap-2 mt-2">
          {action}
          {secondary}
        </div>
      ) : null}
    </div>
  );
}
