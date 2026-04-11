/**
 * Mock Pexels API (B-roll search for Faceless Mode)
 * Replace by updating /lib/services/pexels.ts when PEXELS_API_KEY is ready
 */

const delay = (ms = 400) => new Promise((r) => setTimeout(r, ms));

export interface PexelsVideo {
  id: number;
  url: string;
  thumbnailUrl: string;
  durationSeconds: number;
  width: number;
  height: number;
}

const MOCK_VIDEOS: PexelsVideo[] = [
  {
    id: 1,
    url: "https://sample-videos.com/video321/mp4/720/big_buck_bunny_720p_1mb.mp4",
    thumbnailUrl: "https://images.unsplash.com/photo-1518770660439-4636190af475?w=400",
    durationSeconds: 15,
    width: 1280,
    height: 720,
  },
  {
    id: 2,
    url: "https://sample-videos.com/video321/mp4/720/big_buck_bunny_720p_1mb.mp4",
    thumbnailUrl: "https://images.unsplash.com/photo-1488590528505-98d2b5aba04b?w=400",
    durationSeconds: 12,
    width: 1280,
    height: 720,
  },
  {
    id: 3,
    url: "https://sample-videos.com/video321/mp4/720/big_buck_bunny_720p_1mb.mp4",
    thumbnailUrl: "https://images.unsplash.com/photo-1461749280684-dccba630e2f6?w=400",
    durationSeconds: 18,
    width: 1280,
    height: 720,
  },
];

export async function searchVideos(params: {
  query: string;
  perPage?: number;
}): Promise<PexelsVideo[]> {
  console.log("[MOCK pexels] searchVideos", params.query);
  await delay();
  return MOCK_VIDEOS.slice(0, params.perPage ?? 3);
}
