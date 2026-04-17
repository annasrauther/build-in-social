/**
 * POST /api/waitlist/avatar
 * Public endpoint — no auth required. Captures email for the Avatar Mode
 * Phase 2 cohort waitlist.
 *
 * Body: { email: string }
 * Response: { data: { position: number, alreadyOnList: boolean } }
 */

export const runtime = "nodejs";

import { NextResponse } from "next/server";
import { z } from "zod";
import { addToAvatarWaitlist } from "@/lib/services/db";

const WaitlistSchema = z.object({
  email: z.string().email().max(254),
});

export async function POST(req: Request) {
  let body: unknown;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON" }, { status: 400 });
  }
  const parsed = WaitlistSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json(
      { error: "Enter a valid email address." },
      { status: 400 }
    );
  }

  try {
    const { added, position } = await addToAvatarWaitlist(parsed.data.email);
    return NextResponse.json({
      data: { position, alreadyOnList: !added },
      error: null,
    });
  } catch (err) {
    console.error("[waitlist/avatar]", err);
    return NextResponse.json(
      { error: "Failed to join waitlist" },
      { status: 500 }
    );
  }
}
