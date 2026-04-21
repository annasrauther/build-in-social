"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { ArrowLeft, ArrowRight, Check, Pause, Play } from "lucide-react";
import { OnboardingLayout } from "@/components/onboarding/OnboardingLayout";
import { Button } from "@/components/ui/shadcn/button";
import { FirstRunHint } from "@/components/ui/states/FirstRunHint";
import { toast } from "@/components/providers/Toaster";
import { LIBRARY_VOICES } from "@/lib/constants/onboarding";
import { getDraft, patchDraft, clearDraft } from "@/lib/onboarding-draft";
import { cn } from "@/lib/utils";

/**
 * Onboarding — Step 3: Voice (F2 final step).
 *
 * 6-tile grid of library voices. Hover previews, click to select,
 * continue to /plan/current?firstRun=1.
 *
 * Preview uses ElevenLabs mock via /api/voice/preview when available;
 * falls back to a silent toast if the endpoint 5xxs.
 */

const CONSENT_KEY = "bis:voice-consent:v1";

export default function OnboardingVoicePage() {
  const router = useRouter();
  const [selected, setSelected] = useState<string | null>(null);
  const [playingId, setPlayingId] = useState<string | null>(null);
  const [consented, setConsented] = useState(false);
  const [hydrated, setHydrated] = useState(false);
  const audioRef = useRef<HTMLAudioElement | null>(null);

  useEffect(() => {
    const draft = getDraft();
    setSelected(draft.voiceId ?? "alex");
    try {
      setConsented(window.localStorage.getItem(CONSENT_KEY) === "1");
    } catch {
      /* ignore */
    }
    setHydrated(true);
  }, []);

  const stopAudio = useCallback(() => {
    audioRef.current?.pause();
    audioRef.current = null;
    setPlayingId(null);
  }, []);

  const playPreview = useCallback(
    async (voiceId: string) => {
      if (playingId === voiceId) {
        stopAudio();
        return;
      }
      stopAudio();
      try {
        const res = await fetch("/api/voice/preview", {
          method: "POST",
          headers: { "content-type": "application/json" },
          body: JSON.stringify({ voiceId }),
        });
        if (!res.ok) {
          toast.error("We couldn't load that preview. Try another voice.");
          return;
        }
        const { audioUrl } = (await res.json()) as { audioUrl?: string };
        if (!audioUrl) {
          toast.error("No preview available for that voice yet.");
          return;
        }
        const audio = new Audio(audioUrl);
        audioRef.current = audio;
        setPlayingId(voiceId);
        audio.addEventListener("ended", () => setPlayingId(null));
        await audio.play();
      } catch {
        toast.error("Preview couldn't play.");
        setPlayingId(null);
      }
    },
    [playingId, stopAudio],
  );

  // Stop audio on unmount.
  useEffect(() => stopAudio, [stopAudio]);

  const toggleConsent = () => {
    const next = !consented;
    setConsented(next);
    try {
      window.localStorage.setItem(CONSENT_KEY, next ? "1" : "0");
    } catch {
      /* ignore */
    }
  };

  function back() {
    stopAudio();
    router.push("/onboarding/plan-preview");
  }

  function finish() {
    if (!selected || !consented) return;
    stopAudio();
    patchDraft({ voiceId: selected, lastStep: 3 });
    // Best-effort persist of the completed onboarding draft to the server.
    try {
      void fetch("/api/user/onboarding", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({
          ...getDraft(),
          voiceConsentAt: new Date().toISOString(),
        }),
      });
    } catch {
      /* best-effort */
    }
    clearDraft();
    router.push("/plan/current?firstRun=1");
  }

  const canFinish = hydrated && !!selected && consented;

  return (
    <OnboardingLayout step={3}>
      <div className="flex flex-col gap-6">
        <header className="flex flex-col gap-1">
          <h1 className="text-[22px] font-medium tracking-[-0.02em] leading-tight text-text">
            Pick a voice.
          </h1>
          <p className="text-[14px] leading-snug text-text-secondary">
            Hover to preview. You can swap any time in settings.
          </p>
        </header>

        <FirstRunHint
          capability="onboarding.voice"
          message="One click to preview. The default is a safe bet if you're unsure."
        />

        <ul
          className="grid grid-cols-2 gap-2 sm:grid-cols-3"
          role="radiogroup"
          aria-label="Library voices"
        >
          {LIBRARY_VOICES.map((voice) => {
            const isSelected = selected === voice.id;
            const isPlaying = playingId === voice.id;
            return (
              <li key={voice.id}>
                <button
                  type="button"
                  role="radio"
                  aria-checked={isSelected}
                  onClick={() => setSelected(voice.id)}
                  onMouseEnter={() => {
                    /* autoplay on hover would be aggressive; rely on Play button */
                  }}
                  className={cn(
                    "group relative w-full text-left",
                    "flex flex-col gap-2",
                    "p-3",
                    "rounded-[var(--radius-card)]",
                    "border transition-colors duration-fast ease-out-cubic",
                    "focus-visible:outline-2 focus-visible:outline-offset-2",
                    "focus-visible:[outline-color:var(--focus-ring)]",
                    isSelected
                      ? "border-[color-mix(in_srgb,var(--accent)_40%,transparent)] bg-accent-subtle"
                      : "border-[color:var(--border)] bg-surface hover:bg-[color-mix(in_srgb,var(--gray-12)_3%,var(--surface))]",
                  )}
                >
                  <div className="flex items-center justify-between gap-2">
                    <span className="inline-flex items-center gap-2">
                      <span className="text-[13px] font-medium leading-none text-text">
                        {voice.name}
                      </span>
                      <span className="text-[11px] uppercase tracking-wider text-text-tertiary">
                        {voice.personality}
                      </span>
                    </span>
                    <span
                      role="button"
                      tabIndex={0}
                      aria-label={isPlaying ? "Stop preview" : `Preview ${voice.name}`}
                      onClick={(e) => {
                        e.preventDefault();
                        e.stopPropagation();
                        void playPreview(voice.id);
                      }}
                      onKeyDown={(e) => {
                        if (e.key === "Enter" || e.key === " ") {
                          e.preventDefault();
                          e.stopPropagation();
                          void playPreview(voice.id);
                        }
                      }}
                      className={cn(
                        "inline-flex h-5 w-5 items-center justify-center",
                        "rounded-[4px] text-text-tertiary",
                        "hover:text-text hover:bg-[color-mix(in_srgb,var(--gray-12)_4%,transparent)]",
                        "transition-colors duration-fast ease-out-cubic",
                      )}
                    >
                      {isPlaying ? (
                        <Pause size={12} strokeWidth={1.5} aria-hidden="true" />
                      ) : (
                        <Play size={12} strokeWidth={1.5} aria-hidden="true" />
                      )}
                    </span>
                  </div>
                  <p className="text-[12px] leading-snug text-text-secondary">
                    {voice.description}
                  </p>
                  {isSelected ? (
                    <span
                      aria-hidden="true"
                      className="absolute right-2 top-2 inline-flex h-4 w-4 items-center justify-center text-accent"
                    >
                      <Check size={12} strokeWidth={2} />
                    </span>
                  ) : null}
                </button>
              </li>
            );
          })}
        </ul>

        <label className="flex items-start gap-2 text-[12px] text-text-secondary leading-snug cursor-pointer select-none">
          <input
            type="checkbox"
            checked={consented}
            onChange={toggleConsent}
            className={cn(
              "mt-0.5 h-3.5 w-3.5 shrink-0 cursor-pointer accent-[color:var(--accent)]",
              "focus-visible:outline-2 focus-visible:outline-offset-2",
              "focus-visible:[outline-color:var(--focus-ring)]",
            )}
          />
          <span>
            I understand Build In Social uses this voice to narrate my videos
            and that I can change it later.
          </span>
        </label>

        <div className="flex items-center justify-between pt-2">
          <Button variant="ghost" size="sm" onClick={back}>
            <ArrowLeft size={14} strokeWidth={1.5} aria-hidden="true" />
            Back
          </Button>
          <Button
            variant="primary"
            size="md"
            onClick={finish}
            disabled={!canFinish}
          >
            Open my plan
            <ArrowRight size={14} strokeWidth={1.5} aria-hidden="true" />
          </Button>
        </div>
      </div>
    </OnboardingLayout>
  );
}
