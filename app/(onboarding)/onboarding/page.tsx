"use client";

import { useState } from "react";
import Link from "next/link";
import { Card } from "@/components/tremor/Card";
import { Button } from "@/components/tremor/Button";
import { Input } from "@/components/tremor/Input";
import { Label } from "@/components/tremor/Label";
import { APP } from "@/content/app";
import type { Platform } from "@/lib/types/user";
import type {
  HeygenAvatarSource,
  SeriesMode,
} from "@/lib/types/series";

/**
 * Single-page onboarding wizard — progressive disclosure inside one scroll.
 *
 * Flow:
 *   1. Niche / what you build or sell
 *   2. Rendering mode (faceless / stock-ai / heygen / combo)
 *   3. Avatar source (only when mode uses HeyGen)
 *   4. Platforms
 *   5. "Generate my week preview" → POST /api/plan/preview (free, no render)
 *   6. Show the preview week inline with an "Activate this series" CTA that
 *      routes to /signup (or /settings/billing if already signed in).
 *
 * We don't require signup to see the preview — that's the whole point of the
 * "preview-free, pay-to-ship" flow. Activation is the conversion event.
 */

const MODES: SeriesMode[] = [
  "faceless",
  "stock-ai-avatar",
  "heygen-avatar",
  "combo",
];

const PLATFORMS: Platform[] = ["youtube", "instagram", "linkedin", "x"];
const PLATFORM_LABELS: Record<Platform, string> = {
  youtube: "YouTube Shorts",
  instagram: "Instagram Reels",
  linkedin: "LinkedIn",
  x: "X",
};

type PreviewWeek = {
  platform: Platform;
  title: string;
  hook: string;
  angle: string;
  suggestedLength: number;
};

export default function OnboardingPage() {
  const [niche, setNiche] = useState("");
  const [mode, setMode] = useState<SeriesMode>("faceless");
  const [heygenSource, setHeygenSource] = useState<HeygenAvatarSource>("licensed");
  const [platforms, setPlatforms] = useState<Platform[]>(["youtube", "linkedin"]);
  const [previewing, setPreviewing] = useState(false);
  const [preview, setPreview] = useState<PreviewWeek[] | null>(null);
  const [error, setError] = useState<string | null>(null);

  const needsHeygenSource = mode === "heygen-avatar";
  const canSubmit =
    niche.trim().length >= 3 && platforms.length > 0 && !previewing;

  function togglePlatform(p: Platform) {
    setPlatforms((prev) =>
      prev.includes(p) ? prev.filter((x) => x !== p) : [...prev, p],
    );
  }

  async function generatePreview() {
    if (!canSubmit) return;
    setPreviewing(true);
    setError(null);
    try {
      const res = await fetch("/api/plan/preview", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ niche: niche.trim(), mode, platforms }),
      });
      const json = await res.json();
      if (!res.ok) {
        setError(json.error ?? APP.COMMON.errorGeneric);
        return;
      }
      setPreview(json.data.week as PreviewWeek[]);
    } catch {
      setError(APP.COMMON.errorGeneric);
    } finally {
      setPreviewing(false);
    }
  }

  return (
    <div className="mx-auto w-full max-w-3xl px-4 sm:px-6 py-10 space-y-6">
      <header>
        <p className="text-xs uppercase tracking-wider text-[color:var(--accent)]">
          Build In Social
        </p>
        <h1 className="mt-2 text-2xl sm:text-3xl font-serif font-medium text-gray-900 dark:text-gray-50">
          See a free week of content before you pay.
        </h1>
        <p className="mt-2 text-sm text-gray-600 dark:text-gray-400">
          Tell us what you build or sell. We&apos;ll generate a week of
          platform-native titles and hooks. No render, no credit card.
        </p>
      </header>

      {/* Niche */}
      <Card className="p-5">
        <Label htmlFor="onb-niche">What do you build or sell?</Label>
        <Input
          id="onb-niche"
          value={niche}
          onChange={(e) => setNiche(e.target.value)}
          placeholder="Indie SaaS for dev teams, React perf tips, SEO courses\u2026"
          maxLength={200}
        />
      </Card>

      {/* Mode */}
      <Card className="p-5">
        <h2 className="text-sm font-medium text-gray-900 dark:text-gray-50">
          How should your videos look?
        </h2>
        <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">
          Pick once. Change any time. Combo lets Build In Social decide per
          video.
        </p>
        <div className="mt-3 grid gap-2 sm:grid-cols-2">
          {MODES.map((m) => {
            const selected = mode === m;
            const copy = APP.SERIES.create.modeOptions[m];
            return (
              <button
                key={m}
                type="button"
                onClick={() => setMode(m)}
                className={
                  "rounded-md border p-3 text-left text-sm transition " +
                  (selected
                    ? "border-brand-500 bg-brand-50 dark:bg-brand-950/30"
                    : "border-gray-200 hover:border-gray-300 dark:border-gray-800 dark:hover:border-gray-700")
                }
                aria-pressed={selected}
              >
                <div className="font-medium text-gray-900 dark:text-gray-50">
                  {copy.label}
                </div>
                <div className="mt-1 text-xs text-gray-500 dark:text-gray-400">
                  {copy.helper}
                </div>
              </button>
            );
          })}
        </div>

        {needsHeygenSource && (
          <div className="mt-4">
            <Label>Pick the face</Label>
            <div className="mt-2 grid gap-2 sm:grid-cols-2">
              {(["licensed", "twin"] as HeygenAvatarSource[]).map((src) => (
                <button
                  key={src}
                  type="button"
                  onClick={() => setHeygenSource(src)}
                  className={
                    "rounded-md border p-3 text-left text-sm transition " +
                    (heygenSource === src
                      ? "border-brand-500 bg-brand-50 dark:bg-brand-950/30"
                      : "border-gray-200 hover:border-gray-300 dark:border-gray-800 dark:hover:border-gray-700")
                  }
                  aria-pressed={heygenSource === src}
                >
                  <div className="font-medium capitalize text-gray-900 dark:text-gray-50">
                    {src === "licensed"
                      ? "A licensed HeyGen face"
                      : "Your own face (train a twin)"}
                  </div>
                  <div className="mt-1 text-xs text-gray-500 dark:text-gray-400">
                    {src === "licensed"
                      ? "Pick a real licensed human from HeyGen\u2019s marketplace."
                      : "Record a 60-second clip later; HeyGen trains a digital twin. Creator tier and up."}
                  </div>
                </button>
              ))}
            </div>
          </div>
        )}
      </Card>

      {/* Platforms */}
      <Card className="p-5">
        <h2 className="text-sm font-medium text-gray-900 dark:text-gray-50">
          Where should your videos go?
        </h2>
        <div className="mt-3 grid gap-2 sm:grid-cols-2">
          {PLATFORMS.map((p) => {
            const selected = platforms.includes(p);
            return (
              <button
                key={p}
                type="button"
                onClick={() => togglePlatform(p)}
                className={
                  "flex items-center justify-between rounded-md border p-3 text-sm transition " +
                  (selected
                    ? "border-brand-500 bg-brand-50 dark:bg-brand-950/30"
                    : "border-gray-200 hover:border-gray-300 dark:border-gray-800 dark:hover:border-gray-700")
                }
                aria-pressed={selected}
              >
                <span>{PLATFORM_LABELS[p]}</span>
                <span className="text-xs text-gray-500">
                  {selected ? "on" : "off"}
                </span>
              </button>
            );
          })}
        </div>
      </Card>

      {/* Preview action */}
      <div className="flex flex-col gap-3">
        <Button
          variant="primary"
          onClick={generatePreview}
          disabled={!canSubmit}
          className="self-start"
        >
          {previewing ? "Generating your preview\u2026" : "Preview my week"}
        </Button>
        {error && (
          <p className="text-sm text-red-600 dark:text-red-400">{error}</p>
        )}
      </div>

      {/* Preview results */}
      {preview && (
        <section
          aria-label="Preview week"
          className="mt-6 rounded-lg border border-brand-500/50 bg-brand-50/50 p-5 dark:bg-brand-950/20"
        >
          <p className="text-xs uppercase tracking-wider text-[color:var(--accent)]">
            Free preview
          </p>
          <h2 className="mt-2 text-lg font-medium text-gray-900 dark:text-gray-50">
            Your first week of {niche.trim()} content
          </h2>
          <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">
            {preview.length} platform-native video idea
            {preview.length !== 1 ? "s" : ""}. Activate a plan to render and
            post them on your schedule.
          </p>

          <ul className="mt-4 space-y-3">
            {preview.map((v, i) => (
              <li
                key={`${v.platform}-${i}`}
                className="rounded-md bg-white p-4 shadow-sm dark:bg-gray-900"
              >
                <div className="flex items-center justify-between text-xs">
                  <span className="uppercase tracking-wide text-gray-500 dark:text-gray-400">
                    {PLATFORM_LABELS[v.platform]}
                  </span>
                  <span className="text-gray-400">{v.suggestedLength}s</span>
                </div>
                <h3 className="mt-1 text-sm font-medium text-gray-900 dark:text-gray-50">
                  {v.title}
                </h3>
                <p className="mt-1 text-sm text-gray-700 dark:text-gray-300">
                  {v.hook}
                </p>
                <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">
                  <span className="font-medium">Angle: </span>
                  {v.angle}
                </p>
              </li>
            ))}
          </ul>

          <div className="mt-5 flex flex-wrap items-center gap-3">
            <Link href="/signup">
              <Button variant="primary">Activate a plan to ship this week</Button>
            </Link>
            <Link
              href="/pricing"
              className="text-sm text-gray-600 underline-offset-4 hover:underline dark:text-gray-400"
            >
              See pricing
            </Link>
          </div>
        </section>
      )}
    </div>
  );
}
