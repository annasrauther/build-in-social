/**
 * POST /api/plan/preview
 * Generate a free week-of-titles preview for onboarding. No render, no credit
 * deduction — this is the zero-cost "what am I buying?" demo. Activation
 * happens later via Stripe checkout from /settings/billing.
 *
 * Runs unauthenticated in dev (and optionally in prod) so visitors can see a
 * preview before they sign up. Hard-caps input sizes so anonymous traffic
 * can't DOS the Haiku pool.
 */

export const runtime = "nodejs";

import { NextResponse } from "next/server";
import { z } from "zod";
import { generateSeriesPlan } from "@/lib/services/claude";
import type { Platform } from "@/lib/types/user";

const PLATFORMS = ["youtube", "instagram", "linkedin", "x"] as const;
const MODES = ["faceless", "stock-ai-avatar", "heygen-avatar", "combo"] as const;

const BodySchema = z
  .object({
    niche: z.string().min(3).max(200),
    mode: z.enum(MODES),
    platforms: z.array(z.enum(PLATFORMS)).min(1).max(4).optional(),
    tone: z.string().max(40).optional(),
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

  const { niche, mode, tone } = parsed.data;
  const platforms: Platform[] = parsed.data.platforms ?? [
    "youtube",
    "linkedin",
  ];

  // Fan out one SeriesPlan request per platform to get platform-native
  // angles. Claude Haiku is cheap enough that five parallel calls are
  // acceptable for a preview. Combine into a single week shape.
  const weekPromises = platforms.map(async (platform) => {
    const plans = await generateSeriesPlan({
      topic: niche,
      contentType: "domain-tip",
      tone: tone ?? "confident",
      platform,
      videoCount: 1,
    });
    const plan = plans[0];
    return {
      platform,
      title: plan?.title ?? `${niche} \u2014 ${platform}`,
      hook: plan?.hook ?? "",
      angle: plan?.angle ?? "",
      suggestedLength: plan?.suggestedLength ?? 45,
    };
  });

  try {
    const week = await Promise.all(weekPromises);
    return NextResponse.json({
      data: {
        niche,
        mode,
        platforms,
        week,
      },
      error: null,
    });
  } catch (err) {
    console.error("[plan/preview]", err);
    return NextResponse.json({ error: "Preview generation failed" }, { status: 500 });
  }
}
