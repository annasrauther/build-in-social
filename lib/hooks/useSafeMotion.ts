"use client";

import { useReducedMotion } from "framer-motion";
import type { Transition } from "framer-motion";

/**
 * Reduced-motion-aware helpers for Framer Motion.
 *
 * `useReducedMotion()` reads the user's OS-level `prefers-reduced-motion`
 * setting. When enabled, motion animations should resolve to their final
 * state instantly — no slides, springs, or lingering fades.
 *
 * Usage:
 *   const { reduced, transition, slide } = useSafeMotion();
 *   <motion.div transition={transition({ duration: 0.3 })} ... />
 *
 * - `reduced` — boolean; true when the user prefers reduced motion.
 * - `transition(base)` — wraps a base `Transition`; returns a zero-duration
 *   equivalent when reduced motion is on.
 * - `slide(offsetPx)` — returns `{ x }` offset for directional slides; 0 when
 *   reduced.
 */
export interface SafeMotionHelpers {
  reduced: boolean;
  transition: (base?: Transition) => Transition;
  slide: (offsetPx: number) => number;
}

export function useSafeMotion(): SafeMotionHelpers {
  const reduced = useReducedMotion() ?? false;

  function transition(base: Transition = {}): Transition {
    if (!reduced) return base;
    // Force instant resolution for any animated property.
    return { duration: 0 };
  }

  function slide(offsetPx: number): number {
    return reduced ? 0 : offsetPx;
  }

  return { reduced, transition, slide };
}
