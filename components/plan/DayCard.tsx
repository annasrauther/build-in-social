"use client";

import * as React from "react";
import {
  Check,
  ChevronRight,
  Lock,
  MoreHorizontal,
  Pencil,
  RotateCw,
  Trash2,
  Upload,
} from "lucide-react";
import type { Platform } from "@/lib/types/user";
import { cn } from "@/lib/utils";
import { PLATFORM_ICON } from "@/components/video/platform-icons";
import {
  RowCommandMenu,
  type RowAction,
} from "@/components/ui/RowCommandMenu";

/**
 * DayCard — a single row in the weekly plan.
 *
 * Interactions (mouse + a11y):
 *  - Click / Enter / Space on the row → open drawer
 *  - Double-click title → inline rename
 *  - MoreHorizontal (·) button → row context menu (Rename, Approve,
 *    Regenerate, Publish, Lock, Reject)
 *
 * Visual: 32–36px row, hairline grayDark.6 border, iris `.is-selected`
 * treatment (accent@15% bg + 2px left accent bar), tabular-nums for
 * day + duration.
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
  onRename?: (id: string, nextTitle: string) => void;
  onRegenerate?: (id: string) => void;
  onApprove?: (id: string) => void;
  onReject?: (id: string) => void;
  onPublish?: (id: string) => void;
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
  onRename,
  onRegenerate,
  onApprove,
  onReject,
  onPublish,
  index = 0,
  className,
}: DayCardProps) {
  const Icon = PLATFORM_ICON[video.platform];
  const approved = video.status === "approved";

  const rowRef = React.useRef<HTMLDivElement | null>(null);
  const [menuOpen, setMenuOpen] = React.useState(false);

  // Inline title editing — double-click to enter.
  const [editing, setEditing] = React.useState(false);
  const [draftTitle, setDraftTitle] = React.useState(video.title);
  React.useEffect(() => setDraftTitle(video.title), [video.title]);
  const inputRef = React.useRef<HTMLInputElement | null>(null);
  React.useEffect(() => {
    if (editing && inputRef.current) {
      inputRef.current.focus();
      inputRef.current.select();
    }
  }, [editing]);

  const commitRename = () => {
    const next = draftTitle.trim();
    if (next && next !== video.title && onRename) onRename(video.id, next);
    setEditing(false);
  };
  const cancelRename = () => {
    setDraftTitle(video.title);
    setEditing(false);
  };

  // Enter / Space open the drawer (a11y baseline — not advertised
  // anywhere in the UI; this is just the native role="button" contract).
  const handleKey = (e: React.KeyboardEvent) => {
    if (editing) return;
    if (e.key === "Enter" || e.key === " ") {
      e.preventDefault();
      onOpen(video.id);
    }
  };

  const actions: RowAction[] = React.useMemo(() => {
    const list: RowAction[] = [];
    list.push({
      id: "row.open",
      label: "Open",
      icon: ChevronRight,
      run: () => onOpen(video.id),
    });
    list.push({
      id: "row.rename",
      label: "Rename",
      icon: Pencil,
      run: () => setEditing(true),
    });
    if (onApprove && !approved) {
      list.push({
        id: "row.approve",
        label: "Approve",
        icon: Check,
        run: () => onApprove(video.id),
      });
    }
    if (onRegenerate) {
      list.push({
        id: "row.regenerate",
        label: "Regenerate",
        icon: RotateCw,
        run: () => onRegenerate(video.id),
      });
    }
    if (onPublish && approved) {
      list.push({
        id: "row.publish",
        label: "Publish",
        icon: Upload,
        run: () => onPublish(video.id),
      });
    }
    if (onToggleLock) {
      list.push({
        id: "row.lock",
        label: locked ? "Unlock" : "Lock",
        icon: Lock,
        run: () => onToggleLock(video.id),
      });
    }
    if (onReject) {
      list.push({
        id: "row.reject",
        label: "Reject",
        icon: Trash2,
        destructive: true,
        run: () => onReject(video.id),
      });
    }
    return list;
  }, [
    video.id,
    approved,
    locked,
    onApprove,
    onOpen,
    onPublish,
    onRegenerate,
    onReject,
    onToggleLock,
  ]);

  return (
    <>
      <div
        ref={rowRef}
        role="button"
        tabIndex={0}
        aria-pressed={selected}
        onClick={() => !editing && onOpen(video.id)}
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
          className,
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

        {/* Title — double-click to rename inline */}
        {editing ? (
          <input
            ref={inputRef}
            value={draftTitle}
            onChange={(e) => setDraftTitle(e.target.value)}
            onClick={(e) => e.stopPropagation()}
            onKeyDown={(e) => {
              if (e.key === "Enter") {
                e.preventDefault();
                commitRename();
              } else if (e.key === "Escape") {
                e.preventDefault();
                cancelRename();
              }
              e.stopPropagation();
            }}
            onBlur={commitRename}
            className={cn(
              "flex-1 min-w-0 h-5",
              "bg-transparent text-text text-[13px] leading-none",
              "outline-none focus:outline-none",
              "border-b border-[color:var(--accent)]",
              "tabular-nums",
            )}
          />
        ) : (
          <span
            className="flex-1 min-w-0 truncate text-text"
            onDoubleClick={(e) => {
              e.stopPropagation();
              setEditing(true);
            }}
          >
            {video.title}
          </span>
        )}

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
              "text-accent",
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
              "transition-colors duration-fast ease-out-cubic",
            )}
          >
            <Lock size={12} strokeWidth={1.5} />
          </button>
        ) : null}

        {/* MoreHorizontal → row context menu */}
        <button
          type="button"
          onClick={(e) => {
            e.stopPropagation();
            setMenuOpen(true);
          }}
          aria-label="More actions"
          className={cn(
            "shrink-0 inline-flex h-4 w-4 items-center justify-center",
            "text-text-tertiary hover:text-text",
            "opacity-0 group-hover:opacity-100 transition-opacity duration-fast ease-out-cubic",
            "focus-visible:opacity-100 focus-visible:outline-2 focus-visible:outline-offset-2",
            "focus-visible:[outline-color:var(--focus-ring)] rounded-[3px]",
          )}
        >
          <MoreHorizontal size={12} strokeWidth={1.5} />
        </button>

        {/* Open chevron (mouse-hover affordance) */}
        <ChevronRight
          size={14}
          strokeWidth={1.5}
          className="shrink-0 text-text-tertiary opacity-0 group-hover:opacity-100 transition-opacity duration-fast ease-out-cubic"
          aria-hidden="true"
        />
      </div>

      <RowCommandMenu
        open={menuOpen}
        onOpenChange={setMenuOpen}
        anchor={rowRef.current}
        actions={actions}
        title={
          <span className="flex items-center gap-1">
            <span>{video.dayOfWeek}</span>
            <span aria-hidden="true">·</span>
            <span>{video.platform}</span>
          </span>
        }
      />
    </>
  );
}
