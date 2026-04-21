"use client";

import { useState } from "react";
import Link from "next/link";
import { Card } from "@/components/tremor/Card";
import { Button } from "@/components/tremor/Button";
import { Label } from "@/components/tremor/Label";
import type { Platform } from "@/lib/types/user";

type PreviewRow = {
  platform: Platform;
  title: string;
  hook: string;
  angle: string;
  suggestedLength: number;
};

const PLATFORM_LABELS: Record<Platform, string> = {
  youtube: "YouTube Shorts",
  instagram: "Instagram Reels",
  linkedin: "LinkedIn",
  x: "X",
};

/**
 * Free content-plan preview tool — a single-input shortcut that shows the same
 * week of platform-native content the paid product would generate. Shares the
 * /api/plan/preview endpoint with the full onboarding wizard.
 */
export default function ContentPlanPreviewTool() {
  const [niche, setNiche] = useState("");
  const [busy, setBusy] = useState(false);
  const [rows, setRows] = useState<PreviewRow[] | null>(null);
  const [error, setError] = useState<string | null>(null);

  async function run() {
    if (niche.trim().length < 3 || busy) return;
    setBusy(true);
    setError(null);
    try {
      const res = await fetch("/api/plan/preview", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({
          niche: niche.trim(),
          mode: "faceless",
          platforms: ["youtube", "instagram", "linkedin", "x"],
        }),
      });
      const json = await res.json();
      if (!res.ok) {
        setError(json.error ?? "Preview failed");
        return;
      }
      setRows(json.data.week as PreviewRow[]);
    } catch {
      setError("Preview failed");
    } finally {
      setBusy(false);
    }
  }

  return (
    <main className="mx-auto w-full max-w-3xl px-4 sm:px-6 py-12">
      <p className="text-xs text-gray-500">
        <Link href="/tools" className="underline-offset-4 hover:underline">
          &larr; All tools
        </Link>
      </p>
      <h1 className="mt-2 font-serif text-3xl font-medium text-gray-900 dark:text-gray-50">
        Free content plan preview
      </h1>
      <p className="mt-2 text-sm text-gray-600 dark:text-gray-400">
        Drop your niche. See a week of platform-native titles + hooks for all
        four platforms. The same preview your paid plan would ship. No card,
        no signup.
      </p>

      <Card className="mt-6 p-5">
        <Label htmlFor="plan-niche">What do you build or sell?</Label>
        <input
          id="plan-niche"
          value={niche}
          onChange={(e) => setNiche(e.target.value)}
          placeholder="Indie SaaS for dev teams, React performance tips, SEO courses\u2026"
          maxLength={200}
          className="mt-1 w-full rounded-md border border-gray-200 bg-white px-3 py-2 text-sm text-gray-900 placeholder:text-gray-400 focus:border-brand-500 focus:outline-none focus:ring-2 focus:ring-brand-500/20 dark:border-gray-800 dark:bg-gray-950 dark:text-gray-50"
        />
        <div className="mt-3 flex items-center justify-end">
          <Button
            variant="primary"
            onClick={run}
            disabled={niche.trim().length < 3 || busy}
          >
            {busy ? "Generating preview\u2026" : "Preview my week"}
          </Button>
        </div>
        {error && (
          <p className="mt-3 text-sm text-red-600 dark:text-red-400">{error}</p>
        )}
      </Card>

      {rows && (
        <ul className="mt-6 space-y-3">
          {rows.map((r, i) => (
            <li
              key={`${r.platform}-${i}`}
              className="rounded-md border border-[color:var(--border-default)] bg-[color:var(--bg-surface)] p-4"
            >
              <div className="flex items-center justify-between text-xs">
                <span className="uppercase tracking-wide text-gray-500 dark:text-gray-400">
                  {PLATFORM_LABELS[r.platform]}
                </span>
                <span className="text-gray-400">{r.suggestedLength}s</span>
              </div>
              <h3 className="mt-1 text-sm font-medium text-gray-900 dark:text-gray-50">
                {r.title}
              </h3>
              <p className="mt-1 text-sm text-gray-700 dark:text-gray-300">
                {r.hook}
              </p>
              <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">
                <span className="font-medium">Angle: </span>
                {r.angle}
              </p>
            </li>
          ))}
        </ul>
      )}

      {rows && (
        <div className="mt-8 rounded-lg border border-brand-500/50 bg-brand-50/50 p-5 dark:bg-brand-950/20">
          <h2 className="text-base font-medium text-gray-900 dark:text-gray-50">
            Activate to ship this week
          </h2>
          <p className="mt-2 text-sm text-gray-700 dark:text-gray-300">
            Pick a plan, and Build In Social renders each of these and posts
            them on your schedule.
          </p>
          <Link
            href="/onboarding"
            className="mt-3 inline-block text-sm font-medium text-[color:var(--accent)] underline-offset-4 hover:underline"
          >
            Customize mode + platforms &rarr;
          </Link>
        </div>
      )}
    </main>
  );
}
