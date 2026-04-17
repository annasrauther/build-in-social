/**
 * Real ElevenLabs API implementation.
 * Falls back to mock when ELEVENLABS_API_KEY is not set.
 * Docs: https://elevenlabs.io/docs/api-reference/
 */

import type { VoiceOption } from "@/lib/mock/elevenlabs.mock";

const BASE_URL = "https://api.elevenlabs.io/v1";

function headers(json = false) {
  return {
    "xi-api-key": process.env.ELEVENLABS_API_KEY ?? "",
    Accept: "application/json",
    ...(json ? { "Content-Type": "application/json" } : {}),
  };
}

// ─── getVoices ────────────────────────────────────────────────────────────────

type ElevenVoice = {
  voice_id: string;
  name: string;
  preview_url: string;
  labels: Record<string, string>;
  category: string;
};

export async function getVoices(): Promise<VoiceOption[]> {
  const res = await fetch(`${BASE_URL}/voices`, { headers: headers() });
  if (!res.ok) throw new Error(`ElevenLabs getVoices error ${res.status}`);
  const json = await res.json();
  const voices: ElevenVoice[] = json.voices ?? [];

  return voices.map((v) => {
    const gender = (v.labels?.gender ?? "male") as "male" | "female";
    const accent = v.labels?.accent ?? "";
    let style: VoiceOption["style"] = "professional";
    const useCase = (v.labels?.use_case ?? "").toLowerCase();
    if (useCase.includes("casual") || useCase.includes("conversational")) style = "casual";
    else if (useCase.includes("energetic") || useCase.includes("narration")) style = "energetic";
    else if (useCase.includes("warm") || useCase.includes("meditation")) style = "warm";

    return {
      id: v.voice_id,
      name: v.name,
      description: [v.labels?.description, accent].filter(Boolean).join(", ") || `${gender} voice`,
      previewUrl: v.preview_url ?? "",
      gender,
      style,
    };
  });
}

// ─── synthesizeSpeech ─────────────────────────────────────────────────────────

export async function synthesizeSpeech(params: {
  text: string;
  voiceId: string;
}): Promise<{ audioUrl: string; durationSeconds: number }> {
  const res = await fetch(`${BASE_URL}/text-to-speech/${params.voiceId}`, {
    method: "POST",
    headers: headers(true),
    body: JSON.stringify({
      text: params.text,
      model_id: "eleven_turbo_v2",
      voice_settings: { stability: 0.5, similarity_boost: 0.75 },
    }),
  });

  if (!res.ok) {
    const body = await res.text().catch(() => "");
    throw new Error(`ElevenLabs synthesize error ${res.status}: ${body}`);
  }

  // Response is raw audio bytes (mp3)
  const buffer = await res.arrayBuffer();
  const base64 = Buffer.from(buffer).toString("base64");
  const audioUrl = `data:audio/mpeg;base64,${base64}`;

  // Rough estimate: ~150 words/min, ~5 chars/word
  const durationSeconds = Math.round(params.text.length / (150 * 5 / 60));

  return { audioUrl, durationSeconds };
}

// ─── cloneVoice ───────────────────────────────────────────────────────────────

export async function cloneVoice(params: {
  audioUrl: string;
  userId: string;
}): Promise<{ voiceId: string }> {
  // ── Critical path #7: REFUSE without DB-recorded consent ───────────────
  // ElevenLabs ToS + biometric privacy laws require provable consent BEFORE
  // any voice biometric capture. The /api/onboard/voice route writes the
  // consent record; this guard ensures no other code path can ever skip it.
  const { hasVoiceConsent } = await import("@/lib/services/db");
  const consentOk = await hasVoiceConsent(params.userId);
  if (!consentOk) {
    throw new Error(
      `cloneVoice refused: no voice consent record for user ${params.userId}. ` +
        `Consent must be persisted via recordVoiceConsent() before any ElevenLabs clone request.`
    );
  }

  // Fetch the audio file from the URL first
  const audioRes = await fetch(params.audioUrl);
  if (!audioRes.ok) throw new Error("Failed to fetch audio for voice clone");
  const audioBuffer = await audioRes.arrayBuffer();

  const form = new FormData();
  form.append("name", `User ${params.userId} voice`);
  form.append("description", "Voice cloned via Build In Social");
  form.append(
    "files",
    new Blob([audioBuffer], { type: "audio/mpeg" }),
    "voice_sample.mp3"
  );

  const res = await fetch(`${BASE_URL}/voices/add`, {
    method: "POST",
    headers: { "xi-api-key": process.env.ELEVENLABS_API_KEY ?? "" },
    body: form,
  });

  if (!res.ok) {
    const body = await res.text().catch(() => "");
    throw new Error(`ElevenLabs cloneVoice error ${res.status}: ${body}`);
  }

  const json = await res.json();
  return { voiceId: json.voice_id };
}
