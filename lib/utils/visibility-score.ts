import type { Video } from "@/lib/types/video";

export function computeVisibilityScore(video: Partial<Video>): number | null {
  const { watchTimeAvg, durationSeconds, viewCount, engagementRate, trafficFromPseo } = video;

  if (!watchTimeAvg || !durationSeconds || !viewCount || engagementRate === undefined) {
    return null;
  }

  const watchTimeScore = Math.min(watchTimeAvg / durationSeconds, 1);
  const engagementScore = Math.min(engagementRate, 1);
  const trafficScore = Math.min((trafficFromPseo ?? 0) / 100, 1);

  return Math.round(
    (0.4 * watchTimeScore + 0.4 * engagementScore + 0.2 * trafficScore) * 100
  ) / 100;
}

export function formatVisibilityScore(score: number | null | undefined): string {
  if (score === null || score === undefined) return "—";
  return `${Math.round(score * 100)}`;
}
