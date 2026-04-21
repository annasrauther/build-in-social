/**
 * POST /api/avatar/render
 * Generates a HeyGen avatar video from a script + avatar + voice.
 * Any paid tier can render with stock avatars; Creator+ can render with twin.
 */

export const runtime = "nodejs";

import { NextResponse } from "next/server";
import { z } from "zod";
import { getOrCreateUser } from "@/lib/auth";
import { checkRateLimit } from "@/lib/services/rate-limit";
import { generateVideo } from "@/lib/services/heygen";
import { canCreateTwin } from "@/lib/utils/avatar-access";

const schema = z.object({
  avatarId: z.string().min(1).max(200),
  voiceId: z.string().min(1).max(200),
  script: z.string().min(1).max(4000),
  width: z.number().int().positive().max(4096).optional(),
  height: z.number().int().positive().max(4096).optional(),
  /**
   * When true, the caller asserts `avatarId` is a user-trained twin. Triggers
   * tier gating for Creator+. Stock avatar ids (prefix `stock-*`) skip this.
   */
  isTwin: z.boolean().optional(),
});

export async function POST(request: Request) {
  let userId: string;
  let tier: string;
  try {
    const user = await getOrCreateUser();
    userId = user.clerkUserId;
    tier = user.subscriptionTier;
  } catch {
    return NextResponse.json({ data: null, error: "Unauthorized" }, { status: 401 });
  }

  const limited = await checkRateLimit(userId, "avatar/render", 30, "1 h");
  if (limited) return limited;

  try {
    const raw = await request.json();
    const parsed = schema.safeParse(raw);
    if (!parsed.success) {
      return NextResponse.json(
        { data: null, error: "Invalid input", details: parsed.error.flatten() },
        { status: 400 },
      );
    }

    if (parsed.data.isTwin && !canCreateTwin(tier as Parameters<typeof canCreateTwin>[0])) {
      return NextResponse.json(
        { data: null, error: "Twin renders require the Creator plan or higher." },
        { status: 402 },
      );
    }

    const result = await generateVideo({
      avatarId: parsed.data.avatarId,
      voiceId: parsed.data.voiceId,
      script: parsed.data.script,
      width: parsed.data.width,
      height: parsed.data.height,
    });

    return NextResponse.json({ data: result, error: null });
  } catch (error) {
    console.error("[avatar/render] error:", error);
    return NextResponse.json({ data: null, error: "Internal error" }, { status: 500 });
  }
}
