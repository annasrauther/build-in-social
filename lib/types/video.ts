import type { Platform, FacelessStyle } from "./user";

export type ContentType =
  | "feature-drop"
  | "founder-story"
  | "tutorial"
  | "roadmap-tease"
  | "problem-solution"
  | "social-proof"
  | "domain-tip"
  | "domain-opinion"
  | "domain-case-study"
  | "domain-myth-bust"
  | "series-episode";

/** How the week's content was sourced */
export type ContentMode = "manual" | "autopilot";

/** What drove content generation this week */
export type ContentSource =
  | "user_input"          // manual mode — user provided quality gate answers
  | "intelligent_suggestion" // autopilot — AI suggested angles from domain + trends
  | "series_autopilot";   // autopilot — running a pre-built content series

export type VideoStatus =
  | "draft"
  | "approved"
  | "rendering"
  | "ready"
  | "posted"
  | "failed";

export type TopicLabel =
  | "feature_drop"
  | "mistake_story"
  | "roadmap_tease"
  | "how_to"
  | "opinion"
  | "social_proof";

export type HookType =
  | "bold_claim"
  | "pain_question"
  | "shock_stat"
  | "unexpected_twist"
  | "results_preview";

export type Sentiment = "confident" | "vulnerable" | "educational" | "entertaining";

export type DayOfWeek = "mon" | "tue" | "wed" | "thu" | "fri" | "sat" | "sun";

export interface ScriptSection {
  hook: string;
  body: string;
  cta: string;
}

export interface ScriptOutput {
  script: ScriptSection;
  estimatedDurationSeconds: number;
  platformNotes: Partial<Record<Platform, string>>;
  pseoKeywords: string[];
  topicLabel: TopicLabel;
  hookType: HookType;
  sentiment: Sentiment;
  estimatedOptimalLength: number;
}

export interface ContentWeek {
  id: string;
  userId: string;
  weekNumber: number;
  year: number;
  startDate: string;
  endDate: string;
  mode: ContentMode;
  contentSource: ContentSource;
  /** Manual mode: user's 3 quality gate answers. Autopilot: undefined. */
  qualityGateAnswers?: [string, string, string];
  specificityScore?: number;
  /** Autopilot: AI-generated content angles used this week */
  autopilotAngles?: string[];
  /** Autopilot series: which series is running, and which episode offset */
  seriesId?: string;
  seriesEpisodeOffset?: number;
  status: "generating" | "ready" | "approved" | "complete";
  videoCount: number;
  createdAt: string;
}

export interface Video {
  id: string;
  userId: string;
  weekId: string;
  /**
   * Series this video belongs to, when it was generated as part of one.
   * Null for ad-hoc / weekly-plan-only videos. Used to resolve the default
   * render mode when the video page loads.
   */
  seriesId?: string;
  title: string;
  scriptJson: ScriptSection;
  platform: Platform;
  dayOfWeek: DayOfWeek;
  facelessStyle: FacelessStyle;
  durationSeconds: number;
  contentType: ContentType;
  status: VideoStatus;
  outputUrl?: string;
  /** WebVTT caption sidecar URL stored in R2 alongside the .mp4 (A7 — WCAG 1.2.2) */
  captionUrl?: string;
  thumbnailUrl?: string;
  renderJobId?: string;

  // Intelligence labels (set silently on render)
  topicLabel?: TopicLabel;
  hookType?: HookType;
  sentiment?: Sentiment;
  specificityScore?: number;

  // Analytics
  watchTimeAvg?: number;
  viewCount?: number;
  engagementRate?: number;
  ctr?: number;
  trafficFromPseo?: number;
  visibilityScore?: number;
  platformVideoId?: string;

  /** Number of AI rewrites applied to this video's script. Capped at 3. */
  revisionCount?: number;

  /** Render mode used for this video. Defaults to "faceless" if not set. */
  renderMode?: "faceless" | "avatar";

  /** X (Twitter) thread split — only present when platform = "x" and thread mode is active. */
  thread?: Array<{ index: number; text: string }>;

  /**
   * Per-platform hook overrides. If set, the renderer uses
   * `platformHooks[platform]` as the stitched opening line instead of the
   * shared `scriptJson.hook`. The platform the video is primarily for still
   * drives formatting; these are secondary hooks used when the same script
   * body is reshared to a different surface. Populated by the Haiku plan
   * generator when the "per-platform hooks" feature is enabled on the series.
   */
  platformHooks?: Partial<Record<Platform, string>>;

  createdAt: string;
  publishedAt?: string;
}

export interface RenderJob {
  id: string;
  userId: string;
  videoId: string;
  status: "queued" | "rendering" | "completed" | "failed";
  outputUrl?: string;
  errorMessage?: string;
  createdAt: string;
  completedAt?: string;
}

export interface HookVariant {
  type: HookType;
  label: string;
  hook: string;
}

/** Lightweight video shape used by the weekly plan UI and WeekContext. */
export interface PlanVideo {
  id: string;
  platform: Platform;
  title: string;
  hook: string;
  script: string;
  durationSeconds: number;
  contentType: string;
  status: VideoStatus;
  dayOfWeek: string;
  outputUrl?: string;
  /** AI confidence in this content piece (1–10). Shown on video cards. */
  confidenceScore?: number;
}
