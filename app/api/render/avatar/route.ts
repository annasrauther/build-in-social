/**
 * POST /api/render/avatar
 * Submit an avatar render job for an approved video.
 *
 * Body: { videoId: string, avatarId: string, voiceId: string }
 * Returns: { data: { jobId: string, dbJobId: string, status: string, credits: {...} } }
 */

export const runtime = "nodejs";

import { NextRequest, NextResponse } from "next/server";
import {
  getVideo,
  updateVideo,
  createRenderJob,
  getUserByClerkId,
} from "@/lib/services/db";
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
import { INTERNAL_SECRET, APP_URL } from "@/lib/env";
import { z } from "zod";

const BodySchema = z.object({
  videoId: z.string().min(1).max(120),
  avatarId: z.string().min(1).max(120),
  voiceId: z.string().min(1).max(120),
  // Credit kind for this render. Defaults to HeyGen licensed — the existing
  // callers assume a HeyGen marketplace avatar. Pass "heygen-twin" when
  // rendering the user's trained digital twin, or "stock-ai-avatar" for
  // cheap text-overlay renders that still flow through this endpoint.
  renderKind: z
    .enum(["heygen-licensed", "heygen-twin", "stock-ai-avatar"])
    .optional(),
});

export async function POST(req: NextRequest) {
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

  const limited = await checkRateLimit(userId, "render/avatar", 5, "1 m");
  if (limited) return limited;

  try {
    const rawBody = await req.json().catch(() => null);
    const parsed = BodySchema.safeParse(rawBody);
    if (!parsed.success) {
      return NextResponse.json({ error: "invalid_request" }, { status: 400 });
    }
    const { avatarId, voiceId } = parsed.data;
    const videoId = parsed.data.videoId.trim();
    const renderKind = parsed.data.renderKind ?? "heygen-licensed";

    const video = await getVideo(videoId);
    if (!video) {
      return NextResponse.json({ error: "Video not found" }, { status: 404 });
    }
    if (video.userId !== userId) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    // ── Credit deduction ─────────────────────────────────────────────────────
    // HeyGen renders are 15× the cost of faceless (~$6–7 upstream vs ~$0.50).
    // Stock-AI avatar is the exception — shares the faceless cost. The caller
    // picks which kind in the body; default matches historical behavior.
    const deduction = await deductCreditForRender(userId, videoId, renderKind);
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

      // ── Fire-and-forget the avatar render worker ──────────────────────────
      const processUrl = `${APP_URL}/api/render/avatar-process`;
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
          avatarId,
          voiceId,
        }),
      }).catch((err: unknown) =>
        console.error("[render/avatar] process trigger failed:", err)
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
      await refundCreditForRender(userId, videoId).catch((err) =>
        console.error("[render/avatar] refund failed:", err)
      );
      if (dbJobId) {
        await updateVideo(videoId, { status: "draft", renderJobId: undefined }).catch(
          () => undefined
        );
      }
      throw submitError;
    }
  } catch (error) {
    console.error("[render/avatar] error:", error);
    return NextResponse.json({ error: "Internal error" }, { status: 500 });
  }
}
