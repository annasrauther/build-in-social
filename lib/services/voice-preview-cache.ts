/**
 * Voice preview cache — Phase 1 in-memory cache for ElevenLabs preview audio URLs.
 *
 * COST NOTE: each ElevenLabs TTS preview costs ~$0.003–0.01. The 24h TTL here,
 * combined with the per-user rate limit in the API route, keeps the worst-case
 * monthly spend bounded. At 1 preview / 10 min / user, with a 24h cache and
 * 10k active users the COGS ceiling is ~$1200/mo; realistic (with caching) is
 * an order of magnitude lower.
 *
 * This is intentionally process-local. For multi-region or multi-instance
 * deployments, swap the Map for Upstash Redis (`SET key val EX 86400`) without
 * changing the call sites.
 */
export type CachedPreview = {
  audioUrl: string;
  cachedUntil: number; // epoch ms
};

const TTL_MS = 24 * 60 * 60 * 1000; // 24h
const cache = new Map<string, CachedPreview>();

export function cacheKey(userId: string, voiceCloneId: string, previewText: string): string {
  // Keep key stable even if preview text changes in a future copy tweak.
  const textHash = hash(previewText);
  return `${userId}:${voiceCloneId}:${textHash}`;
}

export function getCachedPreview(key: string): CachedPreview | null {
  const entry = cache.get(key);
  if (!entry) return null;
  if (entry.cachedUntil < Date.now()) {
    cache.delete(key);
    return null;
  }
  return entry;
}

export function setCachedPreview(key: string, audioUrl: string): CachedPreview {
  const entry: CachedPreview = { audioUrl, cachedUntil: Date.now() + TTL_MS };
  cache.set(key, entry);
  return entry;
}

// Tiny deterministic string hash (DJB2). Not cryptographic — just for cache keys.
function hash(s: string): string {
  let h = 5381;
  for (let i = 0; i < s.length; i++) h = ((h << 5) + h + s.charCodeAt(i)) | 0;
  return (h >>> 0).toString(36);
}

/**
 * Phase 1 memory-only rate limit — used as a fallback when Upstash Redis is
 * not configured. The existing `checkRateLimit` helper already does this
 * transparently (no-op when no Redis env vars), so this is a secondary guard
 * layered on the Redis limiter for a specific cost-sensitive action: clone
 * TTS previews.
 */
const lastRunByUser = new Map<string, number>();
const CLONE_PREVIEW_MIN_INTERVAL_MS = 10 * 60 * 1000; // 1 per 10 minutes

export function checkClonePreviewCooldown(userId: string): {
  ok: boolean;
  retryAfterMs: number;
} {
  const now = Date.now();
  const last = lastRunByUser.get(userId) ?? 0;
  const elapsed = now - last;
  if (elapsed < CLONE_PREVIEW_MIN_INTERVAL_MS) {
    return { ok: false, retryAfterMs: CLONE_PREVIEW_MIN_INTERVAL_MS - elapsed };
  }
  return { ok: true, retryAfterMs: 0 };
}

export function markClonePreviewRun(userId: string): void {
  lastRunByUser.set(userId, Date.now());
}
