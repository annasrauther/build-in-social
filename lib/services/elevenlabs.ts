/**
 * ElevenLabs API service — uses real API when ELEVENLABS_API_KEY is set,
 * falls back to mock for local development without a key.
 */

import * as mock from "@/lib/mock/elevenlabs.mock";
import * as real from "@/lib/services/elevenlabs.real";

const useReal = !!process.env.ELEVENLABS_API_KEY;

export type { VoiceOption } from "@/lib/mock/elevenlabs.mock";
// MOCK_VOICES is used as a static fallback list in UI components
export { MOCK_VOICES } from "@/lib/mock/elevenlabs.mock";

export const getVoices: typeof real.getVoices = useReal
  ? real.getVoices
  : mock.getVoices;

export const synthesizeSpeech: typeof real.synthesizeSpeech = useReal
  ? real.synthesizeSpeech
  : mock.synthesizeSpeech;

export const cloneVoice: typeof real.cloneVoice = useReal
  ? real.cloneVoice
  : mock.cloneVoice;
