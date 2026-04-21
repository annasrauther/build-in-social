import { describe, it, expect } from "vitest";
import { CREDIT_COSTS, getCreditCost, isHeygenKind, type RenderKind } from "./costs";

const ALL_KINDS: RenderKind[] = [
  "faceless",
  "stock-ai-avatar",
  "heygen-licensed",
  "heygen-twin",
];

describe("CREDIT_COSTS", () => {
  it("defines a positive cost for every render kind", () => {
    for (const kind of ALL_KINDS) {
      expect(CREDIT_COSTS[kind]).toBeGreaterThan(0);
    }
  });

  it("prices faceless and stock-ai-avatar at the same low tier (shared pipeline)", () => {
    expect(CREDIT_COSTS.faceless).toBe(CREDIT_COSTS["stock-ai-avatar"]);
  });

  it("prices both HeyGen classes the same (shared upstream cost)", () => {
    expect(CREDIT_COSTS["heygen-licensed"]).toBe(CREDIT_COSTS["heygen-twin"]);
  });

  it("prices HeyGen renders materially higher than faceless — encodes the real cost gap", () => {
    // Margin guardrail: if someone accidentally flattens this, the test fails loud.
    expect(CREDIT_COSTS["heygen-licensed"]).toBeGreaterThanOrEqual(
      10 * CREDIT_COSTS.faceless,
    );
  });

  it("is frozen — cost table cannot be mutated at runtime", () => {
    expect(() => {
      (CREDIT_COSTS as Record<string, number>).faceless = 99;
    }).toThrow();
  });
});

describe("getCreditCost", () => {
  it("matches CREDIT_COSTS entries", () => {
    for (const kind of ALL_KINDS) {
      expect(getCreditCost(kind)).toBe(CREDIT_COSTS[kind]);
    }
  });
});

describe("isHeygenKind", () => {
  it("returns true for both HeyGen classes", () => {
    expect(isHeygenKind("heygen-licensed")).toBe(true);
    expect(isHeygenKind("heygen-twin")).toBe(true);
  });

  it("returns false for faceless and stock-ai-avatar", () => {
    expect(isHeygenKind("faceless")).toBe(false);
    expect(isHeygenKind("stock-ai-avatar")).toBe(false);
  });
});
