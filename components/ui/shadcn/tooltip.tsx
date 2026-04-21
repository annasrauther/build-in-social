"use client";

import * as React from "react";
import * as TooltipPrimitive from "@radix-ui/react-tooltip";
import { cn } from "@/lib/utils";

export const TooltipProvider = TooltipPrimitive.Provider;
export const Tooltip = TooltipPrimitive.Root;
export const TooltipTrigger = TooltipPrimitive.Trigger;

export const TooltipContent = React.forwardRef<
  React.ComponentRef<typeof TooltipPrimitive.Content>,
  React.ComponentPropsWithoutRef<typeof TooltipPrimitive.Content> & {
    shortcut?: React.ReactNode;
  }
>(function TooltipContent(
  { className, sideOffset = 6, children, shortcut, ...props },
  ref
) {
  return (
    <TooltipPrimitive.Portal>
      <TooltipPrimitive.Content
        ref={ref}
        sideOffset={sideOffset}
        className={cn(
          "z-50",
          "bg-elevated text-text",
          "border border-[color:var(--border)]",
          "rounded-[var(--radius-input)]",
          "px-2 py-1 text-[12px] leading-none",
          "flex items-center gap-2",
          "data-[state=delayed-open]:animate-slideUpAndFade",
          className
        )}
        {...props}
      >
        {children}
        {shortcut ? (
          <kbd className="font-mono text-[11px] text-text-tertiary">
            {shortcut}
          </kbd>
        ) : null}
      </TooltipPrimitive.Content>
    </TooltipPrimitive.Portal>
  );
});
