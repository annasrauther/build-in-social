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
import { APP_URL } from "@/lib/env";

export async function POST(req: NextRequest) {
  let userId: string;
  try {
    userId = await requireAuth();
  } catch {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
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
    const message = error instanceof Error ? error.message : "pSEO generation failed";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
