import { clsx } from "clsx";
import type { HTMLAttributes } from "react";

type BadgeVariant =
  | "default"
  | "accent"
  | "success"
  | "warning"
  | "danger"
  /* Video/job status variants */
  | "draft"
  | "approved"
  | "rendering"
  | "ready"
  | "posted"
  | "failed";

interface BadgeProps extends HTMLAttributes<HTMLSpanElement> {
  variant?: BadgeVariant;
}

export function Badge({
  variant = "default",
  className,
  ...props
}: BadgeProps): React.ReactElement {
  return (
    <span
      className={clsx(
        "inline-flex items-center rounded-[4px] px-1.5 py-0.5",
        "text-[var(--type-micro)] font-medium uppercase tracking-[0.07em]",
        variantStyles[variant],
        className
      )}
      {...props}
    />
  );
}

/* Aliased export for Uber Base naming */
export const StatusBadge = Badge;

const variantStyles: Record<BadgeVariant, string> = {
  default: "bg-[var(--bg-elevated)] text-[var(--text-secondary)]",
  accent: "bg-[var(--accent-subtle)] text-[var(--accent)]",
  success: "bg-[var(--success-subtle)] text-[var(--success)]",
  warning: "bg-[var(--warning-subtle)] text-[var(--warning)]",
  danger: "bg-[var(--danger-subtle)] text-[var(--danger)]",
  /* Video status variants */
  draft: "bg-[var(--bg-elevated)] text-[var(--text-tertiary)]",
  approved: "bg-[var(--success-subtle)] text-[var(--success)]",
  rendering: "bg-[var(--warning-subtle)] text-[var(--warning)]",
  ready: "bg-[var(--success-subtle)] text-[var(--success)]",
  posted: "bg-[var(--success-subtle)] text-[var(--success)]",
  failed: "bg-[var(--danger-subtle)] text-[var(--danger)]",
};
