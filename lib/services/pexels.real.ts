/**
 * Real Pexels API implementation for B-roll video search.
 * Falls back to mock when PEXELS_API_KEY is not set.
 * Docs: https://www.pexels.com/api/documentation/
 */

import type { PexelsVideo } from "@/lib/mock/pexels.mock";

const BASE_URL = "https://api.pexels.com/videos";

function headers() {
  return { Authorization: process.env.PEXELS_API_KEY ?? "" };
}

type PexelsVideoFile = {
  link: string;
  width: number;
  height: number;
  quality: string;
};

type PexelsVideoItem = {
  id: number;
  url: string;
  duration: number;
  width: number;
  height: number;
  image: string;
  video_files: PexelsVideoFile[];
};

export async function searchVideos(params: {
  query: string;
  perPage?: number;
}): Promise<PexelsVideo[]> {
  const perPage = params.perPage ?? 6;
  const url = new URL(`${BASE_URL}/search`);
  url.searchParams.set("query", params.query);
  url.searchParams.set("per_page", String(perPage));
  url.searchParams.set("orientation", "portrait"); // 9:16 for short-form
  url.searchParams.set("size", "medium");

  const res = await fetch(url.toString(), { headers: headers() });
  if (!res.ok) throw new Error(`Pexels API error ${res.status}`);
  const json = await res.json();
  const videos: PexelsVideoItem[] = json.videos ?? [];

  return videos.map((v) => {
    // Prefer HD portrait file, fall back to first available
    const file =
      v.video_files.find((f) => f.quality === "hd" && f.height > f.width) ??
      v.video_files.find((f) => f.quality === "hd") ??
      v.video_files[0];

    return {
      id: v.id,
      url: file?.link ?? v.url,
      thumbnailUrl: v.image,
      durationSeconds: v.duration,
      width: file?.width ?? v.width,
      height: file?.height ?? v.height,
    };
  });
}
