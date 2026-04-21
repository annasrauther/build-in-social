"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { Compass, Plus } from "lucide-react";
import { PlanShell } from "@/components/plan/PlanShell";
import { Button } from "@/components/ui/shadcn/button";
import {
  EmptyState,
  ErrorState,
  SkeletonRows,
} from "@/components/ui/states";
import { APP } from "@/content/app";
import { cn } from "@/lib/utils";
import type { Series, SeriesStatus } from "@/lib/types/series";

/**
 * /series — list surface. One row per series, matching the
 * plan/videos grammar: dot + name + topic + cadence + credits +
 * status chip. Click opens /series/[id] (tune/pause/archive).
 *
 * Primary entry for creating a series is still the "+ New series"
 * button in the weekly plan header (F5); this page's CTA is a
 * fallback.
 */

const STATUS_DOT: Record<SeriesStatus, string> = {
  active: "bg-accent",
  paused: "bg-[color:var(--warning)]",
  completed: "bg-[color:var(--border)]",
};

export default function SeriesListPage() {
  const [series, setSeries] = useState<Series[] | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;
    fetch("/api/series")
      .then((r) => r.json())
      .then((j) => {
        if (cancelled) return;
        if (j.error) {
          setError(j.error);
          setSeries([]);
        } else {
          setSeries((j.data as Series[]) ?? []);
        }
      })
      .catch(() => {
        if (!cancelled) {
          setError(APP.COMMON.errorGeneric);
          setSeries([]);
        }
      });
    return () => {
      cancelled = true;
    };
  }, []);

  const loading = series === null && !error;

  return (
    <PlanShell
      title="Series"
      subtitle={
        series
          ? `${series.length} total · ${
              series.filter((s) => s.status === "active").length
            } active`
          : "Loading series…"
      }
      actions={
        <Button asChild variant="primary" size="sm">
          <Link href="/series/create">
            <Plus size={14} strokeWidth={1.5} aria-hidden="true" />
            New series
          </Link>
        </Button>
      }
    >
      <div
        role="status"
        aria-live="polite"
        aria-atomic="true"
        className="sr-only"
      >
        {series === null ? APP.A11Y.loading : error ? error : APP.A11Y.loaded}
      </div>

      {loading ? (
        <SkeletonRows rows={4} height={44} gap={6} />
      ) : error ? (
        <ErrorState
          title="Couldn't load series"
          description={error}
          onRetry={() => window.location.reload()}
        />
      ) : !series || series.length === 0 ? (
        <EmptyState
          icon={Compass}
          title={APP.SERIES.emptyTitle}
          description={APP.SERIES.emptyDescription}
          action={
            <Button asChild variant="primary" size="sm">
              <Link href="/series/create">{APP.SERIES.emptyCta}</Link>
            </Button>
          }
        />
      ) : (
        <ul className="flex flex-col gap-1.5">
          {series.map((s, i) => (
            <SeriesRow key={s.id} series={s} index={i} />
          ))}
        </ul>
      )}
    </PlanShell>
  );
}

function SeriesRow({ series, index }: { series: Series; index: number }) {
  return (
    <li>
      <Link
        href={`/series/${series.id}`}
        prefetch
        aria-label={`${APP.SERIES.list.rowOpen}: ${series.name}`}
        className={cn(
          "group flex items-start gap-3 px-3 py-2.5",
          "border border-[color:var(--border)] hover:border-[color:var(--border-interactive)]",
          "bg-surface hover:bg-[color-mix(in_srgb,var(--gray-12)_3%,var(--surface))]",
          "rounded-[var(--radius-card)]",
          "transition-colors duration-fast ease-out-cubic",
          "focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:[outline-color:var(--focus-ring)]",
          "animate-fade-in",
        )}
        style={{ animationDelay: `${Math.min(index, 8) * 30}ms` }}
      >
        <span
          aria-hidden="true"
          className={cn(
            "mt-1.5 inline-block h-1.5 w-1.5 rounded-full shrink-0",
            STATUS_DOT[series.status],
          )}
        />
        <div className="flex-1 min-w-0 flex flex-col gap-0.5">
          <div className="flex items-center gap-2 min-w-0">
            <span className="text-[13px] font-medium leading-tight text-text truncate">
              {series.name}
            </span>
            <span className="text-[11px] uppercase tracking-wider text-text-tertiary font-mono">
              {APP.SERIES.modeLabels[series.mode]}
            </span>
          </div>
          <p className="text-[12px] leading-snug text-text-secondary line-clamp-1">
            {series.topic}
          </p>
        </div>
        <div className="flex flex-col items-end gap-0.5 shrink-0">
          <span className="text-[11px] uppercase tracking-wider text-text-tertiary font-mono">
            {APP.SERIES.statusLabels[series.status]}
          </span>
          <span className="text-[11px] text-text-tertiary font-mono tabular-nums">
            {APP.SERIES.frequencyLabels[series.frequency]} ·{" "}
            {series.creditsConsumed ?? 0} cr
          </span>
        </div>
      </Link>
    </li>
  );
}
