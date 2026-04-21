/**
 * Per-render credit cost table.
 *
 * The pricing axis for the product is mode-aware credits, not a flat video
 * cap. HeyGen renders cost ~$6–7 upstream; our faceless + stock-avatar
 * pipeline costs ~$0.50. A flat cap collapses margin on avatar-heavy usage;
 * a credit system scales cost to usage without surprising the user.
 *
 * Ratios chosen so ~70% gross margin holds at list price across the
 * workload mixes shown in the pricing page calculator.
 */

/**
 * What we're billing for. Expanded beyond `Video.renderMode` ("faceless" |
 * "avatar") because stock-AI-avatar shares the faceless cost profile but
 * HeyGen (licensed or twin) does not — the billing layer has to see that.
 */
export type RenderKind =
  | "faceless"
  | "stock-ai-avatar"
  | "heygen-licensed"
  | "heygen-twin";

export const CREDIT_COSTS: Readonly<Record<RenderKind, number>> = Object.freeze({
  faceless: 1,
  "stock-ai-avatar": 1,
  "heygen-licensed": 15,
  "heygen-twin": 15,
});

/** Credit cost for a single render of the given kind. */
export function getCreditCost(kind: RenderKind): number {
  return CREDIT_COSTS[kind];
}

/** True if a render kind uses HeyGen (any class) upstream. */
export function isHeygenKind(kind: RenderKind): boolean {
  return kind === "heygen-licensed" || kind === "heygen-twin";
}
