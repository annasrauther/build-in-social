"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { motion } from "motion/react";
import { Card } from "@/components/tremor/Card";
import { Badge } from "@/components/tremor/Badge";
import { Button } from "@/components/tremor/Button";
import { StatusCard } from "@/components/ui/StatusCard";
import { APP } from "@/content/app";
import type { Series, SeriesStatus, SeriesMode } from "@/lib/types/series";

function statusVariant(status: SeriesStatus): "success" | "warning" | "default" {
  switch (status) {
    case "active":
      return "success";
    case "paused":
      return "warning";
    default:
      return "default";
  }
}

function modeClass(mode: SeriesMode): string {
  switch (mode) {
    case "faceless":
      return "bg-gray-100 text-gray-700 dark:bg-gray-800 dark:text-gray-300";
    case "stock-ai-avatar":
      return "bg-brand-50 text-brand-600 dark:bg-brand-900/40 dark:text-brand-400";
    case "heygen-avatar":
      return "bg-brand-100 text-brand-700 dark:bg-brand-950 dark:text-brand-300";
    case "combo":
      return "bg-gray-900 text-gray-50 dark:bg-gray-100 dark:text-gray-900";
  }
}

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

  return (
    <div className="p-4 sm:px-6 sm:pb-10 sm:pt-10 lg:px-10 lg:pt-7">
      <div role="status" aria-live="polite" aria-atomic="true" className="sr-only">
        {series === null ? APP.A11Y.loading : error ? error : APP.A11Y.loaded}
      </div>

      <header className="mb-6 flex items-start justify-between gap-4">
        <div>
          <h1 className="text-lg font-medium text-gray-900 dark:text-gray-50">
            {APP.SERIES.title}
          </h1>
          <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
            {APP.SERIES.subtitle(series?.length ?? 0)}
          </p>
        </div>
        <Link href="/series/create">
          <Button variant="primary">{APP.SERIES.createCta}</Button>
        </Link>
      </header>

      {series === null ? (
        <SeriesListSkeleton />
      ) : error ? (
        <StatusCard
          variant="error"
          title="Couldn't load series"
          description={error}
          cta={APP.COMMON.retry}
          onCta={() => window.location.reload()}
          ctaGradient
        />
      ) : series.length === 0 ? (
        <StatusCard
          variant="empty"
          title={APP.SERIES.emptyTitle}
          description={APP.SERIES.emptyDescription}
          cta={APP.SERIES.emptyCta}
          ctaHref="/series/create"
          ctaGradient
        />
      ) : (
        <ul className="grid gap-3 tablet-sm:grid-cols-2 lg:grid-cols-3">
          {series.map((s) => (
            <motion.li
              key={s.id}
              initial={{ opacity: 0, y: 6 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.16, ease: [0.16, 1, 0.3, 1] }}
            >
              <Link
                href={`/series/${s.id}`}
                className="block focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 rounded-lg"
                aria-label={APP.SERIES.list.rowOpen + ": " + s.name}
              >
                <Card className="p-4 h-full hover:border-gray-300 dark:hover:border-gray-700 transition">
                  <div className="flex items-center justify-between mb-2">
                    <span
                      className={`inline-flex items-center rounded px-1.5 py-0.5 text-xs font-medium ${modeClass(s.mode)}`}
                    >
                      {APP.SERIES.modeLabels[s.mode]}
                    </span>
                    <Badge variant={statusVariant(s.status)}>
                      {APP.SERIES.statusLabels[s.status]}
                    </Badge>
                  </div>
                  <h3 className="text-sm font-medium text-gray-900 dark:text-gray-50 line-clamp-1">
                    {s.name}
                  </h3>
                  <p className="mt-1 text-xs text-gray-500 dark:text-gray-400 line-clamp-2">
                    {s.topic}
                  </p>
                  <div className="mt-3 flex items-center justify-between text-xs text-gray-400 dark:text-gray-500">
                    <span>{APP.SERIES.frequencyLabels[s.frequency]}</span>
                    <span>
                      {s.creditsConsumed ?? 0} credits
                    </span>
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

function SeriesListSkeleton() {
  return (
    <ul className="grid gap-3 tablet-sm:grid-cols-2 lg:grid-cols-3">
      {Array.from({ length: 4 }).map((_, i) => (
        <li
          key={i}
          className="skeleton-line"
          style={{ height: 140, borderRadius: "var(--radius-lg)" }}
        />
      ))}
    </ul>
  );
}
