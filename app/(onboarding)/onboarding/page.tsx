"use client";

import { Suspense, useEffect, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { ArrowRight } from "lucide-react";
import { OnboardingLayout } from "@/components/onboarding/OnboardingLayout";
import { Button } from "@/components/ui/shadcn/button";
import { Input, Textarea } from "@/components/ui/shadcn/input";
import { cn } from "@/lib/utils";
import { getDraft, patchDraft } from "@/lib/onboarding-draft";
import type { Platform } from "@/lib/types/user";

/**
 * Onboarding — Step 1: Context (F2).
 *
 * Three fields: niche, audience, one goal. Pre-filled from F1
 * MiniPlanner query params when present. "Use defaults" on every step.
 * On submit: persist draft + go to /onboarding/plan-preview.
 *
 * This page absorbs /onboarding/start (which redirects here). The old
 * multi-panel pre-signup preview is retired — this is the post-signup
 * activation flow.
 */

const PLATFORMS: readonly Platform[] = [
  "youtube",
  "instagram",
  "linkedin",
  "x",
] as const;

const PLATFORM_LABELS: Record<Platform, string> = {
  youtube: "YouTube Shorts",
  instagram: "Instagram Reels",
  linkedin: "LinkedIn",
  x: "X",
};

export default function OnboardingContextPage() {
  // useSearchParams requires Suspense for static-prerendered routes.
  return (
    <Suspense fallback={<OnboardingLayout step={1}><div className="h-[320px]" aria-hidden="true" /></OnboardingLayout>}>
      <OnboardingContextInner />
    </Suspense>
  );
}

function OnboardingContextInner() {
  const router = useRouter();
  const params = useSearchParams();

  const [niche, setNiche] = useState("");
  const [audience, setAudience] = useState("");
  const [goal, setGoal] = useState("");
  const [platforms, setPlatforms] = useState<Platform[]>([
    "youtube",
    "linkedin",
  ]);
  const [hydrated, setHydrated] = useState(false);

  // Hydrate from draft + pre-fill from F1 MiniPlanner query params.
  useEffect(() => {
    const draft = getDraft();
    const qNiche = params.get("niche") ?? "";
    const qAudience = params.get("audience") ?? "";
    const qGoal = params.get("goal") ?? "";
    setNiche(qNiche || draft.niche);
    setAudience(qAudience || draft.audience);
    setGoal(qGoal || draft.goal);
    if (draft.platforms.length) setPlatforms(draft.platforms);
    setHydrated(true);
  }, [params]);

  const canContinue = niche.trim().length >= 3 && platforms.length > 0;

  function togglePlatform(p: Platform) {
    setPlatforms((prev) =>
      prev.includes(p) ? prev.filter((x) => x !== p) : [...prev, p],
    );
  }

  function continueToPreview() {
    patchDraft({
      niche: niche.trim(),
      audience: audience.trim(),
      goal: goal.trim(),
      platforms,
      lastStep: 2,
    });
    router.push("/onboarding/plan-preview");
  }

  function useDefaults() {
    patchDraft({
      niche: niche.trim() || "Indie SaaS builder",
      audience: audience.trim() || "Technical founders",
      goal: goal.trim() || "Consistent weekly presence",
      platforms: platforms.length ? platforms : ["youtube", "linkedin"],
      lastStep: 2,
    });
    router.push("/onboarding/plan-preview");
  }

  return (
    <OnboardingLayout
      step={1}
      topRight={
        <Button variant="link" size="sm" onClick={useDefaults}>
          Use defaults
        </Button>
      }
    >
      <div className="flex flex-col gap-6">
        <header className="flex flex-col gap-1">
          <h1 className="text-[22px] font-medium tracking-[-0.02em] leading-tight text-text">
            Tell us what you do.
          </h1>
          <p className="text-[14px] leading-snug text-text-secondary">
            Three answers. We&rsquo;ll draft your week from them.
          </p>
        </header>

        {hydrated ? (
          <div className="flex flex-col gap-5">
            <Field
              label="Your niche"
              hint="What you build, sell, or teach."
              htmlFor="niche"
            >
              <Input
                id="niche"
                autoFocus
                value={niche}
                onChange={(e) => setNiche(e.target.value)}
                placeholder="Indie SaaS for dev teams"
                maxLength={120}
              />
            </Field>

            <Field
              label="Who you&rsquo;re reaching"
              hint="One sentence. Optional, but it sharpens the plan."
              htmlFor="audience"
            >
              <Input
                id="audience"
                value={audience}
                onChange={(e) => setAudience(e.target.value)}
                placeholder="Founders shipping their first paid product"
                maxLength={160}
              />
            </Field>

            <Field
              label="One goal this quarter"
              hint="Demo, launch, pipeline, authority — whatever the next thing is."
              htmlFor="goal"
            >
              <Textarea
                id="goal"
                value={goal}
                onChange={(e) => setGoal(e.target.value)}
                placeholder="Ship v1 to 50 paying teams"
                maxLength={240}
                rows={2}
              />
            </Field>

            <Field label="Platforms" hint="Toggle off anything you don&rsquo;t use.">
              <div className="flex flex-wrap gap-1.5">
                {PLATFORMS.map((p) => {
                  const selected = platforms.includes(p);
                  return (
                    <button
                      key={p}
                      type="button"
                      onClick={() => togglePlatform(p)}
                      aria-pressed={selected}
                      className={cn(
                        "inline-flex items-center h-7 px-2.5",
                        "text-[12px] leading-none font-medium",
                        "rounded-[var(--radius-input)]",
                        "border transition-colors duration-fast ease-out-cubic",
                        "focus-visible:outline-2 focus-visible:outline-offset-2",
                        "focus-visible:[outline-color:var(--focus-ring)]",
                        selected
                          ? "bg-accent-subtle border-[color-mix(in_srgb,var(--accent)_30%,transparent)] text-text"
                          : "bg-transparent border-[color:var(--border)] text-text-secondary hover:bg-[color-mix(in_srgb,var(--gray-12)_4%,transparent)]",
                      )}
                    >
                      {PLATFORM_LABELS[p]}
                    </button>
                  );
                })}
              </div>
            </Field>
          </div>
        ) : (
          <div className="h-[320px]" aria-hidden="true" />
        )}

        <div className="flex items-center justify-between pt-2">
          <span className="text-[12px] text-text-tertiary">
            Takes about 15 seconds.
          </span>
          <Button
            variant="primary"
            size="md"
            onClick={continueToPreview}
            disabled={!canContinue}
          >
            Continue
            <ArrowRight size={14} strokeWidth={1.5} aria-hidden="true" />
          </Button>
        </div>
      </div>
    </OnboardingLayout>
  );
}

function Field({
  label,
  hint,
  htmlFor,
  children,
}: {
  label: React.ReactNode;
  hint?: React.ReactNode;
  htmlFor?: string;
  children: React.ReactNode;
}) {
  return (
    <div className="flex flex-col gap-1.5">
      <label
        htmlFor={htmlFor}
        className="text-[12px] font-medium text-text leading-none"
      >
        {label}
      </label>
      {children}
      {hint ? (
        <p className="text-[12px] leading-snug text-text-tertiary">{hint}</p>
      ) : null}
    </div>
  );
}
