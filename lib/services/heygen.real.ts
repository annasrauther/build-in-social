/**
 * Real HeyGen API implementation.
 * Falls back to mock when HEYGEN_API_KEY is not set.
 * Docs: https://docs.heygen.com/reference/
 */

import type {
  HeyGenAvatar,
  HeyGenVoice,
  HeyGenVideoStatus,
  HeyGenCustomAvatar,
} from "@/lib/mock/heygen.mock";

const BASE_URL_V2 = "https://api.heygen.com/v2";
const BASE_URL_V1 = "https://api.heygen.com/v1";

function headers(json = false) {
  return {
    "X-Api-Key": process.env.HEYGEN_API_KEY ?? "",
    Accept: "application/json",
    ...(json ? { "Content-Type": "application/json" } : {}),
  };
}

// ── listAvatars ───────────────────────────────────────────────────────────────

export async function listAvatars(): Promise<HeyGenAvatar[]> {
  const res = await fetch(`${BASE_URL_V2}/avatars`, { headers: headers() });
  if (!res.ok) throw new Error(`HeyGen listAvatars error ${res.status}`);
  const json = await res.json();
  const avatars = (json.data?.avatars ?? []) as Array<{
    avatar_id: string;
    avatar_name: string;
    preview_image_url: string;
    gender: string;
  }>;
  return avatars.map((a) => ({
    avatar_id: a.avatar_id,
    avatar_name: a.avatar_name,
    preview_image_url: a.preview_image_url ?? "",
    gender: (a.gender === "female" ? "female" : "male") as "male" | "female",
  }));
}

// ── listLicensedAvatars ───────────────────────────────────────────────────────
//
// HeyGen marketplace avatars only — real humans whose likeness is licensed for
// commercial renders. The v2 /avatars endpoint returns all avatars the
// workspace can use; we filter client-side for the ones that aren't twin
// trained-photo avatars (those belong to a different class, see
// getCustomAvatarStatus). HeyGen's response uses the avatar_name format to
// distinguish these — public licensed avatars don't carry a "photo_" prefix.

export async function listLicensedAvatars(): Promise<HeyGenAvatar[]> {
  const all = await listAvatars();
  return all.filter((a) => !a.avatar_id.startsWith("photo_"));
}

// ── listVoices ────────────────────────────────────────────────────────────────

export async function listVoices(): Promise<HeyGenVoice[]> {
  const res = await fetch(`${BASE_URL_V2}/voices`, { headers: headers() });
  if (!res.ok) throw new Error(`HeyGen listVoices error ${res.status}`);
  const json = await res.json();
  const voices = (json.data?.voices ?? []) as Array<{
    voice_id: string;
    language: string;
    gender: string;
    name: string;
    preview_audio: string;
  }>;
  return voices.map((v) => ({
    voice_id: v.voice_id,
    language: v.language ?? "en-US",
    gender: (v.gender === "female" ? "female" : "male") as "male" | "female",
    name: v.name,
    preview_audio: v.preview_audio ?? "",
  }));
}

// ── generateVideo ─────────────────────────────────────────────────────────────

export async function generateVideo(params: {
  avatarId: string;
  voiceId: string;
  script: string;
  width?: number;
  height?: number;
}): Promise<{ videoId: string }> {
  const width = params.width ?? 1080;
  const height = params.height ?? 1920;

  const res = await fetch(`${BASE_URL_V2}/video/generate`, {
    method: "POST",
    headers: headers(true),
    body: JSON.stringify({
      video_inputs: [
        {
          character: {
            type: "avatar",
            avatar_id: params.avatarId,
            avatar_style: "normal",
          },
          voice: {
            type: "text",
            input_text: params.script,
            voice_id: params.voiceId,
          },
          background: {
            type: "color",
            value: "#000000",
          },
        },
      ],
      dimension: { width, height },
      test: false,
    }),
  });

  if (!res.ok) {
    const body = await res.text().catch(() => "");
    throw new Error(`HeyGen generateVideo error ${res.status}: ${body}`);
  }

  const json = await res.json();
  return { videoId: json.data.video_id as string };
}

// ── getVideoStatus ────────────────────────────────────────────────────────────

export async function getVideoStatus(params: {
  videoId: string;
}): Promise<HeyGenVideoStatus> {
  const res = await fetch(
    `${BASE_URL_V1}/video_status.get?video_id=${encodeURIComponent(params.videoId)}`,
    { headers: headers() }
  );
  if (!res.ok) throw new Error(`HeyGen getVideoStatus error ${res.status}`);
  const json = await res.json();
  const d = json.data as {
    video_id: string;
    status: "processing" | "completed" | "failed";
    video_url?: string;
    thumbnail_url?: string;
    duration?: number;
    error?: string;
  };
  return {
    video_id: d.video_id,
    status: d.status,
    video_url: d.video_url,
    thumbnail_url: d.thumbnail_url,
    duration: d.duration,
    error: d.error,
  };
}

// ── createAvatarFromVideo (Photo Avatar training) ─────────────────────────────

export async function createAvatarFromVideo(params: {
  sourceClipUrl: string;
  userId: string;
}): Promise<{ avatarId: string; status: "training" }> {
  const res = await fetch(`${BASE_URL_V2}/photo_avatar/train`, {
    method: "POST",
    headers: headers(true),
    body: JSON.stringify({ video_url: params.sourceClipUrl, name: params.userId }),
  });
  if (!res.ok) {
    const body = await res.text().catch(() => "");
    throw new Error(`HeyGen createAvatarFromVideo error ${res.status}: ${body}`);
  }
  const json = await res.json();
  return {
    avatarId: json.data.avatar_id as string,
    status: "training",
  };
}

// ── getCustomAvatarStatus ─────────────────────────────────────────────────────

export async function getCustomAvatarStatus(params: {
  avatarId: string;
}): Promise<HeyGenCustomAvatar> {
  const res = await fetch(
    `${BASE_URL_V2}/photo_avatar/${encodeURIComponent(params.avatarId)}`,
    { headers: headers() },
  );
  if (!res.ok) throw new Error(`HeyGen getCustomAvatarStatus error ${res.status}`);
  const json = await res.json();
  const d = json.data as {
    avatar_id: string;
    status: "training" | "ready" | "failed";
    preview_image_url?: string;
    error?: string;
  };
  return {
    avatar_id: d.avatar_id,
    status: d.status,
    preview_image_url: d.preview_image_url,
    error: d.error,
  };
}
