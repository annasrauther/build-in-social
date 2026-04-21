"use client";

import * as React from "react";
import { Slot } from "@radix-ui/react-slot";
import { tv, type VariantProps } from "tailwind-variants";
import { cn } from "@/lib/utils";

const buttonStyles = tv({
  base: [
    "inline-flex items-center justify-center gap-1.5",
    "text-[13px] font-medium leading-none",
    "rounded-[var(--radius-input)]",
    "transition-colors duration-fast ease-out-cubic",
    "disabled:pointer-events-none disabled:opacity-50",
    "focus-visible:outline-2 focus-visible:outline-offset-2",
    "focus-visible:[outline-color:var(--focus-ring)]",
    "select-none",
  ],
  variants: {
    variant: {
      primary: [
        "bg-accent text-accent-fg",
        "hover:bg-accent-hover",
      ],
      secondary: [
        "bg-elevated text-text",
        "hover:bg-[var(--gray-4)]",
        "border border-[color:var(--border)]",
      ],
      ghost: [
        "bg-transparent text-text",
        "hover:bg-[color-mix(in_srgb,var(--gray-12)_4%,transparent)]",
      ],
      outline: [
        "bg-transparent text-text",
        "border border-[color:var(--border)]",
        "hover:bg-[color-mix(in_srgb,var(--gray-12)_4%,transparent)]",
      ],
      danger: [
        "bg-[color:var(--danger)] text-white",
        "hover:brightness-110",
      ],
      link: [
        "bg-transparent text-accent underline-offset-4",
        "hover:underline",
      ],
    },
    size: {
      sm: "h-7 px-2.5 text-[12px]",
      md: "h-8 px-3",
      lg: "h-9 px-4 text-[14px]",
      icon: "h-8 w-8 p-0",
    },
  },
  defaultVariants: {
    variant: "primary",
    size: "md",
  },
});

export type ButtonProps = React.ButtonHTMLAttributes<HTMLButtonElement> &
  VariantProps<typeof buttonStyles> & {
    asChild?: boolean;
    /** Keyboard shortcut hint rendered on the right (e.g. "⌘K"). */
    shortcut?: React.ReactNode;
  };

export const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  function Button(
    { className, variant, size, asChild, shortcut, children, ...props },
    ref
  ) {
    // With asChild, Radix Slot requires exactly one child element. We can't
    // append the shortcut <kbd> as a sibling — instead we shove it into the
    // single child's children when we know it's a valid element.
    if (asChild) {
      const singleChild = React.Children.only(children);
      if (React.isValidElement(singleChild) && shortcut) {
        const merged = React.cloneElement(
          singleChild,
          singleChild.props as Record<string, unknown>,
          <>
            {(singleChild.props as { children?: React.ReactNode }).children}
            <kbd className="ml-1.5 inline-flex items-center font-mono text-[11px] text-text-tertiary">
              {shortcut}
            </kbd>
          </>
        );
        return (
          <Slot
            ref={ref}
            className={cn(buttonStyles({ variant, size }), className)}
            {...props}
          >
            {merged}
          </Slot>
        );
      }
      return (
        <Slot
          ref={ref}
          className={cn(buttonStyles({ variant, size }), className)}
          {...props}
        >
          {singleChild}
        </Slot>
      );
    }

    return (
      <button
        ref={ref}
        className={cn(buttonStyles({ variant, size }), className)}
        {...props}
      >
        {children}
        {shortcut ? (
          <kbd className="ml-1.5 inline-flex items-center font-mono text-[11px] text-text-tertiary">
            {shortcut}
          </kbd>
        ) : null}
      </button>
    );
  }
);
