/**
 * PATCH /api/script/update
 *
 * Inline direct-edit of a video's script body (not an AI revision).
 * This is a user-authored plain-text edit — it bypasses Claude entirely.
 *
 * Rate limit: 10 edits per video per day (per-user sliding window).
 * Zod validation: script 1–2000 chars.
 */

import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { getOrCreateUser } from "@/lib/auth";
import { getVideo, updateVideo } from "@/lib/services/db";
import { checkRateLimit } from "@/lib/services/rate-limit";
import type { User } from "@/lib/types/user";

const DAILY_EDITS_PER_USER = 10;

const bodySchema = z
  .object({
    videoId: z.string().min(1),
    script: z.string().min(1).max(2000),
  })
  .strict();

/**
 * In-memory per-user/day counter. Used when Upstash Redis is not configured.
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
  return { count: existing.count, exceeded: existing.count > DAILY_EDITS_PER_USER };
}

export async function PATCH(req: NextRequest) {
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
  const { videoId, script } = parsed.data;

  // 3. Rate limit — Upstash first (authoritative), memory fallback
  const limited = await checkRateLimit(
    user.id,
    "script/update/daily",
    DAILY_EDITS_PER_USER,
    "1 d"
  );
  if (limited) return limited;

  const mem = bumpMemoryDaily(user.id);
  if (mem.exceeded) {
    return NextResponse.json(
      { data: null, error: { message: "Daily edit limit reached — try again tomorrow." } },
      { status: 429 }
    );
  }

  // 4. Load + authorize video
  const video = await getVideo(videoId);
  if (!video) return NextResponse.json({ error: "Not found" }, { status: 404 });
  if (video.userId !== user.id) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  // 5. Status gate — can only edit scripts on editable videos
  if (video.status !== "draft" && video.status !== "approved") {
    return NextResponse.json(
      { error: "Script cannot be edited once rendering or live." },
      { status: 400 }
    );
  }

  // 6. Persist the direct edit — update script body only, preserve hook and cta
  const updatedScript = {
    ...video.scriptJson,
    body: script,
  };

  const updated = await updateVideo(videoId, { scriptJson: updatedScript });

  return NextResponse.json({
    data: { script: updated.scriptJson.body },
    error: null,
  });
}
