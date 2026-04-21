"use client";

import * as React from "react";
import { Slot } from "@radix-ui/react-slot";
import { tv, type VariantProps } from "tailwind-variants";
import { cn } from "@/lib/utils";

/**
 * Button — Raycast-style.
 *
 * Every button across marketing, onboarding, product, and dashboard
 * shares the same surface treatment (gradient + inset top highlight +
 * hairline border + 1px bottom shadow). Variant colors swap; the
 * "physical plate" geometry stays identical.
 *
 * The surface CSS lives in `app/globals.css` under
 * `.btn-raycast-{primary|secondary|ghost|outline|danger}`. Keeping it
 * there means the Tremor Button shim (`components/tremor/Button.tsx`)
 * can reuse the exact same classes without a second implementation.
 */

const buttonStyles = tv({
  base: [
    // Layout
    "inline-flex items-center justify-center gap-1.5 whitespace-nowrap",
    // Typography
    "text-[13px] font-medium leading-none [letter-spacing:-0.005em]",
    "font-[family-name:var(--font-sans)]",
    // Geometry
    "rounded-[var(--radius-input)]",
    // Motion
    "transition-[background-color,color,transform,box-shadow,filter] duration-fast ease-out-cubic",
    // A11y
    "focus-visible:outline-2 focus-visible:outline-offset-2",
    "focus-visible:[outline-color:var(--focus-ring)]",
    // Reset
    "select-none cursor-pointer",
  ],
  variants: {
    variant: {
      primary: "btn-raycast-primary",
      secondary: "btn-raycast-secondary",
      ghost: "btn-raycast-ghost",
      outline: "btn-raycast-outline",
      danger: "btn-raycast-danger",
      // Text-only link style — no plate, no border. Used for tertiary
      // affordances next to a primary (e.g. "See pricing").
      link: [
        "bg-transparent text-accent border-0",
        "underline-offset-4 hover:underline",
        "px-0",
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

export type ButtonVariant = NonNullable<
  VariantProps<typeof buttonStyles>["variant"]
>;
export type ButtonSize = NonNullable<
  VariantProps<typeof buttonStyles>["size"]
>;

export type ButtonProps = Omit<
  React.ButtonHTMLAttributes<HTMLButtonElement>,
  "color"
> &
  VariantProps<typeof buttonStyles> & {
    asChild?: boolean;
  };

export const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  function Button(
    { className, variant, size, asChild, children, type, ...props },
    ref,
  ) {
    const Comp = asChild ? Slot : "button";
    return (
      <Comp
        ref={ref}
        // Native <button> defaults to type="submit" inside a form —
        // nobody ever means that; default to "button".
        type={asChild ? undefined : type ?? "button"}
        className={cn(buttonStyles({ variant, size }), className)}
        {...props}
      >
        {children}
      </Comp>
    );
  },
);
