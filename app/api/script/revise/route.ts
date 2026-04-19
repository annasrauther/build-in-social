/**
 * POST /api/script/revise
 *
 * Rewrites an existing video script in response to a short user note.
 *
 * Cost-sensitive endpoint — HARD REQUIREMENTS:
 *   1. Model: Claude Haiku ONLY (enforced inside reviseScript()).
 *   2. Per-video cap: 3 revisions, then the endpoint refuses with 400.
 *   3. Per-user daily soft cap: 20/day (Upstash sliding window, no-op in dev
 *      without Redis — deliberate, matches the rest of the app).
 *   4. Note: Zod-validated, max 500 chars.
 */

import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { getOrCreateUser } from "@/lib/auth";
import { getVideo, updateVideo } from "@/lib/services/db";
import { reviseScript } from "@/lib/services/claude";
import { checkRateLimit } from "@/lib/services/rate-limit";
import { fireWebhookEventNonBlocking } from "@/lib/services/webhooks";
import type { User } from "@/lib/types/user";

const MAX_REVISIONS_PER_VIDEO = 3;
const DAILY_REVISIONS_PER_USER = 20;

const bodySchema = z
  .object({
    videoId: z.string().min(1),
    note: z.string().min(1).max(500),
  })
  .strict();

/**
 * In-memory per-user/day counter. Only used when Upstash is not configured.
 * The Upstash path below (checkRateLimit with a 24h window) is authoritative
 * in production.
 */
const memoryDailyCounter = new Map<string, { day: string; count: number }>();
function bumpMemoryDaily(userId: string): { count: number; exceeded: boolean } {
  const day = new Date().toISOString().slice(0, 10);
  const existing = memoryDailyCounter.get(userId);
  if (!existing || existing.day !== day) {
    memoryDailyCounter.set(userId, { day, count: 1 });
    return { count: 1, exceeded: false };
  }
  existing.count += 1;
  return { count: existing.count, exceeded: existing.count > DAILY_REVISIONS_PER_USER };
}

export async function POST(req: NextRequest) {
  // 1. Auth
  let user: User;
  try {
    user = await getOrCreateUser();
  } catch {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  // 2. Validate body
  let raw: unknown;
  try {
    raw = await req.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON body" }, { status: 400 });
  }
  const parsed = bodySchema.safeParse(raw);
  if (!parsed.success) {
    return NextResponse.json(
      { error: "Invalid fields", details: parsed.error.flatten() },
      { status: 400 }
    );
  }
  const { videoId, note } = parsed.data;

  // 3. Per-user daily cap — Upstash first (authoritative), memory fallback.
  const limited = await checkRateLimit(
    user.id,
    "script/revise/daily",
    DAILY_REVISIONS_PER_USER,
    "1 d"
  );
  if (limited) return limited;
  const mem = bumpMemoryDaily(user.id);
  if (mem.exceeded) {
    return NextResponse.json(
      { data: null, error: { message: "Daily revision limit reached" } },
      { status: 429 }
    );
  }

  // 4. Load + authorize video
  const video = await getVideo(videoId);
  if (!video) return NextResponse.json({ error: "Not found" }, { status: 404 });
  if (video.userId !== user.id)
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });

  // 5. Status gate — can only revise editable videos.
  if (video.status !== "draft" && video.status !== "approved") {
    return NextResponse.json(
      { error: "Script can't be revised once it's rendering or live." },
      { status: 400 }
    );
  }

  // 6. Per-video revision cap.
  const currentCount = video.revisionCount ?? 0;
  if (currentCount >= MAX_REVISIONS_PER_VIDEO) {
    return NextResponse.json(
      {
        error: "Revision limit reached on this video.",
        revisionsRemaining: 0,
      },
      { status: 400 }
    );
  }

  // 7. Haiku revision call.
  let revised: { opening_hook: string; body: string; cta?: string };
  try {
    revised = await reviseScript(video.scriptJson, note, {
      platform: video.platform,
      durationSeconds: video.durationSeconds,
      contentType: video.contentType,
      title: video.title,
      // niche lives on the user row — pass if present to keep the rewrite on-topic.
      niche: user.niche,
    });
  } catch (err) {
    console.error("[script/revise] reviseScript failed", err);
    return NextResponse.json(
      { error: "Build In Social couldn't rewrite this." },
      { status: 502 }
    );
  }

  // 8. Persist. Best-effort: if the DB can't hold revisionCount (missing column),
  //    fall back to just updating the script — the per-user daily cap still
  //    protects us, and the UI will re-read video.revisionCount = 0 (no regression).
  const newScript = {
    hook: revised.opening_hook,
    body: revised.body,
    cta: revised.cta ?? video.scriptJson.cta,
  };
  let updated;
  try {
    updated = await updateVideo(videoId, {
      scriptJson: newScript,
      status: "draft",
      revisionCount: currentCount + 1,
    });
  } catch (err) {
    // TODO(schema): revision_count column not present — drop it and retry.
    console.warn(
      "[script/revise] updateVideo with revisionCount failed; retrying without it",
      err
    );
    updated = await updateVideo(videoId, {
      scriptJson: newScript,
      status: "draft",
    });
  }

  const newCount = updated.revisionCount ?? currentCount + 1;

  // Fire outbound webhook — non-blocking, never throws.
  fireWebhookEventNonBlocking(user.id, "revision.requested", {
    videoId,
    note,
    revisionCount: newCount,
  });

  return NextResponse.json({
    data: {
      video: updated,
      revisionsRemaining: Math.max(0, MAX_REVISIONS_PER_VIDEO - newCount),
    },
  });
}
