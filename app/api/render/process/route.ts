/**
 * POST /api/render/process
 * Internal render worker. Wires: ElevenLabs TTS → Pexels B-roll → FFmpeg → R2 → DB.
 *
 * Called fire-and-forget by /api/render/faceless immediately after enqueuing.
 * Secured by x-internal-secret header. Claude API calls fall back to mock when
 * ANTHROPIC_API_KEY is absent — the app works E2E without it.
 *
 * Body: { jobId, dbJobId, videoId, userId }
 */

export const runtime = "nodejs";
export const maxDuration = 300;

import { NextRequest, NextResponse } from "next/server";
import {
  getVideo,
  updateVideo,
  updateRenderJob,
  getVoiceProfilesForUser,
  createPseoPage,
  getPseoPageByVideoId,
  getUserByClerkId,
} from "@/lib/services/db";
import { updateRenderJob as updateQueueJob } from "@/lib/services/queue";
import { synthesizeSpeech } from "@/lib/services/elevenlabs";
import { searchVideos } from "@/lib/services/pexels";
import { assembleVideo } from "@/lib/services/ffmpeg";
import { uploadBuffer } from "@/lib/services/r2";
import { generateVTT, buildCaptionSegments } from "@/lib/services/captions";
import { generatePseoPage } from "@/lib/services/claude";
import { sendEmail } from "@/lib/services/resend";
import { refundCreditForRender } from "@/lib/services/credits";
import { INTERNAL_SECRET, APP_URL } from "@/lib/env";

const DEFAULT_VOICE_ID = "21m00Tcm4TlvDq8ikWAM"; // ElevenLabs: Rachel — clear, neutral

const STOP_WORDS = new Set([
  "about", "after", "again", "almost", "also", "another", "because", "before",
  "being", "between", "could", "doing", "every", "first", "found", "going",
  "great", "have", "having", "here", "just", "keep", "know", "like", "little",
  "made", "make", "most", "much", "never", "only", "other", "over", "really",
  "right", "same", "should", "since", "some", "still", "such", "than", "that",
  "their", "them", "then", "there", "these", "they", "thing", "think", "this",
  "those", "through", "time", "very", "want", "well", "were", "what", "when",
  "where", "which", "while", "will", "with", "would", "your",
]);

function extractKeywords(script: string): string {
  const words = script
    .toLowerCase()
    .replace(/[^a-z\s]/g, "")
    .split(/\s+/)
    .filter((w) => w.length > 4 && !STOP_WORDS.has(w));
  return words.slice(0, 3).join(" ") || "technology startup";
}

export async function POST(req: NextRequest) {
  // SECURITY (S2): Fail closed — refuse to boot without a secret rather than
  // fall back to a static dev token. Mirrors /api/render/complete.
  if (!INTERNAL_SECRET) {
    return NextResponse.json(
      { error: "Server misconfigured: INTERNAL_SECRET not set" },
      { status: 500 }
    );
  }
  const provided = req.headers.get("x-internal-secret");
  if (provided !== INTERNAL_SECRET) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const body = await req.json() as Record<string, unknown>;
  const jobId = String(body.jobId ?? "");
  const dbJobId = String(body.dbJobId ?? "");
  const videoId = String(body.videoId ?? "");
  const userId = String(body.userId ?? "");

  if (!jobId || !videoId || !userId) {
    return NextResponse.json(
      { error: "jobId, videoId, userId are required" },
      { status: 400 }
    );
  }

  async function failRender(reason: string) {
    console.error("[render/process] failing render:", reason);
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

    // ── 2. ElevenLabs TTS ─────────────────────────────────────────────────────
    const voiceProfiles = await getVoiceProfilesForUser(userId).catch(() => []);
    const voiceId = voiceProfiles[0]?.elevenLabsVoiceId ?? DEFAULT_VOICE_ID;
    const { audioUrl, durationSeconds: audioDuration } = await synthesizeSpeech({
      text: fullScript,
      voiceId,
    });

    // ── 3. Pexels B-roll (documentary style only) ─────────────────────────────
    let brollUrls: string[] = [];
    if (video.facelessStyle === "documentary") {
      try {
        const keywords = extractKeywords(fullScript);
        const clips = await searchVideos({ query: keywords, perPage: 3 });
        brollUrls = clips.map((c) => c.url);
      } catch (err) {
        console.warn("[render/process] Pexels failed — continuing without b-roll:", err);
      }
    }

    // ── 4. FFmpeg — assemble video ────────────────────────────────────────────
    const { videoBlob, durationSeconds: finalDuration } = await assembleVideo({
      style: (video.facelessStyle ?? "minimal-text") as "dev-log" | "documentary" | "minimal-text" | "slide",
      audioUrl,
      brollUrls,
      script: fullScript,
      durationSeconds: video.durationSeconds,
      platform: video.platform as "youtube" | "instagram" | "linkedin" | "x",
    });

    // ── 5. R2 — upload assembled video ────────────────────────────────────────
    const baseKey = `videos/${userId}/${videoId}_${Date.now()}`;
    const videoBuffer = Buffer.from(await videoBlob.arrayBuffer());
    const { publicUrl: outputUrl } = await uploadBuffer({
      key: `${baseKey}.mp4`,
      buffer: videoBuffer,
      contentType: "video/mp4",
    });

    // ── 5a. R2 — upload WebVTT sidecar (non-fatal) ────────────────────────────
    let vttUrl: string | undefined;
    try {
      const segments = buildCaptionSegments(fullScript, finalDuration > 0 ? finalDuration : audioDuration);
      const vttString = generateVTT(segments);
      const vttBuffer = Buffer.from(vttString, "utf8");
      const { publicUrl } = await uploadBuffer({
        key: `${baseKey}.vtt`,
        buffer: vttBuffer,
        contentType: "text/vtt",
      });
      vttUrl = publicUrl;
    } catch (err) {
      console.warn("[render/process] VTT generation failed (non-fatal):", err);
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

    const effectiveDuration = finalDuration > 0 ? finalDuration : audioDuration;
    await updateVideo(videoId, {
      status: "ready",
      outputUrl,
      // A7: persist caption sidecar URL so the video player can load the VTT track
      ...(vttUrl ? { captionUrl: vttUrl } : {}),
      ...(effectiveDuration > 0 ? { durationSeconds: effectiveDuration } : {}),
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
        console.warn("[render/process] pSEO generation failed (non-fatal):", err);
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
      console.warn("[render/process] sendEmail failed (non-fatal):", err);
    }

    return NextResponse.json({ data: { ok: true, outputUrl } });
  } catch (error) {
    const msg = error instanceof Error ? error.message : "Render failed";
    await failRender(msg);
    return NextResponse.json({ data: { ok: true } });
  }
}
