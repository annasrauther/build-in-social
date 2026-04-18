/**
 * POST /api/waitlist
 * Public endpoint — no auth required. Captures emails from the landing page
 * CTA for early access / trial start.
 *
 * Body: { email: string }
 * Response: { data: { joined: boolean } }
 */

export const runtime = "nodejs";

import { NextResponse } from "next/server";
import { z } from "zod";
import { checkRateLimit } from "@/lib/services/rate-limit";

const WaitlistSchema = z.object({
  email: z.string().email().max(254),
});

export async function POST(req: Request) {
  // IP-keyed rate limit — unauth endpoint, 5 requests per minute.
  const ip =
    req.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ??
    req.headers.get("x-real-ip") ??
    "unknown";
  const limited = await checkRateLimit(`ip:${ip}`, "waitlist/general", 5, "1 m");
  if (limited) return limited;

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
      { status: 400 },
    );
  }

  // In Phase 1, log the email and return success.
  // Wire to a DB table or Resend audience when the integration is ready.
  console.info("[waitlist/general] new signup:", parsed.data.email);

  return NextResponse.json({
    data: { joined: true },
    error: null,
  });
}
