import { clsx } from "clsx";
import type { HTMLAttributes } from "react";

/* ─── Separator — simple div-based, no Radix dependency ── */

interface SeparatorProps extends HTMLAttributes<HTMLDivElement> {
  orientation?: "horizontal" | "vertical";
}

export function Separator({
  className,
  orientation = "horizontal",
  ...props
}: SeparatorProps): React.ReactElement {
  return (
    <div
      role="separator"
      aria-orientation={orientation}
      className={clsx(
        "bg-[var(--border-subtle)]",
        orientation === "horizontal" ? "h-px w-full" : "h-full w-px",
        className
      )}
      {...props}
    />
  );
}
