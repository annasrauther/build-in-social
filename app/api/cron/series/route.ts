/**
 * GET /api/cron/series
 * Recurring cron job (Vercel Cron) — advances the schedule for every active
 * series and queues a new video when one is due.
 *
 * Flow per due series:
 *   1. Pick the next platform (round-robin over series.platforms).
 *   2. Ask Claude Haiku for one SeriesPlan entry (`generateSeriesPlan`).
 *   3. Run the combo picker to choose faceless vs avatar for this video
 *      (only matters when series.mode = "combo"; otherwise it short-circuits
 *      to the series' declared mode).
 *   4. Create a Video row with `seriesId` set so the video page defaults its
 *      render mode from the series when the user opens it.
 *   5. Append to series.videos, advance nextVideoAt, increment creditsConsumed
 *      bookkeeping (credits are actually deducted at render time, not here).
 *
 * Credit-budget enforcement stays at render time — deductCreditForRender
 * handles the hard cap. The cron never refuses to queue a video based on
 * budget; it's cheaper to queue and let the render route 402.
 */

export const runtime = "nodejs";
export const maxDuration = 60;

import { NextRequest, NextResponse } from "next/server";
import { CRON_SECRET } from "@/lib/env";
import {
  createVideo,
  getCurrentWeek,
  createContentWeek,
  listActiveSeries,
  updateSeries,
} from "@/lib/services/db";
import { computeNextVideoAt, isDue } from "@/lib/scheduling/cadence";
import {
  pickRenderKindForComboVideo,
  renderKindForMode,
} from "@/lib/scheduling/combo-picker";
import { generateSeriesPlan } from "@/lib/services/claude";
import { clampDurationForPlatform } from "@/lib/utils/platform-config";
import { getCreditCost } from "@/lib/credits";
import type { Series, SeriesVideo } from "@/lib/types/series";
import type { Platform } from "@/lib/types/user";

async function resolveWeekId(userId: string): Promise<string> {
  const current = await getCurrentWeek(userId).catch(() => null);
  if (current) return current.id;
  const now = new Date();
  const weekStart = new Date(now);
  weekStart.setDate(now.getDate() - now.getDay());
  const weekEnd = new Date(weekStart);
  weekEnd.setDate(weekStart.getDate() + 6);
  const week = await createContentWeek({
    userId,
    weekNumber: Math.ceil(
      (now.getTime() - new Date(now.getFullYear(), 0, 1).getTime()) /
        (7 * 24 * 60 * 60 * 1000),
    ),
    year: now.getFullYear(),
    startDate: weekStart.toISOString().split("T")[0],
    endDate: weekEnd.toISOString().split("T")[0],
    mode: "autopilot",
    contentSource: "series_autopilot",
    status: "generating",
    videoCount: 0,
  });
  return week.id;
}

function pickPlatform(series: Series): Platform {
  const i = series.videos?.length ?? 0;
  return series.platforms[i % series.platforms.length];
}

async function generateOneVideoForSeries(
  series: Series,
): Promise<{ videoId: string; renderKind: string } | null> {
  const platform = pickPlatform(series);

  // Estimate remaining-credit budget generously — we're not gating here, so
  // the picker biases on content type + platform only, not on affordability.
  const renderCost = getCreditCost("heygen-licensed");
  const comboPick = pickRenderKindForComboVideo({
    series,
    platform,
    contentType: series.contentType,
    remainingCredits: Number.MAX_SAFE_INTEGER,
    heygenRenderCost: renderCost,
  });
  const renderKind =
    series.mode === "combo"
      ? comboPick.kind
      : renderKindForMode(series.mode, series.heygenAvatarSource);

  const plans = await generateSeriesPlan({
    topic: series.topic,
    contentType: series.contentType,
    tone: series.tone ?? "confident",
    platform,
    videoCount: 1,
  });
  if (plans.length === 0) return null;
  const plan = plans[0];

  const weekId = await resolveWeekId(series.userId);

  const dayOfWeek = (["mon", "tue", "wed", "thu", "fri"] as const)[
    (series.videos?.length ?? 0) % 5
  ];

  const created = await createVideo({
    userId: series.userId,
    weekId,
    seriesId: series.id,
    title: plan.title.slice(0, 200),
    scriptJson: {
      hook: plan.hook,
      body: plan.angle,
      cta: "",
    },
    platform,
    dayOfWeek,
    facelessStyle: series.facelessStyle,
    durationSeconds: clampDurationForPlatform(platform, plan.suggestedLength),
    contentType: series.contentType,
    status: "draft",
  });

  return { videoId: created.id, renderKind };
}

export async function GET(req: NextRequest) {
  if (!CRON_SECRET) {
    return NextResponse.json(
      { error: "Cron secret not configured" },
      { status: 503 },
    );
  }

  const authHeader = req.headers.get("authorization");
  if (authHeader !== `Bearer ${CRON_SECRET}`) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const now = new Date();
  let scanned = 0;
  let advanced = 0;
  const generatedVideoIds: string[] = [];
  const generationErrors: string[] = [];

  try {
    const activeSeries = await listActiveSeries();
    scanned = activeSeries.length;

    for (const series of activeSeries) {
      if (!isDue(series, now)) continue;

      let generation: Awaited<ReturnType<typeof generateOneVideoForSeries>> = null;
      try {
        generation = await generateOneVideoForSeries(series);
      } catch (err) {
        const msg = err instanceof Error ? err.message : String(err);
        console.error(`[cron/series] generation failed for ${series.id}:`, msg);
        generationErrors.push(series.id);
        // Still advance nextVideoAt so one failure doesn't wedge the series on
        // every tick. The user can manually retry from the series detail page.
      }

      const newVideoRef: SeriesVideo | null = generation
        ? {
            id: generation.videoId,
            title: "Auto-generated",
            hook: "",
            platform: pickPlatform(series),
            suggestedLength: 0,
            status: "generating",
            videoId: generation.videoId,
          }
        : null;

      const nextVideoAt = computeNextVideoAt(series.frequency, now);
      const nextVideos = newVideoRef
        ? [...(series.videos ?? []), newVideoRef]
        : series.videos;

      await updateSeries(series.id, {
        nextVideoAt,
        videos: nextVideos,
      });

      advanced += 1;
      if (generation) generatedVideoIds.push(generation.videoId);
    }

    return NextResponse.json({
      data: {
        ok: true,
        scanned,
        advanced,
        generatedVideoIds,
        errors: generationErrors,
        timestamp: now.toISOString(),
      },
    });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Cron series failed";
    console.error("[cron/series] error:", error);
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
