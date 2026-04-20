/**
 * WordPress publishing — mock adapter.
 *
 * Used in dev when WORDPRESS_ENCRYPTION_KEY is unset OR when the caller
 * flags mock mode explicitly. Returns realistic fixtures so UI flows work
 * end-to-end without a real WordPress site.
 *
 * Contracts mirror `wordpress.real.ts` so the dispatcher in `wordpress.ts`
 * can swap them at boot without callers caring which is active.
 */

import type {
  WordPressPublishInput,
  WordPressPublishResult,
  WordPressTestResult,
} from "@/lib/types/wordpress";

const MOCK_DELAY_MS = 250;
const delay = (ms = MOCK_DELAY_MS) => new Promise((r) => setTimeout(r, ms));

/**
 * Fake credential validation — always returns success in dev.
 * The only way this fails is if the site URL is blatantly malformed.
 */
export async function testConnection(params: {
  siteUrl: string;
  username: string;
  appPassword: string;
}): Promise<WordPressTestResult> {
  await delay();
  try {
    const parsed = new URL(params.siteUrl);
    if (!parsed.protocol.startsWith("http")) {
      return { ok: false, error: "Site URL must start with http(s)://" };
    }
  } catch {
    return { ok: false, error: "Site URL is not valid" };
  }
  if (!params.username.trim() || !params.appPassword.trim()) {
    return { ok: false, error: "Username and application password are required" };
  }
  return {
    ok: true,
    siteTitle: "Your WordPress Site (mock)",
    wpUserId: 1,
  };
}

/**
 * Fake publish — returns a deterministic-looking fake permalink so UI can
 * render the "View post" affordance.
 */
export async function publishPost(params: {
  siteUrl: string;
  username: string;
  appPassword: string;
  input: WordPressPublishInput;
}): Promise<WordPressPublishResult> {
  await delay();

  const title =
    params.input.title?.trim() ||
    (params.input.pseoPageId
      ? `pSEO article ${params.input.pseoPageId}`
      : "Untitled post");
  const slug = title
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 60) || "post";

  const base = params.siteUrl.replace(/\/+$/, "");
  const postId = Math.floor(1000 + Math.random() * 9000);

  return {
    ok: true,
    wpPostId: postId,
    postUrl: `${base}/${slug}-${postId}`,
  };
}
