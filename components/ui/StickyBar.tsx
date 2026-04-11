"use client";

import { clsx } from "clsx";
import type { HTMLAttributes } from "react";

interface StickyBarProps extends HTMLAttributes<HTMLDivElement> {
  /** Micro-label text above the CTA */
  label?: string;
}

/**
 * Fixed bottom bar for mobile page-level CTAs.
 * White bg, top border, safe-area padding.
 * Hidden on tablet+ by default.
 */
export function StickyBar({
  label,
  className,
  children,
  ...props
}: StickyBarProps): React.ReactElement {
  return (
    <div
      className={clsx(
        "fixed inset-x-0 bottom-0 z-40 tablet-sm:hidden",
        "border-t border-[var(--border-subtle)]",
        "px-4 pt-3",
        className
      )}
      style={{
        backgroundColor: "var(--bg-page)",
        paddingBottom: "calc(12px + env(safe-area-inset-bottom))",
      }}
      {...props}
    >
      {label && (
        <p
          className="text-center mb-2"
          style={{
            fontSize: "var(--type-micro)",
            color: "var(--text-tertiary)",
          }}
        >
          {label}
        </p>
      )}
      <div className="flex items-center gap-3">{children}</div>
    </div>
  );
}
