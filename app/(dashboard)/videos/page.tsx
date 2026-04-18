"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { motion } from "framer-motion";
import { Card } from "@/components/tremor/Card";
import { Button } from "@/components/tremor/Button";
import { Badge } from "@/components/tremor/Badge";
import { TabNavigation, TabNavigationLink } from "@/components/tremor/TabNavigation";
import { StatusCard } from "@/components/ui/StatusCard";
import { APP } from "@/content/app";
import type { Video, VideoStatus } from "@/lib/types/video";
import type { Platform } from "@/lib/types/user";

type Filter = "all" | VideoStatus;

const FILTERS: { id: Filter; label: string }[] = [
  { id: "all", label: APP.VIDEOS.filterAll },
  { id: "draft", label: APP.VIDEOS.filterDraft },
  { id: "approved", label: APP.VIDEOS.filterApproved },
  { id: "rendering", label: APP.VIDEOS.filterRendering },
  { id: "ready", label: APP.VIDEOS.filterReady },
  { id: "posted", label: APP.VIDEOS.filterPosted },
  { id: "failed", label: APP.VIDEOS.filterFailed },
];

const PLATFORM_COLORS: Record<Platform, string> = {
  youtube: "bg-brand-100 text-brand-700 dark:bg-brand-950 dark:text-brand-300",
  instagram:
    "bg-brand-50 text-brand-600 dark:bg-brand-900/40 dark:text-brand-400",
  linkedin:
    "bg-gray-100 text-gray-700 dark:bg-gray-800 dark:text-gray-300",
  x: "bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-300",
};

export default function VideosPage() {
  const [videos, setVideos] = useState<Video[] | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [filter, setFilter] = useState<Filter>("all");

  useEffect(() => {
    let cancelled = false;
    fetch("/api/videos")
      .then((r) => r.json())
      .then((j) => {
        if (cancelled) return;
        if (j.error) {
          setError(j.error);
          setVideos([]);
        } else {
          setVideos((j.data as Video[]) ?? []);
        }
      })
      .catch(() => {
        if (!cancelled) {
          setError(APP.COMMON.errorGeneric);
          setVideos([]);
        }
      });
    return () => {
      cancelled = true;
    };
  }, []);

  const filtered = useMemo(() => {
    if (!videos) return [];
    if (filter === "all") return videos;
    return videos.filter((v) => v.status === filter);
  }, [videos, filter]);

  return (
    <div className="p-4 sm:px-6 sm:pb-10 sm:pt-10 lg:px-10 lg:pt-7">
      {/* A6: aria-live region announces async fetch state changes to screen readers */}
      <div
        role="status"
        aria-live="polite"
        aria-atomic="true"
        className="sr-only"
      >
        {videos === null
          ? APP.A11Y.loading
          : error
          ? error
          : APP.A11Y.loaded}
      </div>

      <header className="mb-6">
        <h1 className="text-lg font-medium text-gray-900 dark:text-gray-50">
          {APP.VIDEOS.title}
        </h1>
        <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
          {APP.VIDEOS.subtitle(videos?.length ?? 0)}
        </p>
      </header>

      <TabNavigation className="mb-6">
        {FILTERS.map((f) => (
          <TabNavigationLink
            key={f.id}
            href="#"
            active={filter === f.id}
            onClick={(e: React.MouseEvent) => {
              e.preventDefault();
              setFilter(f.id);
            }}
          >
            {f.label}
          </TabNavigationLink>
        ))}
      </TabNavigation>

      {videos === null ? (
        <VideoGridSkeleton />
      ) : error ? (
        <StatusCard
          variant="error"
          title="Couldn't load videos"
          description={error}
          cta={APP.COMMON.retry}
          onCta={() => window.location.reload()}
          ctaGradient
        />
      ) : filtered.length === 0 ? (
        <EmptyState filter={filter} />
      ) : (
        <ul className="grid gap-3 tablet-sm:grid-cols-2 lg:grid-cols-3">
          {filtered.map((v) => (
            <motion.li
              key={v.id}
              initial={{ opacity: 0, y: 6 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.16, ease: [0.16, 1, 0.3, 1] }}
            >
              <Link
                href={`/videos/${v.id}`}
                className="block focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 rounded-lg"
              >
                <Card className="p-4 h-full hover:border-gray-300 dark:hover:border-gray-700 transition">
                  <div className="flex items-center justify-between mb-2">
                    <span
                      className={`inline-flex items-center rounded px-1.5 py-0.5 text-xs font-medium ${PLATFORM_COLORS[v.platform]}`}
                    >
                      {v.platform}
                    </span>
                    <Badge variant={statusVariant(v.status)}>
                      {v.status}
                    </Badge>
                  </div>
                  <h3 className="text-sm font-medium text-gray-900 dark:text-gray-50 line-clamp-2">
                    {v.title}
                  </h3>
                  <p className="mt-1 text-xs text-gray-500 dark:text-gray-400 line-clamp-2">
                    {v.scriptJson.hook}
                  </p>
                  <div className="mt-3 flex items-center justify-between text-xs text-gray-400 dark:text-gray-500">
                    <span>{v.durationSeconds}s</span>
                    <span>{v.dayOfWeek?.toUpperCase()}</span>
                  </div>
                </Card>
              </Link>
            </motion.li>
          ))}
        </ul>
      )}
    </div>
  );
}

function statusVariant(status: VideoStatus): "success" | "warning" | "default" | "error" {
  switch (status) {
    case "ready":
    case "posted":
      return "success";
    case "rendering":
    case "approved":
      return "warning";
    case "failed":
      return "error";
    default:
      return "default";
  }
}

function EmptyState({ filter }: { filter: Filter }) {
  const isAll = filter === "all";

  if (!isAll) {
    const filterLabels: Record<string, string> = {
      draft: "No drafts yet",
      approved: "Nothing approved yet",
      rendering: "Nothing rendering right now",
      ready: "Nothing queued to post",
      posted: "No posted videos yet",
      failed: "No failed videos",
    };
    return (
      <StatusCard
        variant="notFound"
        title={filterLabels[filter] ?? `No ${filter} videos`}
        description="Switch to a different filter or build your weekly plan."
        ctaGradient
        cta="Build this week's plan"
        ctaHref="/plan/current"
      />
    );
  }

  return (
    <StatusCard
      variant="empty"
      title="Your library is empty"
      description={APP.VIDEOS.emptyFirstWeekCta}
      cta={APP.VIDEOS.emptyCta}
      ctaHref="/plan/current"
      ctaGradient
    />
  );
}

function VideoGridSkeleton() {
  return (
    <ul className="grid gap-3 tablet-sm:grid-cols-2 lg:grid-cols-3">
      {Array.from({ length: 6 }).map((_, i) => (
        <li
          key={i}
          className="skeleton-line"
          style={{ height: 160, borderRadius: "var(--radius-lg)" }}
        />
      ))}
    </ul>
  );
}
