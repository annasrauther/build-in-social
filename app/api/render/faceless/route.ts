/**
 * POST /api/render/faceless
 * Submit a faceless render job for an approved video.
 *
 * Body: { videoId: string }
 * Returns: { data: { jobId: string, status: string } }
 */

export const runtime = "nodejs";

import { NextRequest, NextResponse } from "next/server";
import { getVideo, updateVideo, createRenderJob } from "@/lib/services/db";
import { enqueueRenderJob } from "@/lib/services/queue";
import { requireAuth } from "@/lib/auth";
import { checkRateLimit } from "@/lib/services/rate-limit";
import { deductCreditForRender, refundCreditForRender } from "@/lib/services/credits";
import { INTERNAL_SECRET, APP_URL } from "@/lib/env";

export async function POST(req: NextRequest) {
  // SECURITY (S2): Fail closed — refuse to enqueue work we can't authenticate
  // the render worker for. Mirrors /api/render/complete and /api/render/process.
  if (!INTERNAL_SECRET) {
    return NextResponse.json(
      { error: "Server misconfigured: INTERNAL_SECRET not set" },
      { status: 500 }
    );
  }

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

    // ── Critical path #1: deduct BEFORE submitting render ────────────────
    const deduction = await deductCreditForRender(userId, videoId);
    if (!deduction.ok) {
      if (deduction.reason === "INSUFFICIENT_CREDITS") {
        return NextResponse.json(
          {
            error: "insufficient_credits",
            message:
              "You've used your monthly video budget. Upgrade your plan or wait until next month.",
            remaining: deduction.remaining,
            budget: deduction.budget,
          },
          { status: 402 }
        );
      }
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    // Create the DB render job and enqueue the worker. If either fails, refund.
    let dbJobId: string | null = null;
    try {
      const dbJob = await createRenderJob({
        userId,
        videoId,
        status: "queued",
      });
      dbJobId = dbJob.id;

      const queueJob = await enqueueRenderJob(videoId, userId);

      await updateVideo(videoId, {
        status: "rendering",
        renderJobId: dbJob.id,
      });

      // ── Fire-and-forget the render worker ─────────────────────────────────
      // Not awaited — the response returns immediately; processing happens async.
      const processUrl = `${APP_URL}/api/render/process`;
      fetch(processUrl, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "x-internal-secret": INTERNAL_SECRET,
        },
        body: JSON.stringify({
          jobId: queueJob.id,
          dbJobId: dbJob.id,
          videoId,
          userId,
        }),
      }).catch((err: unknown) =>
        console.error("[render/faceless] process trigger failed:", err)
      );

      return NextResponse.json({
        data: {
          jobId: queueJob.id,
          dbJobId: dbJob.id,
          status: queueJob.status,
          credits: {
            remaining: deduction.remaining,
            budget: deduction.budget,
          },
        },
      });
    } catch (submitError) {
      // Refund the credit so the user isn't billed for a render that never started.
      await refundCreditForRender(userId, videoId).catch((err) =>
        console.error("[render/faceless] refund failed:", err)
      );
      if (dbJobId) {
        // Best-effort cleanup of the DB record so it isn't left in queued state.
        await updateVideo(videoId, { status: "draft", renderJobId: undefined }).catch(
          () => undefined
        );
      }
      throw submitError;
    }
  } catch (error) {
    // SECURITY (M6): log full error, return generic message to client.
    console.error("[render/faceless] error:", error);
    return NextResponse.json({ error: "Internal error" }, { status: 500 });
  }
}
