/**
 * Mock HeyGen API
 * Replace by updating /lib/services/heygen.ts when HEYGEN_API_KEY is ready.
 * All delays are intentional — they simulate real API latency in dev.
 */

const delay = (ms = 400) => new Promise((r) => setTimeout(r, ms));

// ── Types ────────────────────────────────────────────────────────────────────

export interface HeyGenAvatar {
  avatar_id: string;
  avatar_name: string;
  preview_image_url: string;
  gender: "male" | "female";
}

export interface HeyGenVoice {
  voice_id: string;
  language: string;
  gender: "male" | "female";
  name: string;
  preview_audio: string;
}

export interface HeyGenVideoStatus {
  video_id: string;
  status: "processing" | "completed" | "failed";
  video_url?: string;
  thumbnail_url?: string;
  duration?: number;
  error?: string;
}

export interface HeyGenCustomAvatar {
  avatar_id: string;
  status: "training" | "ready" | "failed";
  preview_image_url?: string;
  error?: string;
}

// ── Static mock data ─────────────────────────────────────────────────────────

export const MOCK_AVATARS: HeyGenAvatar[] = [
  {
    avatar_id: "avatar_01",
    avatar_name: "Alex",
    preview_image_url: "https://placehold.co/200x200?text=Alex",
    gender: "male",
  },
  {
    avatar_id: "avatar_02",
    avatar_name: "Jordan",
    preview_image_url: "https://placehold.co/200x200?text=Jordan",
    gender: "female",
  },
  {
    avatar_id: "avatar_03",
    avatar_name: "Morgan",
    preview_image_url: "https://placehold.co/200x200?text=Morgan",
    gender: "male",
  },
  {
    avatar_id: "avatar_04",
    avatar_name: "Taylor",
    preview_image_url: "https://placehold.co/200x200?text=Taylor",
    gender: "female",
  },
  {
    avatar_id: "avatar_05",
    avatar_name: "Riley",
    preview_image_url: "https://placehold.co/200x200?text=Riley",
    gender: "male",
  },
  {
    avatar_id: "avatar_06",
    avatar_name: "Casey",
    preview_image_url: "https://placehold.co/200x200?text=Casey",
    gender: "female",
  },
];

export const MOCK_HEYGEN_VOICES: HeyGenVoice[] = [
  {
    voice_id: "hg_voice_01",
    language: "en-US",
    gender: "male",
    name: "Marcus",
    preview_audio: "",
  },
  {
    voice_id: "hg_voice_02",
    language: "en-US",
    gender: "female",
    name: "Sarah",
    preview_audio: "",
  },
  {
    voice_id: "hg_voice_03",
    language: "en-GB",
    gender: "male",
    name: "Oliver",
    preview_audio: "",
  },
  {
    voice_id: "hg_voice_04",
    language: "en-AU",
    gender: "female",
    name: "Emma",
    preview_audio: "",
  },
];

// ── Poll tracking (module-level, survives across requests in same process) ───

const pollCounts = new Map<string, number>();

// ── Mock functions ────────────────────────────────────────────────────────────

export async function listAvatars(): Promise<HeyGenAvatar[]> {
  console.log("[MOCK heygen] listAvatars");
  await delay(400);
  return MOCK_AVATARS;
}

/**
 * HeyGen marketplace — real licensed humans whose likeness is available for
 * paid renders. In the real service this is a filtered view of HeyGen's
 * avatar catalog (is_public=true, licensing=commercial). Mocked to the same
 * six faces as listAvatars for now; real impl narrows server-side.
 */
export async function listLicensedAvatars(): Promise<HeyGenAvatar[]> {
  console.log("[MOCK heygen] listLicensedAvatars");
  await delay(400);
  return MOCK_AVATARS;
}

export async function listVoices(): Promise<HeyGenVoice[]> {
  console.log("[MOCK heygen] listVoices");
  await delay(300);
  return MOCK_HEYGEN_VOICES;
}

export async function generateVideo(params: {
  avatarId: string;
  voiceId: string;
  script: string;
  width?: number;
  height?: number;
}): Promise<{ videoId: string }> {
  console.log("[MOCK heygen] generateVideo", params.avatarId, params.voiceId);
  await delay(1500);
  return { videoId: `mock_heygen_video_${Date.now()}` };
}

export async function getVideoStatus(params: {
  videoId: string;
}): Promise<HeyGenVideoStatus> {
  console.log("[MOCK heygen] getVideoStatus", params.videoId);
  await delay(400);

  // Only simulate progression for mock video IDs
  if (!params.videoId.startsWith("mock_")) {
    return { video_id: params.videoId, status: "failed", error: "Unknown video" };
  }

  const count = (pollCounts.get(params.videoId) ?? 0) + 1;
  pollCounts.set(params.videoId, count);

  if (count >= 2) {
    return {
      video_id: params.videoId,
      status: "completed",
      video_url: "https://storage.googleapis.com/gtv-videos-bucket/sample/BigBuckBunny.mp4",
      thumbnail_url: "",
      duration: 30,
    };
  }

  return { video_id: params.videoId, status: "processing" };
}

// ── Custom twin avatar (Photo Avatar / Instant Avatar in HeyGen API) ─────────

const twinPollCounts = new Map<string, number>();

export async function createAvatarFromVideo(params: {
  sourceClipUrl: string;
  userId: string;
}): Promise<{ avatarId: string; status: "training" }> {
  console.log("[MOCK heygen] createAvatarFromVideo", params.userId);
  await delay(1800);
  return {
    avatarId: `mock_twin_${params.userId}_${Date.now()}`,
    status: "training",
  };
}

export async function getCustomAvatarStatus(params: {
  avatarId: string;
}): Promise<HeyGenCustomAvatar> {
  console.log("[MOCK heygen] getCustomAvatarStatus", params.avatarId);
  await delay(400);

  if (!params.avatarId.startsWith("mock_twin_")) {
    return {
      avatar_id: params.avatarId,
      status: "failed",
      error: "Unknown avatar",
    };
  }

  const count = (twinPollCounts.get(params.avatarId) ?? 0) + 1;
  twinPollCounts.set(params.avatarId, count);

  if (count >= 2) {
    return {
      avatar_id: params.avatarId,
      status: "ready",
      preview_image_url: "https://i.pravatar.cc/600?img=7",
    };
  }
  return { avatar_id: params.avatarId, status: "training" };
}
