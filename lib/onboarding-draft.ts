"use client";

/**
 * Onboarding draft persistence — resumable state across the 3 steps.
 *
 * Lives in localStorage so an abandon-and-return lands on the last step
 * touched, with every prior answer still populated. No server state;
 * when the final step commits, everything is persisted via existing API
 * calls and this draft is cleared.
 */

import type { Platform } from "@/lib/types/user";

const KEY = "bis:onboarding:draft:v1";

export interface OnboardingDraft {
  // Step 1 — Context
  niche: string;
  audience: string;
  goal: string;
  platforms: Platform[];
  // Step 2 — Preview (stored as the accepted week summary)
  previewGenerated: boolean;
  // Step 3 — Voice
  voiceId: string | null;
  // Progress
  lastStep: 1 | 2 | 3;
  updatedAt: number;
}

const EMPTY: OnboardingDraft = {
  niche: "",
  audience: "",
  goal: "",
  platforms: ["youtube", "linkedin"],
  previewGenerated: false,
  voiceId: null,
  lastStep: 1,
  updatedAt: 0,
};

function read(): OnboardingDraft {
  if (typeof window === "undefined") return EMPTY;
  try {
    const raw = window.localStorage.getItem(KEY);
    if (!raw) return EMPTY;
    const parsed = JSON.parse(raw) as Partial<OnboardingDraft>;
    return { ...EMPTY, ...parsed };
  } catch {
    return EMPTY;
  }
}

function write(draft: OnboardingDraft): void {
  if (typeof window === "undefined") return;
  try {
    window.localStorage.setItem(
      KEY,
      JSON.stringify({ ...draft, updatedAt: Date.now() }),
    );
  } catch {
    // Private mode / quota — ignore.
  }
}

export function getDraft(): OnboardingDraft {
  return read();
}

export function patchDraft(patch: Partial<OnboardingDraft>): OnboardingDraft {
  const next = { ...read(), ...patch };
  write(next);
  return next;
}

export function clearDraft(): void {
  if (typeof window === "undefined") return;
  try {
    window.localStorage.removeItem(KEY);
  } catch {
    // ignore
  }
}
