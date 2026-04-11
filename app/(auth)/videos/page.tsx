"use client";

import { useState } from "react";
import Link from "next/link";
import { motion } from "framer-motion";
import { pageVariants, pageTransition } from "@/lib/motion";
import { useWeek } from "@/lib/context/week-context";
import { APP } from "@/content/app";
import { Card } from "@/components/ui/Card";
import { Badge } from "@/components/ui/Badge";
import { Button, KIND, SIZE } from "baseui/button";
import { ListRow } from "@/components/ui/ListRow";
import { EmptyState } from "@/components/shared/EmptyState";
import type { Platform } from "@/lib/types/user";
import type { VideoStatus } from "@/components/plan/VideoCard";

type FilterStatus = "all" | VideoStatus;

const PLATFORM_COLORS: Record<Platform, string> = {
  youtube: "var(--danger)",
  instagram: "var(--accent)",
  linkedin: "var(--accent-hover)",
  x: "var(--text-primary)",
};

const STATUS_TO_BADGE: Record<VideoStatus, string> = {
  draft: "draft",
  approved: "approved",
  rendering: "rendering",
  ready: "ready",
  posted: "posted",
  failed: "failed",
};

const FILTER_TABS: { key: FilterStatus; label: string }[] = [
  { key: "all", label: APP.VIDEOS.filterAll },
  { key: "draft", label: APP.VIDEOS.filterDraft },
  { key: "approved", label: APP.VIDEOS.filterApproved },
  { key: "rendering", label: APP.VIDEOS.filterRendering },
  { key: "ready", label: APP.VIDEOS.filterReady },
  { key: "posted", label: APP.VIDEOS.filterPosted },
  { key: "failed", label: APP.VIDEOS.filterFailed },
];

export default function VideosPage() {
  const [filter, setFilter] = useState<FilterStatus>("all");
  const { videos, generationState } = useWeek();

  const hasPlan = generationState === "ready" && videos.length > 0;
  const filtered =
    filter === "all" ? videos : videos.filter((v) => v.status === filter);

  const counts: Partial<Record<FilterStatus, number>> = {};
  for (const v of videos) {
    counts[v.status] = (counts[v.status] ?? 0) + 1;
  }

  return (
    <motion.div
      className="space-y-6 max-w-4xl"
      variants={pageVariants}
      initial="initial"
      animate="animate"
      transition={pageTransition}
    >
      {/* Header — display scale */}
      <div>
        <h2
          className="text-[var(--type-display-mobile)] tablet-sm:text-[var(--type-display-desktop)]"
          style={{
            fontFamily: "var(--font-heading)",
            fontWeight: 400,
            lineHeight: 1.2,
            letterSpacing: "-0.02em",
            color: "var(--text-primary)",
          }}
        >
          {APP.VIDEOS.title}
        </h2>
        <p
          className="text-[var(--type-supporting-mobile)] tablet-sm:text-[var(--type-supporting-desktop)] mt-1"
          style={{ color: "var(--text-tertiary)" }}
        >
          {APP.VIDEOS.subtitle(videos.length)}
        </p>
      </div>

      {/* Empty state */}
      {!hasPlan && (
        <Card>
          <EmptyState
            illustrationType="no-videos"
            title={APP.VIDEOS.emptyTitle}
            description={APP.VIDEOS.emptyDescription}
            action={
              <Link href="/plan/current">
                <Button>{APP.VIDEOS.emptyCta}</Button>
              </Link>
            }
          />
        </Card>
      )}

      {/* Filter pills + video list */}
      {hasPlan && (
        <>
          {/* Filter pills — horizontal scroll on mobile */}
          <div className="flex gap-2 overflow-x-auto pb-1 -mx-4 px-4 tablet-sm:mx-0 tablet-sm:px-0 tablet-sm:flex-wrap">
            {FILTER_TABS.map((tab) => {
              const count =
                tab.key === "all" ? videos.length : (counts[tab.key] ?? 0);
              if (tab.key !== "all" && count === 0) return null;
              const isActive = filter === tab.key;
              return (
                <div key={tab.key} className="shrink-0">
                  <Button
                    kind={isActive ? KIND.primary : KIND.tertiary}
                    size={SIZE.compact}
                    onClick={() => setFilter(tab.key)}
                  >
                    {tab.label}
                    <span
                      className="text-[var(--type-micro)] tabular-nums ml-1"
                      style={{ opacity: isActive ? 0.8 : 0.6 }}
                    >
                      {count}
                    </span>
                  </Button>
                </div>
              );
            })}
          </div>

          {/* Video list — ListRow on mobile, card rows on desktop */}
          {filtered.length === 0 ? (
            <div className="text-center py-16">
              <p
                className="text-[var(--type-body-mobile)]"
                style={{ color: "var(--text-tertiary)" }}
              >
                {APP.VIDEOS.noFilter(filter)}
              </p>
            </div>
          ) : (
            <Card className="p-0 overflow-hidden">
              {filtered.map((video, i) => (
                <motion.div
                  key={video.id}
                  initial={{ opacity: 0, y: 8 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{
                    delay: i * 0.03,
                    duration: 0.28,
                    ease: [0.16, 1, 0.3, 1],
                  }}
                >
                  <Link
                    href={`/videos/${video.id}`}
                    style={{ textDecoration: "none" }}
                  >
                    <ListRow
                      interactive
                      left={
                        <span
                          className="w-5 h-5 rounded flex items-center justify-center text-[9px] font-bold"
                          style={{
                            backgroundColor: PLATFORM_COLORS[video.platform],
                            color: "var(--text-inverse)",
                          }}
                        >
                          {APP.PLATFORMS[video.platform].short}
                        </span>
                      }
                      supporting={
                        <span style={{ fontFamily: "var(--font-mono)", fontWeight: 500 }}>
                          {video.durationSeconds}s &middot; {video.dayOfWeek}
                        </span>
                      }
                      right={
                        <Badge variant={STATUS_TO_BADGE[video.status] as "draft" | "approved" | "rendering" | "ready" | "posted" | "failed"}>
                          {video.status}
                        </Badge>
                      }
                      noBorder={i === filtered.length - 1}
                    >
                      <span className="font-medium truncate">{video.title}</span>
                    </ListRow>
                  </Link>
                </motion.div>
              ))}
            </Card>
          )}
        </>
      )}
    </motion.div>
  );
}
