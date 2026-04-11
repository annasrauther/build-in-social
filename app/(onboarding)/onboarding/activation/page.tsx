"use client";

import { useState, useEffect, useMemo, useRef } from "react";
import { useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import { OnboardingShell } from "@/components/onboarding/OnboardingShell";
import { OnboardingHeading } from "@/components/onboarding/OnboardingHeading";
import { useOnboarding } from "@/components/onboarding/OnboardingProvider";
import { EASE_SPRING, DURATION_ENTRY } from "@/lib/constants/onboarding";
import { Button } from "baseui/button";

/* -------------------------------------------------------------------------- */
/*  Confetti                                                                   */
/* -------------------------------------------------------------------------- */

interface Particle {
  id: number;
  x: number;
  y: number;
  rotate: number;
  scale: number;
  color: string;
}

const PARTICLE_COLORS = [
  "var(--accent)",
  "#C9A84C",
  "#D4B96A",
  "#EDE9E1",
  "#FAFAF8",
  "#F5F3EE",
];

function generateParticles(count: number): Particle[] {
  return Array.from({ length: count }, (_, i) => ({
    id: i,
    x: (Math.random() - 0.5) * 500,
    y: (Math.random() - 0.5) * 600 - 200,
    rotate: Math.random() * 720 - 360,
    scale: Math.random() * 0.6 + 0.4,
    color: PARTICLE_COLORS[i % PARTICLE_COLORS.length],
  }));
}

function ConfettiBurst() {
  const [particles] = useState(() => generateParticles(50));

  return (
    <div className="absolute inset-0 pointer-events-none overflow-hidden" style={{ zIndex: 20 }}>
      {particles.map((p) => (
        <motion.div
          key={p.id}
          className="absolute rounded-sm"
          style={{
            width: 8 * p.scale,
            height: 8 * p.scale,
            backgroundColor: p.color,
            left: "50%",
            top: "40%",
          }}
          initial={{ x: 0, y: 0, opacity: 1, rotate: 0, scale: 0 }}
          animate={{
            x: p.x,
            y: p.y,
            opacity: [1, 1, 0],
            rotate: p.rotate,
            scale: [0, 1, 0.6],
          }}
          transition={{
            duration: 2,
            ease: [0.16, 1, 0.3, 1],
            times: [0, 0.4, 1],
          }}
        />
      ))}
    </div>
  );
}

/* -------------------------------------------------------------------------- */
/*  Page                                                                       */
/* -------------------------------------------------------------------------- */

export default function ActivationPage() {
  const router = useRouter();
  const { data } = useOnboarding();
  const [showContent, setShowContent] = useState(false);

  const firstPlatform = data.platforms[0] ?? "your first platform";
  const platformLabel = useMemo(() => {
    const labels: Record<string, string> = {
      youtube: "YouTube Shorts",
      instagram: "Instagram Reels",
      linkedin: "LinkedIn",
      x: "X",
    };
    return labels[firstPlatform] ?? firstPlatform;
  }, [firstPlatform]);

  useEffect(() => {
    const timer = setTimeout(() => setShowContent(true), 800);
    return () => clearTimeout(timer);
  }, []);

  // Transfer onboarding data to WeekContext localStorage keys + persist to DB
  const persistedRef = useRef(false);
  useEffect(() => {
    // localStorage for WeekContext compatibility
    if (data.platforms.length > 0) {
      localStorage.setItem("sg_onboard_platforms", JSON.stringify(data.platforms));
    }
    if (data.niche) {
      localStorage.setItem("sg_user_niche", data.niche);
    }
    if (data.tone) {
      localStorage.setItem("sg_user_tone", data.tone);
    }

    // Persist to DB via API (once)
    if (!persistedRef.current && data.platforms.length > 0) {
      persistedRef.current = true;
      fetch("/api/onboard/complete", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          niche: data.niche,
          tone: data.tone,
          platforms: data.platforms,
          voiceChoice: data.voiceChoice,
          libraryVoiceId: data.libraryVoiceId,
          selectedTier: data.selectedTier,
          productName: data.productName,
          productDescription: data.productDescription,
          voiceConsentAt: data.voiceConsentAt,
        }),
      }).catch((err) => {
        console.error("[activation] Failed to persist onboarding:", err);
        persistedRef.current = false; // allow retry
      });
    }
  }, [data]);

  function handleGoToPlan() {
    router.push("/plan/current");
  }

  return (
    <OnboardingShell step={5} showBack={false} showContinue={false}>
      <ConfettiBurst />

      <AnimatePresence>
        {showContent && (
          <motion.div
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: DURATION_ENTRY, ease: [...EASE_SPRING] }}
          >
            <OnboardingHeading
              title="Your account is active"
              subtitle={`Your first week starts now. Build In Social will create platform-native content for ${platformLabel} and beyond.`}
            />

            <motion.div
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.4, duration: DURATION_ENTRY, ease: [...EASE_SPRING] }}
            >
              <motion.div whileTap={{ scale: 0.98 }}>
                <Button
                  onClick={handleGoToPlan}
                  overrides={{ BaseButton: { style: { width: "100%" } } }}
                >
                  Build your first plan &rarr;
                </Button>
              </motion.div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </OnboardingShell>
  );
}
