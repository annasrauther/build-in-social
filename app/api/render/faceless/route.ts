/**
 * POST /api/render/faceless
 * Submit a faceless render job for an approved video.
 *
 * Body: { videoId: string }
 * Returns: { data: { jobId: string, status: string } }
 */

export const runtime = "nodejs";

import { NextRequest, NextResponse } from "next/server";
import { getVideo, updateVideo, updateRenderJob as dbUpdateRenderJob, createRenderJob } from "@/lib/services/db";
import { enqueueRenderJob } from "@/lib/services/queue";
import { requireAuth } from "@/lib/auth";
import { checkRateLimit } from "@/lib/services/rate-limit";

export async function POST(req: NextRequest) {
  let userId: string;
  try {
    userId = await requireAuth();
  } catch {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  const limited = await checkRateLimit(userId, "render/faceless", 5, "1 m");
  if (limited) return limited;

  try {
    const body = await req.json() as Record<string, unknown>;
    const videoId = typeof body.videoId === "string" ? body.videoId.trim() : "";

    if (!videoId) {
      return NextResponse.json({ error: "videoId is required" }, { status: 400 });
    }

    const video = await getVideo(videoId);
    if (!video) {
      return NextResponse.json({ error: "Video not found" }, { status: 404 });
    }
    if (video.userId !== userId) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    // Create a DB render job record
    const dbJob = await createRenderJob({
      userId,
      videoId,
      status: "queued",
    });

    // Enqueue in Redis (or in-memory fallback)
    const queueJob = await enqueueRenderJob(videoId, userId);

    // Link render job ID to video and set status to "rendering"
    await updateVideo(videoId, {
      status: "rendering",
      renderJobId: dbJob.id,
    });

    return NextResponse.json({
      data: {
        jobId: queueJob.id,
        dbJobId: dbJob.id,
        status: queueJob.status,
      },
    });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Failed to submit render job";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
