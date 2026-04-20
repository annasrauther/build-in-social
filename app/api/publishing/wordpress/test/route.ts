/**
 * POST /api/publishing/wordpress/test
 * Verify a set of WordPress credentials without persisting them.
 *
 * This is the "Test connection" button before the user clicks save.
 * Credentials flow: body (plaintext over HTTPS) → wordpress.testConnection.
 * We never echo the password back and never log it.
 *
 * GET /api/publishing/wordpress/test
 * Re-test the currently saved connection (uses the encrypted app password).
 *
 * Rate-limited to 10/min per user.
 */

export const runtime = "nodejs";

import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { getAuthUserId, getOrCreateUser } from "@/lib/auth";
import { canUseFeature } from "@/lib/billing/capabilities";
import { checkRateLimit } from "@/lib/services/rate-limit";
import { getWordPressConnection, updateWordPressConnection } from "@/lib/services/db";
import {
  decryptAppPassword,
  testConnection,
  toPublicConnection,
  validateSiteUrl,
} from "@/lib/services/wordpress";
import { assertSameOrigin } from "@/lib/security/csrf";

const TestSchema = z
  .object({
    siteUrl: z.string().min(1).max(500),
    username: z.string().min(1).max(255),
    appPassword: z.string().min(1).max(500),
  })
  .strict();

function err(status: number, error: string) {
  return NextResponse.json({ data: null, error }, { status });
}

export async function POST(req: NextRequest) {
  const csrf = assertSameOrigin(req);
  if (csrf) return csrf;
  let userId: string;
  try {
    userId = await getAuthUserId();
  } catch {
    return err(401, "Unauthorized");
  }

  const limited = await checkRateLimit(
    userId,
    "publishing/wordpress/test",
    10,
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

  let raw: unknown;
  try {
    raw = await req.json();
  } catch {
    return err(400, "Invalid JSON body");
  }
  const parsed = TestSchema.safeParse(raw);
  if (!parsed.success) {
    return err(
      400,
      parsed.error.issues.map((i) => i.message).join(", ")
    );
  }

  const urlCheck = validateSiteUrl(parsed.data.siteUrl);
  if (!urlCheck.ok || !urlCheck.normalized) {
    return err(400, urlCheck.reason ?? "Invalid site URL");
  }

  const result = await testConnection({
    siteUrl: urlCheck.normalized,
    username: parsed.data.username,
    appPassword: parsed.data.appPassword,
  });

  if (!result.ok) {
    // 200 with ok:false — UI shows the error inline. Use 400 only for
    // malformed requests above.
    return NextResponse.json({
      data: {
        ok: false,
        error: result.error ?? "Could not verify WordPress credentials",
      },
      error: null,
    });
  }

  return NextResponse.json({
    data: {
      ok: true,
      siteTitle: result.siteTitle ?? null,
      wpUserId: result.wpUserId ?? null,
      normalizedSiteUrl: urlCheck.normalized,
    },
    error: null,
  });
}

/**
 * Re-test the saved connection without re-entering credentials.
 */
export async function GET() {
  let userId: string;
  try {
    userId = await getAuthUserId();
  } catch {
    return err(401, "Unauthorized");
  }

  const limited = await checkRateLimit(
    userId,
    "publishing/wordpress/test",
    10,
    "1 m"
  );
  if (limited) return limited;

  const conn = await getWordPressConnection(userId);
  if (!conn) return err(404, "No WordPress connection on file");

  let appPassword: string;
  try {
    appPassword = await decryptAppPassword(conn.encryptedAppPassword);
  } catch (decErr) {
    console.error(
      "[wordpress/test] decryption failed:",
      decErr instanceof Error ? decErr.message : "unknown"
    );
    return err(500, "Could not read stored credentials");
  }

  const result = await testConnection({
    siteUrl: conn.siteUrl,
    username: conn.username,
    appPassword,
  });

  if (result.ok) {
    await updateWordPressConnection(userId, {
      lastTestedAt: new Date().toISOString(),
      wpUserId: result.wpUserId ?? conn.wpUserId,
    }).catch(() => null);
  }

  return NextResponse.json({
    data: {
      ok: result.ok,
      siteTitle: result.siteTitle ?? null,
      wpUserId: result.wpUserId ?? null,
      error: result.error ?? null,
      connection: toPublicConnection(conn),
    },
    error: null,
  });
}
