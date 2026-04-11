import { clsx } from "clsx";
import type { HTMLAttributes } from "react";

/* ─── ContentCard ─────────────────────────────────────────────
   Uber Base card pattern.
   --bg-elevated fill, no border, --radius-lg.
   Padding: 16px mobile / 24px desktop.
   No box-shadow on default. This is the only card variant.
   ───────────────────────────────────────────────────────────── */

interface CardProps extends HTMLAttributes<HTMLDivElement> {
  interactive?: boolean;
}

export function Card({ interactive, className, ...props }: CardProps): React.ReactElement {
  return (
    <div
      className={clsx(
        "rounded-[var(--radius-lg)] bg-[var(--bg-elevated)]",
        "p-4 tablet-sm:p-6",
        interactive &&
          "transition-all duration-[120ms] hover:-translate-y-0.5 hover:shadow-[0_4px_12px_rgba(0,0,0,0.06)] cursor-pointer",
        className
      )}
      {...props}
    />
  );
}

/* Aliased export for Uber Base naming */
export const ContentCard = Card;

export function CardHeader({
  className,
  ...props
}: HTMLAttributes<HTMLDivElement>): React.ReactElement {
  return (
    <div
      className={clsx(
        "flex items-center justify-between pb-3 mb-4",
        "border-b border-[var(--border-default)]",
        className
      )}
      {...props}
    />
  );
}

export function CardTitle({
  className,
  ...props
}: HTMLAttributes<HTMLHeadingElement>): React.ReactElement {
  return (
    <h3
      className={clsx(
        "text-[var(--type-section-mobile)] tablet-sm:text-[var(--type-section-desktop)]",
        "font-semibold text-[var(--text-primary)]",
        className
      )}
      {...props}
    />
  );
}

export function CardDescription({
  className,
  ...props
}: HTMLAttributes<HTMLParagraphElement>): React.ReactElement {
  return (
    <p
      className={clsx(
        "text-[var(--type-supporting-mobile)] tablet-sm:text-[var(--type-supporting-desktop)]",
        "text-[var(--text-secondary)] mt-1",
        className
      )}
      {...props}
    />
  );
}

export function CardContent({
  className,
  ...props
}: HTMLAttributes<HTMLDivElement>): React.ReactElement {
  return <div className={clsx(className)} {...props} />;
}
