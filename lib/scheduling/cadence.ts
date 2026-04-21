/**
 * Series cadence arithmetic — pure.
 *
 * Given a posting frequency (daily / 3x-week / 5x-week / custom) and the last
 * time a video was queued, compute when the next one is due. Kept separate
 * from the cron route so the scheduling logic is deterministic and
 * unit-testable without a running DB or HTTP stack.
 */

import type { PostingFrequency, Series } from "@/lib/types/series";

const DAY_MS = 24 * 60 * 60 * 1000;

/**
 * Approximate interval between posts for each cadence.
 *
 * "daily" = every 24h.
 * "3x-week" = every ~56h (168/3 — spaced evenly across the week).
 * "5x-week" = every ~33.6h (168/5 — one post on each weekday).
 * "custom" = daily fallback; callers that need a non-default should set
 *            nextVideoAt explicitly. We don't invent a custom rule here.
 */
const INTERVAL_MS: Readonly<Record<PostingFrequency, number>> = Object.freeze({
  daily: DAY_MS,
  "3x-week": Math.round((7 * DAY_MS) / 3),
  "5x-week": Math.round((7 * DAY_MS) / 5),
  custom: DAY_MS,
});

/** Next video ISO timestamp given a frequency and a starting point. */
export function computeNextVideoAt(
  frequency: PostingFrequency,
  from: Date | string
): string {
  const base = typeof from === "string" ? new Date(from) : from;
  const next = new Date(base.getTime() + INTERVAL_MS[frequency]);
  return next.toISOString();
}

/**
 * True when a series is due to generate its next video as of `now`. Only
 * "active" series are ever due. If the series has no `nextVideoAt` set, it's
 * treated as due immediately — new series post their first video right away.
 */
export function isDue(series: Series, now: Date = new Date()): boolean {
  if (series.status !== "active") return false;
  if (!series.nextVideoAt) return true;
  return new Date(series.nextVideoAt).getTime() <= now.getTime();
}

/** Filter a list of series down to the ones that should run now. */
export function pickDueSeries(list: Series[], now: Date = new Date()): Series[] {
  return list.filter((s) => isDue(s, now));
}
