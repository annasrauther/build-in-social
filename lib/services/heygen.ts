/**
 * HeyGen API service — uses real API when HEYGEN_API_KEY is set,
 * falls back to mock for local development without a key.
 */

import * as mock from "@/lib/mock/heygen.mock";
import * as real from "@/lib/services/heygen.real";

const useReal = !!process.env.HEYGEN_API_KEY;

export type {
  HeyGenAvatar,
  HeyGenVoice,
  HeyGenVideoStatus,
  HeyGenCustomAvatar,
} from "@/lib/mock/heygen.mock";
export { MOCK_AVATARS, MOCK_HEYGEN_VOICES } from "@/lib/mock/heygen.mock";

export const listAvatars: typeof real.listAvatars = useReal ? real.listAvatars : mock.listAvatars;
export const listLicensedAvatars: typeof real.listLicensedAvatars = useReal
  ? real.listLicensedAvatars
  : mock.listLicensedAvatars;
export const listVoices: typeof real.listVoices = useReal ? real.listVoices : mock.listVoices;
export const generateVideo: typeof real.generateVideo = useReal ? real.generateVideo : mock.generateVideo;
export const getVideoStatus: typeof real.getVideoStatus = useReal ? real.getVideoStatus : mock.getVideoStatus;
export const createAvatarFromVideo: typeof real.createAvatarFromVideo =
  useReal ? real.createAvatarFromVideo : mock.createAvatarFromVideo;
export const getCustomAvatarStatus: typeof real.getCustomAvatarStatus =
  useReal ? real.getCustomAvatarStatus : mock.getCustomAvatarStatus;
