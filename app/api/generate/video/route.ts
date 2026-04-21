import { NextRequest, NextResponse } from "next/server";
import { createVideo, createRenderJob, getCurrentWeek, createContentWeek } from "@/lib/services/db";
import { requireAuth } from "@/lib/auth";
import { z } from "zod";
import { clampDurationForPlatform } from "@/lib/utils/platform-config";
import type { Platform, FacelessStyle } from "@/lib/types/user";
import type { Video, ContentType, VideoStatus } from "@/lib/types/video";

const PLATFORM_VALUES = ["youtube", "instagram", "linkedin", "x"] as const;

const generateVideoSchema = z.object({
  scriptOutput: z.object({
    script: z.object({ hook: z.string(), body: z.string(), cta: z.string() }),
    estimatedDurationSeconds: z.number().optional(),
    topicLabel: z.string().optional(),
    hookType: z.string().optional(),
    sentiment: z.string().optional(),
  }),
  videoInput: z.object({
    platform: z.enum(PLATFORM_VALUES).optional(),
    platforms: z.array(z.enum(PLATFORM_VALUES)).optional(),
    dayOfWeek: z.string().optional(),
    facelessStyle: z.string().optional(),
    contentType: z.string().optional(),
  }),
  title: z.string().max(500).optional(),
  weekId: z.string().optional(),
  // Attach the created video to an ongoing series so the video page can
  // default its render mode from the series config. Optional — ad-hoc videos
  // (one-off tests, manual creates) can omit it.
  seriesId: z.string().min(1).max(64).optional(),
});

/**
 * Generate video route — stubbed for Sprint 1.
 * Full weekly plan generation in Sprint 5 via /api/plan/generate.
 */
export async function POST(req: NextRequest) {
  let userId: string;
  try {
    userId = await requireAuth();
  } catch {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  try {
    const raw = await req.json();
    const parsed = generateVideoSchema.safeParse(raw);
    if (!parsed.success) {
      return NextResponse.json({ error: "Invalid input", details: parsed.error.flatten() }, { status: 400 });
    }
    const { scriptOutput, videoInput, title, weekId, seriesId } = parsed.data;

    const platform: Platform =
      videoInput.platform ?? videoInput.platforms?.[0] ?? "youtube";

    // Resolve weekId — use the passed value, look up the current week, or create one.
    let resolvedWeekId = weekId;
    if (!resolvedWeekId) {
      const currentWeek = await getCurrentWeek(userId).catch(() => null);
      if (currentWeek) {
        resolvedWeekId = currentWeek.id;
      } else {
        const now = new Date();
        const weekStart = new Date(now);
        weekStart.setDate(now.getDate() - now.getDay());
        const weekEnd = new Date(weekStart);
        weekEnd.setDate(weekStart.getDate() + 6);
        const newWeek = await createContentWeek({
          userId,
          weekNumber: Math.ceil((now.getTime() - new Date(now.getFullYear(), 0, 1).getTime()) / (7 * 24 * 60 * 60 * 1000)),
          year: now.getFullYear(),
          startDate: weekStart.toISOString().split("T")[0],
          endDate: weekEnd.toISOString().split("T")[0],
          mode: "manual",
          contentSource: "user_input",
          status: "ready",
          videoCount: 0,
        });
        resolvedWeekId = newWeek.id;
      }
    }

    const video = await createVideo({
      userId,
      weekId: resolvedWeekId,
      seriesId,
      title: title ?? "Untitled video",
      scriptJson: scriptOutput.script,
      platform,
      dayOfWeek: (videoInput.dayOfWeek ?? "mon") as Video["dayOfWeek"],
      facelessStyle: (videoInput.facelessStyle ?? "dev-log") as FacelessStyle,
      // Critical path #4: clamp to platform spec — never trust LLM duration.
      durationSeconds: clampDurationForPlatform(
        platform,
        scriptOutput.estimatedDurationSeconds
      ),
      contentType: (videoInput.contentType ?? "founder-story") as ContentType,
      status: "draft" as VideoStatus,
      topicLabel: scriptOutput.topicLabel as Video["topicLabel"],
      hookType: scriptOutput.hookType as Video["hookType"],
      sentiment: scriptOutput.sentiment as Video["sentiment"],
    });

    const renderJob = await createRenderJob({
      userId,
      videoId: video.id,
      status: "queued",
    });

    return NextResponse.json({ data: { videoId: video.id, jobId: renderJob.id }, error: null });
  } catch (error: unknown) {
    // SECURITY (M6): log full error server-side, return generic message.
    console.error("[generate/video] error:", error);
    return NextResponse.json({ error: "Internal error" }, { status: 500 });
  }
}
