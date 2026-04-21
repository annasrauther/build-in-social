"use client";

import { useEffect } from "react";
import Lenis from "lenis";

/**
 * Lenis smooth scroll, mounted once at app root.
 *
 * Gated on `prefers-reduced-motion: no-preference` — users who opt out of
 * motion get native scroll, never a degraded Lenis instance.
 *
 * Only marketing surfaces should feel this; product UI does not benefit
 * from inertial scroll and can feel laggy. We attach globally but keep
 * the duration short and disable wheelMultiplier tuning so product pages
 * feel near-native.
 */
export function SmoothScroll() {
  useEffect(() => {
    if (typeof window === "undefined") return;

    const mql = window.matchMedia("(prefers-reduced-motion: reduce)");
    if (mql.matches) return;

    const lenis = new Lenis({
      duration: 1.0,
      easing: (t) => Math.min(1, 1.001 - Math.pow(2, -10 * t)),
      smoothWheel: true,
      wheelMultiplier: 1,
      touchMultiplier: 1.2,
    });

    let rafId = 0;
    const raf = (time: number) => {
      lenis.raf(time);
      rafId = requestAnimationFrame(raf);
    };
    rafId = requestAnimationFrame(raf);

    // If the user flips the reduced-motion preference mid-session, tear down.
    const onChange = (e: MediaQueryListEvent) => {
      if (e.matches) {
        cancelAnimationFrame(rafId);
        lenis.destroy();
      }
    };
    mql.addEventListener("change", onChange);

    return () => {
      mql.removeEventListener("change", onChange);
      cancelAnimationFrame(rafId);
      lenis.destroy();
    };
  }, []);

  return null;
}
