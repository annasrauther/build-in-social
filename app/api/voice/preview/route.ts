import { NextResponse } from "next/server";
import { synthesizeSpeech } from "@/lib/services/elevenlabs";

/**
 * GET /api/voice/preview?voiceId=alex
 *
 * Returns a short audio sample for the given library voice ID.
 * Uses ElevenLabs synthesis when ELEVENLABS_API_KEY is set;
 * falls back to the mock service (returns a sample MP3 URL).
 * In-memory cache prevents re-synthesising the same voice twice per server lifecycle.
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

// In-memory cache — persists for the server lifecycle
const previewCache = new Map<string, string>();

export async function GET(req: Request) {
  const url = new URL(req.url);
  const voiceId = url.searchParams.get("voiceId");

  if (!voiceId) {
    return NextResponse.json({ error: "voiceId is required" }, { status: 400 });
  }

  // Serve from cache if available
  const cached = previewCache.get(voiceId);
  if (cached) {
    return NextResponse.json({ audioUrl: cached });
  }

  const mapping = VOICE_ID_MAP[voiceId];
  const elevenlabsId = mapping?.elevenlabsId ?? voiceId;
  const previewText =
    mapping?.previewText ?? "Hello, I'll be narrating your videos this week.";

  try {
    const { audioUrl } = await synthesizeSpeech({
      text: previewText,
      voiceId: elevenlabsId,
    });

    previewCache.set(voiceId, audioUrl);
    return NextResponse.json({ audioUrl });
  } catch (err) {
    console.error("[voice/preview] synthesis failed:", err);
    return NextResponse.json(
      { error: "Voice preview unavailable" },
      { status: 503 },
    );
  }
}
