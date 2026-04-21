"use client";

import * as React from "react";
import { cn } from "@/lib/utils";

/**
 * Loading skeletons matching the real layout, staggered at 40ms.
 *
 * Rules: never spinners for data loading. Skeletons should roughly
 * mirror the shape of the real content so there's no layout shift
 * on resolution.
 */

export interface SkeletonProps extends React.HTMLAttributes<HTMLDivElement> {
  /** Tailwind size + shape classes. */
  className?: string;
  /** 0-indexed reveal order; each step adds 40ms of delay. */
  index?: number;
}

export function Skeleton({ className, index = 0, style, ...props }: SkeletonProps) {
  return (
    <div
      className={cn(
        "skeleton-line",
        "bg-[color-mix(in_srgb,var(--gray-12)_6%,transparent)]",
        "rounded-[4px]",
        "animate-fade-in",
        className
      )}
      style={{
        ...style,
        animationDelay: `${index * 40}ms`,
      }}
      aria-hidden="true"
      {...props}
    />
  );
}

/**
 * A stack of `rows` skeleton rows — common enough to deserve a helper.
 */
export function SkeletonRows({
  rows = 4,
  height = 32,
  gap = 8,
  className,
}: {
  rows?: number;
  height?: number;
  gap?: number;
  className?: string;
}) {
  return (
    <div
      className={cn("flex flex-col", className)}
      style={{ gap }}
      role="status"
      aria-label="Loading"
    >
      {Array.from({ length: rows }).map((_, i) => (
        <Skeleton key={i} index={i} style={{ height }} className="w-full" />
      ))}
    </div>
  );
}
