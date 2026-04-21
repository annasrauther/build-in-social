"use client";

import type { Platform } from "@/lib/types/user";

/**
 * Publish a video to a single platform.
 *
 * The backend endpoint `/api/videos/[id]/publish` currently returns 501
 * (platform OAuth is Sprint 9 per the API stub's comment). This client
 * shim handles all three real-world response shapes honestly:
 *
 *   200 OK      → { status: "success", liveUrl? }
 *   501         → { status: "not-implemented", reason }  (not a failure)
 *   4xx / 5xx   → { status: "failed", reason }
 *   network     → { status: "failed", reason: "Network error" }
 *
 * Consumers (the PublishStrip) can distinguish "not-implemented" from
 * "failed" — we show an accent-colored "Coming soon" chip rather than
 * the amber failure dot, so users don't think something broke.
 */

export type PublishResult =
  | { status: "success"; liveUrl?: string }
  | { status: "not-implemented"; reason: string }
  | { status: "failed"; reason: string };

export async function publishVideo(
  videoId: string,
  platform: Platform,
): Promise<PublishResult> {
  try {
    const res = await fetch(`/api/videos/${encodeURIComponent(videoId)}/publish`, {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({ platform }),
    });
    const body = await res.json().catch(() => ({}));
    if (res.status === 501) {
      return {
        status: "not-implemented",
        reason:
          (body as { error?: string }).error ??
          "Publishing isn't wired yet — platform connections are coming.",
      };
    }
    if (!res.ok) {
      return {
        status: "failed",
        reason: (body as { error?: string }).error ?? `Request failed (${res.status})`,
      };
    }
    return {
      status: "success",
      liveUrl: (body as { data?: { liveUrl?: string } }).data?.liveUrl,
    };
  } catch {
    return { status: "failed", reason: "Network error. Check your connection." };
  }
}
