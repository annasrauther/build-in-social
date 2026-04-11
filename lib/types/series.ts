import type { Platform, ContentTone, FacelessStyle } from "./user";
import type { ContentType } from "./video";

export type SeriesStatus = "active" | "paused" | "completed";
export type PostingFrequency = "daily" | "3x-week" | "5x-week" | "custom";
export type SeriesVideoStatus = "generating" | "ready" | "scheduled" | "published" | "failed";

export interface SeriesVideo {
  id: string;
  title: string;
  hook: string;
  platform: Platform;
  suggestedLength: number;
  status: SeriesVideoStatus;
  scheduledAt?: string;
  videoId?: string;
}

export interface Series {
  id: string;
  userId: string;
  name: string;
  topic: string;
  contentType: ContentType;
  facelessStyle: FacelessStyle;
  tone?: ContentTone;
  frequency: PostingFrequency;
  platforms: Platform[];
  status: SeriesStatus;
  startDate: string;
  nextVideoAt?: string;
  videos: SeriesVideo[];
  createdAt: string;
}

export interface SeriesPlan {
  title: string;
  hook: string;
  platform: Platform;
  suggestedLength: number;
  angle: string;
}

export interface CreateSeriesInput {
  name: string;
  topic: string;
  contentType: ContentType;
  facelessStyle: FacelessStyle;
  frequency: PostingFrequency;
  platforms: Platform[];
  startDate: string;
}
