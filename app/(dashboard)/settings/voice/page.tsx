"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Button } from "@/components/tremor/Button";
import { StatusCard } from "@/components/ui/StatusCard";
import { APP } from "@/content/app";
import { LIBRARY_VOICES } from "@/lib/constants/onboarding";
import type { SubscriptionTier } from "@/lib/types/user";

type Profile = {
  id: string;
  subscriptionTier: SubscriptionTier;
  voiceProfileId?: string;
  // Library voice id as persisted in the voice profile `name` field (lowercased).
  libraryVoiceId?: string;
};

type PreviewState =
  | { kind: "idle" }
  | { kind: "loading" }
  | { kind: "playing"; audioUrl: string }
  | { kind: "rateLimited" }
  | { kind: "upgrade" }
  | { kind: "error"; message: string };

type LibraryState =
  | { kind: "idle" }
  | { kind: "saving"; voiceId: string }
  | { kind: "saved"; voiceId: string }
  | { kind: "error"; message: string };

const COPY = APP.SETTINGS_VOICE;

function WaveformBars() {
  return (
    <div className="flex items-center gap-[2px] h-4" aria-hidden="true">
      {[0, 1, 2, 3, 4].map((i) => (
        <motion.span
          key={i}
          className="block rounded-full"
          style={{ width: 2.5, backgroundColor: "var(--accent)" }}
          animate={{ height: ["4px", "14px", "6px", "12px", "4px"] }}
          transition={{
            duration: 0.8,
            repeat: Infinity,
            delay: i * 0.12,
            ease: [0.16, 1, 0.3, 1],
          }}
        />
      ))}
    </div>
  );
}

export default function VoiceSettings() {
  const [profile, setProfile] = useState<Profile | null>(null);
  const [profileError, setProfileError] = useState<string | null>(null);
  const [preview, setPreview] = useState<PreviewState>({ kind: "idle" });
  const [library, setLibrary] = useState<LibraryState>({ kind: "idle" });
  const audioRef = useRef<HTMLAudioElement | null>(null);

  const handleChangeLibraryVoice = useCallback(async (voiceId: string) => {
    setLibrary({ kind: "saving", voiceId });
    try {
      const res = await fetch("/api/settings/voice", {
        method: "PATCH",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ voiceId }),
      });
      const json = await res.json();
      if (!res.ok || json.error) {
        setLibrary({
          kind: "error",
          message: typeof json.error === "string" ? json.error : APP.COMMON.errorGeneric,
        });
        return;
      }
      setLibrary({ kind: "saved", voiceId });
    } catch {
      setLibrary({ kind: "error", message: APP.COMMON.errorGeneric });
    }
  }, []);

  useEffect(() => {
    let cancelled = false;
    fetch("/api/user/profile")
      .then((r) => r.json())
      .then((j) => {
        if (cancelled) return;
        if (j.error) setProfileError(APP.COMMON.errorGeneric);
        else setProfile(j.data as Profile);
      })
      .catch(() => {
        if (!cancelled) setProfileError(APP.COMMON.errorGeneric);
      });
    return () => {
      cancelled = true;
      if (audioRef.current) {
        audioRef.current.pause();
        audioRef.current = null;
      }
    };
  }, []);

  const stopAudio = useCallback(() => {
    if (audioRef.current) {
      audioRef.current.pause();
      audioRef.current.src = "";
      audioRef.current = null;
    }
    setPreview({ kind: "idle" });
  }, []);

  const handlePreview = useCallback(async () => {
    if (preview.kind === "playing") {
      stopAudio();
      return;
    }
    setPreview({ kind: "loading" });
    try {
      const res = await fetch("/api/voice/preview?target=clone");
      if (res.status === 429) {
        setPreview({ kind: "rateLimited" });
        return;
      }
      if (res.status === 403) {
        setPreview({ kind: "upgrade" });
        return;
      }
      if (!res.ok) {
        setPreview({ kind: "error", message: COPY.previewError });
        return;
      }
      const json = (await res.json()) as {
        data?: { audioUrl: string; cachedUntil: number };
      };
      const audioUrl = json.data?.audioUrl;
      if (!audioUrl) {
        setPreview({ kind: "error", message: COPY.previewError });
        return;
      }
      const audio = new Audio(audioUrl);
      audioRef.current = audio;
      audio.onended = () => {
        audioRef.current = null;
        setPreview({ kind: "idle" });
      };
      audio.onerror = () => {
        audioRef.current = null;
        setPreview({ kind: "error", message: COPY.previewError });
      };
      await audio.play();
      setPreview({ kind: "playing", audioUrl });
    } catch {
      setPreview({ kind: "error", message: COPY.previewError });
    }
  }, [preview.kind, stopAudio]);

  const cloneActive = !!profile?.voiceProfileId;
  const canPreviewByPlan =
    profile?.subscriptionTier === "creator" ||
    profile?.subscriptionTier === "studio";

  return (
    <div className="space-y-10">
      <section aria-labelledby="voice-settings">
        <div className="grid grid-cols-1 gap-x-14 gap-y-8 md:grid-cols-3">
          <div>
            <h2
              id="voice-settings"
              className="scroll-mt-10 font-semibold text-gray-900 dark:text-gray-50"
            >
              {COPY.title}
            </h2>
            <p className="mt-1 text-sm leading-6 text-gray-500">
              {COPY.subtitle}
            </p>
            <p className="mt-3 text-xs leading-5 text-gray-500 dark:text-gray-500">
              {COPY.disambiguation}
            </p>
          </div>

          <div className="md:col-span-2 space-y-6">
            <div>
              <h3 className="font-medium text-gray-900 dark:text-gray-50">
                {COPY.cloneTitle}
              </h3>
              <p className="mt-1 text-sm text-gray-500">
                {cloneActive ? COPY.cloneActive : COPY.cloneEmpty}
              </p>
            </div>

            {profileError && (
              <StatusCard
                variant="error"
                title={APP.COMMON.errorGeneric}
                description={profileError}
              />
            )}

            {profile && cloneActive && (
              <div className="space-y-3">
                <div className="flex flex-wrap items-center gap-3">
                  <Button
                    type="button"
                    variant="primary"
                    onClick={handlePreview}
                    disabled={
                      preview.kind === "loading" || !canPreviewByPlan
                    }
                    aria-label={
                      preview.kind === "playing"
                        ? COPY.previewStop
                        : COPY.previewCloneCta
                    }
                  >
                    <AnimatePresence mode="wait" initial={false}>
                      {preview.kind === "loading" ? (
                        <motion.span
                          key="loading"
                          initial={{ opacity: 0 }}
                          animate={{ opacity: 1 }}
                          exit={{ opacity: 0 }}
                        >
                          {COPY.previewRendering}
                        </motion.span>
                      ) : preview.kind === "playing" ? (
                        <motion.span
                          key="playing"
                          initial={{ opacity: 0 }}
                          animate={{ opacity: 1 }}
                          exit={{ opacity: 0 }}
                          className="inline-flex items-center gap-2"
                        >
                          <WaveformBars />
                          <span>{COPY.previewStop}</span>
                        </motion.span>
                      ) : (
                        <motion.span
                          key="idle"
                          initial={{ opacity: 0 }}
                          animate={{ opacity: 1 }}
                          exit={{ opacity: 0 }}
                        >
                          {COPY.previewCloneCta}
                        </motion.span>
                      )}
                    </AnimatePresence>
                  </Button>

                  {preview.kind === "playing" && (
                    <span className="text-sm text-gray-500">
                      {COPY.previewPlaying}
                    </span>
                  )}
                </div>

                {/* A11y live region for status changes */}
                <div
                  role="status"
                  aria-live="polite"
                  aria-atomic="true"
                  className="sr-only"
                >
                  {preview.kind === "loading"
                    ? COPY.previewRendering
                    : preview.kind === "playing"
                      ? COPY.previewPlaying
                      : ""}
                </div>

                {preview.kind === "rateLimited" && (
                  <StatusCard
                    variant="setup"
                    title={COPY.previewRateLimited}
                  />
                )}
                {preview.kind === "upgrade" && (
                  <StatusCard
                    variant="setup"
                    title={COPY.previewUpgradeNeeded}
                    cta={COPY.previewUpgradeCta}
                    ctaHref="/settings/billing"
                  />
                )}
                {!canPreviewByPlan && preview.kind === "idle" && (
                  <StatusCard
                    variant="setup"
                    title={COPY.previewUpgradeNeeded}
                    cta={COPY.previewUpgradeCta}
                    ctaHref="/settings/billing"
                  />
                )}
                {preview.kind === "error" && (
                  <StatusCard
                    variant="error"
                    title={COPY.previewError}
                    description={preview.message}
                  />
                )}
              </div>
            )}

            {profile && !cloneActive && (
              <p className="text-sm text-gray-500">{COPY.previewComingSoon}</p>
            )}
          </div>
        </div>
      </section>

      {profile && (
        <section aria-labelledby="library-voice-settings">
          <div className="grid grid-cols-1 gap-x-14 gap-y-8 md:grid-cols-3">
            <div>
              <h2
                id="library-voice-settings"
                className="scroll-mt-10 font-semibold text-gray-900 dark:text-gray-50"
              >
                Library voice
              </h2>
              <p className="mt-1 text-sm leading-6 text-gray-500">
                The voice Build In Social uses when you&apos;re not using a clone. You
                can change it any time — it takes effect on the next render.
              </p>
            </div>

            <div className="md:col-span-2 space-y-3">
              <ul className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                {LIBRARY_VOICES.map((v) => {
                  const isSaving = library.kind === "saving" && library.voiceId === v.id;
                  const isSaved = library.kind === "saved" && library.voiceId === v.id;
                  return (
                    <li key={v.id}>
                      <button
                        type="button"
                        onClick={() => void handleChangeLibraryVoice(v.id)}
                        disabled={library.kind === "saving"}
                        className="w-full text-left rounded-lg border border-gray-200 bg-white p-4 transition hover:border-brand-500 hover:shadow-sm disabled:opacity-60 disabled:cursor-not-allowed dark:border-gray-800 dark:bg-gray-950 dark:hover:border-brand-500"
                        aria-label={`Use ${v.name} voice`}
                      >
                        <div className="flex items-center justify-between gap-2">
                          <div>
                            <p className="font-medium text-gray-900 dark:text-gray-50">
                              {v.name}
                            </p>
                            <p className="mt-0.5 text-xs text-gray-500">
                              {v.personality}
                            </p>
                          </div>
                          {isSaving && (
                            <span className="text-xs text-gray-500">Saving…</span>
                          )}
                          {isSaved && (
                            <span
                              className="text-xs font-medium"
                              style={{ color: "var(--accent)" }}
                            >
                              Selected
                            </span>
                          )}
                        </div>
                        <p className="mt-2 text-sm leading-5 text-gray-600 dark:text-gray-400">
                          {v.description}
                        </p>
                      </button>
                    </li>
                  );
                })}
              </ul>
              {library.kind === "error" && (
                <StatusCard
                  variant="error"
                  title="Couldn't save"
                  description={library.message}
                />
              )}
            </div>
          </div>
        </section>
      )}
    </div>
  );
}
