"use client";

import { useState, useEffect, useCallback, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { OnboardingShell } from "@/components/onboarding/OnboardingShell";
import { OnboardingHeading } from "@/components/onboarding/OnboardingHeading";
import { WeekCalendarView } from "@/components/onboarding/WeekCalendarView";
import { PremiumInput } from "@/components/onboarding/PremiumInput";
import { TrustLine } from "@/components/onboarding/TrustLine";
import { Button, KIND, SIZE } from "baseui/button";
import { useOnboarding } from "@/components/onboarding/OnboardingProvider";
import { LOADING_MESSAGES, EASE_SPRING } from "@/lib/constants/onboarding";
import { APP } from "@/content/app";
import { PLATFORM_CONFIGS } from "@/lib/utils/platform-config";
import type { PlanPreviewVideo, GeneratedPlanPreview } from "@/lib/types/onboarding";
import type { Platform } from "@/lib/types/user";

/* -------------------------------------------------------------------------- */
/*  Types                                                                      */
/* -------------------------------------------------------------------------- */

type Phase = "generating" | "revealed";

/* -------------------------------------------------------------------------- */
/*  Mock plan builder                                                          */
/* -------------------------------------------------------------------------- */

function buildMockPlan(platforms: Platform[], niche: string): PlanPreviewVideo[] {
  const days = ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday"];
  const titles = [
    `Why ${niche} founders are rethinking distribution in 2026`,
    `The one metric most ${niche} teams ignore (and shouldn't)`,
    `3 things I'd do differently if I restarted my ${niche} company`,
    `How to sound credible in ${niche} without being an "influencer"`,
    `The ${niche} growth playbook nobody talks about`,
  ];
  const hooks = [
    "Most founders post once, pray, and move on. Here's what actually works.",
    "Your competitors are tracking this. You're not. Let's fix that.",
    "I wasted 6 months on the wrong channel. Here's the right one.",
    "You don't need 100k followers. You need 100 of the right people.",
    "Forget virality. This is about compounding trust over time.",
  ];
  const bodies = [
    "Distribution isn't a side project. It's the main project.",
    "The best content comes from the work you're already doing.",
    "One post that makes 50 people think is worth more than one that makes 5,000 scroll.",
    "Credibility isn't about production value. It's about specificity.",
    "The founders who win at distribution are the most consistent.",
  ];
  const contentTypes = ["educational", "insight", "story", "authority", "strategy"];

  const videos: PlanPreviewVideo[] = [];
  for (let i = 0; i < 5; i++) {
    const platform = platforms[i % platforms.length];
    const cfg = PLATFORM_CONFIGS[platform];
    videos.push({
      title: titles[i],
      hook: hooks[i],
      body: bodies[i],
      cta: "Follow for more.",
      platform,
      dayOfWeek: days[i],
      contentType: contentTypes[i],
      durationSeconds: cfg.optimalDurationSeconds,
      expanded: false,
    });
  }
  return videos;
}

/* -------------------------------------------------------------------------- */
/*  Shimmer keyframes                                                          */
/* -------------------------------------------------------------------------- */

const shimmerCSS = `
@keyframes plan-shimmer {
  0% { background-position: -200% 0; }
  100% { background-position: 200% 0; }
}
`;

/* -------------------------------------------------------------------------- */
/*  Component                                                                  */
/* -------------------------------------------------------------------------- */

export default function PlanPreviewPage() {
  const { data, update, goToStep } = useOnboarding();

  const [phase, setPhase] = useState<Phase>("generating");
  const [msgIndex, setMsgIndex] = useState(0);
  const [progress, setProgress] = useState(0);
  const [plan, setPlan] = useState<PlanPreviewVideo[]>([]);
  const generationStarted = useRef(false);

  const platforms = data.platforms.length > 0 ? data.platforms : (["youtube", "linkedin"] as Platform[]);
  const niche = data.niche || "your niche";

  /* ── Phase 1: mock generation ─────────────────────────────────────────── */

  const startGeneration = useCallback(() => {
    if (generationStarted.current) return;
    generationStarted.current = true;

    setProgress(0);
    const progressStart = Date.now();
    const progressDuration = 4000;

    const progressInterval = setInterval(() => {
      const elapsed = Date.now() - progressStart;
      const pct = Math.min((elapsed / progressDuration) * 90, 90);
      setProgress(pct);
      if (pct >= 90) clearInterval(progressInterval);
    }, 50);

    let currentMsg = 0;
    const msgInterval = setInterval(() => {
      currentMsg++;
      if (currentMsg >= LOADING_MESSAGES.length) currentMsg = 0;
      setMsgIndex(currentMsg);
    }, 2500);

    setTimeout(() => {
      clearInterval(progressInterval);
      clearInterval(msgInterval);
      setProgress(100);

      const videos = buildMockPlan(platforms, niche);
      setPlan(videos);

      const generatedPlan: GeneratedPlanPreview = {
        videos,
        generatedAt: new Date().toISOString(),
      };
      update({ generatedPlan });

      setTimeout(() => setPhase("revealed"), 400);
    }, 5000);
  }, [platforms, niche, update]);

  useEffect(() => {
    startGeneration();
  }, [startGeneration]);

  return (
    <>
      <style>{shimmerCSS}</style>

      <OnboardingShell
        step={3}
        showContinue={phase === "revealed"}
        continueLabel={APP.ONBOARDING.step5.cta}
        onContinue={() => goToStep(4)}
        showBack={phase === "revealed"}
        onBack={() => goToStep(2)}
        wide={phase === "revealed"}
      >
        <AnimatePresence mode="wait">
          {/* ── GENERATING ── */}
          {phase === "generating" && (
            <motion.div
              key="generating"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.4 }}
              className="flex flex-col items-center text-center"
            >
              <h2
                className="mb-6"
                style={{
                  fontFamily: "var(--font-heading)",
                  fontSize: "var(--type-display-mobile)",
                  fontWeight: 400,
                  color: "var(--text-primary)",
                  lineHeight: 1.3,
                }}
              >
                {APP.ONBOARDING.step5.generating}
              </h2>

              <div className="h-6 flex items-center justify-center mb-6">
                <AnimatePresence mode="wait">
                  <motion.p
                    key={msgIndex}
                    initial={{ opacity: 0, y: 8 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -8 }}
                    transition={{ duration: 0.3, ease: [...EASE_SPRING] }}
                    style={{ fontSize: "var(--type-body-mobile)", color: "var(--text-secondary)" }}
                  >
                    {LOADING_MESSAGES[msgIndex]}
                  </motion.p>
                </AnimatePresence>
              </div>

              <div className="w-full mb-4">
                <div
                  className="h-1 rounded-full w-full overflow-hidden"
                  style={{ backgroundColor: "var(--bg-elevated)" }}
                >
                  <div
                    className="h-1 rounded-full"
                    style={{
                      backgroundColor: "var(--accent)",
                      width: `${progress}%`,
                      transition: progress < 90
                        ? "width 100ms linear"
                        : "width 300ms ease-out",
                    }}
                  />
                </div>
              </div>

              <TrustLine lines="1,247 plans built this week" />

              <div className="w-full space-y-3 mt-6">
                {[90, 75, 85].map((widthPct, i) => (
                  <motion.div
                    key={i}
                    initial={{ opacity: 0, y: 8 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.2 + i * 0.1, duration: 0.4, ease: [...EASE_SPRING] }}
                    className="h-14 rounded-lg"
                    style={{
                      width: `${widthPct}%`,
                      background: `linear-gradient(90deg, var(--bg-elevated) 25%, var(--bg-surface) 50%, var(--bg-elevated) 75%)`,
                      backgroundSize: "200% 100%",
                      animation: "plan-shimmer 1.8s ease-in-out infinite",
                      animationDelay: `${i * 0.15}s`,
                    }}
                  />
                ))}
              </div>
            </motion.div>
          )}

          {/* ── REVEALED ── */}
          {phase === "revealed" && (
            <motion.div
              key="revealed"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.4 }}
            >
              <OnboardingHeading
                title={APP.ONBOARDING.step5.title}
                subtitle={`${plan.length} videos ready for this week. Each built for its algorithm.`}
              />

              {/* Week calendar */}
              <WeekCalendarView videos={plan} />

              {/* Email capture — below calendar, constrained width */}
              <motion.div
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.5, duration: 0.28, ease: [...EASE_SPRING] }}
                className="mt-10 mx-auto"
                style={{ maxWidth: 480 }}
              >
                <div
                  className="rounded-[var(--radius-lg)] p-4"
                  style={{ backgroundColor: "var(--bg-elevated)" }}
                >
                  <div className="flex items-end gap-3">
                    <div className="flex-1">
                      <PremiumInput
                        type="email"
                        value={data.recoveryEmail || ""}
                        onChange={(e) => update({ recoveryEmail: e.target.value })}
                        placeholder="you@example.com"
                      />
                    </div>
                    <Button
                      kind={KIND.tertiary}
                      size={SIZE.compact}
                      disabled={!data.recoveryEmail || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(data.recoveryEmail)}
                      onClick={() => {/* saved via update already */}}
                    >
                      Save
                    </Button>
                  </div>
                  <p
                    className="mt-2"
                    style={{ fontSize: "var(--type-supporting-mobile)", color: "var(--text-tertiary)" }}
                  >
                    Save your progress — we&apos;ll email you a link to pick up where you left off.
                  </p>
                </div>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>
      </OnboardingShell>
    </>
  );
}
