/**
 * WordPress publishing — real adapter.
 *
 * Auth: HTTP Basic with username + Application Password (not the login
 * password). Passwords are always decrypted from the ciphertext stored in
 * `wordpress_connections.encrypted_app_password` and never logged.
 *
 * Endpoints used:
 *   GET  /wp-json/wp/v2/users/me  — verify credentials, capture wpUserId.
 *   GET  /wp-json/             — fetch site title.
 *   POST /wp-json/wp/v2/posts     — publish a post (pSEO article).
 *
 * SSRF hardening lives in validateSiteUrl in `wordpress.ts`; every call in
 * this module expects the URL to already be validated upstream.
 */

import type {
  WordPressPublishInput,
  WordPressPublishResult,
  WordPressTestResult,
} from "@/lib/types/wordpress";

const REQUEST_TIMEOUT_MS = 12_000;
const USER_AGENT = "BuildInSocial-WP/1.0";

function basicAuth(username: string, appPassword: string): string {
  // WP app passwords may contain spaces for human readability (ignored by WP).
  // We strip them so the Basic-auth header matches what WP expects.
  const clean = appPassword.replace(/\s+/g, "");
  const token =
    typeof btoa === "function"
      ? btoa(`${username}:${clean}`)
      : // Node fallback — safe even though we mostly run in the edge-compatible
        // Node runtime.
        Buffer.from(`${username}:${clean}`).toString("base64");
  return `Basic ${token}`;
}

class WpRedirectError extends Error {
  constructor(public readonly status: number, public readonly location?: string) {
    super(
      `WordPress site redirected (${status})${
        location ? ` to ${location}` : ""
      } — confirm the canonical URL`
    );
    this.name = "WpRedirectError";
  }
}

async function wpFetch(
  url: string,
  init: RequestInit & { timeoutMs?: number } = {}
): Promise<Response> {
  const controller = new AbortController();
  const timer = setTimeout(
    () => controller.abort(),
    init.timeoutMs ?? REQUEST_TIMEOUT_MS
  );
  try {
    const res = await fetch(url, {
      ...init,
      signal: controller.signal,
      // Never carry cookies to a third-party site.
      credentials: "omit",
      cache: "no-store",
      redirect: "manual",
      headers: {
        "User-Agent": USER_AGENT,
        Accept: "application/json",
        ...(init.headers ?? {}),
      },
    });
    // HIGH-5: redirects can point a Basic-auth-bearing request at an attacker
    // target. With redirect: "manual" fetch doesn't follow, but callers MUST
    // treat 3xx as failure rather than try to JSON.parse a redirect body.
    if (res.status >= 300 && res.status < 400) {
      throw new WpRedirectError(res.status, res.headers.get("location") ?? undefined);
    }
    return res;
  } finally {
    clearTimeout(timer);
  }
}

/**
 * Validate credentials and capture site metadata.
 * Never logs the app password on failure.
 */
export async function testConnection(params: {
  siteUrl: string;
  username: string;
  appPassword: string;
}): Promise<WordPressTestResult> {
  const base = params.siteUrl.replace(/\/+$/, "");
  const authHeader = basicAuth(params.username, params.appPassword);

  let meRes: Response;
  try {
    meRes = await wpFetch(`${base}/wp-json/wp/v2/users/me`, {
      headers: { Authorization: authHeader },
    });
  } catch (err) {
    if (err instanceof Error && err.name === "AbortError") {
      return { ok: false, error: "WordPress site did not respond in time" };
    }
    if (err instanceof Error && err.name === "WpRedirectError") {
      return { ok: false, error: err.message };
    }
    return { ok: false, error: "Could not reach the WordPress REST API" };
  }

  if (meRes.status === 401 || meRes.status === 403) {
    return { ok: false, error: "Invalid username or application password" };
  }
  if (!meRes.ok) {
    return { ok: false, error: `WordPress returned ${meRes.status}` };
  }

  let meJson: { id?: number } | null = null;
  try {
    meJson = (await meRes.json()) as { id?: number };
  } catch {
    return { ok: false, error: "WordPress returned an unexpected response" };
  }

  // Site title is public and doesn't require auth.
  let siteTitle: string | undefined;
  try {
    const rootRes = await wpFetch(`${base}/wp-json/`);
    if (rootRes.ok) {
      const rootJson = (await rootRes.json()) as { name?: string };
      siteTitle = typeof rootJson.name === "string" ? rootJson.name : undefined;
    }
  } catch {
    // Non-fatal — we have the auth check already.
  }

  return {
    ok: true,
    siteTitle,
    wpUserId: typeof meJson.id === "number" ? meJson.id : undefined,
  };
}

/**
 * Publish a WordPress post.
 * Callers must already have validated that the input includes title +
 * htmlContent (the API route resolves pSEO page ids before calling).
 */
export async function publishPost(params: {
  siteUrl: string;
  username: string;
  appPassword: string;
  input: WordPressPublishInput;
}): Promise<WordPressPublishResult> {
  if (!params.input.title || !params.input.htmlContent) {
    return { ok: false, error: "Missing title or HTML content" };
  }

  const base = params.siteUrl.replace(/\/+$/, "");
  const authHeader = basicAuth(params.username, params.appPassword);
  const body = JSON.stringify({
    title: params.input.title,
    content: params.input.htmlContent,
    status: params.input.status ?? "publish",
  });

  let res: Response;
  try {
    res = await wpFetch(`${base}/wp-json/wp/v2/posts`, {
      method: "POST",
      headers: {
        Authorization: authHeader,
        "Content-Type": "application/json",
      },
      body,
    });
  } catch (err) {
    if (err instanceof Error && err.name === "AbortError") {
      return { ok: false, error: "WordPress site did not respond in time" };
    }
    if (err instanceof Error && err.name === "WpRedirectError") {
      return { ok: false, error: err.message };
    }
    return { ok: false, error: "Could not reach the WordPress REST API" };
  }

  if (res.status === 401 || res.status === 403) {
    return { ok: false, error: "WordPress rejected the credentials" };
  }
  if (!res.ok) {
    return { ok: false, error: `WordPress returned ${res.status}` };
  }

  let json: { id?: number; link?: string } | null = null;
  try {
    json = (await res.json()) as { id?: number; link?: string };
  } catch {
    return { ok: false, error: "WordPress returned an unexpected response" };
  }

  return {
    ok: true,
    wpPostId: typeof json.id === "number" ? json.id : undefined,
    postUrl: typeof json.link === "string" ? json.link : undefined,
  };
}

/**
 * Publish a video post to WordPress — embeds the rendered MP4 via an HTML5
 * `<video>` tag that points at its R2 URL. Title + summary are driven by the
 * script's hook + body. Requires the same Basic-auth app-password flow as
 * `publishPost`.
 */
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
  if (!params.input.title || !params.input.videoUrl) {
    return { ok: false, error: "Missing title or video URL" };
  }

  const base = params.siteUrl.replace(/\/+$/, "");
  const authHeader = basicAuth(params.username, params.appPassword);

  // Minimal HTML wrapper — title + <video> + hook + body paragraphs. Keeps
  // rendering predictable across WP themes without depending on Gutenberg
  // block schemas.
  const html = [
    `<figure class="wp-block-video"><video controls src="${escapeAttr(params.input.videoUrl)}"></video></figure>`,
    params.input.hook ? `<p><strong>${escapeHtml(params.input.hook)}</strong></p>` : "",
    params.input.body ? `<p>${escapeHtml(params.input.body)}</p>` : "",
    `<p><em>Shared to ${escapeHtml(params.input.platform)} via Build In Social.</em></p>`,
  ]
    .filter(Boolean)
    .join("\n");

  const body = JSON.stringify({
    title: params.input.title,
    content: html,
    status: params.input.status ?? "publish",
  });

  let res: Response;
  try {
    res = await wpFetch(`${base}/wp-json/wp/v2/posts`, {
      method: "POST",
      headers: {
        Authorization: authHeader,
        "Content-Type": "application/json",
      },
      body,
    });
  } catch (err) {
    if (err instanceof Error && err.name === "AbortError") {
      return { ok: false, error: "WordPress site did not respond in time" };
    }
    if (err instanceof Error && err.name === "WpRedirectError") {
      return { ok: false, error: err.message };
    }
    return { ok: false, error: "Could not reach the WordPress REST API" };
  }

  if (res.status === 401 || res.status === 403) {
    return { ok: false, error: "WordPress rejected the credentials" };
  }
  if (!res.ok) {
    return { ok: false, error: `WordPress returned ${res.status}` };
  }

  let json: { id?: number; link?: string } | null = null;
  try {
    json = (await res.json()) as { id?: number; link?: string };
  } catch {
    return { ok: false, error: "WordPress returned an unexpected response" };
  }

  return {
    ok: true,
    wpPostId: typeof json.id === "number" ? json.id : undefined,
    postUrl: typeof json.link === "string" ? json.link : undefined,
  };
}

function escapeHtml(s: string): string {
  return s
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;");
}

function escapeAttr(s: string): string {
  return escapeHtml(s);
}
