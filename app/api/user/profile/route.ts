import { NextRequest, NextResponse } from "next/server";
import { updateUser } from "@/lib/services/db";
import { getOrCreateUser } from "@/lib/auth";
import { checkRateLimit } from "@/lib/services/rate-limit";
import { z } from "zod";

const platformSchema = z.enum(["youtube", "instagram", "linkedin", "x"]);
const profileUpdateSchema = z.object({
  displayName: z.string().max(100).optional(),
  brandName: z.string().max(100).optional(),
  niche: z.string().max(200).optional(),
  tone: z.enum(["professional", "casual", "nerdy-warm", "fun-energetic"]).optional(),
  platforms: z.array(platformSchema).optional(),
  voiceNotes: z.string().max(1000).optional(),
}).strict();

/**
 * User profile API — uses Clerk auth. Lazy-creates the DB row on first
 * authenticated request via getOrCreateUser().
 */
export async function GET() {
  let user;
  try {
    user = await getOrCreateUser();
  } catch (err) {
    const msg = err instanceof Error ? err.message : "";
    if (msg === "UNAUTHORIZED") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
    return NextResponse.json({ error: "Failed to fetch profile" }, { status: 500 });
  }
  // SECURITY (S4): userId-keyed rate limit, 60/min.
  const limited = await checkRateLimit(user.id, "user/profile", 60, "1 m");
  if (limited) return limited;
  return NextResponse.json({ data: user, error: null });
}

export async function PATCH(req: NextRequest) {
  let user;
  try {
    user = await getOrCreateUser();
  } catch (err) {
    const msg = err instanceof Error ? err.message : "";
    if (msg === "UNAUTHORIZED") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
    return NextResponse.json({ error: "Failed to fetch profile" }, { status: 500 });
  }
  // SECURITY (S4): userId-keyed rate limit, 60/min.
  const limited = await checkRateLimit(user.id, "user/profile", 60, "1 m");
  if (limited) return limited;
  try {
    const raw = await req.json();
    const parsed = profileUpdateSchema.safeParse(raw);
    if (!parsed.success) {
      return NextResponse.json({ error: "Invalid fields", details: parsed.error.flatten() }, { status: 400 });
    }
    const updated = await updateUser(user.id, parsed.data);
    return NextResponse.json({ data: updated, error: null });
  } catch {
    return NextResponse.json({ error: "Failed to update profile" }, { status: 500 });
  }
}
