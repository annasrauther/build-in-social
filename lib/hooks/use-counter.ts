"use client";

import { useEffect, useRef, useState } from "react";

interface UseCounterOptions {
  target: number;
  duration?: number;
  enabled?: boolean;
  prefix?: string;
  suffix?: string;
}

function easeOut(t: number): number {
  return 1 - Math.pow(1 - t, 3);
}

export function useCounter({
  target,
  duration = 800,
  enabled = false,
  prefix = "",
  suffix = "",
}: UseCounterOptions): { value: number; displayValue: string } {
  const [value, setValue] = useState(0);
  const rafRef = useRef<number | null>(null);
  const startTimeRef = useRef<number | null>(null);
  const hasStartedRef = useRef(false);

  useEffect(() => {
    if (!enabled || hasStartedRef.current) return;
    hasStartedRef.current = true;

    const animate = (timestamp: number) => {
      if (startTimeRef.current === null) {
        startTimeRef.current = timestamp;
      }
      const elapsed = timestamp - startTimeRef.current;
      const progress = Math.min(elapsed / duration, 1);
      const eased = easeOut(progress);
      const current = Math.round(eased * target);

      setValue(current);

      if (progress < 1) {
        rafRef.current = requestAnimationFrame(animate);
      } else {
        setValue(target);
      }
    };

    rafRef.current = requestAnimationFrame(animate);

    return () => {
      if (rafRef.current !== null) {
        cancelAnimationFrame(rafRef.current);
      }
    };
  }, [enabled, target, duration]);

  const displayValue = `${prefix}${value}${suffix}`;
  return { value, displayValue };
}
