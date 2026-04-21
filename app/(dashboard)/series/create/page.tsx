"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Card } from "@/components/tremor/Card";
import { Button } from "@/components/tremor/Button";
import { Input } from "@/components/tremor/Input";
import { Label } from "@/components/tremor/Label";
import { APP } from "@/content/app";
import type {
  SeriesMode,
  HeygenAvatarSource,
  PostingFrequency,
} from "@/lib/types/series";
import type { Platform } from "@/lib/types/user";
import type { ContentType } from "@/lib/types/video";
import type { FacelessStyle } from "@/lib/types/user";

const MODES: SeriesMode[] = [
  "faceless",
  "stock-ai-avatar",
  "heygen-avatar",
  "combo",
];

const FREQUENCIES: PostingFrequency[] = ["daily", "3x-week", "5x-week"];

const PLATFORMS: Platform[] = ["youtube", "instagram", "linkedin", "x"];
const PLATFORM_LABELS: Record<Platform, string> = {
  youtube: "YouTube Shorts",
  instagram: "Instagram Reels",
  linkedin: "LinkedIn",
  x: "X",
};

export default function CreateSeriesPage() {
  const router = useRouter();

  const [name, setName] = useState("");
  const [topic, setTopic] = useState("");
  const [mode, setMode] = useState<SeriesMode>("faceless");
  const [heygenSource, setHeygenSource] = useState<HeygenAvatarSource>("licensed");
  const [frequency, setFrequency] = useState<PostingFrequency>("3x-week");
  const [platforms, setPlatforms] = useState<Platform[]>(["youtube", "linkedin"]);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const needsHeygenSource = mode === "heygen-avatar";
  const canSubmit =
    name.trim().length > 0 && topic.trim().length > 0 && platforms.length > 0;

  function togglePlatform(p: Platform) {
    setPlatforms((prev) =>
      prev.includes(p) ? prev.filter((x) => x !== p) : [...prev, p]
    );
  }

  async function submit() {
    if (!canSubmit || submitting) return;
    setSubmitting(true);
    setError(null);
    try {
      // Content-type + faceless-style are not exposed as explicit choices in
      // this first wizard pass — we pick sensible defaults that the plan
      // generator uses. The per-video editor lets users override later.
      const defaultContentType: ContentType = "domain-tip";
      const defaultFacelessStyle: FacelessStyle = "slide";

      const body = {
        name: name.trim(),
        topic: topic.trim(),
        contentType: defaultContentType,
        facelessStyle: defaultFacelessStyle,
        frequency,
        platforms,
        mode,
        ...(needsHeygenSource ? { heygenAvatarSource: heygenSource } : {}),
      };
      const res = await fetch("/api/series", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify(body),
      });
      const json = await res.json();
      if (!res.ok) {
        setError(json.error ?? APP.COMMON.errorSave);
        setSubmitting(false);
        return;
      }
      router.push(`/series/${json.data.id}`);
    } catch {
      setError(APP.COMMON.errorSave);
      setSubmitting(false);
    }
  }

  return (
    <div className="p-4 sm:px-6 sm:pb-10 sm:pt-10 lg:px-10 lg:pt-7 max-w-3xl">
      <header className="mb-6">
        <Link
          href="/series"
          className="text-sm text-gray-500 hover:text-gray-900 dark:text-gray-400 hover:dark:text-gray-100"
        >
          ← Back to series
        </Link>
        <h1 className="mt-2 text-xl font-medium text-gray-900 dark:text-gray-50">
          {APP.SERIES.create.title}
        </h1>
        <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
          {APP.SERIES.create.subtitle}
        </p>
      </header>

      <div className="space-y-4">
        {/* Basics */}
        <Card className="p-5">
          <h2 className="mb-3 text-sm font-medium text-gray-900 dark:text-gray-50">
            {APP.SERIES.create.steps.basics}
          </h2>
          <div className="space-y-3">
            <div>
              <Label htmlFor="series-name">Series name</Label>
              <Input
                id="series-name"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Weekly React tips"
                maxLength={120}
              />
            </div>
            <div>
              <Label htmlFor="series-topic">What&apos;s this series about?</Label>
              <textarea
                id="series-topic"
                value={topic}
                onChange={(e) => setTopic(e.target.value)}
                placeholder="React performance — hooks, memoization, rendering, Suspense…"
                maxLength={500}
                rows={3}
                className="w-full rounded-md border border-gray-200 bg-white px-3 py-2 text-sm text-gray-900 placeholder:text-gray-400 focus:border-brand-500 focus:outline-none focus:ring-2 focus:ring-brand-500/20 dark:border-gray-800 dark:bg-gray-950 dark:text-gray-50"
              />
            </div>
          </div>
        </Card>

        {/* Mode */}
        <Card className="p-5">
          <h2 className="mb-3 text-sm font-medium text-gray-900 dark:text-gray-50">
            {APP.SERIES.create.steps.mode}
          </h2>
          <div className="grid gap-2 sm:grid-cols-2">
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
              <Label>HeyGen avatar source</Label>
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
                      {src === "licensed" ? "Licensed human" : "Your twin"}
                    </div>
                    <div className="mt-1 text-xs text-gray-500 dark:text-gray-400">
                      {src === "licensed"
                        ? "Pick a real face from HeyGen's marketplace."
                        : "Your HeyGen-trained digital double (Creator tier)."}
                    </div>
                  </button>
                ))}
              </div>
            </div>
          )}
        </Card>

        {/* Cadence */}
        <Card className="p-5">
          <h2 className="mb-3 text-sm font-medium text-gray-900 dark:text-gray-50">
            {APP.SERIES.create.steps.cadence}
          </h2>
          <div className="grid gap-2 sm:grid-cols-3">
            {FREQUENCIES.map((f) => {
              const selected = frequency === f;
              return (
                <button
                  key={f}
                  type="button"
                  onClick={() => setFrequency(f)}
                  className={
                    "rounded-md border p-3 text-sm transition " +
                    (selected
                      ? "border-brand-500 bg-brand-50 dark:bg-brand-950/30"
                      : "border-gray-200 hover:border-gray-300 dark:border-gray-800 dark:hover:border-gray-700")
                  }
                  aria-pressed={selected}
                >
                  {APP.SERIES.frequencyLabels[f]}
                </button>
              );
            })}
          </div>
        </Card>

        {/* Platforms */}
        <Card className="p-5">
          <h2 className="mb-3 text-sm font-medium text-gray-900 dark:text-gray-50">
            Platforms
          </h2>
          <div className="grid gap-2 sm:grid-cols-2">
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

        {error && (
          <p className="text-sm text-red-600 dark:text-red-400">{error}</p>
        )}

        <div className="flex items-center gap-3 pt-2">
          <Button
            variant="primary"
            disabled={!canSubmit || submitting}
            onClick={submit}
          >
            {submitting ? "Creating..." : APP.SERIES.create.submit}
          </Button>
          <Link href="/series">
            <Button variant="secondary">{APP.SERIES.create.cancel}</Button>
          </Link>
        </div>
      </div>
    </div>
  );
}
