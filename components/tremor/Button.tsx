// Tremor Button — now a compatibility shim around the Raycast-style
// shadcn Button. Kept at this import path so the 40+ legacy callers
// inherit the new look without touching each file.
//
// Variant mapping:
//   Tremor primary      → shadcn primary
//   Tremor secondary    → shadcn secondary
//   Tremor light        → shadcn outline   (transparent bg + hairline border)
//   Tremor ghost        → shadcn ghost
//   Tremor destructive  → shadcn danger
//
// Tremor's `isLoading` prop resolves to `disabled`; we don't render
// spinners for user-initiated actions per the design rules (see
// CLAUDE.md → Interaction rules → Mutations). Callers that relied on
// the spinner should switch to optimistic updates + toast.undo.

"use client";

import * as React from "react";
import {
  Button as RaycastButton,
  type ButtonProps as RaycastButtonProps,
  type ButtonVariant,
} from "@/components/ui/shadcn/button";

type TremorVariant =
  | "primary"
  | "secondary"
  | "light"
  | "ghost"
  | "destructive";

const VARIANT_MAP: Record<TremorVariant, ButtonVariant> = {
  primary: "primary",
  secondary: "secondary",
  light: "outline",
  ghost: "ghost",
  destructive: "danger",
};

export interface TremorButtonProps
  extends Omit<RaycastButtonProps, "variant"> {
  variant?: TremorVariant;
  /** Tremor legacy prop — disables the button. No spinner. */
  isLoading?: boolean;
  loadingText?: string;
}

export const Button = React.forwardRef<HTMLButtonElement, TremorButtonProps>(
  function Button(
    {
      variant = "primary",
      isLoading,
      loadingText,
      disabled,
      children,
      ...rest
    },
    ref,
  ) {
    const mapped = VARIANT_MAP[variant];
    return (
      <RaycastButton
        ref={ref}
        variant={mapped}
        disabled={disabled || isLoading}
        {...rest}
      >
        {isLoading && loadingText ? loadingText : children}
      </RaycastButton>
    );
  },
);

// Re-export the Raycast Button's variants + types in case anything
// imported the Tremor-specific types directly.
export type ButtonProps = TremorButtonProps;
export type { ButtonVariant };
