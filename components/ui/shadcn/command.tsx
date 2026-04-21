"use client";

import * as React from "react";
import { Command as CommandPrimitive } from "cmdk";
import { Search } from "lucide-react";
import * as DialogPrimitive from "@radix-ui/react-dialog";
import { cn } from "@/lib/utils";
import { DialogOverlay, DialogPortal } from "./dialog";

/**
 * cmdk primitives wired to our tokens. See `CommandPalette.tsx` for the
 * mounted ⌘K shell that consumes these.
 */

export const Command = React.forwardRef<
  React.ComponentRef<typeof CommandPrimitive>,
  React.ComponentPropsWithoutRef<typeof CommandPrimitive>
>(function Command({ className, ...props }, ref) {
  return (
    <CommandPrimitive
      ref={ref}
      className={cn(
        "flex h-full w-full flex-col overflow-hidden",
        "bg-surface text-text",
        "rounded-[var(--radius-modal)]",
        className
      )}
      {...props}
    />
  );
});

export interface CommandDialogProps extends DialogPrimitive.DialogProps {
  children: React.ReactNode;
}

export function CommandDialog({ children, ...props }: CommandDialogProps) {
  return (
    <DialogPrimitive.Root {...props}>
      <DialogPortal>
        <DialogOverlay />
        <DialogPrimitive.Content
          className={cn(
            "fixed left-1/2 top-[12%] z-50 -translate-x-1/2",
            "w-full max-w-[640px]",
            "bg-surface text-text",
            "border border-[color:var(--border)]",
            "rounded-[var(--radius-modal)]",
            "overflow-hidden",
            "animate-dialogContentShow",
            "focus:outline-none"
          )}
        >
          <DialogPrimitive.Title className="sr-only">
            Command palette
          </DialogPrimitive.Title>
          <DialogPrimitive.Description className="sr-only">
            Search for actions, pages, and objects. Use arrow keys to navigate.
          </DialogPrimitive.Description>
          <Command>{children}</Command>
        </DialogPrimitive.Content>
      </DialogPortal>
    </DialogPrimitive.Root>
  );
}

export const CommandInput = React.forwardRef<
  React.ComponentRef<typeof CommandPrimitive.Input>,
  React.ComponentPropsWithoutRef<typeof CommandPrimitive.Input>
>(function CommandInput({ className, ...props }, ref) {
  return (
    <div
      className="flex items-center gap-2 border-b border-[color:var(--divider)] px-3"
      cmdk-input-wrapper=""
    >
      <Search
        size={16}
        strokeWidth={1.5}
        className="text-text-tertiary shrink-0"
        aria-hidden="true"
      />
      <CommandPrimitive.Input
        ref={ref}
        className={cn(
          "flex h-11 w-full",
          "bg-transparent text-text text-[14px] leading-none",
          "placeholder:text-text-tertiary",
          "outline-none focus:outline-none",
          "disabled:cursor-not-allowed disabled:opacity-50",
          className
        )}
        {...props}
      />
    </div>
  );
});

export const CommandList = React.forwardRef<
  React.ComponentRef<typeof CommandPrimitive.List>,
  React.ComponentPropsWithoutRef<typeof CommandPrimitive.List>
>(function CommandList({ className, ...props }, ref) {
  return (
    <CommandPrimitive.List
      ref={ref}
      className={cn("max-h-[420px] overflow-y-auto p-1.5", className)}
      {...props}
    />
  );
});

export const CommandEmpty = React.forwardRef<
  React.ComponentRef<typeof CommandPrimitive.Empty>,
  React.ComponentPropsWithoutRef<typeof CommandPrimitive.Empty>
>(function CommandEmpty({ className, ...props }, ref) {
  return (
    <CommandPrimitive.Empty
      ref={ref}
      className={cn(
        "py-8 text-center text-[13px] text-text-tertiary",
        className
      )}
      {...props}
    />
  );
});

export const CommandGroup = React.forwardRef<
  React.ComponentRef<typeof CommandPrimitive.Group>,
  React.ComponentPropsWithoutRef<typeof CommandPrimitive.Group>
>(function CommandGroup({ className, ...props }, ref) {
  return (
    <CommandPrimitive.Group
      ref={ref}
      className={cn(
        "text-text",
        "[&_[cmdk-group-heading]]:px-2 [&_[cmdk-group-heading]]:py-1.5",
        "[&_[cmdk-group-heading]]:text-[11px] [&_[cmdk-group-heading]]:uppercase",
        "[&_[cmdk-group-heading]]:tracking-wider",
        "[&_[cmdk-group-heading]]:text-text-tertiary",
        className
      )}
      {...props}
    />
  );
});

export const CommandSeparator = React.forwardRef<
  React.ComponentRef<typeof CommandPrimitive.Separator>,
  React.ComponentPropsWithoutRef<typeof CommandPrimitive.Separator>
>(function CommandSeparator({ className, ...props }, ref) {
  return (
    <CommandPrimitive.Separator
      ref={ref}
      className={cn("my-1 h-px bg-[color:var(--divider)]", className)}
      {...props}
    />
  );
});

export const CommandItem = React.forwardRef<
  React.ComponentRef<typeof CommandPrimitive.Item>,
  React.ComponentPropsWithoutRef<typeof CommandPrimitive.Item> & {
    shortcut?: React.ReactNode;
  }
>(function CommandItem({ className, children, shortcut, ...props }, ref) {
  return (
    <CommandPrimitive.Item
      ref={ref}
      className={cn(
        "flex items-center gap-2 px-2 h-8",
        "text-[13px] leading-none text-text",
        "rounded-[var(--radius-input)]",
        "cursor-pointer select-none",
        "outline-none",
        "transition-colors duration-fast ease-out-cubic",
        "data-[selected=true]:bg-accent-subtle",
        "data-[selected=true]:text-text",
        "data-[disabled=true]:pointer-events-none data-[disabled=true]:opacity-50",
        className
      )}
      {...props}
    >
      <span className="flex-1 truncate flex items-center gap-2">{children}</span>
      {shortcut ? (
        <kbd className="font-mono text-[11px] text-text-tertiary">
          {shortcut}
        </kbd>
      ) : null}
    </CommandPrimitive.Item>
  );
});

export const CommandShortcut = ({
  className,
  ...props
}: React.HTMLAttributes<HTMLSpanElement>) => {
  return (
    <span
      className={cn(
        "ml-auto font-mono text-[11px] text-text-tertiary",
        className
      )}
      {...props}
    />
  );
};
