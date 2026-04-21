/**
 * POST /api/publishing/wordpress/publish
 * Publish a pSEO article (by id) to the authenticated user's WordPress site.
 *
 * Dual-auth path mirrors pSEO/generate:
 *   - External calls: Clerk session via getAuthUserId.
 *   - Internal service calls: `x-internal-secret` header.
 *
 * On failure the route bubbles `ok:false` + error; the caller is expected to
 * fall back to the buildinsocial.com subdomain and notify the user.
 */

export const runtime = "nodejs";

import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { getAuthUserId, getOrCreateUser } from "@/lib/auth";
import { canUseFeature } from "@/lib/billing/capabilities";
import { checkRateLimit } from "@/lib/services/rate-limit";
import { getPseoPage, getVideo } from "@/lib/services/db";
import {
  publishPseoToWordPress,
  publishVideoToWordPress,
} from "@/lib/services/wordpress";
import { INTERNAL_SECRET } from "@/lib/env";
import { timingSafeStringEquals } from "@/lib/security/compare";

const BodySchema = z
  .object({
    pseoPageId: z.string().min(1).max(120).optional(),
    videoId: z.string().min(1).max(120).optional(),
  })
  .strict()
  .refine((v) => v.pseoPageId || v.videoId, {
    message: "pseoPageId or videoId is required",
  });

function err(status: number, error: string) {
  return NextResponse.json({ data: null, error }, { status });
}

export async function POST(req: NextRequest) {
  // Auth: Clerk session OR internal service secret.
  let userId: string | null = null;
  const internalHeader = req.headers.get("x-internal-secret") ?? "";
  const isInternal =
    !!INTERNAL_SECRET && timingSafeStringEquals(internalHeader, INTERNAL_SECRET);

  if (!isInternal) {
    try {
      userId = await getAuthUserId();
    } catch {
      return err(401, "Unauthorized");
    }
  }

  let raw: unknown;
  try {
    raw = await req.json();
  } catch {
    return err(400, "Invalid JSON body");
  }
  const parsed = BodySchema.safeParse(raw);
  if (!parsed.success) {
    return err(
      400,
      parsed.error.issues.map((i) => i.message).join(", ")
    );
  }

  // Internal calls must carry a pseoPageId OR videoId and we resolve the
  // owning userId from the record itself.
  if (isInternal) {
    if (parsed.data.pseoPageId) {
      const page = await getPseoPage(parsed.data.pseoPageId);
      if (!page) return err(404, "pSEO page not found");
      userId = page.userId;
    } else if (parsed.data.videoId) {
      const video = await getVideo(parsed.data.videoId);
      if (!video) return err(404, "Video not found");
      userId = video.userId;
    } else {
      return err(400, "pseoPageId or videoId is required for internal publish");
    }
  }

  if (!userId) return err(401, "Unauthorized");

  // External calls are tier-gated + rate-limited. Internal calls skip both —
  // they already came from our own render-complete pipeline.
  if (!isInternal) {
    const limited = await checkRateLimit(
      userId,
      "publishing/wordpress/publish",
      30,
      "1 m"
    );
    if (limited) return limited;

    try {
      const user = await getOrCreateUser();
      if (!canUseFeature(user.subscriptionTier, "publish_wordpress")) {
        return err(
          403,
          "WordPress publishing is available on Creator and Studio plans"
        );
      }
    } catch {
      return err(401, "Unauthorized");
    }
  }

  // Branch on the type of content being published. Video posts embed the
  // rendered MP4 from R2; pSEO posts publish the Haiku-generated article.
  if (parsed.data.videoId && !parsed.data.pseoPageId) {
    const video = await getVideo(parsed.data.videoId);
    if (!video) return err(404, "Video not found");
    if (video.userId !== userId) return err(403, "Forbidden");
    if (!video.outputUrl) {
      return err(400, "Video has not finished rendering yet");
    }

    const videoResult = await publishVideoToWordPress({
      userId,
      videoId: parsed.data.videoId,
    });

    if (!videoResult.ok) {
      return NextResponse.json({
        data: {
          ok: false,
          error: videoResult.error ?? "Publish failed",
          connection: videoResult.connection ?? null,
        },
        error: null,
      });
    }

    return NextResponse.json({
      data: {
        ok: true,
        wpPostId: videoResult.wpPostId ?? null,
        postUrl: videoResult.postUrl ?? null,
        connection: videoResult.connection ?? null,
      },
      error: null,
    });
  }

  if (!parsed.data.pseoPageId) {
    return err(400, "pseoPageId is required");
  }

  // Ownership check: the page must belong to the acting user (or the
  // internal path already resolved userId from the page).
  const page = await getPseoPage(parsed.data.pseoPageId);
  if (!page) return err(404, "pSEO page not found");
  if (page.userId !== userId) return err(403, "Forbidden");

  const result = await publishPseoToWordPress({
    userId,
    pseoPageId: parsed.data.pseoPageId,
  });

  if (!result.ok) {
    // Return 200 with ok:false so the caller can branch without parsing a
    // status code. Server-side we've already logged the failure.
    return NextResponse.json({
      data: {
        ok: false,
        error: result.error ?? "Publish failed",
        connection: result.connection ?? null,
      },
      error: null,
    });
  }

  return NextResponse.json({
    data: {
      ok: true,
      wpPostId: result.wpPostId ?? null,
      postUrl: result.postUrl ?? null,
      connection: result.connection ?? null,
    },
    error: null,
  });
}
