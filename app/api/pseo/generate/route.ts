/**
 * POST /api/pseo/generate
 * Generate a pSEO article landing page for a video.
 *
 * Body: { videoId: string }
 * Returns: { data: { pageId: string, slug: string, canonicalUrl: string } }
 */

export const runtime = "nodejs";

import { NextRequest, NextResponse } from "next/server";
import {
  getVideo,
  createPseoPage,
  getPseoPageByVideoId,
  getUserByClerkId,
  getWordPressConnection,
} from "@/lib/services/db";
import { generatePseoPage } from "@/lib/services/claude";
import { publishPseoToWordPress } from "@/lib/services/wordpress";
import { requireAuth } from "@/lib/auth";
import { APP_URL, INTERNAL_SECRET } from "@/lib/env";
import { checkRateLimit } from "@/lib/services/rate-limit";
import { canUseFeature } from "@/lib/billing/capabilities";
import { timingSafeStringEquals } from "@/lib/security/compare";

export async function POST(req: NextRequest) {
  // Dual-auth: internal service calls use x-internal-secret header,
  // external calls use Clerk session auth
  let userId: string;
  const internalHeader = req.headers.get("x-internal-secret") ?? "";
  if (INTERNAL_SECRET && timingSafeStringEquals(internalHeader, INTERNAL_SECRET)) {
    userId = "internal";
  } else {
    try {
      userId = await requireAuth();
    } catch {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
  }
  const limited = await checkRateLimit(userId, "pseo/generate", 10, "1 m");
  if (limited) return limited;

  try {
    const body = await req.json() as Record<string, unknown>;
    const videoId = typeof body.videoId === "string" ? body.videoId.trim() : "";

    if (!videoId) {
      return NextResponse.json({ error: "videoId is required" }, { status: 400 });
    }

    const video = await getVideo(videoId);
    if (!video) {
      return NextResponse.json({ error: "Video not found" }, { status: 404 });
    }
    if (userId !== "internal" && video.userId !== userId) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    // Tier gate: Starter plans cannot generate pSEO pages.
    // Internal calls (x-internal-secret) check the video-owner's tier.
    if (userId === "internal" || userId !== "internal") {
      const ownerClerkId = userId === "internal" ? video.userId : userId;
      const owner = await getUserByClerkId(ownerClerkId).catch(() => null);
      if (owner && !canUseFeature(owner.subscriptionTier, "pseo")) {
        return NextResponse.json(
          {
            error: "feature_not_available",
            feature: "pseo",
            tier: owner.subscriptionTier,
            message:
              "pSEO articles are available on Solo and above. Upgrade to unlock a Google-indexed article per video.",
          },
          { status: 403 }
        );
      }
    }

    // Return cached page if one already exists
    const existing = await getPseoPageByVideoId(videoId);
    if (existing) {
      return NextResponse.json({
        data: {
          pageId: existing.id,
          slug: existing.slug,
          canonicalUrl: existing.canonicalUrl,
        },
      });
    }

    const fullScript = [
      video.scriptJson.hook,
      video.scriptJson.body,
      video.scriptJson.cta,
    ]
      .filter(Boolean)
      .join(" ");

    // generatePseoPage auto-falls back to mock when ANTHROPIC_API_KEY is absent
    const generated = await generatePseoPage({
      script: fullScript,
      videoTitle: video.title,
      platform: video.platform,
      brandName: "Build In Social",
      pseoKeywords: [],
    });

    const canonicalUrl = `${APP_URL}/p/${generated.slug}`;

    const pseoPage = await createPseoPage({
      userId: video.userId,
      videoId: video.id,
      title: generated.title,
      slug: generated.slug,
      htmlContent: generated.htmlContent,
      metaDescription: generated.metaDescription,
      faqJson: generated.faqJson,
      videoObjectJsonLd: generated.videoObjectJsonLd,
      canonicalUrl,
    });

    // ── WordPress mirror (Creator+ feature) ────────────────────────────────
    // If the user has a connected + enabled WordPress site AND their tier
    // supports it, mirror the pSEO article to their own domain. Failures
    // here do not block the response — we keep the buildinsocial.com page
    // as the source of truth and log the failure server-side.
    let wpPostUrl: string | null = null;
    try {
      const owner = await getUserByClerkId(video.userId);
      const ownerTier = owner?.subscriptionTier ?? "trial";
      if (canUseFeature(ownerTier, "publish_wordpress")) {
        const conn = await getWordPressConnection(video.userId);
        if (conn && conn.enabled) {
          const wp = await publishPseoToWordPress({
            userId: video.userId,
            pseoPageId: pseoPage.id,
          });
          if (wp.ok && wp.postUrl) {
            wpPostUrl = wp.postUrl;
            console.log(
              `[pseo/generate] mirrored to WP for user=${video.userId} postUrl=${wp.postUrl}`
            );
          } else if (!wp.ok) {
            // Fall back to the subdomain URL (already created above). The
            // caller's UI surfaces the buildinsocial.com link as usual; the
            // user-visible notification lives on the Settings → Publishing
            // page via connection.lastTestedAt / status re-test.
            console.warn(
              `[pseo/generate] WP publish failed for user=${video.userId}: ${wp.error}`
            );
          }
        }
      }
    } catch (wpErr) {
      console.warn(
        "[pseo/generate] WP mirror threw:",
        wpErr instanceof Error ? wpErr.message : "unknown"
      );
    }

    return NextResponse.json({
      data: {
        pageId: pseoPage.id,
        slug: pseoPage.slug,
        canonicalUrl: pseoPage.canonicalUrl,
        wpPostUrl,
      },
    });
  } catch (error) {
    // SECURITY (M6): log full error, return generic message to client.
    console.error("[pseo/generate] error:", error);
    return NextResponse.json({ error: "Internal error" }, { status: 500 });
  }
}
