"use client";

import { useState, useCallback } from "react";
import {
  DndContext,
  DragEndEvent,
  DragOverEvent,
  DragStartEvent,
  useDroppable,
  useDraggable,
  DragOverlay,
  closestCenter,
} from "@dnd-kit/core";
import { motion, AnimatePresence } from "motion/react";
import { cx } from "@/lib/utils";
import { APP } from "@/content/app";
import type { ScheduledVideo } from "@/lib/types/schedule";

// ── Constants ─────────────────────────────────────────────────────────────────

const DAYS = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"] as const;
type Day = (typeof DAYS)[number];
type ColumnId = Day | "Unscheduled";

const PLATFORM_PILL: Record<string, string> = {
  youtube: "text-[#FF0000] bg-[rgba(255,0,0,0.08)]",
  instagram: "text-[#E1306C] bg-[rgba(225,48,108,0.08)]",
  linkedin: "text-[#0A66C2] bg-[rgba(10,102,194,0.08)]",
  x: "text-[color:var(--text-secondary)] bg-[color:var(--bg-elevated)]",
};

const PLATFORM_LABEL: Record<string, string> = {
  youtube: "YT",
  instagram: "IG",
  linkedin: "LI",
  x: "X",
};

const STATUS_DOT: Record<string, string> = {
  draft: "bg-[color:var(--text-tertiary)]",
  approved: "bg-[color:var(--accent-green)]",
  rendering: "bg-amber-400",
  ready: "bg-[color:var(--accent-green)]",
  posted: "bg-blue-400",
  failed: "bg-red-500",
};

// ── VideoCard ─────────────────────────────────────────────────────────────────

function VideoCard({
  video,
  isDragging = false,
}: {
  video: ScheduledVideo;
  isDragging?: boolean;
}) {
  const { attributes, listeners, setNodeRef, transform } = useDraggable({
    id: video.videoId,
  });

  const style = transform
    ? { transform: `translate(${transform.x}px, ${transform.y}px)` }
    : undefined;

  return (
    <div
      ref={setNodeRef}
      style={style}
      {...listeners}
      {...attributes}
      className={cx(
        "group relative rounded-[var(--radius-md)] border px-3 py-2.5 cursor-grab active:cursor-grabbing select-none touch-none",
        "border-[color:var(--border-default)] bg-[color:var(--bg-surface)]",
        "shadow-[var(--shadow-sm)] transition-shadow duration-150",
        "hover:shadow-[var(--shadow-md)] hover:border-brand-500/30",
        isDragging ? "opacity-40" : "opacity-100",
        "min-h-[44px]"
      )}
      aria-label={APP.PLAN_UI.scheduledDay(video.scheduledDay ?? "unknown")}
      role="button"
      tabIndex={0}
    >
      <div className="flex items-center gap-1.5 mb-1">
        <span
          className={cx(
            "text-[10px] font-bold uppercase tracking-wider px-1.5 py-0.5 rounded-full",
            PLATFORM_PILL[video.platform] ?? "text-gray-500 bg-gray-100"
          )}
        >
          {PLATFORM_LABEL[video.platform] ?? video.platform}
        </span>
        <span
          className={cx(
            "ml-auto h-1.5 w-1.5 rounded-full shrink-0",
            STATUS_DOT[video.status] ?? "bg-gray-300"
          )}
          aria-hidden="true"
        />
      </div>
      <p className="text-[12px] font-medium leading-[1.4] text-[color:var(--text-primary)] truncate">
        {video.title}
      </p>
    </div>
  );
}

// ── Drag Overlay card (shown while dragging) ──────────────────────────────────

function VideoCardOverlay({ video }: { video: ScheduledVideo }) {
  return (
    <div
      className={cx(
        "rounded-[var(--radius-md)] border px-3 py-2.5 cursor-grabbing select-none",
        "border-brand-500/40 bg-[color:var(--bg-surface)]",
        "shadow-[0_8px_24px_rgba(217,119,87,0.2)] ring-1 ring-brand-500/30",
        "min-h-[44px] opacity-95 rotate-[1.5deg] w-[140px]"
      )}
    >
      <div className="flex items-center gap-1.5 mb-1">
        <span
          className={cx(
            "text-[10px] font-bold uppercase tracking-wider px-1.5 py-0.5 rounded-full",
            PLATFORM_PILL[video.platform] ?? "text-gray-500 bg-gray-100"
          )}
        >
          {PLATFORM_LABEL[video.platform] ?? video.platform}
        </span>
        <span
          className={cx(
            "ml-auto h-1.5 w-1.5 rounded-full shrink-0",
            STATUS_DOT[video.status] ?? "bg-gray-300"
          )}
          aria-hidden="true"
        />
      </div>
      <p className="text-[12px] font-medium leading-[1.4] text-[color:var(--text-primary)] truncate">
        {video.title}
      </p>
    </div>
  );
}

// ── DayColumn ─────────────────────────────────────────────────────────────────

function DayColumn({
  day,
  videos,
  isDragActive,
  activeVideoId,
}: {
  day: ColumnId;
  videos: ScheduledVideo[];
  isDragActive: boolean;
  activeVideoId: string | null;
}) {
  const { setNodeRef, isOver } = useDroppable({ id: day });

  return (
    <div
      ref={setNodeRef}
      className={cx(
        "flex flex-col gap-2 rounded-[var(--radius-lg)] p-2 min-h-[120px] transition-all duration-150",
        "border",
        isOver && isDragActive
          ? "bg-brand-500/10 ring-1 ring-brand-500 border-brand-500/20"
          : isDragActive
          ? "bg-[color:var(--bg-elevated)]/30 border-[color:var(--border-subtle)]"
          : "border-transparent"
      )}
    >
      <AnimatePresence initial={false}>
        {videos.map((v) => (
          <motion.div
            key={v.videoId}
            layout
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.9 }}
            transition={{ duration: 0.18, ease: [0.16, 1, 0.3, 1] }}
          >
            <VideoCard video={v} isDragging={v.videoId === activeVideoId} />
          </motion.div>
        ))}
      </AnimatePresence>

      {isDragActive && isOver && (
        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="text-center text-[11px] text-brand-500 font-medium py-2"
        >
          {APP.PLAN_UI.dropToSchedule}
        </motion.p>
      )}

      {videos.length === 0 && !isDragActive && (
        <p className="text-center text-[11px] text-[color:var(--text-tertiary)] py-3 select-none">
          &mdash;
        </p>
      )}
    </div>
  );
}

// ── Toast ─────────────────────────────────────────────────────────────────────

function RescheduleToast({ message }: { message: string | null }) {
  return (
    <AnimatePresence>
      {message && (
        <motion.div
          key={message}
          initial={{ opacity: 0, y: 8, scale: 0.97 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          exit={{ opacity: 0, y: -4, scale: 0.97 }}
          transition={{ duration: 0.2 }}
          className="fixed bottom-6 right-6 z-50 rounded-[var(--radius-md)] bg-[color:var(--bg-surface)] border border-[color:var(--border-default)] shadow-[var(--shadow-lg)] px-4 py-2.5 text-[13px] font-medium text-[color:var(--text-primary)]"
        >
          {message}
        </motion.div>
      )}
    </AnimatePresence>
  );
}

// ── WeekCalendar ──────────────────────────────────────────────────────────────

export interface WeekCalendarProps {
  initialVideos: ScheduledVideo[];
}

export function WeekCalendar({ initialVideos }: WeekCalendarProps) {
  const [videos, setVideos] = useState<ScheduledVideo[]>(initialVideos);
  const [activeVideoId, setActiveVideoId] = useState<string | null>(null);
  const [isDragActive, setIsDragActive] = useState(false);
  const [toast, setToast] = useState<string | null>(null);
  const [toastKey, setToastKey] = useState(0);

  const activeVideo = activeVideoId
    ? videos.find((v) => v.videoId === activeVideoId) ?? null
    : null;

  const getVideosForDay = useCallback(
    (day: ColumnId) => {
      if (day === "Unscheduled") {
        return videos.filter((v) => !v.scheduledDay);
      }
      return videos.filter((v) => v.scheduledDay === day);
    },
    [videos]
  );

  function showToast(message: string) {
    setToast(message);
    setToastKey((k) => k + 1);
    setTimeout(() => setToast(null), 2500);
  }

  function handleDragStart(event: DragStartEvent) {
    setActiveVideoId(String(event.active.id));
    setIsDragActive(true);
  }

  function handleDragOver(_event: DragOverEvent) {
    // Visual feedback handled by isOver in DayColumn
  }

  async function handleDragEnd(event: DragEndEvent) {
    setActiveVideoId(null);
    setIsDragActive(false);

    const { active, over } = event;
    if (!over) return;

    const videoId = String(active.id);
    const newDay = String(over.id) as ColumnId;

    const video = videos.find((v) => v.videoId === videoId);
    if (!video) return;
    if ((video.scheduledDay ?? "Unscheduled") === newDay) return;

    // Snapshot for potential revert
    const previous = videos;

    // Optimistic update
    setVideos((prev) =>
      prev.map((v) => {
        if (v.videoId !== videoId) return v;
        if (newDay === "Unscheduled") {
          const { scheduledDay: _removed, ...rest } = v;
          return rest as ScheduledVideo;
        }
        return { ...v, scheduledDay: newDay as ScheduledVideo["scheduledDay"] };
      })
    );

    const dayLabel = newDay === "Unscheduled" ? APP.PLAN_UI.unscheduled : newDay;
    showToast(APP.PLAN_UI.scheduledDay(dayLabel));

    try {
      const res = await fetch("/api/schedule/update", {
        method: "PATCH",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({
          videoId,
          scheduledDay: newDay === "Unscheduled" ? "" : newDay,
        }),
      });
      if (!res.ok) throw new Error("failed");
    } catch {
      // Revert optimistic update
      setVideos(previous);
      showToast("Couldn\u2019t reschedule \u2014 try again.");
    }
  }

  const _allColumns: ColumnId[] = [...DAYS, "Unscheduled"];

  return (
    <DndContext
      collisionDetection={closestCenter}
      onDragStart={handleDragStart}
      onDragOver={handleDragOver}
      onDragEnd={handleDragEnd}
    >
      {/* Mobile: horizontal scroll snap; Desktop: 8-column grid (7 days + Unscheduled) */}
      <div
        className={cx(
          "flex gap-2",
          "overflow-x-auto snap-x snap-mandatory pb-3 -mx-1 px-1",
          "sm:grid sm:grid-cols-8 sm:overflow-x-visible sm:snap-none sm:pb-0"
        )}
      >
        {DAYS.map((day) => (
          <div
            key={day}
            className="flex flex-col gap-1 min-w-[136px] sm:min-w-0 snap-start"
          >
            <div className="text-[11px] font-semibold uppercase tracking-widest text-[color:var(--text-tertiary)] px-2 pb-1">
              {day}
            </div>
            <DayColumn
              day={day}
              videos={getVideosForDay(day)}
              isDragActive={isDragActive}
              activeVideoId={activeVideoId}
            />
          </div>
        ))}

        {/* Unscheduled overflow column */}
        <div className="flex flex-col gap-1 min-w-[136px] sm:min-w-0 snap-start">
          <div className="text-[11px] font-semibold uppercase tracking-widest text-[color:var(--text-tertiary)]/70 px-2 pb-1 border-l border-[color:var(--border-subtle)] pl-3">
            {APP.PLAN_UI.unscheduled}
          </div>
          <div className="border-l border-[color:var(--border-subtle)] pl-1">
            <DayColumn
              day="Unscheduled"
              videos={getVideosForDay("Unscheduled")}
              isDragActive={isDragActive}
              activeVideoId={activeVideoId}
            />
          </div>
        </div>
      </div>

      {/* Drag overlay — renders dragging card at cursor position */}
      <DragOverlay dropAnimation={{ duration: 180, easing: "cubic-bezier(0.16, 1, 0.3, 1)" }}>
        {activeVideo ? <VideoCardOverlay video={activeVideo} /> : null}
      </DragOverlay>

      <RescheduleToast message={toast} key={toastKey} />
    </DndContext>
  );
}
