import * as React from "react";
import { cn } from "@/lib/utils";

/**
 * Keyboard hint chip. Accepts an array of tokens (e.g. ["⌘", "K"]) or a
 * single string ("⌘K"). Mono font, tabular, 11–12px.
 */
export function Kbd({
  keys,
  children,
  className,
  ...props
}: React.HTMLAttributes<HTMLElement> & {
  keys?: ReadonlyArray<string>;
}) {
  if (keys && keys.length > 0) {
    return (
      <span
        className={cn("inline-flex items-center gap-0.5", className)}
        {...props}
      >
        {keys.map((k, i) => (
          <kbd
            key={`${k}-${i}`}
            className={cn(
              "inline-flex items-center justify-center",
              "min-w-[18px] h-[18px] px-1",
              "font-mono text-[11px] leading-none",
              "text-text-tertiary",
              "bg-[color-mix(in_srgb,var(--gray-12)_6%,transparent)]",
              "border border-[color:var(--divider)]",
              "rounded-[4px]"
            )}
          >
            {k}
          </kbd>
        ))}
      </span>
    );
  }
  return (
    <kbd
      className={cn(
        "inline-flex items-center font-mono text-[11px] text-text-tertiary",
        className
      )}
      {...props}
    >
      {children}
    </kbd>
  );
}
