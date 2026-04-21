"use client";

import * as React from "react";
import * as DialogPrimitive from "@radix-ui/react-dialog";
import { X } from "lucide-react";
import { cn } from "@/lib/utils";
import { DialogOverlay, DialogPortal } from "./dialog";

/**
 * Right-side drawer built on Radix Dialog primitives. Used for the
 * F3 video-drawer pattern: click a day in the weekly plan to open a
 * video drawer without a route change.
 *
 * Accepts `side="right" | "left"` (default right). Width is 420–520px.
 */

export const Drawer = DialogPrimitive.Root;
export const DrawerTrigger = DialogPrimitive.Trigger;
export const DrawerClose = DialogPrimitive.Close;

export const DrawerContent = React.forwardRef<
  React.ComponentRef<typeof DialogPrimitive.Content>,
  React.ComponentPropsWithoutRef<typeof DialogPrimitive.Content> & {
    side?: "right" | "left";
    /** Drawer width — defaults to `clamp(360px, 40vw, 520px)`. */
    width?: string;
    showClose?: boolean;
  }
>(function DrawerContent(
  { className, children, side = "right", width, showClose = true, ...props },
  ref
) {
  const alignment =
    side === "right"
      ? "right-0 border-l"
      : "left-0 border-r";
  const enter =
    side === "right"
      ? "data-[state=open]:animate-drawerSlideLeftAndFade"
      : "";
  return (
    <DialogPortal>
      <DialogOverlay />
      <DialogPrimitive.Content
        ref={ref}
        style={{ width: width ?? "clamp(360px, 40vw, 520px)" }}
        className={cn(
          "fixed top-0 z-50 h-[100dvh]",
          alignment,
          "bg-surface text-text border-[color:var(--border)]",
          "focus:outline-none",
          "flex flex-col",
          enter,
          className
        )}
        {...props}
      >
        {children}
        {showClose ? (
          <DialogPrimitive.Close
            className={cn(
              "absolute right-3 top-3 inline-flex h-7 w-7 items-center justify-center",
              "rounded-[var(--radius-input)] text-text-tertiary",
              "hover:text-text hover:bg-[color-mix(in_srgb,var(--gray-12)_4%,transparent)]",
              "transition-colors duration-fast ease-out-cubic",
              "focus-visible:outline-2 focus-visible:outline-offset-2",
              "focus-visible:[outline-color:var(--focus-ring)]"
            )}
            aria-label="Close"
          >
            <X size={16} strokeWidth={1.5} aria-hidden="true" />
          </DialogPrimitive.Close>
        ) : null}
      </DialogPrimitive.Content>
    </DialogPortal>
  );
});

export function DrawerHeader({
  className,
  ...props
}: React.HTMLAttributes<HTMLDivElement>) {
  return (
    <div
      className={cn(
        "flex items-start gap-3 p-4 pr-12 border-b border-[color:var(--divider)]",
        className
      )}
      {...props}
    />
  );
}

export function DrawerBody({
  className,
  ...props
}: React.HTMLAttributes<HTMLDivElement>) {
  return (
    <div
      className={cn("flex-1 overflow-y-auto p-4", className)}
      {...props}
    />
  );
}

export function DrawerFooter({
  className,
  ...props
}: React.HTMLAttributes<HTMLDivElement>) {
  return (
    <div
      className={cn(
        "flex items-center justify-between gap-2 p-3 border-t border-[color:var(--divider)] bg-surface",
        className
      )}
      {...props}
    />
  );
}

export const DrawerTitle = React.forwardRef<
  React.ComponentRef<typeof DialogPrimitive.Title>,
  React.ComponentPropsWithoutRef<typeof DialogPrimitive.Title>
>(function DrawerTitle({ className, ...props }, ref) {
  return (
    <DialogPrimitive.Title
      ref={ref}
      className={cn(
        "text-[14px] font-medium leading-tight text-text tracking-[-0.01em]",
        className
      )}
      {...props}
    />
  );
});

export const DrawerDescription = React.forwardRef<
  React.ComponentRef<typeof DialogPrimitive.Description>,
  React.ComponentPropsWithoutRef<typeof DialogPrimitive.Description>
>(function DrawerDescription({ className, ...props }, ref) {
  return (
    <DialogPrimitive.Description
      ref={ref}
      className={cn("text-[12px] text-text-secondary leading-snug", className)}
      {...props}
    />
  );
});
