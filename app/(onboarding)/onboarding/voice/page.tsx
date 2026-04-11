"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import { OnboardingShell } from "@/components/onboarding/OnboardingShell";
import { OnboardingHeading } from "@/components/onboarding/OnboardingHeading";
import { SelectionCard } from "@/components/onboarding/SelectionCard";
import { useOnboarding } from "@/components/onboarding/OnboardingProvider";
import { LIBRARY_VOICES, STAGGER_CARDS } from "@/lib/constants/onboarding";

const VoiceIcon = (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
    <path d="M12 1a3 3 0 0 0-3 3v8a3 3 0 0 0 6 0V4a3 3 0 0 0-3-3Z" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
    <path d="M19 10v2a7 7 0 0 1-14 0v-2" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
    <path d="M12 19v4M8 23h8" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
  </svg>
);

export default function VoicePage() {
  const { data, update, goToStep } = useOnboarding();
  const [selected, setSelected] = useState(data.libraryVoiceId || "alex");
  const [consentChecked, setConsentChecked] = useState(!!data.voiceConsentAt);

  function handleContinue() {
    // Record consent timestamp before proceeding
    update({
      libraryVoiceId: selected,
      voiceChoice: "library",
      voiceConsentAt: new Date().toISOString(),
      currentStep: 4,
    });
    goToStep(4);
  }

  function handleBack() {
    update({ libraryVoiceId: selected });
    goToStep(2);
  }

  return (
    <OnboardingShell
      step={3}
      continueLabel="Continue"
      continueDisabled={!selected || !consentChecked}
      onContinue={handleContinue}
      onBack={handleBack}
    >
      <OnboardingHeading
        title="Choose a voice"
        subtitle="Pick the voice that narrates your videos. You can change it anytime."
      />

      <motion.div
        className="flex flex-col gap-3"
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
            <SelectionCard
              selected={selected === voice.id}
              onSelect={() => setSelected(voice.id)}
              icon={VoiceIcon}
              title={voice.name}
              description={voice.personality}
            />
          </motion.div>
        ))}
      </motion.div>

      {/* Voice consent */}
      <motion.label
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.4, duration: 0.28 }}
        className="flex items-start gap-3 mt-6 cursor-pointer"
        style={{ minHeight: 44 }}
      >
        <input
          type="checkbox"
          checked={consentChecked}
          onChange={(e) => setConsentChecked(e.target.checked)}
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
          I consent to Build In Social using AI voice synthesis to generate audio narration
          for my videos. My voice selection and usage data are processed in accordance with
          our{" "}
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
