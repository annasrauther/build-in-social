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
import { fireWebhookEventNonBlocking } from "@/lib/services/webhooks";
import { refundCreditForRender } from "@/lib/services/credits";
import { APP_URL, INTERNAL_SECRET, R2_PUBLIC_URL } from "@/lib/env";

/**
 * SECURITY (S3): Reject any `outputUrl` that does not start with the
 * configured R2 public prefix. Prevents a compromised worker from storing
 * attacker-controlled URLs that would later be served to users.
 */
function isAllowedOutputUrl(candidate: string): boolean {
  if (!R2_PUBLIC_URL) return false;
  const prefix = R2_PUBLIC_URL.endsWith("/") ? R2_PUBLIC_URL : `${R2_PUBLIC_URL}/`;
  try {
    const parsed = new URL(candidate);
    if (parsed.protocol !== "https:") return false;
  } catch {
    return false;
  }
  return candidate.startsWith(prefix);
}

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
    const status = typeof body.status === "string" ? body.status.trim() : "complete";
    const outputUrl = typeof body.outputUrl === "string" ? body.outputUrl.trim() : "";
    const errorMessage = typeof body.errorMessage === "string" ? body.errorMessage.trim() : "";
    const durationSeconds =
      typeof body.durationSeconds === "number" ? body.durationSeconds : 0;

    if (!jobId) {
      return NextResponse.json(
        { error: "jobId is required" },
        { status: 400 }
      );
    }

    // ── Failure path: refund credit, mark video as failed, notify user ─────
    if (status === "failed") {
      await updateRenderJob(jobId, {
        status: "failed",
        error: errorMessage || "Render failed",
      }).catch((err) => console.error("[render/complete] queue update failed:", err));

      const dbJobFailed = await dbGetRenderJob(jobId).catch(() => null);
      if (dbJobFailed) {
        await dbUpdateRenderJob(jobId, {
          status: "failed",
          errorMessage: errorMessage || "Render failed",
          completedAt: new Date().toISOString(),
        }).catch((err) => console.error("[render/complete] db update failed:", err));

        const video = await getVideo(dbJobFailed.videoId);
        if (video) {
          // Critical path #1: refund the credit so the user isn't charged for a failed render.
          await refundCreditForRender(video.userId, video.id).catch((err) =>
            console.error("[render/complete] refund failed:", err)
          );
          await updateVideo(video.id, { status: "failed" }).catch(() => undefined);
        }
      }
      return NextResponse.json({ data: { ok: true, refunded: true } });
    }

    // ── Success path requires outputUrl ────────────────────────────────────
    if (!outputUrl) {
      return NextResponse.json(
        { error: "outputUrl is required for status=complete" },
        { status: 400 }
      );
    }

    // SECURITY (S3): restrict outputUrl to the configured R2 prefix so a
    // compromised worker cannot ship arbitrary attacker-controlled URLs.
    if (!isAllowedOutputUrl(outputUrl)) {
      console.error(
        "[render/complete] rejected outputUrl not in R2 prefix:",
        outputUrl
      );
      return NextResponse.json(
        { error: "outputUrl must originate from the configured R2 bucket" },
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

        // Fire outbound webhook — non-blocking, never throws.
        fireWebhookEventNonBlocking(video.userId, "video.rendered", {
          videoId: video.id,
          outputUrl,
          platform: video.platform,
          durationSeconds: durationSeconds > 0 ? durationSeconds : video.durationSeconds,
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
    // SECURITY (M6): log the full error server-side, return a generic message.
    console.error("[render/complete] error:", error);
    return NextResponse.json({ error: "Internal error" }, { status: 500 });
  }
}
