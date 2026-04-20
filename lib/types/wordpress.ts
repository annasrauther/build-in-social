/**
 * WordPress publishing — shared types.
 *
 * Auth model: WordPress Application Passwords (not OAuth).
 * The app password is NEVER stored or returned in plaintext.
 * Only the AES-256-GCM ciphertext lives at rest; the API responses always
 * redact the password and surface `hasAppPassword: boolean` instead.
 */

/** Row as stored by NoCodeBackend (or in-memory mock). */
export interface WordPressConnectionRecord {
  id: string;
  userId: string;
  /** Normalized site URL with scheme + no trailing slash. */
  siteUrl: string;
  /** WordPress username used with the application password. */
  username: string;
  /** AES-256-GCM ciphertext, base64url. NEVER returned to the client. */
  encryptedAppPassword: string;
  /** WP user id captured when the /test call succeeds. */
  wpUserId?: number;
  /** ISO timestamp of the last successful /test call. */
  lastTestedAt: string;
  /** ISO timestamp of the last successful publish. */
  lastPublishedAt?: string;
  /** Whether the user has enabled WP publishing for pSEO. */
  enabled: boolean;
  /** ISO timestamps. */
  createdAt: string;
  updatedAt: string;
}

/** Safe shape returned from the API — no secrets. */
export interface PublicWordPressConnection {
  id: string;
  siteUrl: string;
  username: string;
  wpUserId?: number;
  lastTestedAt: string;
  lastPublishedAt?: string;
  enabled: boolean;
  hasAppPassword: boolean;
}

export interface WordPressTestResult {
  ok: boolean;
  /** Site title returned by the WP REST API. Surfaced in the UI. */
  siteTitle?: string;
  wpUserId?: number;
  error?: string;
}

export interface WordPressPublishInput {
  /** pSEO page id — the primary content we publish. */
  pseoPageId?: string;
  /** TODO: video post support — carries the video id when we add that adapter. */
  videoId?: string;
  /** Explicit title/content override used when pSEO page id is absent. */
  title?: string;
  htmlContent?: string;
  /** "publish" posts immediately, "draft" creates an unpublished post. */
  status?: "publish" | "draft";
}

export interface WordPressPublishResult {
  ok: boolean;
  wpPostId?: number;
  postUrl?: string;
  error?: string;
}

export function toPublicConnection(
  row: WordPressConnectionRecord
): PublicWordPressConnection {
  return {
    id: row.id,
    siteUrl: row.siteUrl,
    username: row.username,
    wpUserId: row.wpUserId,
    lastTestedAt: row.lastTestedAt,
    lastPublishedAt: row.lastPublishedAt,
    enabled: row.enabled,
    hasAppPassword: row.encryptedAppPassword.length > 0,
  };
}
