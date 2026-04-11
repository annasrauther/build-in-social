/**
 * Pexels API service — uses real Pexels API when PEXELS_API_KEY is set,
 * falls back to mock for local development without a key.
 */

import * as mock from "@/lib/mock/pexels.mock";
import * as real from "@/lib/services/pexels.real";

const useReal = !!process.env.PEXELS_API_KEY;

export type { PexelsVideo } from "@/lib/mock/pexels.mock";

export const searchVideos: typeof real.searchVideos = useReal
  ? real.searchVideos
  : mock.searchVideos;
