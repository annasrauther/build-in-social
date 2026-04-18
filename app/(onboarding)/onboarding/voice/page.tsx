"use client";

import { useState, useRef, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { OnboardingShell } from "@/components/onboarding/OnboardingShell";
import { OnboardingHeading } from "@/components/onboarding/OnboardingHeading";
import { useOnboarding } from "@/components/onboarding/OnboardingProvider";
import { useInteractionFeedback } from "@/lib/hooks/useInteractionFeedback";
import { LIBRARY_VOICES, STAGGER_CARDS } from "@/lib/constants/onboarding";
import { APP } from "@/content/app";

/* ─── Waveform bars animation ─────────────────────────────────────────────── */

function WaveformBars({ color }: { color: string }) {
  return (
    <div className="flex items-center gap-[2px] h-4">
      {[0, 1, 2, 3, 4].map((i) => (
        <motion.span
          key={i}
          className="block rounded-full"
          style={{ width: 2.5, backgroundColor: color }}
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

/* ─── Gender icon ─────────────────────────────────────────────────────────── */

function GenderDot({ gender }: { gender: "male" | "female" }) {
  return (
    <span
      style={{
        display: "inline-block",
        width: 6,
        height: 6,
        borderRadius: "50%",
        backgroundColor: gender === "female" ? "#DF8F70" : "#6A9BCC",
        marginRight: 4,
        verticalAlign: "middle",
      }}
    />
  );
}

/* ─── Voice card ──────────────────────────────────────────────────────────── */

type VoiceCardProps = {
  voice: (typeof LIBRARY_VOICES)[number];
  selected: boolean;
  playing: boolean;
  loading: boolean;
  onSelect: () => void;
  onPreview: () => void;
};

function VoiceCard({
  voice,
  selected,
  playing,
  loading,
  onSelect,
  onPreview,
}: VoiceCardProps) {
  const isActive = selected || playing;

  return (
    <div
      style={{
        position: "relative",
        borderRadius: "calc(var(--radius-lg) + 1.5px)",
        padding: "1.5px",
        overflow: "hidden",
        boxShadow: selected ? `0 0 0 3px ${voice.color}22, 0 6px 20px ${voice.color}18` : "none",
        transition: "box-shadow 160ms ease",
        backgroundColor: selected ? "transparent" : "var(--bg-elevated)",
      }}
    >
      {/* Traveling beam border in the voice's own color */}
      <motion.div
        animate={{ opacity: selected ? 1 : 0 }}
        transition={{ duration: 0.22 }}
        className="focus-beam-layer"
        style={{ ["--beam-color" as string]: voice.color }}
      />

    <motion.div
      layout
      animate={
        selected
          ? {
              scale: [1, 1.015, 1],
              transition: { duration: 0.18, ease: [0.16, 1, 0.3, 1] },
            }
          : {}
      }
      style={{
        borderRadius: "var(--radius-lg)",
        border: "none",
        backgroundColor: "var(--bg-elevated)",
        overflow: "hidden",
        position: "relative",
        zIndex: 1,
      }}
    >
      {/* Main tap area */}
      <button
        type="button"
        onClick={onSelect}
        className="w-full text-left"
        style={{
          padding: "12px 16px 8px",
          background: "none",
          border: "none",
          cursor: "pointer",
          outline: "none",
          display: "block",
          minHeight: 44,
        }}
      >
        <div className="flex items-start gap-3">
          {/* Avatar circle */}
          <div
            className="shrink-0 flex items-center justify-center rounded-full text-white font-semibold"
            style={{
              width: 40,
              height: 40,
              backgroundColor: voice.color,
              fontSize: 15,
              opacity: 0.92,
            }}
          >
            {voice.name[0]}
          </div>

          {/* Content */}
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 mb-0.5">
              <span
                className="font-sans"
                style={{
                  fontWeight: 600,
                  fontSize: "var(--type-body-mobile)",
                  color: "var(--text-primary)",
                }}
              >
                {voice.name}
              </span>
              <span
                style={{
                  fontSize: "var(--type-micro)",
                  fontWeight: 500,
                  color: voice.color,
                  backgroundColor: `${voice.color}18`,
                  padding: "1px 6px",
                  borderRadius: 99,
                }}
              >
                {voice.personality}
              </span>
            </div>

            <p
              style={{
                fontSize: "var(--type-supporting-mobile)",
                color: "var(--text-secondary)",
                lineHeight: 1.5,
              }}
            >
              <GenderDot gender={voice.gender} />
              {voice.description}
            </p>
          </div>

          {/* Selection checkmark */}
          <motion.div
            className="shrink-0 flex items-center justify-center rounded-full"
            style={{
              width: 22,
              height: 22,
              backgroundColor: selected ? voice.color : "var(--bg-overlay)",
              marginTop: 2,
            }}
            animate={{ scale: selected ? 1 : 0.88, opacity: 1 }}
            transition={{ type: "spring", stiffness: 500, damping: 25 }}
          >
            <AnimatePresence>
              {selected && (
                <motion.svg
                  key="check"
                  width="11"
                  height="9"
                  viewBox="0 0 11 9"
                  fill="none"
                  initial={{ scale: 0, opacity: 0 }}
                  animate={{ scale: 1, opacity: 1 }}
                  exit={{ scale: 0, opacity: 0 }}
                  transition={{ type: "spring", stiffness: 500, damping: 25 }}
                >
                  <path
                    d="M1 4.5L3.8 7.5L10 1"
                    stroke="white"
                    strokeWidth="1.8"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                </motion.svg>
              )}
            </AnimatePresence>
          </motion.div>
        </div>
      </button>

      {/* Preview button row */}
      <div
        style={{
          padding: "0 16px 10px 59px",
          display: "flex",
          alignItems: "center",
          gap: 10,
        }}
      >
        <button
          type="button"
          onClick={(e) => {
            e.stopPropagation();
            onPreview();
          }}
          disabled={loading}
          style={{
            display: "flex",
            alignItems: "center",
            gap: 6,
            padding: "5px 10px",
            borderRadius: 99,
            border: `1px solid ${isActive ? voice.color : "var(--border-default)"}`,
            backgroundColor: "transparent",
            color: isActive ? voice.color : "var(--text-tertiary)",
            fontSize: "var(--type-micro)",
            fontWeight: 500,
            cursor: loading ? "wait" : "pointer",
            transition: "border-color 160ms ease, color 160ms ease",
            outline: "none",
            minHeight: 28,
          }}
          aria-label={playing ? `Stop ${voice.name} preview` : `Preview ${voice.name} voice`}
        >
          <AnimatePresence mode="wait">
            {loading ? (
              <motion.span
                key="loading"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                style={{ display: "flex", alignItems: "center", gap: 4 }}
              >
                {[0, 1, 2].map((i) => (
                  <motion.span
                    key={i}
                    className="block rounded-full"
                    style={{ width: 3, height: 3, backgroundColor: "currentColor" }}
                    animate={{ opacity: [0.3, 1, 0.3] }}
                    transition={{ duration: 0.8, repeat: Infinity, delay: i * 0.18 }}
                  />
                ))}
              </motion.span>
            ) : playing ? (
              <motion.span
                key="playing"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                style={{ display: "flex", alignItems: "center", gap: 6 }}
              >
                <WaveformBars color={voice.color} />
                <span>Stop</span>
              </motion.span>
            ) : (
              <motion.span
                key="play"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                style={{ display: "flex", alignItems: "center", gap: 5 }}
              >
                {/* Play triangle */}
                <svg width="8" height="9" viewBox="0 0 8 9" fill="currentColor">
                  <path d="M0.5 1.5L7.5 4.5L0.5 7.5V1.5Z" />
                </svg>
                Preview
              </motion.span>
            )}
          </AnimatePresence>
        </button>

        {playing && (
          <motion.span
            initial={{ opacity: 0, x: -4 }}
            animate={{ opacity: 1, x: 0 }}
            style={{
              fontSize: "var(--type-micro)",
              color: voice.color,
            }}
          >
            {voice.previewText.slice(0, 32)}…
          </motion.span>
        )}
      </div>
    </motion.div>
    </div>
  );
}

/* ─── Page ────────────────────────────────────────────────────────────────── */

export default function VoicePage() {
  const { data, update, goToStep } = useOnboarding();
  const { playSelect, playDeselect, playNavigation, playError, vibrate } =
    useInteractionFeedback();

  const [selected, setSelected] = useState(data.libraryVoiceId || "alex");
  const [consentChecked, setConsentChecked] = useState(!!data.voiceConsentAt);
  const [playingId, setPlayingId] = useState<string | null>(null);
  const [loadingId, setLoadingId] = useState<string | null>(null);
  const audioRef = useRef<HTMLAudioElement | null>(null);

  const stopAudio = useCallback(() => {
    if (audioRef.current) {
      audioRef.current.pause();
      audioRef.current.src = "";
      audioRef.current = null;
    }
    setPlayingId(null);
  }, []);

  const handlePreview = useCallback(
    async (voiceId: string) => {
      // Toggle off if already playing this voice
      if (playingId === voiceId) {
        stopAudio();
        return;
      }

      // Stop any current playback
      stopAudio();

      setLoadingId(voiceId);
      vibrate(8);

      try {
        const res = await fetch(`/api/voice/preview?voiceId=${voiceId}`);
        if (!res.ok) {
          playError();
          vibrate([10, 30, 10]);
          return;
        }
        const { audioUrl } = (await res.json()) as { audioUrl: string };

        const audio = new Audio(audioUrl);
        audioRef.current = audio;

        audio.onended = () => {
          setPlayingId(null);
          audioRef.current = null;
        };
        audio.onerror = () => {
          setPlayingId(null);
          audioRef.current = null;
          playError();
        };

        await audio.play();
        setPlayingId(voiceId);
        vibrate(15);
      } catch {
        playError();
        vibrate([10, 30, 10]);
      } finally {
        setLoadingId(null);
      }
    },
    [playingId, stopAudio, vibrate, playError],
  );

  const handleSelect = useCallback(
    (voiceId: string) => {
      if (voiceId === selected) return;
      stopAudio();
      setSelected(voiceId);
      playSelect();
      vibrate(10);
    },
    [selected, stopAudio, playSelect, vibrate],
  );

  function handleContinue() {
    stopAudio();
    update({
      libraryVoiceId: selected,
      voiceChoice: "library",
      voiceConsentAt: new Date().toISOString(),
      currentStep: 4,
    });
    playNavigation();
    vibrate(15);
    goToStep(4); // → /onboarding/plan-preview
  }

  function handleBack() {
    stopAudio();
    update({ libraryVoiceId: selected });
    goToStep(2);
  }

  // A6: derive a human-readable status string for the aria-live region
  const voiceStatusMessage = (() => {
    if (loadingId) {
      const voice = LIBRARY_VOICES.find((v) => v.id === loadingId);
      return `Loading preview for ${voice?.name ?? loadingId}`;
    }
    if (playingId) {
      const voice = LIBRARY_VOICES.find((v) => v.id === playingId);
      return `Now playing ${voice?.name ?? playingId}`;
    }
    return "";
  })();

  return (
    <OnboardingShell
      step={3}
      continueLabel="Continue"
      continueDisabled={!selected || !consentChecked}
      onContinue={handleContinue}
      onBack={handleBack}
    >
      {/* A6: aria-live region announces voice preview loading/playing state to screen readers */}
      <div
        role="status"
        aria-live="polite"
        aria-atomic="true"
        className="sr-only"
      >
        {voiceStatusMessage}
      </div>

      <OnboardingHeading
        title="Choose a narration voice"
        subtitle="Pick the voice that narrates your videos. Click Preview to hear it first."
      />

      <motion.p
        initial={{ opacity: 0, y: 6 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.28, delay: 0.05 }}
        style={{
          fontSize: "var(--type-supporting-mobile)",
          color: "var(--text-tertiary)",
          lineHeight: 1.55,
          marginTop: -8,
          marginBottom: 20,
          padding: "10px 14px",
          borderRadius: "var(--radius-md)",
          backgroundColor: "var(--bg-elevated)",
          border: "1px solid var(--border-subtle)",
        }}
      >
        {APP.ONBOARDING.step4.libraryIntro}
      </motion.p>

      <motion.div
        className="flex flex-col gap-2"
        initial="hidden"
        animate="visible"
        variants={{
          hidden: {},
          visible: { transition: { staggerChildren: STAGGER_CARDS } },
        }}
      >
        {LIBRARY_VOICES.map((voice) => (
          <motion.div
            key={voice.id}
            variants={{
              hidden: { opacity: 0, y: 12 },
              visible: {
                opacity: 1,
                y: 0,
                transition: { duration: 0.28, ease: [0.16, 1, 0.3, 1] },
              },
            }}
          >
            <VoiceCard
              voice={voice}
              selected={selected === voice.id}
              playing={playingId === voice.id}
              loading={loadingId === voice.id}
              onSelect={() => handleSelect(voice.id)}
              onPreview={() => handlePreview(voice.id)}
            />
          </motion.div>
        ))}
      </motion.div>

      {/* Voice consent */}
      <motion.label
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.45, duration: 0.28 }}
        className="flex items-start gap-3 mt-6 cursor-pointer"
        style={{ minHeight: 44 }}
      >
        <input
          type="checkbox"
          checked={consentChecked}
          onChange={(e) => {
            setConsentChecked(e.target.checked);
            if (e.target.checked) {
              playSelect();
              vibrate(8);
            }
          }}
          className="mt-1 shrink-0"
          style={{ width: 18, height: 18, accentColor: "var(--accent)" }}
        />
        <span
          style={{
            fontSize: "var(--type-supporting-mobile)",
            color: "var(--text-secondary)",
            lineHeight: 1.5,
          }}
        >
          I consent to Build In Social using AI voice synthesis to create the
          audio narration for my videos. My voice selection and usage data are
          processed in accordance with our{" "}
          <a
            href="/privacy"
            target="_blank"
            rel="noopener noreferrer"
            style={{ color: "var(--accent)", textDecoration: "underline" }}
          >
            Privacy Policy
          </a>
          .
        </span>
      </motion.label>
    </OnboardingShell>
  );
}
