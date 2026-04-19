/**
 * Outbound webhook delivery service.
 *
 * Responsibilities:
 *   1. Generate per-subscription secrets (32 bytes, base64url).
 *   2. Validate subscription URLs (reject SSRF targets in prod).
 *   3. Sign payloads with HMAC-SHA256.
 *   4. Deliver with retries (3 attempts @ 1s / 5s / 30s).
 *   5. Flip subscription status to "degraded" after exhausting retries.
 *
 * Keep this module edge-compatible: use Web Crypto, not Node `crypto`.
 */

import {
  findWebhookSubscriptionsForEvent,
  updateWebhookSubscription,
  getWebhookSubscription,
} from "@/lib/services/db";
import type {
  WebhookEventType,
  WebhookEventPayload,
  WebhookSubscription,
} from "@/lib/types/webhook";

// ─── Constants ────────────────────────────────────────────────────────────────

export const SIGNATURE_HEADER = "X-Build-In-Social-Signature";
export const EVENT_HEADER = "X-Build-In-Social-Event";
export const DELIVERY_HEADER = "X-Build-In-Social-Delivery";

const RETRY_DELAYS_MS = [1000, 5000, 30000];
const REQUEST_TIMEOUT_MS = 10_000;

// ─── Secret generation ───────────────────────────────────────────────────────

/** Generate a 32-byte HMAC secret, base64url-encoded (no padding). */
export function generateWebhookSecret(): string {
  const bytes = new Uint8Array(32);
  crypto.getRandomValues(bytes);
  let bin = "";
  for (const b of bytes) bin += String.fromCharCode(b);
  return btoa(bin).replace(/\+/g, "-").replace(/\//g, "_").replace(/=+$/, "");
}

// ─── URL validation (SSRF guard) ─────────────────────────────────────────────

const PRIVATE_HOST_PATTERNS: RegExp[] = [
  /^localhost$/i,
  /^0\.0\.0\.0$/,
  /^127\./,
  /^10\./,
  /^192\.168\./,
  /^172\.(1[6-9]|2\d|3[01])\./,
  /^169\.254\./, // link-local
  /^::1$/,
  /^fc[0-9a-f]{2}:/i,
  /^fd[0-9a-f]{2}:/i,
  /^fe80:/i,
  /\.local$/i,
  /\.internal$/i,
];

export interface UrlValidationResult {
  ok: boolean;
  reason?: string;
}

/**
 * Validate a webhook URL. In development we allow loopback/private IPs so
 * devs can point at ngrok/localhost. In production these are rejected.
 */
export function validateWebhookUrl(
  raw: string,
  opts: { allowPrivate?: boolean } = {}
): UrlValidationResult {
  let parsed: URL;
  try {
    parsed = new URL(raw);
  } catch {
    return { ok: false, reason: "Invalid URL" };
  }
  if (parsed.protocol !== "https:" && parsed.protocol !== "http:") {
    return { ok: false, reason: "URL must use http or https" };
  }
  const allowPrivate =
    opts.allowPrivate ?? process.env.NODE_ENV !== "production";
  if (!allowPrivate) {
    if (parsed.protocol !== "https:") {
      return { ok: false, reason: "Production webhooks must use https" };
    }
    const host = parsed.hostname.toLowerCase();
    for (const re of PRIVATE_HOST_PATTERNS) {
      if (re.test(host)) {
        return { ok: false, reason: "Private/loopback hosts are not allowed" };
      }
    }
  }
  return { ok: true };
}

// ─── HMAC signing ────────────────────────────────────────────────────────────

/** Sign a raw JSON body with HMAC-SHA256. Returns hex digest. */
export async function signWebhookBody(
  body: string,
  secret: string
): Promise<string> {
  const enc = new TextEncoder();
  const key = await crypto.subtle.importKey(
    "raw",
    enc.encode(secret),
    { name: "HMAC", hash: "SHA-256" },
    false,
    ["sign"]
  );
  const sig = await crypto.subtle.sign("HMAC", key, enc.encode(body));
  const bytes = new Uint8Array(sig);
  let hex = "";
  for (const b of bytes) hex += b.toString(16).padStart(2, "0");
  return hex;
}

// ─── Delivery ────────────────────────────────────────────────────────────────

function sleep(ms: number): Promise<void> {
  return new Promise((r) => setTimeout(r, ms));
}

export interface DeliveryResult {
  success: boolean;
  attempts: number;
  status?: number;
  error?: string;
}

async function postOnce(
  url: string,
  body: string,
  headers: Record<string, string>
): Promise<{ ok: boolean; status?: number; error?: string }> {
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), REQUEST_TIMEOUT_MS);
  try {
    const res = await fetch(url, {
      method: "POST",
      headers,
      body,
      signal: controller.signal,
      // Never forward cookies / credentials.
      credentials: "omit",
      cache: "no-store",
      redirect: "manual",
    });
    return { ok: res.ok, status: res.status };
  } catch (err) {
    return {
      ok: false,
      error: err instanceof Error ? err.message : "delivery failed",
    };
  } finally {
    clearTimeout(timer);
  }
}

/**
 * Deliver an event to a single subscription with retries. Never throws.
 * Flips the subscription to "degraded" on exhaustion; resets it to "active"
 * on success.
 */
export async function deliverToSubscription(
  sub: WebhookSubscription,
  payload: WebhookEventPayload
): Promise<DeliveryResult> {
  const body = JSON.stringify(payload);
  let signature: string;
  try {
    signature = await signWebhookBody(body, sub.secret);
  } catch (err) {
    return {
      success: false,
      attempts: 0,
      error: err instanceof Error ? err.message : "signing failed",
    };
  }

  const headers: Record<string, string> = {
    "Content-Type": "application/json",
    "User-Agent": "BuildInSocial-Webhooks/1.0",
    [SIGNATURE_HEADER]: signature,
    [EVENT_HEADER]: payload.event,
    [DELIVERY_HEADER]: payload.deliveryId,
  };

  let lastStatus: number | undefined;
  let lastError: string | undefined;

  for (let attempt = 0; attempt < RETRY_DELAYS_MS.length; attempt++) {
    if (attempt > 0) await sleep(RETRY_DELAYS_MS[attempt - 1]);
    const result = await postOnce(sub.url, body, headers);
    lastStatus = result.status;
    lastError = result.error;
    if (result.ok) {
      await updateWebhookSubscription(sub.id, {
        status: "active",
        lastDeliveredAt: new Date().toISOString(),
        lastErrorMessage: "",
      }).catch(() => null);
      return { success: true, attempts: attempt + 1, status: result.status };
    }
  }

  const reason = lastStatus
    ? `HTTP ${lastStatus}`
    : lastError ?? "unreachable";
  await updateWebhookSubscription(sub.id, {
    status: "degraded",
    lastErrorMessage: reason.slice(0, 400),
  }).catch(() => null);

  return {
    success: false,
    attempts: RETRY_DELAYS_MS.length,
    status: lastStatus,
    error: reason,
  };
}

/** Build a fresh delivery id. */
function newDeliveryId(): string {
  return `dlv_${Date.now().toString(36)}${Math.random().toString(36).slice(2, 10)}`;
}

/**
 * Fire an event for a user. Non-blocking: callers should NOT await this if
 * delivery latency would block the originating request. Errors are swallowed
 * — webhook delivery is best-effort by design.
 */
export async function fireWebhookEvent<D extends Record<string, unknown>>(
  userId: string,
  event: WebhookEventType,
  data: D
): Promise<void> {
  try {
    const subs = await findWebhookSubscriptionsForEvent(userId, event);
    if (subs.length === 0) return;

    const payload: WebhookEventPayload<typeof event, D> = {
      event,
      deliveryId: newDeliveryId(),
      timestamp: new Date().toISOString(),
      userId,
      data,
    };

    await Promise.all(
      subs.map((sub) =>
        deliverToSubscription(sub, payload).catch((err) => {
          // SECURITY: never log body/signature/secret. Only id + message.
          console.error(
            `[webhooks] delivery error for ${sub.id}:`,
            err instanceof Error ? err.message : "unknown"
          );
          return null;
        })
      )
    );
  } catch (err) {
    console.error(
      "[webhooks] fireWebhookEvent failed:",
      err instanceof Error ? err.message : "unknown"
    );
  }
}

/**
 * "Fire and forget" helper for API routes: schedules delivery on the next
 * microtask so it never blocks the HTTP response path.
 */
export function fireWebhookEventNonBlocking<
  D extends Record<string, unknown>,
>(userId: string, event: WebhookEventType, data: D): void {
  // Intentionally not awaited. Next.js keeps the worker alive for the
  // microtask; if the platform kills it before delivery we rely on the
  // per-event callers being re-tried at a higher level.
  void fireWebhookEvent(userId, event, data);
}

/**
 * Synchronous test delivery used by the "Send test" button in the settings
 * UI. Returns the delivery result so the UI can surface success/failure.
 */
export async function sendTestWebhook(
  subscriptionId: string
): Promise<DeliveryResult> {
  const sub = await getWebhookSubscription(subscriptionId);
  if (!sub) {
    return { success: false, attempts: 0, error: "Subscription not found" };
  }
  const payload: WebhookEventPayload = {
    event: "webhook.test",
    deliveryId: newDeliveryId(),
    timestamp: new Date().toISOString(),
    userId: sub.userId,
    data: {
      message: "This is a test delivery from Build In Social.",
      subscriptionId: sub.id,
    },
  };
  return deliverToSubscription(sub, payload);
}
