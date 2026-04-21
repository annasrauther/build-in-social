/**
 * WordPress publishing — dispatcher.
 *
 * Picks mock vs real adapter based on the encryption key being present
 * (mirrors the stripe/claude pattern). Exposes helpers to:
 *   - Validate a WP site URL (HTTPS + SSRF guard in prod).
 *   - Normalize the URL (lowercase host, strip trailing slash).
 *   - Encrypt/decrypt app passwords.
 *   - Publish a pSEO article to a saved connection with one retry.
 *
 * Security posture:
 *   - Encryption: AES-256-GCM via lib/crypto (key = WORDPRESS_ENCRYPTION_KEY).
 *   - SSRF: private/loopback hosts rejected in production.
 *   - Logs: never include the app password. `redactSecret` is used
 *     everywhere the password is referenced.
 */

import * as mock from "@/lib/services/wordpress.mock";
import * as real from "@/lib/services/wordpress.real";
import { promises as dns } from "node:dns";
import net from "node:net";
import {
  decryptSecret,
  encryptSecret,
  redactSecret,
} from "@/lib/crypto";
import {
  getVideo,
  getWordPressConnection,
  updateWordPressConnection,
} from "@/lib/services/db";
import { generatePseoPage as _unused } from "@/lib/services/claude";
import { getPseoPage } from "@/lib/services/db";
import { WORDPRESS_ENCRYPTION_KEY } from "@/lib/env";
import type {
  PublicWordPressConnection,
  WordPressConnectionRecord,
  WordPressPublishInput,
  WordPressPublishResult,
  WordPressTestResult,
} from "@/lib/types/wordpress";
import { toPublicConnection } from "@/lib/types/wordpress";

// Kill the stray unused import — kept as a deliberate "see also" pointer so
// future maintainers know where pSEO content comes from.
void _unused;

// In prod we strictly require the encryption key. In dev without the key we
// fall back to the mock adapter so local flows still work end-to-end.
const hasRealCreds = !!WORDPRESS_ENCRYPTION_KEY;
const adapter = hasRealCreds ? real : mock;

// ─── URL validation (SSRF / transport guards) ────────────────────────────────

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

export interface SiteUrlValidation {
  ok: boolean;
  reason?: string;
  normalized?: string;
}

/**
 * Reject hostnames that encode an IP in short/octal/hex/integer form.
 * URL does some normalization but not all (e.g. "http://127.1" or "http://0x7f.0.0.1"
 * can still resolve to private ranges even after parsing).
 */
function hasSuspiciousNumericHost(host: string): boolean {
  // All-numeric integer form (e.g. 2130706433 = 127.0.0.1)
  if (/^\d+$/.test(host)) return true;
  // Hex prefix anywhere in a dotted hostname
  if (/(^|\.)0x[0-9a-f]+(\.|$)/i.test(host)) return true;
  // Octal prefix (leading zero on an octet with >1 digit)
  if (/(^|\.)0\d+(\.|$)/.test(host)) return true;
  // Short-form IPv4 like 127.1
  if (/^\d+\.\d+$/.test(host)) return true;
  if (/^\d+\.\d+\.\d+$/.test(host)) return true;
  return false;
}

function isBlockedIpv4(ip: string): boolean {
  const parts = ip.split(".").map(Number);
  if (parts.length !== 4 || parts.some((n) => Number.isNaN(n))) return true;
  const [a, b] = parts;
  if (a === 10) return true;              // 10.0.0.0/8
  if (a === 127) return true;             // loopback
  if (a === 0) return true;               // "this network"
  if (a === 169 && b === 254) return true; // link-local (AWS metadata, etc.)
  if (a === 172 && b >= 16 && b <= 31) return true; // 172.16/12
  if (a === 192 && b === 168) return true;          // 192.168/16
  if (a === 100 && b >= 64 && b <= 127) return true; // CGNAT 100.64/10
  if (a >= 224) return true;              // multicast + reserved
  return false;
}

function isBlockedIpv6(ip: string): boolean {
  const lower = ip.toLowerCase();
  if (lower === "::" || lower === "::1") return true;
  if (lower.startsWith("fe80:") || lower.startsWith("fe80::")) return true;
  if (lower.startsWith("fc") || lower.startsWith("fd")) return true;
  // IPv4-mapped IPv6 -> re-check the v4 portion
  const v4Mapped = lower.match(/::ffff:([0-9.]+)$/);
  if (v4Mapped && net.isIPv4(v4Mapped[1])) return isBlockedIpv4(v4Mapped[1]);
  return false;
}

/**
 * Resolve the hostname and reject if any address is in a blocked range.
 * Catches DNS-based SSRF bypasses (attacker's domain with A record → 127.0.0.1
 * or 169.254.169.254 etc).
 */
export async function assertHostIsPublic(host: string): Promise<void> {
  if (net.isIP(host)) {
    const blocked = net.isIPv4(host) ? isBlockedIpv4(host) : isBlockedIpv6(host);
    if (blocked) throw new Error("Host resolves to a blocked range");
    return;
  }
  const addrs = await dns.lookup(host, { all: true });
  for (const { address, family } of addrs) {
    const blocked = family === 4 ? isBlockedIpv4(address) : isBlockedIpv6(address);
    if (blocked) throw new Error("Host resolves to a blocked range");
  }
}

/**
 * Validate and normalize a WordPress site URL.
 * - Must parse as a URL.
 * - Must be https:// in production; http:// is tolerated in dev only.
 * - Private/loopback hosts are rejected in production (SSRF guard).
 * - Normalization: lowercase hostname + drop trailing slash.
 */
export function validateSiteUrl(raw: string): SiteUrlValidation {
  const trimmed = (raw ?? "").trim();
  if (!trimmed) return { ok: false, reason: "Site URL is required" };

  let parsed: URL;
  try {
    parsed = new URL(trimmed);
  } catch {
    return { ok: false, reason: "Site URL is not a valid URL" };
  }

  if (parsed.protocol !== "https:" && parsed.protocol !== "http:") {
    return { ok: false, reason: "Site URL must use https://" };
  }

  const isProd = process.env.NODE_ENV === "production";
  if (isProd && parsed.protocol !== "https:") {
    return { ok: false, reason: "Site URL must use https:// in production" };
  }

  const host = parsed.hostname.toLowerCase();

  // HIGH-4: reject numeric-form hosts before any DNS lookup. URL normalizes
  // some but not all (e.g. "127.1", "0x7f.0.0.1", "2130706433") — these are
  // classic SSRF obfuscation tricks.
  if (isProd && hasSuspiciousNumericHost(host)) {
    return { ok: false, reason: "Host format is not permitted" };
  }

  // Reject IDN / punycode homographs by requiring the canonical hostname
  // match the input — URL stores the punycode form on .hostname for non-ASCII
  // inputs. If the user typed a mixed-script homograph, we refuse it.
  if (isProd && /xn--/i.test(host)) {
    return { ok: false, reason: "Internationalized domains are not yet supported" };
  }

  if (isProd) {
    for (const re of PRIVATE_HOST_PATTERNS) {
      if (re.test(host)) {
        return {
          ok: false,
          reason: "Private or loopback hosts are not allowed",
        };
      }
    }
  }

  // Normalize: lowercase host, strip trailing slash, drop default ports.
  parsed.hostname = host;
  if (
    (parsed.protocol === "https:" && parsed.port === "443") ||
    (parsed.protocol === "http:" && parsed.port === "80")
  ) {
    parsed.port = "";
  }
  const normalized = parsed.toString().replace(/\/+$/, "");

  return { ok: true, normalized };
}

// ─── Encryption passthrough (keeps callers off the raw helper) ───────────────

export function encryptAppPassword(plaintext: string): Promise<string> {
  return encryptSecret(plaintext, WORDPRESS_ENCRYPTION_KEY);
}

export function decryptAppPassword(ciphertext: string): Promise<string> {
  return decryptSecret(ciphertext, WORDPRESS_ENCRYPTION_KEY);
}

export { redactSecret };

// ─── Adapter passthrough ─────────────────────────────────────────────────────

async function guardOutbound(siteUrl: string): Promise<void> {
  // HIGH-4 defense-in-depth: even if the URL passed static validation at save
  // time, DNS answers can change. Re-resolve per request.
  if (process.env.NODE_ENV !== "production") return;
  try {
    const url = new URL(siteUrl);
    await assertHostIsPublic(url.hostname);
  } catch (err) {
    throw new Error(
      err instanceof Error ? err.message : "Host is not resolvable or is blocked"
    );
  }
}

export async function testConnection(params: {
  siteUrl: string;
  username: string;
  appPassword: string;
}): Promise<WordPressTestResult> {
  try {
    await guardOutbound(params.siteUrl);
  } catch (err) {
    return { ok: false, error: err instanceof Error ? err.message : "Blocked host" };
  }
  return adapter.testConnection(params);
}

export async function publishPost(params: {
  siteUrl: string;
  username: string;
  appPassword: string;
  input: WordPressPublishInput;
}): Promise<WordPressPublishResult> {
  try {
    await guardOutbound(params.siteUrl);
  } catch (err) {
    return { ok: false, error: err instanceof Error ? err.message : "Blocked host" };
  }
  return adapter.publishPost(params);
}

export async function publishVideoPost(params: {
  siteUrl: string;
  username: string;
  appPassword: string;
  input: {
    title: string;
    videoUrl: string;
    hook: string;
    body: string;
    platform: string;
    status?: "publish" | "draft" | "pending";
  };
}): Promise<WordPressPublishResult> {
  try {
    await guardOutbound(params.siteUrl);
  } catch (err) {
    return { ok: false, error: err instanceof Error ? err.message : "Blocked host" };
  }
  return adapter.publishVideoPost(params);
}

// ─── High-level orchestration ────────────────────────────────────────────────

/**
 * Publish a pSEO article (by id) through the user's saved WP connection.
 * Returns the publish result. The caller is responsible for deciding whether
 * to fall back to the buildinsocial.com subdomain on failure.
 *
 * Retries once on failure (network + non-2xx) before surfacing the error.
 */
export async function publishPseoToWordPress(params: {
  userId: string;
  pseoPageId: string;
}): Promise<WordPressPublishResult & { connection?: PublicWordPressConnection }> {
  const conn = await getWordPressConnection(params.userId);
  if (!conn) {
    return { ok: false, error: "No WordPress connection on file" };
  }
  if (!conn.enabled) {
    return { ok: false, error: "WordPress publishing is disabled" };
  }

  const page = await getPseoPage(params.pseoPageId);
  if (!page) {
    return { ok: false, error: "pSEO page not found" };
  }
  if (page.userId !== params.userId) {
    // Defense-in-depth — callers must already authorize.
    return { ok: false, error: "pSEO page does not belong to this user" };
  }

  let appPassword: string;
  try {
    appPassword = await decryptAppPassword(conn.encryptedAppPassword);
  } catch (err) {
    console.error(
      "[wordpress] failed to decrypt app password for",
      params.userId,
      err instanceof Error ? err.message : "unknown"
    );
    return { ok: false, error: "Credentials could not be decoded" };
  }

  const input: WordPressPublishInput = {
    pseoPageId: page.id,
    title: page.title,
    htmlContent: page.htmlContent,
    status: "publish",
  };

  const attempt = () =>
    publishPost({
      siteUrl: conn.siteUrl,
      username: conn.username,
      appPassword,
      input,
    });

  let result = await attempt();
  if (!result.ok) {
    // One retry with a small delay — covers transient network hiccups.
    await new Promise((r) => setTimeout(r, 750));
    result = await attempt();
  }

  if (result.ok) {
    await updateWordPressConnection(params.userId, {
      lastPublishedAt: new Date().toISOString(),
    }).catch((err) =>
      console.warn(
        "[wordpress] failed to update lastPublishedAt:",
        err instanceof Error ? err.message : "unknown"
      )
    );
  } else {
    console.warn(
      "[wordpress] publish failed for user",
      params.userId,
      "password=",
      redactSecret(appPassword),
      "error=",
      result.error
    );
  }

  return { ...result, connection: toPublicConnection(conn) };
}

/**
 * Publish a rendered video (by id) through the user's saved WP connection.
 * Builds a post that embeds the video's R2 URL. Retries once on failure,
 * same contract as `publishPseoToWordPress`.
 */
export async function publishVideoToWordPress(params: {
  userId: string;
  videoId: string;
}): Promise<WordPressPublishResult & { connection?: PublicWordPressConnection }> {
  const conn = await getWordPressConnection(params.userId);
  if (!conn) {
    return { ok: false, error: "No WordPress connection on file" };
  }
  if (!conn.enabled) {
    return { ok: false, error: "WordPress publishing is disabled" };
  }

  const video = await getVideo(params.videoId);
  if (!video) return { ok: false, error: "Video not found" };
  if (video.userId !== params.userId) {
    return { ok: false, error: "Video does not belong to this user" };
  }
  if (!video.outputUrl) {
    return { ok: false, error: "Video has no rendered output yet" };
  }

  let appPassword: string;
  try {
    appPassword = await decryptAppPassword(conn.encryptedAppPassword);
  } catch (err) {
    console.error(
      "[wordpress] failed to decrypt app password for",
      params.userId,
      err instanceof Error ? err.message : "unknown",
    );
    return { ok: false, error: "Credentials could not be decoded" };
  }

  const attempt = () =>
    publishVideoPost({
      siteUrl: conn.siteUrl,
      username: conn.username,
      appPassword,
      input: {
        title: video.title || "New video",
        videoUrl: video.outputUrl ?? "",
        hook: video.scriptJson?.hook ?? "",
        body: video.scriptJson?.body ?? "",
        platform: video.platform,
        status: "publish",
      },
    });

  let result = await attempt();
  if (!result.ok) {
    await new Promise((r) => setTimeout(r, 750));
    result = await attempt();
  }

  if (result.ok) {
    await updateWordPressConnection(params.userId, {
      lastPublishedAt: new Date().toISOString(),
    }).catch((err) =>
      console.warn(
        "[wordpress] failed to update lastPublishedAt:",
        err instanceof Error ? err.message : "unknown",
      ),
    );
  } else {
    console.warn(
      "[wordpress] video publish failed for user",
      params.userId,
      "password=",
      redactSecret(appPassword),
      "error=",
      result.error,
    );
  }

  return { ...result, connection: toPublicConnection(conn) };
}

// ─── Re-exports for API route use ────────────────────────────────────────────

export type {
  PublicWordPressConnection,
  WordPressConnectionRecord,
  WordPressPublishInput,
  WordPressPublishResult,
  WordPressTestResult,
};
export { toPublicConnection };
