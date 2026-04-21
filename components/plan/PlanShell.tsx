import * as React from "react";
import { cn } from "@/lib/utils";

/**
 * Plan page shell — shared chrome for `/plan/current` and `/plan/[week-id]`.
 *
 * No hero scroll moment on product surfaces. Typography does the work:
 * Geist at the title, grayDark.11 subtitle, tabular numerics in meta.
 */
export interface PlanShellProps {
  /** Page title (e.g. "This week"). */
  title: React.ReactNode;
  /** Short subtitle (e.g. "7 drafts · 4 approved · autopilot"). */
  subtitle?: React.ReactNode;
  /** Right-aligned toolbar actions. */
  actions?: React.ReactNode;
  children: React.ReactNode;
  className?: string;
}

export function PlanShell({
  title,
  subtitle,
  actions,
  children,
  className,
}: PlanShellProps) {
  return (
    <div
      className={cn(
        "bg-bg text-text",
        "px-6 pt-6 pb-12 sm:px-8",
        "min-h-[100dvh]",
        className
      )}
    >
      <header className="mb-6 flex flex-col gap-3 tablet-sm:flex-row tablet-sm:items-end tablet-sm:justify-between">
        <div className="flex flex-col gap-0.5 min-w-0">
          <h1 className="text-[20px] font-medium tracking-[-0.02em] leading-tight text-text">
            {title}
          </h1>
          {subtitle ? (
            <p className="text-[13px] leading-snug text-text-secondary tabular-nums">
              {subtitle}
            </p>
          ) : null}
        </div>
        {actions ? (
          <div className="flex items-center gap-2 shrink-0">{actions}</div>
        ) : null}
      </header>
      {children}
    </div>
  );
}
