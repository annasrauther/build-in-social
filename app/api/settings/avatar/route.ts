/**
 * PATCH /api/settings/avatar
 *
 * Persist the user's avatar selection — either a stock avatar id or the
 * currently-trained twin id. Mode toggles between them.
 */

import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { getOrCreateUser } from "@/lib/auth";
import { checkRateLimit } from "@/lib/services/rate-limit";
import { updateUser } from "@/lib/services/db";
import { STOCK_AVATARS } from "@/content/avatars";

const Schema = z.object({
  avatarMode: z.enum(["stock", "twin"]).optional(),
  stockAvatarId: z.string().min(1).nullable().optional(),
  twinAvatarId: z.string().min(1).nullable().optional(),
});

export async function PATCH(req: NextRequest) {
  let user;
  try {
    user = await getOrCreateUser();
  } catch (err) {
    const msg = err instanceof Error ? err.message : "";
    if (msg === "UNAUTHORIZED") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
    return NextResponse.json({ error: "Failed to authenticate" }, { status: 500 });
  }

  const limited = await checkRateLimit(user.id, "settings/avatar", 20, "1 m");
  if (limited) return limited;

  const raw = await req.json().catch(() => null);
  const parsed = Schema.safeParse(raw);
  if (!parsed.success) {
    return NextResponse.json({ error: "Invalid body" }, { status: 400 });
  }

  const { avatarMode, stockAvatarId, twinAvatarId } = parsed.data;

  if (stockAvatarId && !STOCK_AVATARS.find((a) => a.id === stockAvatarId)) {
    return NextResponse.json({ error: "Unknown stock avatar id" }, { status: 400 });
  }

  try {
    const patch: Partial<import("@/lib/types/user").User> = {};
    if (avatarMode !== undefined) patch.avatarMode = avatarMode;
    if (stockAvatarId !== undefined)
      patch.stockAvatarId = stockAvatarId ?? undefined;
    if (twinAvatarId !== undefined)
      patch.twinAvatarId = twinAvatarId ?? undefined;

    const updated = await updateUser(user.id, patch);
    return NextResponse.json({ data: updated, error: null });
  } catch (err) {
    console.error("[settings/avatar] error:", err);
    return NextResponse.json({ error: "Failed to update" }, { status: 500 });
  }
}
