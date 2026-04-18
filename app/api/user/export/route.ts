/**
 * GDPR Article 20 — data portability / export.
 *
 * POST /api/user/export
 *
 * Returns the user's data as a downloadable JSON bundle. The response is
 * served inline (Content-Disposition: attachment) rather than via a signed URL
 * since typical exports are well under 1 MB. If the payload grows past a few
 * megabytes in future, switch to staging the file in R2 and returning a short-
 * lived signed URL.
 *
 * Scope:
 *   - Profile (sans Clerk / Stripe third-party IDs)
 *   - Voice profiles (our DB metadata; no audio bytes, no ElevenLabs API ids
 *     beyond our own row's reference)
 *   - Weekly content plans + quality gate answers
 *   - Videos (title, script, metadata, pSEO relation)
 *   - pSEO pages tied to those videos
 *
 * Explicitly omitted (not the user's data, or internal / security-sensitive):
 *   - Clerk secrets, session tokens
 *   - Stripe customer / subscription ids
 *   - Internal webhook idempotency keys
 *
 * SECURITY:
 *   - Auth-gated; only the signed-in user's own data is returned.
 *   - Rate limit: 5/hour per user (exports are expensive to assemble).
 */

import { NextResponse } from "next/server";

import { getAuthUserId } from "@/lib/auth";
import { checkRateLimit } from "@/lib/services/rate-limit";
import { getUserByClerkId, getAllUserData } from "@/lib/services/db";
import type { User } from "@/lib/types/user";

/** Strip fields we do not want to emit: Clerk + Stripe ids, internal refs. */
function sanitizeUser(user: User): Record<string, unknown> {
  return {
    id: user.id,
    email: user.email,
    displayName: user.displayName,
    brandName: user.brandName,
    niche: user.niche ?? null,
    tone: user.tone,
    platforms: user.platforms,
    onboardingComplete: user.onboardingComplete,
    subscriptionTier: user.subscriptionTier,
    trialStartedAt: user.trialStartedAt ?? null,
    trialEndsAt: user.trialEndsAt ?? null,
    createdAt: user.createdAt,
  };
}

export async function POST() {
  // ── Auth ──────────────────────────────────────────────────────────────────
  let clerkUserId: string;
  try {
    clerkUserId = await getAuthUserId();
  } catch {
    return NextResponse.json({ data: null, error: "Unauthorized" }, { status: 401 });
  }

  const user = await getUserByClerkId(clerkUserId);
  if (!user) {
    return NextResponse.json({ data: null, error: "User not found" }, { status: 404 });
  }

  // SECURITY: 5 exports per hour per user.
  const limited = await checkRateLimit(user.id, "user/export", 5, "1 h");
  if (limited) return limited;

  // ── Assemble bundle ───────────────────────────────────────────────────────
  const bundle = await getAllUserData(user.id);

  const payload = {
    meta: {
      generatedAt: new Date().toISOString(),
      format: "build-in-social/export/v1",
      notes:
        "This file contains a copy of the data Build In Social holds about you. " +
        "Third-party account identifiers (Clerk, Stripe, ElevenLabs) are intentionally omitted.",
    },
    profile: bundle.user ? sanitizeUser(bundle.user) : null,
    voiceProfiles: bundle.voiceProfiles.map((v) => ({
      id: v.id,
      name: v.name,
      isClone: v.isClone,
      // Library voice id is the user-visible voice selection; clone id is a
      // biometric identifier and is not exported.
      elevenLabsVoiceId: v.isClone ? null : v.elevenLabsVoiceId,
      createdAt: v.createdAt,
    })),
    weeks: bundle.weeks.map((w) => ({
      id: w.id,
      weekNumber: w.weekNumber,
      year: w.year,
      startDate: w.startDate,
      endDate: w.endDate,
      mode: w.mode,
      contentSource: w.contentSource,
      qualityGateAnswers: w.qualityGateAnswers ?? null,
      specificityScore: w.specificityScore ?? null,
      autopilotAngles: w.autopilotAngles ?? null,
      status: w.status,
      videoCount: w.videoCount,
      createdAt: w.createdAt,
    })),
    videos: bundle.videos.map((v) => ({
      id: v.id,
      weekId: v.weekId,
      title: v.title,
      script: v.scriptJson,
      platform: v.platform,
      dayOfWeek: v.dayOfWeek,
      facelessStyle: v.facelessStyle,
      durationSeconds: v.durationSeconds,
      contentType: v.contentType,
      status: v.status,
      outputUrl: v.outputUrl ?? null,
      thumbnailUrl: v.thumbnailUrl ?? null,
      topicLabel: v.topicLabel ?? null,
      hookType: v.hookType ?? null,
      sentiment: v.sentiment ?? null,
      createdAt: v.createdAt,
      publishedAt: v.publishedAt ?? null,
    })),
    pseoPages: bundle.pseoPages.map((p) => ({
      id: p.id,
      videoId: p.videoId,
      title: p.title,
      slug: p.slug,
      metaDescription: p.metaDescription ?? null,
      canonicalUrl: p.canonicalUrl,
      createdAt: p.createdAt,
    })),
  };

  const body = JSON.stringify(payload, null, 2);
  const filename = `build-in-social-export-${user.id}-${Date.now()}.json`;

  return new NextResponse(body, {
    status: 200,
    headers: {
      "Content-Type": "application/json; charset=utf-8",
      "Content-Disposition": `attachment; filename="${filename}"`,
      "Cache-Control": "no-store",
    },
  });
}
