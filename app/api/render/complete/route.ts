/**
 * POST /api/render/complete
 * Internal webhook called by the render worker when a job finishes.
 *
 * Body: { jobId: string, outputUrl: string, durationSeconds: number }
 * Header: X-Internal-Secret (checked against INTERNAL_SECRET env var when set)
 * Returns: { data: { ok: true } }
 */

export const runtime = "nodejs";

import { NextRequest, NextResponse } from "next/server";
import { updateRenderJob } from "@/lib/services/queue";
import { getRenderJob as dbGetRenderJob, updateRenderJob as dbUpdateRenderJob, updateVideo, getVideo } from "@/lib/services/db";
import { sendEmail } from "@/lib/services/resend";
import { APP_URL, INTERNAL_SECRET } from "@/lib/env";

export async function POST(req: NextRequest) {
  // ── Internal secret check (fail closed) ────────────────────────────────────
  const internalSecret = INTERNAL_SECRET;
  if (!internalSecret) {
    return NextResponse.json(
      { error: "Server misconfigured: INTERNAL_SECRET not set" },
      { status: 503 }
    );
  }
  const provided = req.headers.get("x-internal-secret");
  if (provided !== internalSecret) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const body = await req.json() as Record<string, unknown>;
    const jobId = typeof body.jobId === "string" ? body.jobId.trim() : "";
    const outputUrl = typeof body.outputUrl === "string" ? body.outputUrl.trim() : "";
    const durationSeconds =
      typeof body.durationSeconds === "number" ? body.durationSeconds : 0;

    if (!jobId || !outputUrl) {
      return NextResponse.json(
        { error: "jobId and outputUrl are required" },
        { status: 400 }
      );
    }

    // ── Update queue job status ─────────────────────────────────────────────
    await updateRenderJob(jobId, {
      status: "complete",
      outputUrl,
      completedAt: new Date().toISOString(),
    });

    // ── Find DB render job by queue job ID or directly by jobId ────────────
    // The queue jobId and DB job id are kept separate; the video's renderJobId
    // points to the DB record. We search by videoId via a best-effort lookup.
    // If the caller passes the DB job id as jobId this also works directly.
    const dbJob = await dbGetRenderJob(jobId).catch(() => null);
    if (dbJob) {
      await dbUpdateRenderJob(jobId, {
        status: "completed",
        outputUrl,
        completedAt: new Date().toISOString(),
      });

      // ── Update video to "ready" ───────────────────────────────────────────
      const video = await getVideo(dbJob.videoId);
      if (video) {
        await updateVideo(video.id, {
          status: "ready",
          outputUrl,
          ...(durationSeconds > 0 ? { durationSeconds } : {}),
        });

        // ── Trigger pSEO generation ───────────────────────────────────────
        const pseoUrl = `${APP_URL}/api/pseo/generate`;
        await fetch(pseoUrl, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            // Forward the internal secret so the pSEO route can trust it
            ...(internalSecret ? { "x-internal-secret": internalSecret } : {}),
          },
          body: JSON.stringify({ videoId: video.id }),
        }).catch((err: unknown) => {
          // Non-fatal — pSEO generation failure should not block the response
          console.error("[render/complete] pSEO trigger failed:", err);
        });

        // ── Send video-complete email ─────────────────────────────────────
        // Look up user email from DB; skip if not available
        const { getUserByClerkId: lookupUser } = await import("@/lib/services/db");
        const videoOwner = await lookupUser(video.userId).catch(() => null);
        const toEmail = videoOwner?.email || `${video.userId}@placeholder.buildinsocial.com`;
        await sendEmail({
          to: toEmail,
          template: "video-complete",
          data: {
            displayName: "there",
            videoTitle: video.title,
            videoId: video.id,
          },
        }).catch((err: unknown) => {
          // Non-fatal
          console.error("[render/complete] sendEmail failed:", err);
        });
      }
    }

    return NextResponse.json({ data: { ok: true } });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Failed to process render completion";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
