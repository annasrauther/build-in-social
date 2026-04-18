/**
 * POST /api/pseo/generate
 * Generate a pSEO article landing page for a video.
 *
 * Body: { videoId: string }
 * Returns: { data: { pageId: string, slug: string, canonicalUrl: string } }
 */

export const runtime = "nodejs";

import { NextRequest, NextResponse } from "next/server";
import { getVideo, createPseoPage, getPseoPageByVideoId } from "@/lib/services/db";
import { generatePseoPage } from "@/lib/services/claude";
import { requireAuth } from "@/lib/auth";
import { APP_URL, INTERNAL_SECRET } from "@/lib/env";
import { checkRateLimit } from "@/lib/services/rate-limit";

export async function POST(req: NextRequest) {
  // Dual-auth: internal service calls use x-internal-secret header,
  // external calls use Clerk session auth
  let userId: string;
  const internalHeader = req.headers.get("x-internal-secret");
  if (INTERNAL_SECRET && internalHeader === INTERNAL_SECRET) {
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

    return NextResponse.json({
      data: {
        pageId: pseoPage.id,
        slug: pseoPage.slug,
        canonicalUrl: pseoPage.canonicalUrl,
      },
    });
  } catch (error) {
    // SECURITY (M6): log full error, return generic message to client.
    console.error("[pseo/generate] error:", error);
    return NextResponse.json({ error: "Internal error" }, { status: 500 });
  }
}
