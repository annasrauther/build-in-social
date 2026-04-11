"use client";

import { clsx } from "clsx";
import type { HTMLAttributes } from "react";

interface ListRowProps extends HTMLAttributes<HTMLDivElement> {
  /** Left slot content (icon, avatar — 20px recommended) */
  left?: React.ReactNode;
  /** Right slot content (metadata, action icon, button) */
  right?: React.ReactNode;
  /** Supporting text below the primary content */
  supporting?: React.ReactNode;
  /** Hide the bottom border (e.g. last item) */
  noBorder?: boolean;
  /** Make the row clickable with hover/active states */
  interactive?: boolean;
}

export function ListRow({
  left,
  right,
  supporting,
  noBorder,
  interactive,
  className,
  children,
  ...props
}: ListRowProps): React.ReactElement {
  return (
    <div
      className={clsx(
        "flex items-center gap-3 px-4 min-h-[48px] py-3",
        !noBorder && "border-b border-[var(--border-subtle)]",
        interactive && [
          "cursor-pointer",
          "transition-colors duration-[var(--transition-state)]",
          "active:bg-[var(--bg-elevated)]",
        ],
        className
      )}
      style={interactive ? { transition: "background-color 100ms ease" } : undefined}
      onMouseEnter={
        interactive
          ? (e) => {
              (e.currentTarget as HTMLElement).style.backgroundColor = "var(--bg-elevated)";
            }
          : undefined
      }
      onMouseLeave={
        interactive
          ? (e) => {
              (e.currentTarget as HTMLElement).style.backgroundColor = "";
            }
          : undefined
      }
      {...props}
    >
      {left && (
        <div className="shrink-0 flex items-center justify-center" style={{ width: 20, height: 20 }}>
          {left}
        </div>
      )}

      <div className="flex-1 min-w-0">
        <div className="text-[var(--type-body-mobile)] tablet-sm:text-[var(--type-body-desktop)] text-[var(--text-primary)] truncate">
          {children}
        </div>
        {supporting && (
          <div className="text-[var(--type-supporting-mobile)] tablet-sm:text-[var(--type-supporting-desktop)] text-[var(--text-tertiary)] truncate mt-0.5">
            {supporting}
          </div>
        )}
      </div>

      {right && <div className="shrink-0 flex items-center gap-2">{right}</div>}
    </div>
  );
}
