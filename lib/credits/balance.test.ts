import { describe, it, expect } from "vitest";
import {
  newBalance,
  remainingCredits,
  canAfford,
  canAffordRender,
  deduct,
  refund,
} from "./balance";
import { getMonthlyAllocation } from "./tiers";
import { getCreditCost } from "./costs";

describe("newBalance", () => {
  it("starts with full monthly allocation and zero consumed", () => {
    const b = newBalance("creator");
    expect(b.tier).toBe("creator");
    expect(b.monthlyAllocation).toBe(getMonthlyAllocation("creator"));
    expect(b.consumed).toBe(0);
    expect(b.topoffs).toBe(0);
  });

  it("preserves provided top-offs", () => {
    const b = newBalance("starter", 45);
    expect(b.topoffs).toBe(45);
  });
});

describe("remainingCredits", () => {
  it("equals full allocation on a fresh balance", () => {
    const b = newBalance("solo");
    expect(remainingCredits(b)).toBe(b.monthlyAllocation);
  });

  it("subtracts consumed from the monthly pool", () => {
    const b = { ...newBalance("solo"), consumed: 10 };
    expect(remainingCredits(b)).toBe(b.monthlyAllocation - 10);
  });

  it("includes top-offs in the remaining total", () => {
    const b = { ...newBalance("starter"), consumed: 30, topoffs: 20 };
    expect(remainingCredits(b)).toBe(20);
  });

  it("never goes negative when consumed somehow exceeds allocation", () => {
    const b = { ...newBalance("starter"), consumed: 9999, topoffs: 0 };
    expect(remainingCredits(b)).toBe(0);
  });
});

describe("canAfford / canAffordRender", () => {
  it("returns true when cost ≤ remaining", () => {
    const b = newBalance("studio");
    expect(canAfford(b, 100)).toBe(true);
  });

  it("returns false when cost > remaining", () => {
    const b = newBalance("starter");
    expect(canAfford(b, b.monthlyAllocation + 1)).toBe(false);
  });

  it("rejects negative cost — defensive against bad input", () => {
    expect(canAfford(newBalance("creator"), -1)).toBe(false);
  });

  it("canAffordRender reads the cost table for the render kind", () => {
    const b = newBalance("starter");
    expect(canAffordRender(b, "faceless")).toBe(true);
    expect(canAffordRender(b, "heygen-licensed")).toBe(
      b.monthlyAllocation >= getCreditCost("heygen-licensed"),
    );
  });
});

describe("deduct", () => {
  it("succeeds and drains from the monthly pool first", () => {
    const b = newBalance("solo", 50);
    const result = deduct(b, 10);
    expect(result.ok).toBe(true);
    expect(result.drawn).toEqual({ fromMonthly: 10, fromTopoffs: 0 });
    expect(result.balance.consumed).toBe(10);
    expect(result.balance.topoffs).toBe(50);
  });

  it("overflows into top-offs once the monthly pool is exhausted", () => {
    const b = { ...newBalance("starter", 20), consumed: 25 }; // 5 left in monthly, 20 in topoffs
    const result = deduct(b, 12); // 5 from monthly, 7 from topoffs
    expect(result.ok).toBe(true);
    expect(result.drawn).toEqual({ fromMonthly: 5, fromTopoffs: 7 });
    expect(result.balance.consumed).toBe(30);
    expect(result.balance.topoffs).toBe(13);
  });

  it("does not mutate the input balance", () => {
    const b = newBalance("creator");
    const before = { ...b };
    deduct(b, 20);
    expect(b).toEqual(before);
  });

  it("fails closed when cost > remaining — balance unchanged, no partial deduct", () => {
    const b = newBalance("starter"); // 30 credits
    const result = deduct(b, 999);
    expect(result.ok).toBe(false);
    expect(result.reason).toBe("insufficient_credits");
    expect(result.balance).toEqual(b);
    expect(result.drawn).toBeUndefined();
  });

  it("rejects negative cost", () => {
    const result = deduct(newBalance("creator"), -5);
    expect(result.ok).toBe(false);
  });

  it("zero-cost deduct is a no-op that succeeds", () => {
    const b = newBalance("solo");
    const result = deduct(b, 0);
    expect(result.ok).toBe(true);
    expect(result.drawn).toEqual({ fromMonthly: 0, fromTopoffs: 0 });
    expect(result.balance.consumed).toBe(0);
  });
});

describe("refund", () => {
  it("is the inverse of deduct when the draw split is known", () => {
    const b = newBalance("solo", 50);
    const deducted = deduct(b, 20);
    expect(deducted.ok).toBe(true);
    if (!deducted.ok || !deducted.drawn) throw new Error("precondition");
    const refunded = refund(deducted.balance, 20, deducted.drawn);
    expect(refunded.consumed).toBe(b.consumed);
    expect(refunded.topoffs).toBe(b.topoffs);
  });

  it("restores top-off credits to the top-off pool specifically", () => {
    const b = { ...newBalance("starter", 10), consumed: 30 };
    const afterDeduct = deduct(b, 5); // all 5 from topoffs
    if (!afterDeduct.ok || !afterDeduct.drawn) throw new Error("precondition");
    const after = refund(afterDeduct.balance, 5, afterDeduct.drawn);
    expect(after.consumed).toBe(30);
    expect(after.topoffs).toBe(10);
  });

  it("defaults the refund to the monthly pool when no split is provided", () => {
    const b = { ...newBalance("solo", 10), consumed: 25 };
    const after = refund(b, 5);
    expect(after.consumed).toBe(20);
    expect(after.topoffs).toBe(10);
  });

  it("never drives consumed below zero", () => {
    const b = { ...newBalance("solo"), consumed: 2 };
    const after = refund(b, 100); // absurd refund
    expect(after.consumed).toBe(0);
  });

  it("no-ops on non-positive cost", () => {
    const b = { ...newBalance("solo"), consumed: 10 };
    expect(refund(b, 0)).toEqual(b);
    expect(refund(b, -5)).toEqual(b);
  });
});
