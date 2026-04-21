import type { Platform, ContentTone, FacelessStyle } from "./user";
import type { ContentType } from "./video";

export type SeriesStatus = "active" | "paused" | "completed";
export type PostingFrequency = "daily" | "3x-week" | "5x-week" | "custom";
export type SeriesVideoStatus = "generating" | "ready" | "scheduled" | "published" | "failed";

/**
 * Rendering mode picked at series creation. "combo" lets the AI pick faceless
 * vs avatar per-video in the combo picker, biased by cost budget.
 */
export type SeriesMode =
  | "faceless"
  | "stock-ai-avatar"
  | "heygen-avatar"
  | "combo";

/**
 * Which HeyGen avatar class this series uses. Only meaningful when
 * `mode === "heygen-avatar"` or `mode === "combo"` with HeyGen enabled.
 * - "licensed": HeyGen marketplace avatar (real humans licensed via HeyGen).
 * - "twin":     user's own trained digital twin (Creator+).
 */
export type HeygenAvatarSource = "licensed" | "twin";

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
  /** Rendering mode decided at series creation. Defaults to "faceless". */
  mode: SeriesMode;
  /**
   * When `mode === "heygen-avatar"` (or a combo series using HeyGen), which
   * avatar class to use. Required when HeyGen is involved.
   */
  heygenAvatarSource?: HeygenAvatarSource;
  /** Stock avatar id used when mode is "stock-ai-avatar" or combo-picks stock. */
  stockAvatarId?: string;
  /** HeyGen avatar id used when heygenAvatarSource === "licensed". */
  heygenLicensedAvatarId?: string;
  /** ElevenLabs voice id driving narration for this series. */
  voiceId?: string;
  status: SeriesStatus;
  startDate: string;
  nextVideoAt?: string;
  videos: SeriesVideo[];
  /** Total credits consumed by this series across its lifetime. */
  creditsConsumed?: number;
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
  mode: SeriesMode;
  heygenAvatarSource?: HeygenAvatarSource;
  stockAvatarId?: string;
  heygenLicensedAvatarId?: string;
  voiceId?: string;
}
