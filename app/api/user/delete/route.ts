/**
 * GDPR Article 17 — self-serve account deletion.
 *
 * POST /api/user/delete
 * Body: { confirm: "DELETE" }
 *
 * Flow (all steps are best-effort except the DB cascade + user row):
 *   1. Auth-gate via getAuthUserId() — 401 if unauthenticated.
 *   2. Require confirmation token in the body (prevents accidental / CSRF-like
 *      deletion — a signed-in user still has to type DELETE).
 *   3. Cancel active Stripe subscription (if customer id on record).
 *   4. Delete ElevenLabs voice clone (best-effort).
 *   5. Delete R2 objects keyed to the user's videos (best-effort).
 *   6. Cascade-delete DB rows (videos, weeks, pseo, render jobs, voice
 *      profiles, consent record, user row).
 *   7. Delete Clerk user (prod) or clear dev-auth cookie (dev).
 *
 * Third-party failures are logged (no PII) and swallowed — data deletion in our
 * DB is the legal guarantee, not perfect third-party cleanup. The user can
 * contact support to confirm any remaining tail.
 *
 * SECURITY:
 *   - Confirmation token prevents form-jacking / one-click deletion attacks.
 *   - No PII in console logs (we log user id and step name only).
 *   - Rate limit: 3 requests / hour per user to blunt accidental repeat calls.
 */

import { NextRequest, NextResponse } from "next/server";
import { cookies } from "next/headers";
import { z } from "zod";

import { getAuthUserId } from "@/lib/auth";
import { checkRateLimit } from "@/lib/services/rate-limit";
import {
  getUserByClerkId,
  getVoiceProfilesForUser,
  getVideos,
  deleteUserAndData,
} from "@/lib/services/db";
import { cancelSubscription } from "@/lib/services/stripe";
import { deleteObject } from "@/lib/services/r2";
import { CLERK_SECRET_KEY, DEV_AUTH, ELEVENLABS_API_KEY } from "@/lib/env";

const bodySchema = z.object({
  confirm: z.literal("DELETE"),
}).strict();

/** Best-effort Stripe subscription cancel. Never throws. */
async function cancelStripeBestEffort(user: Record<string, unknown>, userId: string) {
  const subId = (user.stripeSubscriptionId as string | undefined) ?? undefined;
  if (!subId) return;
  try {
    await cancelSubscription(subId);
  } catch {
    console.warn("[user/delete] stripe cancel failed", { userId, step: "stripe" });
  }
}

/** Best-effort ElevenLabs voice delete. Never throws. */
async function deleteElevenLabsVoices(
  voiceIds: string[],
  userId: string
): Promise<void> {
  if (!ELEVENLABS_API_KEY) return;
  for (const voiceId of voiceIds) {
    if (!voiceId) continue;
    try {
      const res = await fetch(`https://api.elevenlabs.io/v1/voices/${voiceId}`, {
        method: "DELETE",
        headers: { "xi-api-key": ELEVENLABS_API_KEY },
      });
      if (!res.ok) {
        console.warn("[user/delete] elevenlabs delete non-ok", { userId, step: "elevenlabs", status: res.status });
      }
    } catch {
      console.warn("[user/delete] elevenlabs delete failed", { userId, step: "elevenlabs" });
    }
  }
}

/**
 * Extract known R2 object keys referenced on video rows. We do not list the
 * bucket by prefix — too easy to mis-scope — so this only touches URLs we've
 * recorded ourselves.
 *
 * TODO: once R2 grows a list-by-prefix helper, switch to a prefix sweep under
 * `users/<userId>/` so we catch orphaned audio/script blobs the DB never saw.
 */
function r2KeysFromVideos(
  videos: Array<{ outputUrl?: string; thumbnailUrl?: string }>
): string[] {
  const publicBase = process.env.R2_PUBLIC_URL ?? "";
  const keys: string[] = [];
  for (const v of videos) {
    for (const url of [v.outputUrl, v.thumbnailUrl]) {
      if (!url) continue;
      if (publicBase && url.startsWith(publicBase + "/")) {
        keys.push(url.slice(publicBase.length + 1));
      }
    }
  }
  return keys;
}

async function deleteR2BestEffort(keys: string[], userId: string) {
  for (const key of keys) {
    try {
      await deleteObject(key);
    } catch {
      console.warn("[user/delete] r2 delete failed", { userId, step: "r2" });
    }
  }
}

async function deleteClerkUserBestEffort(clerkUserId: string) {
  if (DEV_AUTH || !CLERK_SECRET_KEY) return;
  try {
    const { createClerkClient } = await import("@clerk/nextjs/server");
    const clerk = createClerkClient({ secretKey: CLERK_SECRET_KEY });
    await clerk.users.deleteUser(clerkUserId);
  } catch {
    console.warn("[user/delete] clerk delete failed", { step: "clerk" });
  }
}

export async function POST(req: NextRequest) {
  // ── 1. Auth ────────────────────────────────────────────────────────────────
  let clerkUserId: string;
  try {
    clerkUserId = await getAuthUserId();
  } catch {
    return NextResponse.json({ data: null, error: "Unauthorized" }, { status: 401 });
  }

  // ── 2. Load user, rate-limit (keyed to DB id) ─────────────────────────────
  const user = await getUserByClerkId(clerkUserId);
  if (!user) {
    return NextResponse.json({ data: null, error: "User not found" }, { status: 404 });
  }

  // SECURITY: 3 requests per hour per user. Upstash Redis when configured,
  // no-op fallback in dev without Redis.
  const limited = await checkRateLimit(user.id, "user/delete", 3, "1 h");
  if (limited) return limited;

  // ── 3. Validate confirmation token ────────────────────────────────────────
  let parsed;
  try {
    parsed = bodySchema.safeParse(await req.json());
  } catch {
    return NextResponse.json(
      { data: null, error: "Invalid JSON body" },
      { status: 400 }
    );
  }
  if (!parsed.success) {
    return NextResponse.json(
      { data: null, error: "Confirmation token required. Type DELETE to confirm." },
      { status: 400 }
    );
  }

  // ── 4. Best-effort third-party cleanups ───────────────────────────────────
  const userId = user.id;
  console.info("[user/delete] start", { userId });

  await cancelStripeBestEffort(user as unknown as Record<string, unknown>, userId);

  const voiceProfiles = await getVoiceProfilesForUser(userId).catch(() => []);
  const cloneVoiceIds = voiceProfiles.filter((v) => v.isClone).map((v) => v.elevenLabsVoiceId);
  await deleteElevenLabsVoices(cloneVoiceIds, userId);

  const videos = await getVideos(userId).catch(() => []);
  const r2Keys = r2KeysFromVideos(videos);
  await deleteR2BestEffort(r2Keys, userId);

  // ── 5. Cascade-delete DB rows (the legal guarantee) ───────────────────────
  try {
    await deleteUserAndData(userId);
  } catch {
    console.error("[user/delete] db cascade failed", { userId, step: "db" });
    return NextResponse.json(
      {
        data: null,
        error:
          "Account deletion partially failed. Please contact support to finish.",
      },
      { status: 500 }
    );
  }

  // ── 6. Delete Clerk user (prod) / clear dev cookie ───────────────────────
  await deleteClerkUserBestEffort(clerkUserId);

  const res = NextResponse.json({ data: { deleted: true }, error: null });
  if (DEV_AUTH) {
    const c = await cookies();
    // Clearing via cookies() API so the response body carries Set-Cookie.
    c.set("dev-auth", "", { path: "/", maxAge: 0 });
  }

  console.info("[user/delete] done", { userId });
  return res;
}
