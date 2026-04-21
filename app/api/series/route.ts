/**
 * GET  /api/series        — list series for the current user
 * POST /api/series        — create a new series
 *
 * Response shape: { data, error } per repo convention.
 *
 * Series is the primitive for multi-mode, multi-niche content plans. A user
 * can run many in parallel; the credit pool (lib/credits) enforces usage,
 * not series count. See plan file §Phase 1 for the full model.
 */

export const runtime = "nodejs";

import { NextResponse } from "next/server";
import { z } from "zod";
import { getAuthUserId } from "@/lib/auth";
import { createSeries, listSeriesForUser } from "@/lib/services/db";
import { checkRateLimit } from "@/lib/services/rate-limit";

const PLATFORMS = ["youtube", "instagram", "linkedin", "x"] as const;
const MODES = ["faceless", "stock-ai-avatar", "heygen-avatar", "combo"] as const;
const FREQUENCIES = ["daily", "3x-week", "5x-week", "custom"] as const;
const FACELESS_STYLES = ["dev-log", "documentary", "minimal-text", "slide"] as const;
const HEYGEN_SOURCES = ["licensed", "twin"] as const;

// Narrow the content-type enum to the values the Series type accepts. Keep in
// sync with ContentType in lib/types/video.
const CONTENT_TYPES = [
  "feature-drop",
  "founder-story",
  "tutorial",
  "roadmap-tease",
  "problem-solution",
  "social-proof",
  "domain-tip",
  "domain-opinion",
  "domain-case-study",
  "domain-myth-bust",
  "series-episode",
] as const;

const createSchema = z
  .object({
    name: z.string().min(1).max(120),
    topic: z.string().min(1).max(500),
    contentType: z.enum(CONTENT_TYPES),
    facelessStyle: z.enum(FACELESS_STYLES),
    frequency: z.enum(FREQUENCIES),
    platforms: z.array(z.enum(PLATFORMS)).min(1).max(PLATFORMS.length),
    mode: z.enum(MODES),
    heygenAvatarSource: z.enum(HEYGEN_SOURCES).optional(),
    stockAvatarId: z.string().min(1).max(120).optional(),
    heygenLicensedAvatarId: z.string().min(1).max(120).optional(),
    voiceId: z.string().min(1).max(120).optional(),
    startDate: z.string().datetime().optional(),
  })
  .strict()
  // HeyGen avatar source is only valid when the mode actually uses HeyGen.
  // "combo" is permitted to carry a HeyGen source because the combo picker
  // may choose HeyGen renders for individual videos.
  .refine(
    (d) => {
      if (d.mode === "heygen-avatar" || d.mode === "combo") {
        // source is required when the series is heygen-avatar; optional on combo.
        if (d.mode === "heygen-avatar" && !d.heygenAvatarSource) return false;
        return true;
      }
      // faceless / stock-ai-avatar must not carry a HeyGen source.
      return d.heygenAvatarSource === undefined;
    },
    { message: "heygenAvatarSource must accompany HeyGen modes and not other modes" }
  );

export async function GET() {
  let userId: string;
  try {
    userId = await getAuthUserId();
  } catch {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  const series = await listSeriesForUser(userId);
  return NextResponse.json({ data: series, error: null });
}

export async function POST(req: Request) {
  let userId: string;
  try {
    userId = await getAuthUserId();
  } catch {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const limited = await checkRateLimit(userId, "series/create", 10, "1 m");
  if (limited) return limited;

  let raw: unknown;
  try {
    raw = await req.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON body" }, { status: 400 });
  }
  const parsed = createSchema.safeParse(raw);
  if (!parsed.success) {
    return NextResponse.json(
      { error: "Invalid fields", details: parsed.error.flatten() },
      { status: 400 }
    );
  }

  const created = await createSeries(userId, {
    name: parsed.data.name,
    topic: parsed.data.topic,
    contentType: parsed.data.contentType,
    facelessStyle: parsed.data.facelessStyle,
    frequency: parsed.data.frequency,
    platforms: [...parsed.data.platforms],
    mode: parsed.data.mode,
    heygenAvatarSource: parsed.data.heygenAvatarSource,
    stockAvatarId: parsed.data.stockAvatarId,
    heygenLicensedAvatarId: parsed.data.heygenLicensedAvatarId,
    voiceId: parsed.data.voiceId,
    startDate: parsed.data.startDate ?? new Date().toISOString(),
  });

  return NextResponse.json({ data: created, error: null }, { status: 201 });
}
