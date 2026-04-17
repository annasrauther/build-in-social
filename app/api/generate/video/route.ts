import { NextRequest, NextResponse } from "next/server";
import { createVideo, createRenderJob } from "@/lib/services/db";
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
    const { scriptOutput, videoInput, title, weekId } = parsed.data;

    const platform: Platform =
      videoInput.platform ?? videoInput.platforms?.[0] ?? "youtube";

    const video = await createVideo({
      userId,
      weekId: weekId ?? "mock_week",
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
    const message = error instanceof Error ? error.message : "Failed to create video";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
