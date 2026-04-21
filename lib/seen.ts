"use client";

/**
 * Per-capability first-run tracking via localStorage.
 *
 * A "capability" is anything a user might experience for the first time
 * at any point in their account lifetime — not just onboarding. Example
 * capabilities:
 *
 *   plan.empty-week
 *   plan.theme-input
 *   video.drawer
 *   publish.platform-dots
 *   series.create
 *
 * This lets a 6-month user still see the "first time doing X" hint when
 * they finally encounter X, without treating them as a new user.
 *
 * All state is client-side only — there is no server sync. That's
 * deliberate: we don't want to add a schema for onboarding trivia.
 */

const STORAGE_KEY = "bis:seen:v1";

type SeenMap = Record<string, number>; // capability → unix ms

function read(): SeenMap {
  if (typeof window === "undefined") return {};
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    if (!raw) return {};
    const parsed = JSON.parse(raw) as SeenMap;
    return parsed && typeof parsed === "object" ? parsed : {};
  } catch {
    return {};
  }
}

function write(map: SeenMap): void {
  if (typeof window === "undefined") return;
  try {
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(map));
  } catch {
    // Private mode or quota exhausted — silently ignore.
  }
}

/** True if the user has seen this capability before. */
export function hasSeen(capability: string): boolean {
  return Boolean(read()[capability]);
}

/** Mark a capability as seen. No-op if already marked. */
export function markSeen(capability: string): void {
  const map = read();
  if (map[capability]) return;
  map[capability] = Date.now();
  write(map);
}

/** Reset a single capability's seen state (e.g. for a "show me again" affordance). */
export function resetSeen(capability: string): void {
  const map = read();
  if (!(capability in map)) return;
  delete map[capability];
  write(map);
}

/** Reset every capability. Useful for QA / devtools. */
export function resetAllSeen(): void {
  if (typeof window === "undefined") return;
  try {
    window.localStorage.removeItem(STORAGE_KEY);
  } catch {
    // ignore
  }
}
