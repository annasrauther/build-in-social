"use client";

import * as React from "react";
import Link from "next/link";
import { ArrowRight, Sparkles } from "lucide-react";
import { Button } from "@/components/ui/shadcn/button";
import { Input, Textarea } from "@/components/ui/shadcn/input";
import { cn } from "@/lib/utils";

/**
 * MiniPlanner — F1 primary marketing CTA.
 *
 * Instead of "Sign up" the marketing hero offers: two fields (niche +
 * goal) → a 3-day sample plan rendered in place → "Unlock full week"
 * CTA that carries the niche / goal into `/onboarding` as query params.
 *
 * Sample generation is a lightweight local placeholder for now — the
 * real streaming /api/plan/preview wiring lands with `useScroll` +
 * streaming in a follow-up; this commit ships the structural contract.
 */

interface SamplePlanDay {
  day: string;
  platform: "youtube" | "instagram" | "linkedin" | "x";
  hook: string;
}

function buildSample(niche: string, goal: string): readonly SamplePlanDay[] {
  const subject = niche.trim() || "what you ship";
  const objective = goal.trim() || "consistent weekly presence";
  return [
    {
      day: "Mon",
      platform: "youtube",
      hook: `Why ${subject} beats the obvious path — 45s breakdown.`,
    },
    {
      day: "Wed",
      platform: "linkedin",
      hook: `Three things about ${subject} nobody tells you, ranked by ROI.`,
    },
    {
      day: "Fri",
      platform: "x",
      hook: `Shipped something for ${objective}. Here's the 3-line post.`,
    },
  ];
}

export function MiniPlanner({
  className,
  compact,
}: {
  className?: string;
  /** Used inside Hero — tighter spacing and no heading. */
  compact?: boolean;
}) {
  const [niche, setNiche] = React.useState("");
  const [goal, setGoal] = React.useState("");
  const [sample, setSample] = React.useState<
    readonly SamplePlanDay[] | null
  >(null);
  const [generating, setGenerating] = React.useState(false);

  const canPreview = niche.trim().length >= 3;

  const preview = React.useCallback(() => {
    if (!canPreview) return;
    setGenerating(true);
    // Streaming is visually simulated in this pass; the real API call
    // lands with the marketing-streaming follow-up. Honest UX either way.
    setTimeout(() => {
      setSample(buildSample(niche, goal));
      setGenerating(false);
    }, 450);
  }, [canPreview, niche, goal]);

  const signupHref = React.useMemo(() => {
    const params = new URLSearchParams();
    if (niche.trim()) params.set("niche", niche.trim());
    if (goal.trim()) params.set("goal", goal.trim());
    const q = params.toString();
    return q ? `/signup?${q}` : "/signup";
  }, [niche, goal]);

  return (
    <div
      className={cn(
        "flex flex-col gap-3",
        "rounded-[var(--radius-card)]",
        "border border-[color:var(--border)]",
        "bg-surface",
        compact ? "p-3 sm:p-4" : "p-4 sm:p-5",
        className,
      )}
    >
      {!compact ? (
        <div className="flex flex-col gap-1">
          <p className="text-[11px] uppercase tracking-wider text-accent">
            Plan my week
          </p>
          <p className="text-[13px] leading-snug text-text-secondary">
            Two answers. See three days of content before you sign up.
          </p>
        </div>
      ) : null}

      <div className="flex flex-col gap-2">
        <label className="sr-only" htmlFor="mp-niche">
          Your niche
        </label>
        <Input
          id="mp-niche"
          value={niche}
          onChange={(e) => setNiche(e.target.value)}
          placeholder="What do you build, sell, or teach?"
          maxLength={120}
          autoComplete="off"
        />
        <label className="sr-only" htmlFor="mp-goal">
          One goal
        </label>
        <Textarea
          id="mp-goal"
          value={goal}
          onChange={(e) => setGoal(e.target.value)}
          placeholder="Optional: one goal for this quarter."
          maxLength={200}
          rows={2}
        />
      </div>

      <div className="flex items-center gap-2">
        <Button
          variant="primary"
          size="md"
          onClick={preview}
          disabled={!canPreview || generating}
        >
          {generating ? (
            <>
              <Sparkles
                size={14}
                strokeWidth={1.5}
                aria-hidden="true"
                className="animate-pulse"
              />
              Drafting…
            </>
          ) : sample ? (
            <>
              <Sparkles size={14} strokeWidth={1.5} aria-hidden="true" />
              Refresh
            </>
          ) : (
            <>
              <Sparkles size={14} strokeWidth={1.5} aria-hidden="true" />
              Plan week
            </>
          )}
        </Button>
      </div>

      {sample ? (
        <ul
          className={cn(
            "flex flex-col gap-1.5 mt-1",
            "animate-fade-in",
          )}
        >
          {sample.map((s, i) => (
            <li
              key={`${s.day}-${i}`}
              className={cn(
                "flex items-center gap-2 px-2.5 h-9",
                "text-[13px] leading-none",
                "bg-elevated border border-[color:var(--divider)]",
                "rounded-[var(--radius-input)]",
              )}
              style={{ animationDelay: `${i * 40}ms` }}
            >
              <span className="w-9 font-mono text-[11px] uppercase tracking-wider text-text-tertiary tabular-nums">
                {s.day}
              </span>
              <span className="w-16 text-[11px] uppercase tracking-wider text-text-tertiary">
                {s.platform}
              </span>
              <span className="flex-1 min-w-0 truncate text-text">
                {s.hook}
              </span>
            </li>
          ))}
        </ul>
      ) : null}

      {sample ? (
        <div className="flex flex-col gap-1 mt-2">
          <Button asChild variant="primary" size="md">
            <Link href={signupHref}>
              Unlock full week
              <ArrowRight size={14} strokeWidth={1.5} aria-hidden="true" />
            </Link>
          </Button>
          <span className="text-[12px] text-text-secondary">
            Signup picks up exactly where you left off.
          </span>
        </div>
      ) : null}
    </div>
  );
}
