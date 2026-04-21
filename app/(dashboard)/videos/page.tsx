"use client";

import { useEffect, useMemo } from "react";
import Link from "next/link";
import { parseAsString, parseAsStringLiteral, useQueryState } from "nuqs";
import { Video as VideoIcon } from "lucide-react";
import { PlanShell } from "@/components/plan/PlanShell";
import { Button } from "@/components/ui/shadcn/button";
import { Input } from "@/components/ui/shadcn/input";
import {
  EmptyState,
  ErrorState,
  SkeletonRows,
} from "@/components/ui/states";
import { PLATFORM_ICON, PLATFORM_LABEL } from "@/components/video/platform-icons";
import { useState } from "react";
import { APP } from "@/content/app";
import { cn } from "@/lib/utils";
import type { Video, VideoStatus } from "@/lib/types/video";
import type { Platform } from "@/lib/types/user";

/**
 * /videos — demoted to a filterable archive.
 *
 * Per F3: the primary entry to any video is now the drawer on
 * `/plan/current`. This page exists for deep-linking and for
 * browsing the whole library; it is intentionally dense (row
 * layout, not cards) and mono-numeric to signal "archive".
 */

type StatusFilter = "all" | VideoStatus;
const STATUS_VALUES = [
  "all",
  "draft",
  "approved",
  "rendering",
  "ready",
  "posted",
  "failed",
] as const;

const FILTERS: readonly { id: StatusFilter; label: string; meta?: string }[] = [
  { id: "all", label: APP.VIDEOS.filterAll },
  { id: "draft", label: APP.VIDEOS.filterDraft },
  { id: "approved", label: APP.VIDEOS.filterApproved },
  { id: "rendering", label: APP.VIDEOS.filterRendering },
  { id: "ready", label: APP.VIDEOS.filterReady },
  { id: "posted", label: APP.VIDEOS.filterPosted },
  { id: "failed", label: APP.VIDEOS.filterFailed },
];

const STATUS_DOT: Record<VideoStatus, string> = {
  draft: "bg-text-tertiary",
  approved: "bg-[color:var(--warning)]",
  rendering: "bg-[color:var(--warning)] animate-pulse",
  ready: "bg-accent",
  posted: "bg-accent",
  failed: "bg-[color:var(--danger)]",
};

export default function VideosPage() {
  const [videos, setVideosLocal] = useState<Video[] | null>(null);
  const [error, setError] = useState<string | null>(null);

  const [filter, setFilter] = useQueryState(
    "status",
    parseAsStringLiteral(STATUS_VALUES).withDefault("all"),
  );
  const [query, setQuery] = useQueryState(
    "q",
    parseAsString.withDefault(""),
  );

  useEffect(() => {
    let cancelled = false;
    fetch("/api/videos")
      .then((r) => r.json())
      .then((j) => {
        if (cancelled) return;
        if (j.error) {
          setError(j.error);
          setVideosLocal([]);
        } else {
          setVideosLocal((j.data as Video[]) ?? []);
        }
      })
      .catch(() => {
        if (!cancelled) {
          setError(APP.COMMON.errorGeneric);
          setVideosLocal([]);
        }
      });
    return () => {
      cancelled = true;
    };
  }, []);

  const filtered = useMemo(() => {
    if (!videos) return [];
    const q = query.trim().toLowerCase();
    return videos.filter((v) => {
      if (filter !== "all" && v.status !== filter) return false;
      if (!q) return true;
      return (
        v.title.toLowerCase().includes(q) ||
        (v.scriptJson?.hook ?? "").toLowerCase().includes(q)
      );
    });
  }, [videos, filter, query]);

  const loading = videos === null && !error;

  return (
    <PlanShell
      title="Videos"
      subtitle={
        videos
          ? `${videos.length} in archive · ${filtered.length} shown`
          : "Loading archive…"
      }
      actions={
        <Button asChild variant="primary" size="sm">
          <Link href="/plan/current">Go to this week</Link>
        </Button>
      }
    >
      <div className="mb-3 flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex items-center gap-1 overflow-x-auto">
          {FILTERS.map((f) => {
            const active = filter === f.id;
            return (
              <button
                key={f.id}
                type="button"
                onClick={() => void setFilter(f.id)}
                aria-pressed={active}
                className={cn(
                  "inline-flex items-center h-7 px-2.5 text-[12px] font-medium leading-none rounded-[var(--radius-input)]",
                  "transition-colors duration-fast ease-out-cubic",
                  "focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:[outline-color:var(--focus-ring)]",
                  active
                    ? "bg-accent-subtle text-text border border-[color-mix(in_srgb,var(--accent)_30%,transparent)]"
                    : "bg-transparent text-text-secondary border border-transparent hover:bg-[color-mix(in_srgb,var(--gray-12)_4%,transparent)]",
                )}
              >
                {f.label}
              </button>
            );
          })}
        </div>
        <div className="sm:w-64">
          <Input
            value={query}
            onChange={(e) => void setQuery(e.target.value || null)}
            placeholder="Search titles and hooks…"
            aria-label="Search videos"
          />
        </div>
      </div>

      {loading ? (
        <SkeletonRows rows={8} height={36} gap={4} />
      ) : error ? (
        <ErrorState
          title="Couldn't load your library"
          description={error}
          onRetry={() => window.location.reload()}
        />
      ) : filtered.length === 0 ? (
        filter === "all" && !query ? (
          <EmptyState
            icon={VideoIcon}
            title="Your library is empty"
            description={APP.VIDEOS.emptyFirstWeekCta}
            action={
              <Button asChild variant="primary" size="sm">
                <Link href="/plan/current">{APP.VIDEOS.emptyCta}</Link>
              </Button>
            }
          />
        ) : (
          <EmptyState
            icon={VideoIcon}
            title="No matches"
            description="Try a different filter or clear the search."
            action={
              <Button
                variant="secondary"
                size="sm"
                onClick={() => {
                  void setFilter("all");
                  void setQuery(null);
                }}
              >
                Reset filters
              </Button>
            }
          />
        )
      ) : (
        <ul className="flex flex-col gap-1">
          {filtered.map((v, i) => (
            <ArchiveRow key={v.id} video={v} index={i} />
          ))}
        </ul>
      )}
    </PlanShell>
  );
}

function ArchiveRow({ video, index }: { video: Video; index: number }) {
  const Icon = PLATFORM_ICON[video.platform as Platform];
  return (
    <li>
      <Link
        href={`/videos/${video.id}`}
        prefetch
        className={cn(
          "group flex items-center gap-3 h-9 px-3",
          "text-[13px] leading-none",
          "border border-transparent hover:border-[color:var(--border)]",
          "bg-transparent hover:bg-[color-mix(in_srgb,var(--gray-12)_3%,transparent)]",
          "rounded-[var(--radius-card)]",
          "transition-colors duration-fast ease-out-cubic",
          "focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:[outline-color:var(--focus-ring)]",
          "animate-fade-in",
        )}
        style={{ animationDelay: `${Math.min(index, 12) * 20}ms` }}
      >
        <span
          aria-hidden="true"
          className={cn(
            "inline-block h-1.5 w-1.5 rounded-full shrink-0",
            STATUS_DOT[video.status as VideoStatus] ?? "bg-text-tertiary",
          )}
        />
        <span className="w-9 shrink-0 font-mono text-[11px] uppercase tracking-wider text-text-tertiary tabular-nums">
          {(video.dayOfWeek ?? "—").toString().slice(0, 3).toUpperCase()}
        </span>
        <Icon
          size={14}
          className="shrink-0 text-text-secondary"
          aria-hidden="true"
        />
        <span className="flex-1 min-w-0 truncate text-text">
          {video.title}
        </span>
        <span className="shrink-0 font-mono text-[11px] text-text-tertiary tabular-nums">
          {video.durationSeconds}s
        </span>
        <span
          className="shrink-0 font-mono text-[11px] uppercase tracking-wider text-text-tertiary"
          aria-label={`Status: ${video.status}`}
        >
          {video.status}
        </span>
        <span className="shrink-0 text-[11px] text-text-tertiary sr-only">
          {PLATFORM_LABEL[video.platform as Platform]}
        </span>
      </Link>
    </li>
  );
}
