"use client";

import { useState, useMemo, useRef } from "react";
import { useRouter } from "next/navigation";
import { motion, AnimatePresence, useReducedMotion } from "framer-motion";
import { OnboardingShell } from "@/components/onboarding/OnboardingShell";
import { OnboardingHeading } from "@/components/onboarding/OnboardingHeading";
import { useOnboarding } from "@/components/onboarding/OnboardingProvider";
import { EASE_SPRING } from "@/lib/constants/onboarding";
import { APP } from "@/content/app";
import { PLATFORM_CONFIGS } from "@/lib/utils/platform-config";
import type { ContentMode } from "@/lib/types/onboarding";
import type { Platform } from "@/lib/types/user";

/* -------------------------------------------------------------------------- */
/*  Skeleton week — honest preview, no fake hooks                              */
/* -------------------------------------------------------------------------- */

interface SkeletonSlot {
  dayLabel: string;
  platform: Platform;
}

function buildSkeletonWeek(platforms: Platform[]): SkeletonSlot[] {
  // Show 5 placeholder days across the selected platforms — round-robin.
  const days = [
    "Day 1 (Monday)",
    "Day 2 (Tuesday)",
    "Day 3 (Wednesday)",
    "Day 4 (Thursday)",
    "Day 5 (Friday)",
  ];
  const list: SkeletonSlot[] = [];
  for (let i = 0; i < days.length; i++) {
    list.push({ dayLabel: days[i], platform: platforms[i % platforms.length] });
  }
  return list;
}

/* -------------------------------------------------------------------------- */
/*  Component                                                                  */
/* -------------------------------------------------------------------------- */

export default function PlanPreviewPage() {
  const router = useRouter();
  const { data, update, goToStep } = useOnboarding();
  const shouldReduceMotion = useReducedMotion();
  const persistedRef = useRef(false);
  const [activating, setActivating] = useState(false);

  // Pre-select Autopilot: CLAUDE.md rule #3 — "Autopilot is a first-class
  // feature, not a fallback." Users can still switch to Manual in one click.
  const [selectedMode, setSelectedMode] = useState<ContentMode | null>(
    data.contentMode ?? "autopilot",
  );

  // Platforms default to YouTube + LinkedIn since the platforms onboarding
  // step has moved to contextual settings. Users finalize platforms on first
  // publish attempt or from /settings/platforms.
  const platforms = useMemo<Platform[]>(
    () => (data.platforms.length > 0 ? data.platforms : ["youtube", "linkedin"]),
    [data.platforms],
  );

  const slots = useMemo(() => buildSkeletonWeek(platforms), [platforms]);

  async function handleActivate() {
    if (!selectedMode || activating) return;

    setActivating(true);
    update({ contentMode: selectedMode, currentStep: 3 });

    // Mirror onboarding selections into WeekContext localStorage keys.
    if (platforms.length > 0) {
      localStorage.setItem("sg_onboard_platforms", JSON.stringify(platforms));
    }
    if (data.niche) localStorage.setItem("sg_user_niche", data.niche);
    if (data.tone) localStorage.setItem("sg_user_tone", data.tone);

    // Persist to DB (idempotent — /api/onboard/complete handles re-entry).
    if (!persistedRef.current) {
      persistedRef.current = true;
      try {
        await fetch("/api/onboard/complete", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            niche: data.niche,
            tone: data.tone,
            platforms,
            voiceChoice: data.voiceChoice,
            libraryVoiceId: data.libraryVoiceId,
            selectedTier: data.selectedTier,
            productName: data.productName,
            productDescription: data.productDescription,
            voiceConsentAt: data.voiceConsentAt,
          }),
        });
      } catch (err) {
        console.error("[onboarding] failed to persist:", err);
        persistedRef.current = false; // allow retry
      }
    }

    router.push("/plan/current");
  }

  const entryDelay = (base: number) => (shouldReduceMotion ? 0 : base);
  const entryDuration = shouldReduceMotion ? 0 : 0.28;

  return (
    <OnboardingShell
      step={3}
      continueLabel={activating ? "Activating…" : APP.ONBOARDING.step5.cta}
      continueDisabled={selectedMode === null || activating}
      onContinue={handleActivate}
      onBack={() => goToStep(2)}
      wide
    >
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: entryDuration }}
      >
        <OnboardingHeading
          title="Here's how your week will look once you activate"
          subtitle={`5 platform-native videos across ${platforms.length} platform${platforms.length !== 1 ? "s" : ""}. Real scripts generate after you activate.`}
        />

        {/* Skeleton week list */}
        <div
          className="mt-6 mx-auto w-full max-w-[640px] rounded-[var(--radius-lg)] overflow-hidden"
          style={{
            border: "1px solid var(--border-default)",
            backgroundColor: "var(--bg-surface)",
          }}
        >
          {slots.map((slot, i) => {
            const cfg = PLATFORM_CONFIGS[slot.platform];
            return (
              <motion.div
                key={slot.dayLabel}
                initial={{ opacity: 0, y: 6 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{
                  delay: entryDelay(0.05 + i * 0.05),
                  duration: entryDuration,
                  ease: [...EASE_SPRING],
                }}
                className="flex items-start gap-3 px-4 py-3"
                style={{
                  borderBottom:
                    i < slots.length - 1 ? "1px solid var(--border-subtle)" : "none",
                }}
              >
                {/* Platform dot */}
                <span
                  aria-hidden
                  className="shrink-0 mt-1.5"
                  style={{
                    width: 8,
                    height: 8,
                    borderRadius: "50%",
                    backgroundColor: cfg.color,
                    display: "inline-block",
                  }}
                />
                <div className="flex-1 min-w-0">
                  <div
                    className="flex items-center gap-2 flex-wrap"
                    style={{ marginBottom: 6 }}
                  >
                    <span
                      style={{
                        fontSize: "var(--type-supporting-mobile)",
                        fontWeight: 600,
                        color: "var(--text-primary)",
                      }}
                    >
                      {slot.dayLabel}
                    </span>
                    <span
                      style={{
                        fontSize: "var(--type-micro)",
                        color: "var(--text-tertiary)",
                      }}
                    >
                      · {cfg.label} · ~{cfg.optimalDurationSeconds}s
                    </span>
                  </div>
                  <p
                    style={{
                      fontSize: "var(--type-supporting-mobile)",
                      color: "var(--text-tertiary)",
                      lineHeight: 1.5,
                    }}
                  >
                    Topic angle: <em>Generated after activation</em>
                  </p>
                </div>
              </motion.div>
            );
          })}
        </div>

        <p
          className="mt-4 mx-auto text-center"
          style={{
            maxWidth: 560,
            fontSize: "var(--type-supporting-mobile)",
            color: "var(--text-tertiary)",
            lineHeight: 1.55,
          }}
        >
          Real scripts generate after you activate — these run through a
          specificity check before rendering.
        </p>

        {/* ── Mode choice ── */}
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{
            delay: entryDelay(0.25),
            duration: entryDuration,
            ease: [...EASE_SPRING],
          }}
          className="mt-10 mx-auto"
          style={{ maxWidth: 560 }}
        >
          <p
            className="mb-4 font-semibold text-center"
            style={{
              fontSize: "var(--type-body-mobile)",
              color: "var(--text-primary)",
            }}
          >
            {APP.ONBOARDING.step5.modeHeading}
          </p>

          <div role="radiogroup" aria-label={APP.ONBOARDING.step5.modeHeading} className="flex flex-col sm:flex-row sm:items-stretch gap-3">
            {(
              [
                {
                  mode: "manual" as const,
                  title: APP.ONBOARDING.step5.modeManualTitle,
                  description: APP.ONBOARDING.step5.modeManualDescription,
                  badge: null,
                },
                {
                  mode: "autopilot" as const,
                  title: APP.ONBOARDING.step5.modeAutopilotTitle,
                  description: APP.ONBOARDING.step5.modeAutopilotDescription,
                  badge: APP.ONBOARDING.step5.modeAutopilotBadge,
                },
              ] as const
            ).map(({ mode, title, description, badge }) => {
              const isSelected = selectedMode === mode;
              const launchHint =
                mode === "manual" ? APP.ONBOARDING.step5.modeLaunchHint : null;
              return (
                <button
                  key={mode}
                  type="button"
                  role="radio"
                  aria-checked={isSelected}
                  onClick={() => {
                    setSelectedMode(mode);
                    update({ contentMode: mode });
                  }}
                  className="flex-1 text-left relative rounded-[var(--radius-lg)] transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--accent)] focus-visible:ring-offset-2 focus-visible:ring-offset-[var(--bg-page)]"
                  style={{
                    minHeight: 88,
                    padding: "16px 18px",
                    border: isSelected
                      ? "1.5px solid var(--accent)"
                      : "1.5px solid var(--border-default)",
                    backgroundColor: "var(--bg-elevated)",
                    boxShadow: isSelected
                      ? "0 0 0 3px rgba(217,119,87,0.10), inset 0 0 0 1000px rgba(217,119,87,0.06)"
                      : "none",
                    cursor: "pointer",
                  }}
                >
                  {badge && (
                    <span
                      className="absolute font-semibold px-2 py-0.5 rounded-full"
                      style={{
                        fontSize: "var(--type-micro)",
                        top: -10,
                        right: 14,
                        backgroundColor: "var(--accent)",
                        color: "var(--text-inverse)",
                        letterSpacing: "0.01em",
                      }}
                    >
                      {badge}
                    </span>
                  )}

                  <div className="flex items-start gap-3">
                    {/* Radio dot */}
                    <motion.div
                      className="shrink-0 rounded-full mt-0.5 flex items-center justify-center"
                      style={{
                        width: 20,
                        height: 20,
                        border: isSelected
                          ? "2px solid var(--accent)"
                          : "2px solid var(--border-default)",
                        backgroundColor: isSelected ? "var(--accent)" : "transparent",
                        transition:
                          "border-color 120ms, background-color 120ms",
                      }}
                      animate={{ scale: isSelected ? 1 : 0.92 }}
                      transition={{ type: "spring", stiffness: 500, damping: 25 }}
                    >
                      <AnimatePresence>
                        {isSelected && (
                          <motion.span
                            key="dot"
                            className="block rounded-full"
                            style={{
                              width: 7,
                              height: 7,
                              backgroundColor: "white",
                            }}
                            initial={{ scale: 0 }}
                            animate={{ scale: 1 }}
                            exit={{ scale: 0 }}
                            transition={{
                              type: "spring",
                              stiffness: 500,
                              damping: 25,
                            }}
                          />
                        )}
                      </AnimatePresence>
                    </motion.div>

                    <div>
                      <p
                        className="font-semibold leading-snug"
                        style={{
                          fontSize: "var(--type-body-mobile)",
                          color: "var(--text-primary)",
                        }}
                      >
                        {title}
                      </p>
                      <p
                        className="mt-1 leading-snug"
                        style={{
                          fontSize: "var(--type-supporting-mobile)",
                          color: "var(--text-secondary)",
                        }}
                      >
                        {description}
                      </p>
                      {launchHint && (
                        <p
                          className="mt-2 leading-snug"
                          style={{
                            fontSize: "var(--type-micro)",
                            color: "var(--accent)",
                            fontWeight: 500,
                          }}
                        >
                          {launchHint}
                        </p>
                      )}
                    </div>
                  </div>
                </button>
              );
            })}
          </div>

          <p
            className="mt-3 text-center"
            style={{
              fontSize: "var(--type-micro)",
              color: "var(--text-tertiary)",
            }}
          >
            {APP.ONBOARDING.step5.modeNote}
          </p>
        </motion.div>
      </motion.div>
    </OnboardingShell>
  );
}
