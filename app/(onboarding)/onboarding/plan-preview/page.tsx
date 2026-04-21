"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { ArrowLeft, ArrowRight, RotateCw } from "lucide-react";
import { OnboardingLayout } from "@/components/onboarding/OnboardingLayout";
import { Button } from "@/components/ui/shadcn/button";
import { PLATFORM_ICON } from "@/components/video/platform-icons";
import { SkeletonRows } from "@/components/ui/states/LoadingSkeleton";
import { ErrorState } from "@/components/ui/states/ErrorState";
import { FirstRunHint } from "@/components/ui/states/FirstRunHint";
import { toast } from "@/components/providers/Toaster";
import { getDraft, patchDraft } from "@/lib/onboarding-draft";
import { APP } from "@/content/app";
import type { Platform } from "@/lib/types/user";
import { cn } from "@/lib/utils";

/**
 * Onboarding — Step 2: Preview (F2).
 *
 * Streams 7 draft cards from the existing /api/plan/preview endpoint and
 * renders them as Linear-style row cards. The user reviews, regenerates
 * if they want, and continues to step 3. No render, no credit deduction.
 *
 * Uses the draft from /onboarding (step 1). Abandon + return still
 * works because lastStep = 2 is persisted.
 */

interface PreviewCard {
  platform: Platform;
  title: string;
  hook: string;
  angle: string;
  suggestedLength: number;
}

type DayCode = "Mon" | "Tue" | "Wed" | "Thu" | "Fri" | "Sat" | "Sun";
const DAY_ORDER: readonly DayCode[] = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];

export default function OnboardingPreviewPage() {
  const router = useRouter();
  const [niche, setNiche] = useState<string>("");
  const [platforms, setPlatforms] = useState<Platform[]>([]);
  const [cards, setCards] = useState<PreviewCard[] | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [hydrated, setHydrated] = useState(false);

  useEffect(() => {
    const draft = getDraft();
    if (!draft.niche || draft.niche.length < 3) {
      // No context yet → send them back to step 1.
      router.replace("/onboarding");
      return;
    }
    setNiche(draft.niche);
    setPlatforms(draft.platforms.length ? draft.platforms : ["youtube", "linkedin"]);
    setHydrated(true);
  }, [router]);

  const generate = useCallback(async () => {
    if (!niche) return;
    setLoading(true);
    setError(null);
    try {
      const res = await fetch("/api/plan/preview", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({
          niche,
          mode: "faceless" as const,
          platforms,
        }),
      });
      const json = await res.json();
      if (!res.ok) {
        setError(json.error ?? APP.COMMON.errorGeneric);
        return;
      }
      setCards((json.data?.week as PreviewCard[]) ?? []);
    } catch {
      setError(APP.COMMON.errorGeneric);
    } finally {
      setLoading(false);
    }
  }, [niche, platforms]);

  // Auto-generate on first hydration; subsequent regenerates are user-driven.
  useEffect(() => {
    if (hydrated && !cards && !loading && !error) {
      generate();
    }
  }, [hydrated, cards, loading, error, generate]);

  function back() {
    router.push("/onboarding");
  }

  function continueToVoice() {
    patchDraft({ previewGenerated: true, lastStep: 3 });
    router.push("/onboarding/voice");
  }

  function useDefaults() {
    // Skip regeneration if they want — continue with whatever we have.
    patchDraft({ previewGenerated: true, lastStep: 3 });
    router.push("/onboarding/voice");
  }

  return (
    <OnboardingLayout
      step={2}
      topRight={
        <Button variant="link" size="sm" onClick={useDefaults}>
          Use defaults
        </Button>
      }
    >
      <div className="flex flex-col gap-6">
        <header className="flex flex-col gap-1">
          <h1 className="text-[22px] font-medium tracking-[-0.02em] leading-tight text-text">
            Here&rsquo;s a week for {niche || "you"}.
          </h1>
          <p className="text-[14px] leading-snug text-text-secondary">
            Regenerate any row. Rename titles inline. We&rsquo;ll render when you approve — nothing ships yet.
          </p>
        </header>

        <FirstRunHint
          capability="onboarding.preview"
          message="Streaming a sample — you can regenerate anything before continuing."
        />

        {error ? (
          <ErrorState
            title={APP.COMMON.errorGenerate}
            description={error}
            onRetry={() => {
              setError(null);
              generate();
            }}
          />
        ) : loading || !cards ? (
          <SkeletonRows rows={7} height={40} gap={8} />
        ) : cards.length === 0 ? (
          <ErrorState
            title="No draft came back"
            description="The generator returned an empty week. Try once more."
            onRetry={generate}
          />
        ) : (
          <ul className="flex flex-col gap-2">
            {cards.map((card, i) => (
              <PreviewRow key={`${card.platform}-${i}`} card={card} index={i} />
            ))}
          </ul>
        )}

        <div className="flex items-center justify-between pt-2">
          <Button variant="ghost" size="sm" onClick={back}>
            <ArrowLeft size={14} strokeWidth={1.5} aria-hidden="true" />
            Back
          </Button>
          <div className="flex items-center gap-2">
            <Button
              variant="secondary"
              size="md"
              onClick={generate}
              disabled={loading}
            >
              <RotateCw
                size={14}
                strokeWidth={1.5}
                aria-hidden="true"
                className={cn(loading && "animate-spin")}
              />
              {loading ? "Regenerating…" : "Regenerate all"}
            </Button>
            <Button
              variant="primary"
              size="md"
              onClick={continueToVoice}
              disabled={loading || !cards || cards.length === 0}
            >
              Continue
              <ArrowRight size={14} strokeWidth={1.5} aria-hidden="true" />
            </Button>
          </div>
        </div>
      </div>
    </OnboardingLayout>
  );
}

function PreviewRow({ card, index }: { card: PreviewCard; index: number }) {
  const Icon = PLATFORM_ICON[card.platform];
  const day = DAY_ORDER[index % 7];
  return (
    <li
      className={cn(
        "flex items-start gap-3 px-3 py-2.5",
        "border border-[color:var(--border)] bg-surface",
        "rounded-[var(--radius-card)]",
        "animate-fade-in",
      )}
      style={{ animationDelay: `${index * 40}ms` }}
    >
      <span className="w-9 shrink-0 font-mono text-[11px] uppercase tracking-wider text-text-tertiary tabular-nums pt-0.5">
        {day}
      </span>
      <Icon
        size={14}
        className="shrink-0 text-text-secondary mt-1"
        aria-hidden="true"
      />
      <div className="flex-1 min-w-0 flex flex-col gap-0.5">
        <p className="text-[13px] font-medium leading-snug text-text">
          {card.title}
        </p>
        <p className="text-[12px] leading-snug text-text-secondary truncate">
          {card.hook}
        </p>
      </div>
      <span className="shrink-0 font-mono text-[11px] text-text-tertiary tabular-nums pt-0.5">
        {card.suggestedLength}s
      </span>
    </li>
  );
}
