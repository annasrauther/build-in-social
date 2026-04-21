"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { Card } from "@/components/tremor/Card";
import { Button } from "@/components/tremor/Button";
import { Label } from "@/components/tremor/Label";
import { splitScriptIntoThread } from "@/lib/services/thread";

/**
 * X thread splitter — fully client-side. Uses the existing splitScriptIntoThread
 * utility so the output matches what the paid renderer would produce for an
 * X-platform video. Zero API cost.
 */
export default function ThreadSplitterTool() {
  const [script, setScript] = useState("");
  const [generated, setGenerated] = useState(false);

  const thread = useMemo(
    () => (generated ? splitScriptIntoThread(script.trim()) : []),
    [generated, script],
  );

  function copyAll() {
    if (typeof navigator === "undefined" || !navigator.clipboard) return;
    const text = thread.map((t) => `${t.index + 1}/ ${t.text}`).join("\n\n");
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
        X thread splitter
      </h1>
      <p className="mt-2 text-sm text-gray-600 dark:text-gray-400">
        Paste a long script. Get a numbered X thread under the 280-char limit,
        with the hook first and CTA last. Runs entirely in your browser \u2014
        zero API calls, no signup.
      </p>

      <Card className="mt-6 p-5">
        <Label htmlFor="thread-script">Your script</Label>
        <textarea
          id="thread-script"
          value={script}
          onChange={(e) => setScript(e.target.value)}
          placeholder="I tested this for 30 days. Here's the exact number\u2026"
          rows={10}
          maxLength={4000}
          className="mt-1 w-full rounded-md border border-gray-200 bg-white px-3 py-2 text-sm text-gray-900 placeholder:text-gray-400 focus:border-brand-500 focus:outline-none focus:ring-2 focus:ring-brand-500/20 dark:border-gray-800 dark:bg-gray-950 dark:text-gray-50"
        />
        <div className="mt-3 flex items-center justify-between">
          <span className="text-xs text-gray-500">{script.length}/4000</span>
          <Button
            variant="primary"
            onClick={() => setGenerated(true)}
            disabled={script.trim().length < 20}
          >
            Split into thread
          </Button>
        </div>
      </Card>

      {generated && thread.length > 0 && (
        <>
          <div className="mt-6 flex items-center justify-between">
            <p className="text-sm font-medium text-gray-900 dark:text-gray-50">
              {thread.length}-tweet thread
            </p>
            <button
              type="button"
              onClick={copyAll}
              className="text-sm text-[color:var(--accent)] underline-offset-4 hover:underline"
            >
              Copy all tweets
            </button>
          </div>
          <ol className="mt-3 space-y-2">
            {thread.map((t) => (
              <li
                key={t.index}
                className="rounded-md border border-[color:var(--border-default)] bg-[color:var(--bg-surface)] p-3"
              >
                <p className="text-xs text-gray-500">
                  {t.index + 1}/{thread.length} \u2014 {t.text.length}/280
                </p>
                <p className="mt-1 text-sm text-gray-900 dark:text-gray-50">
                  {t.text}
                </p>
              </li>
            ))}
          </ol>
        </>
      )}

      {generated && thread.length > 0 && (
        <div className="mt-8 rounded-lg border border-brand-500/50 bg-brand-50/50 p-5 dark:bg-brand-950/20">
          <h2 className="text-base font-medium text-gray-900 dark:text-gray-50">
            Auto-post threads like these every week?
          </h2>
          <p className="mt-2 text-sm text-gray-700 dark:text-gray-300">
            Build In Social writes and posts X threads alongside YouTube
            Shorts, Reels, and LinkedIn videos \u2014 on autopilot.
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
