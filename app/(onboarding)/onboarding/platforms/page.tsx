"use client";

import { useState, useRef, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { OnboardingShell } from "@/components/onboarding/OnboardingShell";
import { OnboardingHeading } from "@/components/onboarding/OnboardingHeading";
import { SelectionCard } from "@/components/onboarding/SelectionCard";
import { TrustLine } from "@/components/onboarding/TrustLine";
import { useOnboarding } from "@/components/onboarding/OnboardingProvider";
import { STAGGER_CARDS, EASE_SPRING, DURATION_ENTRY } from "@/lib/constants/onboarding";
import { APP } from "@/content/app";
import type { Platform } from "@/lib/types/user";

/* -------------------------------------------------------------------------- */
/*  Platform data                                                              */
/* -------------------------------------------------------------------------- */

const YoutubeIcon = (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
    <path d="M22.54 6.42a2.78 2.78 0 0 0-1.95-1.97C18.88 4 12 4 12 4s-6.88 0-8.59.45A2.78 2.78 0 0 0 1.46 6.42 29.94 29.94 0 0 0 1 12a29.94 29.94 0 0 0 .46 5.58 2.78 2.78 0 0 0 1.95 1.97C5.12 20 12 20 12 20s6.88 0 8.59-.45a2.78 2.78 0 0 0 1.95-1.97A29.94 29.94 0 0 0 23 12a29.94 29.94 0 0 0-.46-5.58Z" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
    <path d="M9.75 15.02 15.5 12 9.75 8.98v6.04Z" fill="currentColor" />
  </svg>
);

const InstagramIcon = (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
    <rect x="2" y="2" width="20" height="20" rx="5" stroke="currentColor" strokeWidth="1.5" />
    <circle cx="12" cy="12" r="5" stroke="currentColor" strokeWidth="1.5" />
    <circle cx="17.5" cy="6.5" r="1.25" fill="currentColor" />
  </svg>
);

const LinkedInIcon = (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
    <rect x="2" y="2" width="20" height="20" rx="3" stroke="currentColor" strokeWidth="1.5" />
    <path d="M7 10v7M7 7.01V7M11 17v-4.5c0-1.38 1.12-2.5 2.5-2.5s2.5 1.12 2.5 2.5V17" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
  </svg>
);

const XIcon = (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
    <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231 5.45-6.231Zm-1.161 17.52h1.833L7.084 4.126H5.117L17.083 19.77Z" fill="currentColor" />
  </svg>
);

interface PlatformDef {
  id: Platform;
  name: string;
  signal: string;
  icon: React.ReactNode;
}

const PLATFORMS: PlatformDef[] = [
  {
    id: "youtube",
    name: "YouTube Shorts",
    signal: "Hook-first — first 3 seconds decide your reach.",
    icon: YoutubeIcon,
  },
  {
    id: "instagram",
    name: "Instagram Reels",
    signal: "Shares drive reach — content people forward.",
    icon: InstagramIcon,
  },
  {
    id: "linkedin",
    name: "LinkedIn",
    signal: "Dwell time + comments — built for professionals.",
    icon: LinkedInIcon,
  },
  {
    id: "x",
    name: "X / Twitter",
    signal: "Engagement velocity — short, sharp, quotable.",
    icon: XIcon,
  },
];

/* -------------------------------------------------------------------------- */
/*  Page                                                                       */
/* -------------------------------------------------------------------------- */

export default function PlatformsPage() {
  const { data, update, goToStep } = useOnboarding();
  const [selected, setSelected] = useState<Platform[]>(
    data.platforms.length >= 2 ? data.platforms : [],
  );

  function toggle(platform: Platform) {
    setSelected((prev) =>
      prev.includes(platform)
        ? prev.filter((p) => p !== platform)
        : [...prev, platform],
    );
  }

  const canContinue = selected.length >= 2;
  const firstCardRef = useRef<HTMLDivElement>(null);

  // Auto-focus first card after slide animation
  useEffect(() => {
    const timer = setTimeout(() => {
      const btn = firstCardRef.current?.querySelector("button");
      btn?.focus();
    }, 350);
    return () => clearTimeout(timer);
  }, []);

  function handleContinue() {
    update({ platforms: selected, currentStep: 3 });
    goToStep(3);
  }

  function handleBack() {
    update({ platforms: selected });
    goToStep(1);
  }

  return (
    <OnboardingShell
      step={2}
      continueLabel={`Continue with ${selected.length} platform${selected.length !== 1 ? "s" : ""}`}
      continueDisabled={!canContinue}
      onContinue={handleContinue}
      onBack={handleBack}
    >
      <OnboardingHeading
        title={APP.ONBOARDING.step3.title}
        subtitle="Pick 2-4 platforms. Each gets content built for its algorithm."
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
        {PLATFORMS.map((platform, i) => (
          <motion.div
            key={platform.id}
            ref={i === 0 ? firstCardRef : undefined}
            variants={{
              hidden: { opacity: 0, y: 12 },
              visible: {
                opacity: 1,
                y: 0,
                transition: { duration: DURATION_ENTRY, ease: [...EASE_SPRING] },
              },
            }}
          >
            <SelectionCard
              selected={selected.includes(platform.id)}
              onSelect={() => toggle(platform.id)}
              icon={platform.icon}
              title={platform.name}
              description={platform.signal}
            />
          </motion.div>
        ))}
      </motion.div>

      <div className="mt-6">
        <TrustLine lines="Each platform gets its own format, duration, and hook style." />
      </div>
    </OnboardingShell>
  );
}
