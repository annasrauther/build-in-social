"use client";

import { useState } from "react";
import Link from "next/link";
import { Card } from "@/components/tremor/Card";
import { Button } from "@/components/tremor/Button";
import { Label } from "@/components/tremor/Label";
import type { Platform } from "@/lib/types/user";

type HookRow = { platform: Platform; hook: string; type: string };

const PLATFORM_LABELS: Record<Platform, string> = {
  youtube: "YouTube Shorts",
  instagram: "Instagram Reels",
  linkedin: "LinkedIn",
  x: "X",
};

export default function HookGeneratorTool() {
  const [topic, setTopic] = useState("");
  const [busy, setBusy] = useState(false);
  const [rows, setRows] = useState<HookRow[] | null>(null);
  const [error, setError] = useState<string | null>(null);

  async function run() {
    if (topic.trim().length < 3 || busy) return;
    setBusy(true);
    setError(null);
    try {
      const res = await fetch("/api/tools/hooks", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ topic: topic.trim() }),
      });
      const json = await res.json();
      if (!res.ok) {
        setError(json.error ?? "Hook generation failed");
        return;
      }
      setRows(json.data.hooks as HookRow[]);
    } catch {
      setError("Hook generation failed");
    } finally {
      setBusy(false);
    }
  }

  function copy(text: string) {
    if (typeof navigator === "undefined" || !navigator.clipboard) return;
    navigator.clipboard.writeText(text).catch(() => undefined);
  }

  return (
    <main className="mx-auto w-full max-w-3xl px-4 sm:px-6 py-12">
      <p className="text-xs text-gray-500">
        <Link href="/tools" className="underline-offset-4 hover:underline">
          &larr; All tools
        </Link>
      </p>
      <h1 className="mt-2 font-serif text-3xl font-medium text-gray-900 dark:text-gray-50">
        Platform-native hook generator
      </h1>
      <p className="mt-2 text-sm text-gray-600 dark:text-gray-400">
        One topic in. Four hooks out &mdash; each tuned to what its platform
        rewards. No signup, no card.
      </p>

      <Card className="mt-6 p-5">
        <Label htmlFor="hook-topic">Your topic</Label>
        <textarea
          id="hook-topic"
          value={topic}
          onChange={(e) => setTopic(e.target.value)}
          placeholder="Shipped a Stripe billing system with idempotent webhooks for my indie SaaS\u2026"
          maxLength={240}
          rows={3}
          className="mt-1 w-full rounded-md border border-gray-200 bg-white px-3 py-2 text-sm text-gray-900 placeholder:text-gray-400 focus:border-brand-500 focus:outline-none focus:ring-2 focus:ring-brand-500/20 dark:border-gray-800 dark:bg-gray-950 dark:text-gray-50"
        />
        <div className="mt-3 flex items-center justify-between">
          <span className="text-xs text-gray-500">
            {topic.length}/240
          </span>
          <Button
            variant="primary"
            onClick={run}
            disabled={topic.trim().length < 3 || busy}
          >
            {busy ? "Generating\u2026" : "Generate 4 hooks"}
          </Button>
        </div>
        {error && (
          <p className="mt-3 text-sm text-red-600 dark:text-red-400">{error}</p>
        )}
      </Card>

      {rows && (
        <ul className="mt-6 space-y-3">
          {rows.map((r) => (
            <li
              key={r.platform}
              className="rounded-md border border-[color:var(--border-default)] bg-[color:var(--bg-surface)] p-4"
            >
              <div className="flex items-center justify-between text-xs">
                <span className="uppercase tracking-wide text-gray-500 dark:text-gray-400">
                  {PLATFORM_LABELS[r.platform]}
                </span>
                <button
                  type="button"
                  onClick={() => copy(r.hook)}
                  className="text-[color:var(--accent)] underline-offset-4 hover:underline"
                >
                  Copy
                </button>
              </div>
              <p className="mt-2 text-sm text-gray-900 dark:text-gray-50">
                {r.hook}
              </p>
              <p className="mt-1 text-xs text-gray-500">
                Style: {r.type.replace(/_/g, " ")}
              </p>
            </li>
          ))}
        </ul>
      )}

      {rows && (
        <div className="mt-8 rounded-lg border border-brand-500/50 bg-brand-50/50 p-5 dark:bg-brand-950/20">
          <h2 className="text-base font-medium text-gray-900 dark:text-gray-50">
            Want these shipped as full videos every week?
          </h2>
          <p className="mt-2 text-sm text-gray-700 dark:text-gray-300">
            Build In Social does exactly this \u2014 but also renders, posts,
            and writes an indexable article per video. On autopilot.
          </p>
          <Link
            href="/onboarding"
            className="mt-3 inline-block text-sm font-medium text-[color:var(--accent)] underline-offset-4 hover:underline"
          >
            Preview your week for free &rarr;
          </Link>
        </div>
      )}
    </main>
  );
}
