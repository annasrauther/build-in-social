"use client";

import { useState, useRef, useEffect } from "react";
import { motion } from "framer-motion";
import { OnboardingShell } from "@/components/onboarding/OnboardingShell";
import { OnboardingHeading } from "@/components/onboarding/OnboardingHeading";
import { SelectionCard } from "@/components/onboarding/SelectionCard";
import { TrustLine } from "@/components/onboarding/TrustLine";
import { useOnboarding } from "@/components/onboarding/OnboardingProvider";
import { useInteractionFeedback } from "@/lib/hooks/useInteractionFeedback";
import { STAGGER_CARDS, EASE_SPRING, DURATION_ENTRY } from "@/lib/constants/onboarding";
import { APP } from "@/content/app";
import {
  RiYoutubeLine,
  RiInstagramLine,
  RiLinkedinBoxLine,
  RiTwitterXLine,
} from "@remixicon/react";
import type { Platform } from "@/lib/types/user";

/* -------------------------------------------------------------------------- */
/*  Platform data                                                              */
/* -------------------------------------------------------------------------- */

interface PlatformDef {
  id: Platform;
  name: string;
  signal: string;
  icon: React.ReactNode;
  /** OAuth scopes we will request when the user connects this platform. */
  scopes: string[];
  /** Plain-English explanation of why each scope is needed. */
  scopeRationale: string;
}

const PLATFORMS: PlatformDef[] = [
  {
    id: "youtube",
    name: "YouTube Shorts",
    signal: "Hook-first — first 3 seconds decide your reach.",
    icon: <RiYoutubeLine style={{ color: "#FF0000", width: 20, height: 20 }} />,
    scopes: ["youtube.upload", "youtube.readonly"],
    scopeRationale:
      "Upload finished Shorts to your channel and read post status + basic metrics. We never access private videos, comments, or your Google account.",
  },
  {
    id: "instagram",
    name: "Instagram Reels",
    signal: "Shares drive reach — content people forward.",
    icon: <RiInstagramLine style={{ color: "#E1306C", width: 20, height: 20 }} />,
    scopes: ["instagram_content_publish", "pages_show_list"],
    scopeRationale:
      "Publish Reels to your professional Instagram account and list the connected Facebook Pages you own (required by Meta's publishing API). We cannot read DMs or follower data.",
  },
  {
    id: "linkedin",
    name: "LinkedIn",
    signal: "Dwell time + comments — built for professionals.",
    icon: <RiLinkedinBoxLine style={{ color: "#0A66C2", width: 20, height: 20 }} />,
    scopes: ["w_member_social", "r_liteprofile"],
    scopeRationale:
      "Post on your behalf and read your name + profile photo for display. We do not access your connections or inbox.",
  },
  {
    id: "x",
    name: "X / Twitter",
    signal: "Engagement velocity — short, sharp, quotable.",
    icon: <RiTwitterXLine style={{ color: "var(--text-primary)", width: 20, height: 20 }} />,
    scopes: ["tweet.write", "users.read", "offline.access"],
    scopeRationale:
      "Publish posts, read your handle for display, and refresh the connection in the background so you don't re-authenticate every week.",
  },
];

/* -------------------------------------------------------------------------- */
/*  Page                                                                       */
/* -------------------------------------------------------------------------- */

export default function PlatformsPage() {
  const { data, update, goToStep } = useOnboarding();
  const { playSelect, playDeselect, playNavigation, vibrate } = useInteractionFeedback();
  const [selected, setSelected] = useState<Platform[]>(
    data.platforms.length >= 2 ? data.platforms : [],
  );

  function toggle(platform: Platform) {
    const isSelected = selected.includes(platform);
    setSelected((prev) =>
      isSelected ? prev.filter((p) => p !== platform) : [...prev, platform],
    );
    if (isSelected) {
      playDeselect();
      vibrate(6);
    } else {
      playSelect();
      vibrate(10);
    }
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
    playNavigation();
    vibrate(15);
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
            <ScopeDisclosure
              scopes={platform.scopes}
              rationale={platform.scopeRationale}
              platformName={platform.name}
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

/* -------------------------------------------------------------------------- */
/*  OAuth scope disclosure (T3)                                                */
/* -------------------------------------------------------------------------- */

interface ScopeDisclosureProps {
  scopes: string[];
  rationale: string;
  platformName: string;
}

function ScopeDisclosure({
  scopes,
  rationale,
  platformName,
}: ScopeDisclosureProps) {
  return (
    <details className="mt-1.5 ml-1 group">
      <summary
        className="cursor-pointer list-none inline-flex items-center gap-1 rounded px-1 py-0.5 text-[12px] leading-tight transition-colors outline-none focus-visible:ring-2 focus-visible:ring-[var(--accent)]"
        style={{ color: "var(--text-tertiary)" }}
        aria-label={`Show OAuth permissions for ${platformName}`}
      >
        <svg
          width="10"
          height="10"
          viewBox="0 0 10 10"
          fill="none"
          aria-hidden="true"
          className="transition-transform duration-150 group-open:rotate-90"
        >
          <path
            d="M3.5 2L6.5 5L3.5 8"
            stroke="currentColor"
            strokeWidth="1.25"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </svg>
        <span>Will request:</span>
        <code
          className="font-mono text-[11px] px-1 rounded"
          style={{
            backgroundColor: "var(--bg-overlay)",
            color: "var(--text-secondary)",
          }}
        >
          {scopes.join(", ")}
        </code>
      </summary>
      <div
        className="mt-2 ml-4 rounded-md border p-3 text-[12px] leading-relaxed"
        style={{
          borderColor: "var(--border-default)",
          backgroundColor: "var(--bg-surface)",
          color: "var(--text-secondary)",
        }}
      >
        <p className="font-medium mb-1" style={{ color: "var(--text-primary)" }}>
          Why we need these
        </p>
        <p>{rationale}</p>
      </div>
    </details>
  );
}
