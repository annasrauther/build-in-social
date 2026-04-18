import { NextResponse } from "next/server";
import { synthesizeSpeech, synthesizeClonePreview } from "@/lib/services/elevenlabs";
import { getAuthUserId } from "@/lib/auth";
import { checkRateLimit } from "@/lib/services/rate-limit";
import { getUserByClerkId, getVoiceProfile } from "@/lib/services/db";
import {
  cacheKey,
  getCachedPreview,
  setCachedPreview,
  checkClonePreviewCooldown,
  markClonePreviewRun,
} from "@/lib/services/voice-preview-cache";

/**
 * GET /api/voice/preview?voiceId=alex
 *   → Library voice preview. Unchanged.
 *
 * GET /api/voice/preview?target=clone  (or ?voiceId=clone)
 *   → Renders a short preview from the caller's own ElevenLabs voice clone.
 *     Gated on Creator/Studio plan, cached 24h, rate-limited 1 / 10 min / user.
 *
 * COST NOTE: clone previews cost ~$0.003–$0.01 per ElevenLabs TTS call.
 * The 24h cache + 10-minute per-user cooldown bound the blast radius.
 * Worst case (no cache ever hits, 10k users, 1 call / 10 min): ~$1200/mo.
 * Realistic (with cache): ~an order of magnitude lower.
 */

// Mapping from our internal IDs to ElevenLabs pre-made voice IDs
const VOICE_ID_MAP: Record<string, { elevenlabsId: string; previewText: string }> = {
  alex: {
    elevenlabsId: "pNInz6obpgDQGcFmaJgB",
    previewText: "Here's the one metric every SaaS founder should watch this week.",
  },
  morgan: {
    elevenlabsId: "21m00Tcm4TlvDq8ikWAM",
    previewText: "I've spent three months learning this, and it changed everything.",
  },
  sam: {
    elevenlabsId: "yoZ06aMxZJJ28mfd3POQ",
    previewText: "Three seconds to hook. Ten seconds to prove it. Here's how.",
  },
  jordan: {
    elevenlabsId: "TxGEqnHWrfWFTfGW9XjX",
    previewText: "The data shows something counterintuitive. Let me walk you through it.",
  },
  casey: {
    elevenlabsId: "VR6AewLTigWG4xSOukaG",
    previewText: "Okay this blew my mind — and it'll blow yours too. Watch this.",
  },
  riley: {
    elevenlabsId: "MF3mGyEYCl7XYWbV9V6O",
    previewText: "Nobody told me this would work. So I tried it anyway. It did.",
  },
};

// Fixed preview text for clones — callers MUST NOT be able to inject their own.
// Custom preview text is an abuse vector (arbitrary TTS, PII read-back, etc.).
const CLONE_PREVIEW_TEXT =
  "This is a preview of your voice on Build In Social. Your weekly content will sound like this.";

const CLONE_PLANS = new Set<string>(["creator", "studio"]);

// In-memory cache for library voices — persists for the server lifecycle
const libraryPreviewCache = new Map<string, string>();

export async function GET(req: Request) {
  let userId: string;
  try {
    userId = await getAuthUserId();
  } catch {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  // Per-endpoint base rate limit 20/min by userId+ip (unchanged).
  const ip =
    req.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ??
    req.headers.get("x-real-ip") ??
    "unknown";
  const rlKey = `${userId}:${ip}`;
  const limited = await checkRateLimit(rlKey, "voice/preview", 20, "1 m");
  if (limited) return limited;

  const url = new URL(req.url);
  const voiceIdParam = url.searchParams.get("voiceId");
  const target = url.searchParams.get("target");
  const wantsClone = target === "clone" || voiceIdParam === "clone";

  if (wantsClone) {
    return handleClonePreview(userId);
  }

  if (!voiceIdParam) {
    return NextResponse.json({ error: "voiceId is required" }, { status: 400 });
  }

  const mapping = VOICE_ID_MAP[voiceIdParam];
  if (!mapping) {
    return NextResponse.json({ error: "Unknown voiceId" }, { status: 400 });
  }

  const cached = libraryPreviewCache.get(voiceIdParam);
  if (cached) {
    return NextResponse.json({ audioUrl: cached });
  }

  try {
    const { audioUrl } = await synthesizeSpeech({
      text: mapping.previewText,
      voiceId: mapping.elevenlabsId,
    });
    libraryPreviewCache.set(voiceIdParam, audioUrl);
    return NextResponse.json({ audioUrl });
  } catch (err) {
    console.error("[voice/preview] library synthesis failed:", err);
    return NextResponse.json(
      { error: "Voice preview unavailable" },
      { status: 503 },
    );
  }
}

async function handleClonePreview(clerkUserId: string) {
  // Look up the user's profile + their voice clone.
  const user = await getUserByClerkId(clerkUserId);
  if (!user) {
    return NextResponse.json(
      { data: null, error: { message: "User not found." } },
      { status: 404 },
    );
  }

  if (!CLONE_PLANS.has(user.subscriptionTier)) {
    return NextResponse.json(
      {
        data: null,
        error: {
          code: "UPGRADE_REQUIRED",
          message: "Voice clone previews are available on Creator and Studio plans.",
        },
      },
      { status: 403 },
    );
  }

  if (!user.voiceProfileId) {
    return NextResponse.json(
      {
        data: null,
        error: {
          code: "NO_CLONE",
          message: "No voice clone found. Upload a sample first.",
        },
      },
      { status: 403 },
    );
  }

  const voiceProfile = await getVoiceProfile(user.voiceProfileId);
  if (!voiceProfile || !voiceProfile.isClone) {
    return NextResponse.json(
      {
        data: null,
        error: {
          code: "NO_CLONE",
          message: "No voice clone found. Upload a sample first.",
        },
      },
      { status: 403 },
    );
  }

  const voiceCloneId = voiceProfile.elevenLabsVoiceId;
  const key = cacheKey(user.id, voiceCloneId, CLONE_PREVIEW_TEXT);

  // Serve from 24h cache before touching rate limit — cached replay shouldn't
  // consume the user's 10-minute quota.
  const cached = getCachedPreview(key);
  if (cached) {
    return NextResponse.json({
      data: { audioUrl: cached.audioUrl, cachedUntil: cached.cachedUntil },
    });
  }

  // 1 preview per user per 10 minutes (Phase 1 memory-only rate limit when
  // Upstash Redis is not configured; layered on top of the Redis limiter).
  const cooldown = checkClonePreviewCooldown(user.id);
  if (!cooldown.ok) {
    return NextResponse.json(
      {
        data: null,
        error: {
          code: "RATE_LIMITED",
          message: "Previews are limited to one every 10 minutes — try again shortly.",
          retryAfterMs: cooldown.retryAfterMs,
        },
      },
      {
        status: 429,
        headers: { "Retry-After": String(Math.ceil(cooldown.retryAfterMs / 1000)) },
      },
    );
  }

  try {
    const { audioUrl } = await synthesizeClonePreview({
      userId: user.id,
      voiceCloneId,
      previewText: CLONE_PREVIEW_TEXT,
    });
    markClonePreviewRun(user.id);
    const entry = setCachedPreview(key, audioUrl);
    return NextResponse.json({
      data: { audioUrl: entry.audioUrl, cachedUntil: entry.cachedUntil },
    });
  } catch (err) {
    console.error("[voice/preview] clone synthesis failed:", err);
    return NextResponse.json(
      {
        data: null,
        error: { message: "Build In Social couldn't render your preview. Try again shortly." },
      },
      { status: 503 },
    );
  }
}
