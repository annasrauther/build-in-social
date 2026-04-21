/**
 * GET    /api/series/[id] — fetch one series (owner-scoped)
 * PATCH  /api/series/[id] — edit name/mode/frequency/avatar/voice/platforms
 * DELETE /api/series/[id] — delete the series (cascade is caller's concern)
 *
 * Ownership: every handler re-fetches the record and 403s on userId mismatch
 * so a leaked series id from another account cannot be read or modified.
 */

export const runtime = "nodejs";

import { NextResponse } from "next/server";
import { z } from "zod";
import { getAuthUserId } from "@/lib/auth";
import {
  deleteSeries,
  getSeriesById,
  updateSeries,
} from "@/lib/services/db";
import { checkRateLimit } from "@/lib/services/rate-limit";

const PLATFORMS = ["youtube", "instagram", "linkedin", "x"] as const;
const MODES = ["faceless", "stock-ai-avatar", "heygen-avatar", "combo"] as const;
const FREQUENCIES = ["daily", "3x-week", "5x-week", "custom"] as const;
const STATUSES = ["active", "paused", "completed"] as const;
const HEYGEN_SOURCES = ["licensed", "twin"] as const;

const patchSchema = z
  .object({
    name: z.string().min(1).max(120).optional(),
    topic: z.string().min(1).max(500).optional(),
    mode: z.enum(MODES).optional(),
    status: z.enum(STATUSES).optional(),
    frequency: z.enum(FREQUENCIES).optional(),
    platforms: z.array(z.enum(PLATFORMS)).min(1).max(PLATFORMS.length).optional(),
    heygenAvatarSource: z.enum(HEYGEN_SOURCES).nullable().optional(),
    stockAvatarId: z.string().min(1).max(120).nullable().optional(),
    heygenLicensedAvatarId: z.string().min(1).max(120).nullable().optional(),
    voiceId: z.string().min(1).max(120).nullable().optional(),
  })
  .strict()
  .refine((d) => Object.keys(d).length > 0, {
    message: "At least one field must be provided",
  });

type Ctx = { params: Promise<{ id: string }> };

async function authAndOwn(
  id: string
): Promise<
  | { ok: true; userId: string; record: NonNullable<Awaited<ReturnType<typeof getSeriesById>>> }
  | { ok: false; response: NextResponse }
> {
  let userId: string;
  try {
    userId = await getAuthUserId();
  } catch {
    return {
      ok: false,
      response: NextResponse.json({ error: "Unauthorized" }, { status: 401 }),
    };
  }
  const record = await getSeriesById(id);
  if (!record) {
    return {
      ok: false,
      response: NextResponse.json({ error: "Series not found" }, { status: 404 }),
    };
  }
  if (record.userId !== userId) {
    // 404 not 403 — don't leak existence to another user.
    return {
      ok: false,
      response: NextResponse.json({ error: "Series not found" }, { status: 404 }),
    };
  }
  return { ok: true, userId, record };
}

export async function GET(_req: Request, ctx: Ctx) {
  const { id } = await ctx.params;
  const gate = await authAndOwn(id);
  if (!gate.ok) return gate.response;
  return NextResponse.json({ data: gate.record, error: null });
}

export async function PATCH(req: Request, ctx: Ctx) {
  const { id } = await ctx.params;
  const gate = await authAndOwn(id);
  if (!gate.ok) return gate.response;

  const limited = await checkRateLimit(gate.userId, "series/patch", 30, "1 m");
  if (limited) return limited;

  let raw: unknown;
  try {
    raw = await req.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON body" }, { status: 400 });
  }
  const parsed = patchSchema.safeParse(raw);
  if (!parsed.success) {
    return NextResponse.json(
      { error: "Invalid fields", details: parsed.error.flatten() },
      { status: 400 }
    );
  }

  // Clients pass `null` to clear an optional string/source; normalize to undefined.
  const patch = {
    ...parsed.data,
    heygenAvatarSource:
      parsed.data.heygenAvatarSource === null
        ? undefined
        : parsed.data.heygenAvatarSource,
    stockAvatarId:
      parsed.data.stockAvatarId === null ? undefined : parsed.data.stockAvatarId,
    heygenLicensedAvatarId:
      parsed.data.heygenLicensedAvatarId === null
        ? undefined
        : parsed.data.heygenLicensedAvatarId,
    voiceId: parsed.data.voiceId === null ? undefined : parsed.data.voiceId,
  };

  const updated = await updateSeries(id, patch);
  if (!updated) {
    return NextResponse.json({ error: "Series not found" }, { status: 404 });
  }
  return NextResponse.json({ data: updated, error: null });
}

export async function DELETE(_req: Request, ctx: Ctx) {
  const { id } = await ctx.params;
  const gate = await authAndOwn(id);
  if (!gate.ok) return gate.response;

  const limited = await checkRateLimit(gate.userId, "series/delete", 10, "1 m");
  if (limited) return limited;

  const ok = await deleteSeries(id);
  if (!ok) {
    return NextResponse.json({ error: "Delete failed" }, { status: 500 });
  }
  return NextResponse.json({ data: { id, deleted: true }, error: null });
}
