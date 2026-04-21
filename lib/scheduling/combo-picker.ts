/**
 * Combo-mode picker — pure.
 *
 * For a series in "combo" mode, the platform decides which render kind each
 * individual video uses (faceless vs avatar) without asking the user. A
 * rule-based heuristic runs here; no Claude API call on every video. The
 * rules encode three signals:
 *
 *   1. Content type — hook-driven "hero" content (founder stories, case
 *      studies, feature launches) converts better with a face. Tip/list
 *      content (tutorials, roadmap teases, list-style domain tips) is
 *      cheaper faceless and doesn't suffer.
 *
 *   2. Platform — LinkedIn rewards visible identity; X rewards text-first.
 *      YouTube Shorts and Instagram Reels tilt neutral.
 *
 *   3. Credit budget — when the remaining budget is low, the picker biases
 *      toward faceless so the series can finish the week. When comfortable,
 *      the content/platform rule wins.
 *
 * This is intentionally deterministic — easy to test, no upstream cost, and
 * users who want full control can override per-video in the editor. A later
 * slice may add a Haiku-backed variant for edge cases.
 */

import type { RenderKind } from "@/lib/credits";
import type {
  HeygenAvatarSource,
  Series,
  SeriesMode,
} from "@/lib/types/series";
import type { Platform } from "@/lib/types/user";
import type { ContentType } from "@/lib/types/video";

/** Content types that benefit most from a visible face. */
const HERO_CONTENT_TYPES: ReadonlySet<ContentType> = new Set<ContentType>([
  "founder-story",
  "feature-drop",
  "domain-case-study",
  "social-proof",
  "domain-opinion",
]);

/** Platform bias: +1 leans avatar, -1 leans faceless, 0 neutral. */
const PLATFORM_BIAS: Readonly<Record<Platform, number>> = Object.freeze({
  linkedin: 1,
  youtube: 0,
  instagram: 0,
  x: -1,
});

/**
 * Map a series mode + optional HeyGen source onto the concrete render kind
 * the credits module bills against. Used outside of combo too — see
 * credit-preview UI and the render endpoints.
 */
export function renderKindForMode(
  mode: SeriesMode,
  heygenAvatarSource?: HeygenAvatarSource,
): RenderKind {
  switch (mode) {
    case "faceless":
      return "faceless";
    case "stock-ai-avatar":
      return "stock-ai-avatar";
    case "heygen-avatar":
      return heygenAvatarSource === "twin" ? "heygen-twin" : "heygen-licensed";
    case "combo":
      // Callers should use pickRenderKindForComboVideo; returning faceless is
      // the safest fallback so a mis-routed combo request never accidentally
      // spends HeyGen credits.
      return "faceless";
  }
}

export interface ComboPickInput {
  series: Series;
  platform: Platform;
  contentType: ContentType;
  /** Remaining credits the user has this month, across all pools. */
  remainingCredits: number;
  /** Cost of a single HeyGen render — credit-module value, injected for testability. */
  heygenRenderCost: number;
}

export interface ComboPickResult {
  kind: RenderKind;
  reason:
    | "non_combo_series"
    | "hero_content_on_avatar_platform"
    | "hero_content"
    | "list_content"
    | "platform_faceless_bias"
    | "insufficient_budget";
}

/**
 * Score-based combo picker. Positive score → avatar; zero/negative → faceless.
 * Thresholds are integer-valued so the decision is stable under reordering.
 */
export function pickRenderKindForComboVideo(
  input: ComboPickInput,
): ComboPickResult {
  const { series, platform, contentType, remainingCredits, heygenRenderCost } =
    input;

  // Only combo series run through this picker. Every other mode is direct.
  if (series.mode !== "combo") {
    return {
      kind: renderKindForMode(series.mode, series.heygenAvatarSource),
      reason: "non_combo_series",
    };
  }

  // Guard 1: if the user can't afford an avatar render, always pick faceless.
  // The scheduler would otherwise happily queue a video it will later fail
  // to bill, which is worse UX than the series just shipping faceless.
  if (remainingCredits < heygenRenderCost) {
    return { kind: "faceless", reason: "insufficient_budget" };
  }

  const contentScore = HERO_CONTENT_TYPES.has(contentType) ? 1 : -1;
  const platformScore = PLATFORM_BIAS[platform];
  const score = contentScore + platformScore;

  if (score > 0) {
    // Pick HeyGen class from series config — caller set source at creation.
    const kind: RenderKind =
      series.heygenAvatarSource === "twin" ? "heygen-twin" : "heygen-licensed";
    const reason: ComboPickResult["reason"] =
      HERO_CONTENT_TYPES.has(contentType) && platformScore > 0
        ? "hero_content_on_avatar_platform"
        : HERO_CONTENT_TYPES.has(contentType)
          ? "hero_content"
          : "hero_content_on_avatar_platform";
    return { kind, reason };
  }

  return {
    kind: "faceless",
    reason: platformScore < 0 ? "platform_faceless_bias" : "list_content",
  };
}
