"use client";

import * as React from "react";
import * as DropdownMenuPrimitive from "@radix-ui/react-dropdown-menu";
import { cn } from "@/lib/utils";
import type { LucideIcon } from "lucide-react";

/**
 * Row context menu — per-row contextual actions, triggered by the
 * `MoreHorizontal` button on each row. Mouse-only; no keyboard
 * binding. Radix DropdownMenu handles Escape + outside-click; Tab
 * order follows the native focusable order of the items inside.
 *
 * Consumers pass an action list via `<RowCommandMenu actions={...}>`
 * and wire open/onOpenChange to the trigger button.
 */

export interface RowAction {
  id: string;
  label: string;
  icon?: LucideIcon;
  /** Destructive actions get danger styling. */
  destructive?: boolean;
  run: () => void | Promise<void>;
}

export interface RowCommandMenuProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  /** Positioning anchor — the focused row element. */
  anchor: HTMLElement | null;
  actions: readonly RowAction[];
  /** Title shown above the menu, e.g. "Monday · YouTube". */
  title?: React.ReactNode;
}

export function RowCommandMenu({
  open,
  onOpenChange,
  anchor,
  actions,
  title,
}: RowCommandMenuProps) {
  // Use a controlled DropdownMenu with a virtual trigger at the anchor's
  // right edge. We render a zero-size element inside the anchor when open.
  const [virtualRect, setVirtualRect] = React.useState<DOMRect | null>(null);
  React.useEffect(() => {
    if (!open || !anchor) {
      setVirtualRect(null);
      return;
    }
    setVirtualRect(anchor.getBoundingClientRect());
  }, [open, anchor]);

  return (
    <DropdownMenuPrimitive.Root open={open} onOpenChange={onOpenChange}>
      <DropdownMenuPrimitive.Trigger asChild>
        <span
          aria-hidden="true"
          style={{
            position: "fixed",
            left: virtualRect ? virtualRect.right - 8 : 0,
            top: virtualRect ? virtualRect.top + virtualRect.height / 2 : 0,
            width: 1,
            height: 1,
            pointerEvents: "none",
          }}
        />
      </DropdownMenuPrimitive.Trigger>
      <DropdownMenuPrimitive.Portal>
        <DropdownMenuPrimitive.Content
          side="right"
          align="start"
          sideOffset={6}
          collisionPadding={12}
          className={cn(
            "z-50 min-w-[200px]",
            "bg-elevated text-text",
            "border border-[color:var(--border)]",
            "rounded-[var(--radius-card)]",
            "p-1",
            "animate-slideRightAndFade",
          )}
        >
          {title ? (
            <div className="px-2 py-1 text-[11px] uppercase tracking-wider text-text-tertiary">
              {title}
            </div>
          ) : null}
          {actions.map((a) => {
            const Icon = a.icon;
            return (
              <DropdownMenuPrimitive.Item
                key={a.id}
                onSelect={(e) => {
                  e.preventDefault();
                  onOpenChange(false);
                  void a.run();
                }}
                className={cn(
                  "flex items-center gap-2 px-2 h-8 rounded-[var(--radius-input)]",
                  "text-[13px] leading-none",
                  "outline-none cursor-pointer select-none",
                  "transition-colors duration-fast ease-out-cubic",
                  a.destructive
                    ? "text-[color:var(--danger)] data-[highlighted]:bg-[color:var(--danger-subtle)]"
                    : "text-text data-[highlighted]:bg-[color-mix(in_srgb,var(--gray-12)_4%,transparent)]",
                )}
              >
                {Icon ? (
                  <Icon
                    size={14}
                    strokeWidth={1.5}
                    className="shrink-0"
                    aria-hidden="true"
                  />
                ) : null}
                <span className="flex-1 truncate">{a.label}</span>
              </DropdownMenuPrimitive.Item>
            );
          })}
        </DropdownMenuPrimitive.Content>
      </DropdownMenuPrimitive.Portal>
    </DropdownMenuPrimitive.Root>
  );
}

