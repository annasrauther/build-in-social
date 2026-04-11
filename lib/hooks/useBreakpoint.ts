"use client";

import { useState, useEffect, useMemo } from "react";

/** Breakpoint tiers matching the @theme block in globals.css */
const BREAKPOINTS = {
  "mobile-sm": 375,
  "mobile-md": 390,
  "mobile-lg": 428,
  "tablet-sm": 768,
  "tablet-md": 834,
  "tablet-lg": 1024,
  "desktop-sm": 1280,
  "desktop-md": 1440,
  "desktop-lg": 1920,
} as const;

export type BreakpointKey = keyof typeof BREAKPOINTS;

interface BreakpointState {
  /** Current active breakpoint (largest that matches) */
  current: BreakpointKey;
  /** Below tablet-sm (768px) */
  isMobile: boolean;
  /** tablet-sm to below tablet-lg (768px–1023px) */
  isTablet: boolean;
  /** tablet-lg and above (1024px+) */
  isDesktop: boolean;
}

const DEFAULT_STATE: BreakpointState = {
  current: "mobile-sm",
  isMobile: true,
  isTablet: false,
  isDesktop: false,
};

function computeState(width: number): BreakpointState {
  let current: BreakpointKey = "mobile-sm";
  const entries = Object.entries(BREAKPOINTS) as [BreakpointKey, number][];
  for (const [key, value] of entries) {
    if (width >= value) current = key;
  }
  return {
    current,
    isMobile: width < BREAKPOINTS["tablet-sm"],
    isTablet: width >= BREAKPOINTS["tablet-sm"] && width < BREAKPOINTS["tablet-lg"],
    isDesktop: width >= BREAKPOINTS["tablet-lg"],
  };
}

/**
 * Returns the current breakpoint tier and boolean helpers.
 * Hydration-safe: defaults to mobile on the server.
 * Uses matchMedia listeners for performance (no resize events).
 */
export function useBreakpoint(): BreakpointState {
  const [state, setState] = useState<BreakpointState>(DEFAULT_STATE);

  const queries = useMemo(() => {
    if (typeof window === "undefined") return [];
    const entries = Object.entries(BREAKPOINTS) as [BreakpointKey, number][];
    return entries.map(([, value]) => window.matchMedia(`(min-width: ${value}px)`));
  }, []);

  useEffect(() => {
    if (typeof window === "undefined") return;

    const update = () => setState(computeState(window.innerWidth));
    update(); // initial state

    const listeners = queries.map((mq) => {
      const handler = () => update();
      mq.addEventListener("change", handler);
      return { mq, handler };
    });

    return () => {
      listeners.forEach(({ mq, handler }) =>
        mq.removeEventListener("change", handler)
      );
    };
  }, [queries]);

  return state;
}
