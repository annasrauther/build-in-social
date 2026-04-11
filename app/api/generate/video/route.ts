import { NextRequest, NextResponse } from "next/server";
import { createVideo, createRenderJob } from "@/lib/services/db";
import { requireAuth } from "@/lib/auth";
import type { Platform, FacelessStyle } from "@/lib/types/user";
import type { ContentType, VideoStatus } from "@/lib/types/video";

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
    const body = await req.json();
    const { scriptOutput, videoInput, title, weekId } = body;

    const video = await createVideo({
      userId,
      weekId: weekId ?? "mock_week",
      title: title ?? "Untitled video",
      scriptJson: scriptOutput.script,
      platform: (videoInput.platform ?? videoInput.platforms?.[0] ?? "youtube") as Platform,
      dayOfWeek: videoInput.dayOfWeek ?? "mon",
      facelessStyle: (videoInput.facelessStyle ?? "dev-log") as FacelessStyle,
      durationSeconds: scriptOutput.estimatedDurationSeconds ?? 38,
      contentType: (videoInput.contentType ?? "founder-story") as ContentType,
      status: "draft" as VideoStatus,
      topicLabel: scriptOutput.topicLabel,
      hookType: scriptOutput.hookType,
      sentiment: scriptOutput.sentiment,
    });

    const renderJob = await createRenderJob({
      userId,
      videoId: video.id,
      status: "queued",
    });

    return NextResponse.json({ videoId: video.id, jobId: renderJob.id });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : "Failed to create video";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
