/**
 * POST /api/publishing/wordpress/connect
 * Save a user's WordPress site + application password (encrypted at rest).
 * DELETE /api/publishing/wordpress/connect
 * Disconnect the user's WordPress publishing connection.
 * GET    /api/publishing/wordpress/connect
 * Read the current connection (secret redacted).
 *
 * SECURITY:
 *   - Clerk auth via getAuthUserId — never trusts client userId.
 *   - Application password encrypted with AES-256-GCM before persistence.
 *   - Rate limit: 10/min per user.
 *   - Tier gate: creator + studio + trial only (canUseFeature).
 *   - Site URL: validated + normalized (https required in prod, SSRF guard).
 */

export const runtime = "nodejs";

import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { getAuthUserId, getOrCreateUser } from "@/lib/auth";
import { canUseFeature } from "@/lib/billing/capabilities";
import { checkRateLimit } from "@/lib/services/rate-limit";
import {
  deleteWordPressConnection,
  getWordPressConnection,
  upsertWordPressConnection,
} from "@/lib/services/db";
import {
  encryptAppPassword,
  testConnection,
  toPublicConnection,
  validateSiteUrl,
} from "@/lib/services/wordpress";
import { assertSameOrigin } from "@/lib/security/csrf";

const ConnectSchema = z
  .object({
    siteUrl: z.string().min(1).max(500),
    username: z.string().min(1).max(255),
    appPassword: z.string().min(1).max(500),
    enabled: z.boolean().optional(),
  })
  .strict();

function err(status: number, error: string) {
  return NextResponse.json({ data: null, error }, { status });
}

export async function GET() {
  let userId: string;
  try {
    userId = await getAuthUserId();
  } catch {
    return err(401, "Unauthorized");
  }
  const conn = await getWordPressConnection(userId);
  return NextResponse.json({
    data: conn ? toPublicConnection(conn) : null,
    error: null,
  });
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
    "publishing/wordpress/connect",
    10,
    "1 m"
  );
  if (limited) return limited;

  // Tier gate — reject Starter/Solo at the API, not just the UI.
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
  const parsed = ConnectSchema.safeParse(raw);
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

  // Always test the credentials BEFORE saving, so we never persist a broken
  // connection. The /test endpoint is also available for re-verification.
  const testResult = await testConnection({
    siteUrl: urlCheck.normalized,
    username: parsed.data.username,
    appPassword: parsed.data.appPassword,
  });
  if (!testResult.ok) {
    return err(400, testResult.error ?? "Could not verify WordPress credentials");
  }

  let ciphertext: string;
  try {
    ciphertext = await encryptAppPassword(parsed.data.appPassword);
  } catch (encErr) {
    // SECURITY: do not echo the plaintext back or leak which key is missing.
    console.error(
      "[wordpress/connect] encryption failed:",
      encErr instanceof Error ? encErr.message : "unknown"
    );
    return err(500, "Could not securely store credentials");
  }

  const now = new Date().toISOString();
  const saved = await upsertWordPressConnection({
    userId,
    siteUrl: urlCheck.normalized,
    username: parsed.data.username.trim(),
    encryptedAppPassword: ciphertext,
    wpUserId: testResult.wpUserId,
    lastTestedAt: now,
    enabled: parsed.data.enabled ?? true,
  });

  return NextResponse.json({
    data: {
      connection: toPublicConnection(saved),
      siteTitle: testResult.siteTitle ?? null,
    },
    error: null,
  });
}

export async function DELETE(req: NextRequest) {
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
    "publishing/wordpress/connect",
    10,
    "1 m"
  );
  if (limited) return limited;

  await deleteWordPressConnection(userId);
  return NextResponse.json({ data: { ok: true }, error: null });
}

/**
 * PATCH /api/publishing/wordpress/connect
 * Lightweight toggle for `enabled`. Kept in the same route to avoid a
 * separate API surface for a one-field update.
 */
const PatchSchema = z.object({ enabled: z.boolean() }).strict();

export async function PATCH(req: NextRequest) {
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
    "publishing/wordpress/connect",
    10,
    "1 m"
  );
  if (limited) return limited;

  // Still gate on tier — a downgraded user shouldn't be able to flip it on.
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
  const parsed = PatchSchema.safeParse(raw);
  if (!parsed.success) {
    return err(
      400,
      parsed.error.issues.map((i) => i.message).join(", ")
    );
  }

  const existing = await getWordPressConnection(userId);
  if (!existing) return err(404, "No WordPress connection on file");

  const updated = await upsertWordPressConnection({
    ...existing,
    enabled: parsed.data.enabled,
  });
  return NextResponse.json({
    data: toPublicConnection(updated),
    error: null,
  });
}
