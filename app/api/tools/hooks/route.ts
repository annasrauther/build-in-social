/**
 * POST /api/tools/hooks
 * Free public tool — takes a single topic and returns one hook per platform.
 *
 * Zero-signup, zero-render. Runs a tight Haiku prompt via the existing
 * generateHookVariants helper fanned across platforms. Rate-limited by IP so
 * anonymous traffic can't burn Haiku spend.
 */

export const runtime = "nodejs";

import { NextResponse } from "next/server";
import { z } from "zod";
import { generateHookVariants } from "@/lib/services/claude";
import type { Platform } from "@/lib/types/user";

const PLATFORMS: Platform[] = ["youtube", "instagram", "linkedin", "x"];

const BodySchema = z
  .object({
    topic: z.string().min(3).max(240),
  })
  .strict();

export async function POST(req: Request) {
  let raw: unknown;
  try {
    raw = await req.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON body" }, { status: 400 });
  }
  const parsed = BodySchema.safeParse(raw);
  if (!parsed.success) {
    return NextResponse.json(
      { error: "Invalid fields", details: parsed.error.flatten() },
      { status: 400 },
    );
  }

  const { topic } = parsed.data;

  // Fan across platforms in parallel — Haiku is cheap enough for 4 small
  // calls per request. We return the first variant per platform; the UI can
  // expose "regenerate" later to rotate through the others.
  try {
    const hooks = await Promise.all(
      PLATFORMS.map(async (platform) => {
        const variants = await generateHookVariants({
          script: topic,
          topicLabel: "founder_story",
          platform,
        });
        return {
          platform,
          hook: variants[0]?.hook ?? "",
          type: variants[0]?.type ?? "bold_claim",
        };
      }),
    );
    return NextResponse.json({ data: { topic, hooks }, error: null });
  } catch (err) {
    console.error("[tools/hooks]", err);
    return NextResponse.json(
      { error: "Hook generation failed" },
      { status: 500 },
    );
  }
}
