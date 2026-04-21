/**
 * POST /api/render/faceless
 * Submit a faceless render job for an approved video.
 *
 * Body: { videoId: string }
 * Returns: { data: { jobId: string, status: string } }
 */

export const runtime = "nodejs";

import { NextRequest, NextResponse } from "next/server";
import { getVideo, updateVideo, createRenderJob, getVoiceProfilesForUser } from "@/lib/services/db";
import { enqueueRenderJob } from "@/lib/services/queue";
import { requireAuth } from "@/lib/auth";
import { checkRateLimit } from "@/lib/services/rate-limit";
import {
  deductCreditForRender,
  refundCreditForRender,
  nextMonthResetIso,
  MONTHLY_VIDEO_BUDGET,
} from "@/lib/services/credits";
import { UPGRADE_PATH } from "@/lib/types/billing";
import { getUserByClerkId } from "@/lib/services/db";
import { canUseFeature } from "@/lib/billing/capabilities";
import { INTERNAL_SECRET, APP_URL } from "@/lib/env";
import { z } from "zod";

const BodySchema = z.object({
  videoId: z.string().min(1).max(120),
});

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
    const rawBody = await req.json().catch(() => null);
    const parsed = BodySchema.safeParse(rawBody);
    if (!parsed.success) {
      return NextResponse.json({ error: "invalid_request" }, { status: 400 });
    }
    const videoId = parsed.data.videoId.trim();

    const video = await getVideo(videoId);
    if (!video) {
      return NextResponse.json({ error: "Video not found" }, { status: 404 });
    }
    if (video.userId !== userId) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    // ── Tier gate: voice clone requires Creator+ ──────────────────────────
    // The render worker uses the user's first voice profile if present. If
    // that profile is a clone (isClone=true), enforce the tier requirement
    // here before consuming a credit.
    {
      const voiceProfiles = await getVoiceProfilesForUser(userId).catch(() => []);
      const usesClone = voiceProfiles.some((vp) => vp.isClone);
      if (usesClone) {
        const owner = await getUserByClerkId(userId).catch(() => null);
        const tier = owner?.subscriptionTier ?? "starter";
        if (!canUseFeature(tier, "voice_clone")) {
          return NextResponse.json(
            {
              error: "feature_not_available",
              feature: "voice_clone",
              tier,
              message:
                "Voice cloning is available on Creator and Studio plans. Your video will use a library voice instead, or upgrade to use your cloned voice.",
            },
            { status: 403 }
          );
        }
      }
    }

    // ── Critical path #1: deduct BEFORE submitting render ────────────────
    //
    // Hard-cap policy: when a user is at cap, we return 402 with
    // { error: "quota_exhausted", tier, cap, resetAt }. We NEVER auto-charge
    // for extras — the client surfaces an "Upgrade to {nextTier}" CTA instead.
    // Faceless renders bill 1 credit per video (see lib/credits/costs.ts).
    const deduction = await deductCreditForRender(userId, videoId, "faceless");
    if (!deduction.ok) {
      if (deduction.reason === "INSUFFICIENT_CREDITS") {
        const user = await getUserByClerkId(userId).catch(() => null);
        const tier = user?.subscriptionTier ?? "trial";
        const cap = MONTHLY_VIDEO_BUDGET[tier];
        const upgradeTo =
          tier === "trial" || tier === "studio"
            ? null
            : UPGRADE_PATH[tier as keyof typeof UPGRADE_PATH] ?? null;
        return NextResponse.json(
          {
            error: "quota_exhausted",
            tier,
            cap,
            used: cap,
            resetAt: nextMonthResetIso(),
            upgradeTo,
            message: `You've used this month's ${cap} videos. Upgrade${
              upgradeTo ? ` to ${upgradeTo}` : ""
            } for more, or wait until the reset date. You'll keep access to previous videos.`,
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
