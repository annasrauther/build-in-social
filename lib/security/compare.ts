import { timingSafeEqual } from "node:crypto";

/**
 * Constant-time string comparison for secrets/tokens.
 * Length is compared first (length is not secret); timingSafeEqual used on bodies.
 */
export function timingSafeStringEquals(a: string, b: string): boolean {
  if (typeof a !== "string" || typeof b !== "string") return false;
  if (a.length !== b.length) return false;
  const ab = Buffer.from(a, "utf8");
  const bb = Buffer.from(b, "utf8");
  if (ab.length !== bb.length) return false;
  return timingSafeEqual(ab, bb);
}
