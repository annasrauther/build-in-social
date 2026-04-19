/**
 * Brand kit API — GET + PATCH, auth-gated.
 * GET  /api/brand  → returns current user's brand kit
 * PATCH /api/brand → updates brand kit fields
 */

import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { getOrCreateUser } from "@/lib/auth";
import { getBrandKit, updateBrandKit } from "@/lib/services/brand";
import { checkRateLimit } from "@/lib/services/rate-limit";

const brandUpdateSchema = z
  .object({
    primaryColor: z
      .string()
      .regex(/^#[0-9A-Fa-f]{6}$/, "Must be a hex color")
      .optional(),
    accentColor: z
      .string()
      .regex(/^#[0-9A-Fa-f]{6}$/, "Must be a hex color")
      .optional(),
    logoUrl: z.string().url().nullable().optional(),
    watermarkPosition: z
      .enum(["top-left", "top-right", "bottom-left", "bottom-right", "none"])
      .optional(),
    fontStyle: z.enum(["modern", "bold", "minimal", "playful"]).optional(),
  })
  .strict();

export async function GET() {
  let user;
  try {
    user = await getOrCreateUser();
  } catch (err) {
    const msg = err instanceof Error ? err.message : "";
    if (msg === "UNAUTHORIZED") {
      return NextResponse.json({ data: null, error: "Unauthorized" }, { status: 401 });
    }
    return NextResponse.json({ data: null, error: "Failed to authenticate" }, { status: 500 });
  }

  const limited = await checkRateLimit(user.id, "brand/get", 60, "1 m");
  if (limited) return limited;

  try {
    const kit = await getBrandKit(user.id);
    return NextResponse.json({ data: kit, error: null });
  } catch {
    return NextResponse.json({ data: null, error: "Failed to fetch brand kit" }, { status: 500 });
  }
}

export async function PATCH(req: NextRequest) {
  let user;
  try {
    user = await getOrCreateUser();
  } catch (err) {
    const msg = err instanceof Error ? err.message : "";
    if (msg === "UNAUTHORIZED") {
      return NextResponse.json({ data: null, error: "Unauthorized" }, { status: 401 });
    }
    return NextResponse.json({ data: null, error: "Failed to authenticate" }, { status: 500 });
  }

  const limited = await checkRateLimit(user.id, "brand/patch", 30, "1 m");
  if (limited) return limited;

  try {
    const raw = await req.json();
    const parsed = brandUpdateSchema.safeParse(raw);
    if (!parsed.success) {
      return NextResponse.json(
        { data: null, error: "Invalid fields", details: parsed.error.flatten() },
        { status: 400 }
      );
    }
    const updated = await updateBrandKit(user.id, parsed.data);
    return NextResponse.json({ data: updated, error: null });
  } catch {
    return NextResponse.json({ data: null, error: "Failed to update brand kit" }, { status: 500 });
  }
}
