"use client";

import { clsx } from "clsx";

/* ─── Progress bar — pure CSS, no Radix or Base Web dep ─
   Accent fill. 8px height. Rounded. 120ms transition.
   ─────────────────────────────────────────────────────── */

interface ProgressProps {
  /** Progress value 0-100 */
  value?: number;
  className?: string;
}

export function Progress({
  value = 0,
  className,
}: ProgressProps): React.ReactElement {
  const clamped = Math.min(100, Math.max(0, value));
  return (
    <div
      role="progressbar"
      aria-valuenow={clamped}
      aria-valuemin={0}
      aria-valuemax={100}
      className={clsx("relative h-2 w-full overflow-hidden rounded-full", className)}
      style={{ backgroundColor: "var(--bg-elevated)" }}
    >
      <div
        className="h-full rounded-full"
        style={{
          width: `${clamped}%`,
          backgroundColor: "var(--accent)",
          transition: "width 120ms ease-out",
        }}
      />
    </div>
  );
}
