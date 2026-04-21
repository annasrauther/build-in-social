/**
 * POST /api/render/avatar-process
 * Internal render worker for Avatar Mode. Wires: HeyGen → poll → download → R2 → DB.
 *
 * Called fire-and-forget by /api/render/avatar immediately after enqueuing.
 * Secured by x-internal-secret header.
 *
 * Body: { jobId, dbJobId, videoId, userId, avatarId, voiceId }
 */

export const runtime = "nodejs";
export const maxDuration = 300;

import { NextRequest, NextResponse } from "next/server";
import {
  getVideo,
  updateVideo,
  updateRenderJob,
  createPseoPage,
  getPseoPageByVideoId,
  getUserByClerkId,
} from "@/lib/services/db";
import { updateRenderJob as updateQueueJob } from "@/lib/services/queue";
import { generateVideo, getVideoStatus } from "@/lib/services/heygen";
import { uploadBuffer } from "@/lib/services/r2";
import { generateVTT, buildCaptionSegments } from "@/lib/services/captions";
import { generatePseoPage } from "@/lib/services/claude";
import { sendEmail } from "@/lib/services/resend";
import { refundCreditForRender } from "@/lib/services/credits";
import { INTERNAL_SECRET, APP_URL } from "@/lib/env";
import { timingSafeStringEquals } from "@/lib/security/compare";

/** Platform → [width, height] */
function dimensionsForPlatform(platform: string): [number, number] {
  switch (platform) {
    case "linkedin":
      return [1280, 720]; // 16:9
    case "x":
      return [1080, 1080]; // 1:1
    case "youtube":
    case "instagram":
    default:
      return [1080, 1920]; // 9:16
  }
}

/** Exponential backoff delay, capped at 30s */
function backoffDelay(attempt: number): number {
  return Math.min(5000 * Math.pow(2, attempt), 30000);
}

export async function POST(req: NextRequest) {
  if (!INTERNAL_SECRET) {
    return NextResponse.json(
      { error: "Server misconfigured: INTERNAL_SECRET not set" },
      { status: 500 }
    );
  }
  const provided = req.headers.get("x-internal-secret") ?? "";
  if (!timingSafeStringEquals(provided, INTERNAL_SECRET)) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const body = await req.json() as Record<string, unknown>;
  const jobId = String(body.jobId ?? "");
  const dbJobId = String(body.dbJobId ?? "");
  const videoId = String(body.videoId ?? "");
  const userId = String(body.userId ?? "");
  const avatarId = String(body.avatarId ?? "");
  const voiceId = String(body.voiceId ?? "");

  if (!jobId || !videoId || !userId || !avatarId || !voiceId) {
    return NextResponse.json(
      { error: "jobId, videoId, userId, avatarId, voiceId are required" },
      { status: 400 }
    );
  }

  async function failRender(reason: string) {
    console.error("[render/avatar-process] failing render:", reason);
    await updateQueueJob(jobId, {
      status: "failed",
      error: reason,
      completedAt: new Date().toISOString(),
    }).catch(() => null);
    if (dbJobId) {
      await updateRenderJob(dbJobId, {
        status: "failed",
        errorMessage: reason,
        completedAt: new Date().toISOString(),
      }).catch(() => null);
    }
    await updateVideo(videoId, { status: "failed" }).catch(() => null);
    await refundCreditForRender(userId, videoId).catch(() => null);
  }

  try {
    await updateQueueJob(jobId, {
      status: "processing",
      startedAt: new Date().toISOString(),
    }).catch(() => null);

    // ── 1. Fetch video ────────────────────────────────────────────────────────
    const video = await getVideo(videoId);
    if (!video) {
      await failRender("Video not found");
      return NextResponse.json({ data: { ok: true } });
    }

    const fullScript = [video.scriptJson.hook, video.scriptJson.body, video.scriptJson.cta]
      .filter(Boolean)
      .join(" ");

    // ── 2. HeyGen — generate avatar video ────────────────────────────────────
    const [width, height] = dimensionsForPlatform(video.platform);
    const { videoId: heygenVideoId } = await generateVideo({
      avatarId,
      voiceId,
      script: fullScript,
      width,
      height,
    });

    // ── 3. Poll HeyGen status with exponential backoff ────────────────────────
    const MAX_ATTEMPTS = 20;
    let heygenVideoUrl: string | undefined;
    let heygenDuration: number | undefined;
    let heygenThumbnail: string | undefined;

    for (let attempt = 0; attempt < MAX_ATTEMPTS; attempt++) {
      if (attempt > 0) {
        await new Promise((r) => setTimeout(r, backoffDelay(attempt - 1)));
      }

      const statusResult = await getVideoStatus({ videoId: heygenVideoId });

      if (statusResult.status === "failed") {
        await failRender(statusResult.error ?? "HeyGen video generation failed");
        return NextResponse.json({ data: { ok: true } });
      }

      if (statusResult.status === "completed") {
        heygenVideoUrl = statusResult.video_url;
        heygenDuration = statusResult.duration;
        heygenThumbnail = statusResult.thumbnail_url;
        break;
      }

      // status === "processing" — continue polling
    }

    if (!heygenVideoUrl) {
      await failRender("HeyGen video did not complete within the polling window");
      return NextResponse.json({ data: { ok: true } });
    }

    // ── 4. Download video from HeyGen ─────────────────────────────────────────
    const downloadRes = await fetch(heygenVideoUrl);
    if (!downloadRes.ok) {
      await failRender(`Failed to download HeyGen video: ${downloadRes.status}`);
      return NextResponse.json({ data: { ok: true } });
    }
    const videoBuffer = Buffer.from(await downloadRes.arrayBuffer());

    // ── 5. Upload to R2 ───────────────────────────────────────────────────────
    const baseKey = `videos/${userId}/${videoId}_avatar_${Date.now()}`;
    const { publicUrl: outputUrl } = await uploadBuffer({
      key: `${baseKey}.mp4`,
      buffer: videoBuffer,
      contentType: "video/mp4",
    });

    // ── 5a. Generate WebVTT sidecar (non-fatal) ───────────────────────────────
    let vttUrl: string | undefined;
    try {
      const durationForCaptions = heygenDuration ?? video.durationSeconds ?? 60;
      const segments = buildCaptionSegments(fullScript, durationForCaptions);
      const vttString = generateVTT(segments);
      const vttBuffer = Buffer.from(vttString, "utf8");
      const { publicUrl } = await uploadBuffer({
        key: `${baseKey}.vtt`,
        buffer: vttBuffer,
        contentType: "text/vtt",
      });
      vttUrl = publicUrl;
    } catch (err) {
      console.warn("[render/avatar-process] VTT generation failed (non-fatal):", err);
    }

    // ── 6. DB — mark render job + video complete ──────────────────────────────
    const completedAt = new Date().toISOString();
    await updateQueueJob(jobId, {
      status: "complete",
      outputUrl,
      completedAt,
    }).catch(() => null);

    if (dbJobId) {
      await updateRenderJob(dbJobId, {
        status: "completed",
        outputUrl,
        completedAt,
      });
    }

    await updateVideo(videoId, {
      status: "ready",
      outputUrl,
      renderMode: "avatar",
      ...(vttUrl ? { captionUrl: vttUrl } : {}),
      ...(heygenThumbnail ? { thumbnailUrl: heygenThumbnail } : {}),
      ...(heygenDuration && heygenDuration > 0 ? { durationSeconds: heygenDuration } : {}),
    });

    // ── 7. pSEO — auto-generate (non-fatal) ───────────────────────────────────
    const existingPage = await getPseoPageByVideoId(videoId).catch(() => null);
    if (!existingPage) {
      try {
        const generated = await generatePseoPage({
          script: fullScript,
          videoTitle: video.title,
          platform: video.platform,
          brandName: "Build In Social",
          pseoKeywords: [],
        });
        const canonicalUrl = `${APP_URL}/p/${generated.slug}`;
        await createPseoPage({
          userId,
          videoId,
          title: generated.title,
          slug: generated.slug,
          htmlContent: generated.htmlContent,
          metaDescription: generated.metaDescription,
          faqJson: generated.faqJson,
          videoObjectJsonLd: generated.videoObjectJsonLd,
          canonicalUrl,
        });
      } catch (err) {
        console.warn("[render/avatar-process] pSEO generation failed (non-fatal):", err);
      }
    }

    // ── 8. Email — video ready notification (non-fatal) ──────────────────────
    try {
      const user = await getUserByClerkId(userId).catch(() => null);
      await sendEmail({
        to: user?.email ?? `${userId}@placeholder.buildinsocial.com`,
        template: "video-complete",
        data: {
          displayName: user?.displayName ?? "there",
          videoTitle: video.title,
          videoId,
        },
      });
    } catch (err) {
      console.warn("[render/avatar-process] sendEmail failed (non-fatal):", err);
    }

    return NextResponse.json({ data: { ok: true, outputUrl } });
  } catch (error) {
    const msg = error instanceof Error ? error.message : "Avatar render failed";
    await failRender(msg);
    return NextResponse.json({ data: { ok: true } });
  }
}
