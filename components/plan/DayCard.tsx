"use client";

import * as React from "react";
import {
  Check,
  ChevronRight,
  Lock,
} from "lucide-react";
import type { Platform } from "@/lib/types/user";
import { cn } from "@/lib/utils";
import { PLATFORM_ICON } from "@/components/video/platform-icons";

/**
 * DayCard — a single row in the weekly plan.
 *
 * 32–36px base height. Hairline grayDark.6 border. Platform icon via
 * Lucide. Iris selection treatment (accent@15% bg + 2px left-edge
 * accent bar). Tabular-nums for day + duration. No shadows.
 *
 * Click opens the VideoDrawer in place; Enter/Space also triggers.
 */

export interface DayCardVideo {
  id: string;
  title: string;
  hook: string;
  dayOfWeek: string;
  platform: Platform;
  durationSeconds: number;
  status: "draft" | "approved";
}

export interface DayCardProps {
  video: DayCardVideo;
  selected?: boolean;
  locked?: boolean;
  onOpen: (id: string) => void;
  onToggleLock?: (id: string) => void;
  /** Stagger index for reveal animation. */
  index?: number;
  className?: string;
}

export function DayCard({
  video,
  selected,
  locked,
  onOpen,
  onToggleLock,
  index = 0,
  className,
}: DayCardProps) {
  const Icon = PLATFORM_ICON[video.platform];
  const approved = video.status === "approved";

  const handleKey = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" || e.key === " ") {
      e.preventDefault();
      onOpen(video.id);
    }
  };

  return (
    <div
      role="button"
      tabIndex={0}
      aria-pressed={selected}
      onClick={() => onOpen(video.id)}
      onKeyDown={handleKey}
      className={cn(
        "group relative",
        "flex items-center gap-3",
        "h-9 px-3",
        "text-[13px] leading-none",
        "border border-[color:var(--border)]",
        "bg-surface text-text",
        "rounded-[var(--radius-card)]",
        "cursor-pointer select-none",
        "transition-[background-color,border-color] duration-fast ease-out-cubic",
        "hover:bg-[color-mix(in_srgb,var(--gray-12)_3%,var(--surface))]",
        "focus-visible:outline-2 focus-visible:outline-offset-2",
        "focus-visible:[outline-color:var(--focus-ring)]",
        selected && "is-selected",
        "animate-fade-in",
        className
      )}
      style={{ animationDelay: `${index * 40}ms` }}
    >
      {/* Day chip */}
      <span className="w-9 shrink-0 font-mono text-[11px] uppercase tracking-wider text-text-tertiary tabular-nums">
        {video.dayOfWeek}
      </span>

      {/* Platform icon */}
      <Icon
        size={14}
        className="shrink-0 text-text-secondary"
        aria-hidden="true"
      />

      {/* Title */}
      <span className="flex-1 min-w-0 truncate text-text">
        {video.title}
      </span>

      {/* Duration */}
      <span className="shrink-0 font-mono text-[11px] text-text-tertiary tabular-nums">
        {video.durationSeconds}s
      </span>

      {/* Approved dot */}
      {approved ? (
        <span
          aria-label="Approved"
          className={cn(
            "shrink-0 inline-flex h-4 w-4 items-center justify-center",
            "rounded-full",
            "text-accent"
          )}
        >
          <Check size={12} strokeWidth={2} />
        </span>
      ) : null}

      {/* Locked indicator */}
      {locked ? (
        <button
          type="button"
          onClick={(e) => {
            e.stopPropagation();
            onToggleLock?.(video.id);
          }}
          aria-label="Unlock day"
          className={cn(
            "shrink-0 inline-flex h-4 w-4 items-center justify-center",
            "text-text-tertiary hover:text-text",
            "transition-colors duration-fast ease-out-cubic"
          )}
        >
          <Lock size={12} strokeWidth={1.5} />
        </button>
      ) : null}

      {/* Open chevron */}
      <ChevronRight
        size={14}
        strokeWidth={1.5}
        className="shrink-0 text-text-tertiary opacity-0 group-hover:opacity-100 transition-opacity duration-fast ease-out-cubic"
        aria-hidden="true"
      />
    </div>
  );
}
