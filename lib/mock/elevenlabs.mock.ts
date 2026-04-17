/**
 * Mock ElevenLabs API
 * Replace by updating /lib/services/elevenlabs.ts when ELEVENLABS_API_KEY is ready
 */

const delay = (ms = 400) => new Promise((r) => setTimeout(r, ms));

export interface VoiceOption {
  id: string;
  name: string;
  description: string;
  previewUrl: string;
  gender: "male" | "female";
  style: "professional" | "casual" | "energetic" | "warm";
}

export const MOCK_VOICES: VoiceOption[] = [
  {
    id: "voice_01",
    name: "James",
    description: "Deep, authoritative. Great for business content.",
    previewUrl: "",
    gender: "male",
    style: "professional",
  },
  {
    id: "voice_02",
    name: "Sarah",
    description: "Warm and conversational. Perfect for coaching content.",
    previewUrl: "",
    gender: "female",
    style: "warm",
  },
  {
    id: "voice_03",
    name: "Marcus",
    description: "Energetic and punchy. Built for short-form video.",
    previewUrl: "",
    gender: "male",
    style: "energetic",
  },
  {
    id: "voice_04",
    name: "Emma",
    description: "Clear and articulate. Great for tutorials.",
    previewUrl: "",
    gender: "female",
    style: "professional",
  },
  {
    id: "voice_05",
    name: "Kai",
    description: "Casual and relatable. Gen Z and millennial audiences.",
    previewUrl: "",
    gender: "male",
    style: "casual",
  },
  {
    id: "voice_06",
    name: "Aria",
    description: "Sophisticated and polished. Premium brand feel.",
    previewUrl: "",
    gender: "female",
    style: "warm",
  },
];

export async function getVoices(): Promise<VoiceOption[]> {
  console.log("[MOCK elevenlabs] getVoices");
  await delay();
  return MOCK_VOICES;
}

export async function synthesizeSpeech(params: {
  text: string;
  voiceId: string;
}): Promise<{ audioUrl: string; durationSeconds: number }> {
  console.log("[MOCK elevenlabs] synthesizeSpeech", params.voiceId);
  await delay(800);
  return {
    audioUrl: "https://www.soundhelix.com/examples/mp3/SoundHelix-Song-1.mp3",
    durationSeconds: Math.round(params.text.length / 15), // ~15 chars/second estimate
  };
}

export async function cloneVoice(params: {
  audioUrl: string;
  userId: string;
}): Promise<{ voiceId: string }> {
  // Mirror the real-API consent guard so dev surfaces missing-consent bugs.
  const { hasVoiceConsent } = await import("@/lib/services/db");
  const consentOk = await hasVoiceConsent(params.userId);
  if (!consentOk) {
    throw new Error(
      `cloneVoice refused: no voice consent record for user ${params.userId}.`
    );
  }
  console.log("[MOCK elevenlabs] cloneVoice");
  await delay(1500);
  return { voiceId: `voice_clone_${Date.now()}` };
}
