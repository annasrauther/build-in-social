"use client";

import { useState, useMemo, useRef, useEffect } from "react";
import { motion } from "framer-motion";
import { OnboardingShell } from "@/components/onboarding/OnboardingShell";
import { TrustLine } from "@/components/onboarding/TrustLine";
import { Button, KIND } from "baseui/button";
import { useOnboarding } from "@/components/onboarding/OnboardingProvider";
import {
  PRICING_PACKAGES,
  EASE_SPRING,
  DURATION_ENTRY,
  STAGGER_CARDS,
} from "@/lib/constants/onboarding";
import { APP } from "@/content/app";
import type { PricingTier } from "@/lib/types/onboarding";

type BillingCycle = "monthly" | "annual";

function BillingToggle({ cycle, onChange }: { cycle: BillingCycle; onChange: (c: BillingCycle) => void }) {
  return (
    <div
      className="inline-flex items-center rounded-full p-1"
      style={{ backgroundColor: "var(--bg-elevated)" }}
    >
      {(["monthly", "annual"] as const).map((c) => (
        <button
          key={c}
          type="button"
          onClick={() => onChange(c)}
          className="relative px-4 py-2 font-medium rounded-full"
          style={{
            fontSize: "var(--type-supporting-mobile)",
            minHeight: 44,
            color: cycle === c ? "var(--text-primary)" : "var(--text-tertiary)",
            backgroundColor: cycle === c ? "var(--bg-surface)" : "transparent",
            transition: "background-color 120ms, color 120ms",
          }}
        >
          {c === "monthly" ? "Monthly" : "Annual"}
          {c === "annual" && (
            <span className="ml-1.5 font-semibold" style={{ fontSize: "var(--type-micro)", color: "var(--accent)" }}>
              Save ~16%
            </span>
          )}
        </button>
      ))}
    </div>
  );
}

export default function PricingPage() {
  const { data, update, goToStep } = useOnboarding();
  const [cycle, setCycle] = useState<BillingCycle>("monthly");
  const scrollRef = useRef<HTMLDivElement>(null);

  const platformCount = data.platforms.length;

  const recommendedTier = useMemo<PricingTier>(() => {
    if (platformCount >= 4) return "studio";
    if (platformCount >= 3) return "creator";
    return "solo";
  }, [platformCount]);

  // Auto-scroll to recommended card on mobile
  useEffect(() => {
    if (!scrollRef.current) return;
    const index = PRICING_PACKAGES.findIndex((p) => p.tier === recommendedTier);
    if (index > 0) {
      const cardWidth = 280 + 16;
      scrollRef.current.scrollTo({ left: cardWidth * index - 40, behavior: "smooth" });
    }
  }, [recommendedTier]);

  function handleSelect(tier: PricingTier) {
    update({ selectedTier: tier, paymentComplete: true, currentStep: 5 });
    goToStep(5);
  }

  return (
    <OnboardingShell step={4} showContinue={false} onBack={() => goToStep(3)}>
      {/* Header */}
      <div className="mb-10">
        <motion.h1
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.12, ease: [...EASE_SPRING] }}
          style={{
            fontFamily: "var(--font-heading)",
            fontWeight: 400,
            fontSize: 24,
            lineHeight: 1.15,
            letterSpacing: "-0.02em",
            color: "var(--text-primary)",
          }}
          className="tablet-sm:text-[28px]"
        >
          {APP.ONBOARDING.step6.title}
        </motion.h1>

        <motion.p
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.12, ease: [...EASE_SPRING], delay: 0.04 }}
          className="mt-3"
          style={{
            fontFamily: "var(--font-heading)",
            fontStyle: "italic",
            fontWeight: 400,
            fontSize: 15,
            lineHeight: 1.6,
            color: "var(--text-secondary)",
          }}
        >
          {APP.ONBOARDING.step6.framingLine}
        </motion.p>
      </div>

      {/* Billing toggle */}
      <motion.div
        className="flex justify-center mb-8"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.12, duration: DURATION_ENTRY }}
      >
        <BillingToggle cycle={cycle} onChange={setCycle} />
      </motion.div>

      {/* 3-tier pricing cards — snap-scroll on mobile, grid on desktop */}
      <div
        ref={scrollRef}
        className="flex tablet-sm:grid gap-4 overflow-x-auto tablet-sm:overflow-visible snap-x snap-mandatory pb-2 -mx-6 px-6 tablet-sm:mx-0 tablet-sm:px-0"
        style={{
          gridTemplateColumns: "repeat(3, 1fr)",
          scrollbarWidth: "none",
        }}
      >
        {PRICING_PACKAGES.map((pkg, i) => {
          const isCreator = pkg.tier === "creator";
          const isMatched = pkg.tier === recommendedTier;
          const displayPrice = cycle === "annual" ? pkg.annualPrice : pkg.price;

          return (
            <motion.div
              key={pkg.tier}
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{
                delay: 0.16 + i * STAGGER_CARDS,
                duration: DURATION_ENTRY,
                ease: [...EASE_SPRING],
              }}
              className="relative flex flex-col snap-center shrink-0 tablet-sm:shrink"
              style={{
                width: 280,
                minWidth: 280,
                borderRadius: "var(--radius-lg)",
                backgroundColor: isCreator ? "var(--accent-subtle)" : "var(--bg-elevated)",
                padding: 20,
              }}
            >
              {/* Badge */}
              {"badge" in pkg && (pkg as typeof pkg & { badge: string }).badge && (
                <motion.span
                  className="absolute left-1/2 font-semibold px-3 py-1 rounded-full whitespace-nowrap"
                  style={{
                    fontSize: "var(--type-micro)",
                    top: -12,
                    transform: "translateX(-50%)",
                    backgroundColor: "var(--accent)",
                    color: "var(--text-inverse)",
                  }}
                  initial={{ opacity: 0, y: 4 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.4, duration: 0.3 }}
                >
                  {(pkg as typeof pkg & { badge: string }).badge}
                </motion.span>
              )}

              {/* Name + price */}
              <h3
                className="mb-1"
                style={{
                  fontFamily: "var(--font-heading)",
                  fontWeight: 400,
                  fontSize: "var(--type-section-desktop)",
                  color: "var(--text-primary)",
                }}
              >
                {pkg.name}
              </h3>
              <div className="flex items-baseline gap-1 mb-2">
                <span
                  className="font-medium"
                  style={{ fontSize: 32, color: "var(--text-primary)", fontFamily: "var(--font-mono)", fontWeight: 500 }}
                >
                  ${displayPrice}
                </span>
                <span style={{ fontSize: "var(--type-body-mobile)", color: "var(--text-tertiary)" }}>/mo</span>
              </div>

              {/* Outcome */}
              <p className="leading-snug mb-4" style={{ fontSize: "var(--type-supporting-mobile)", color: "var(--text-secondary)" }}>
                {pkg.outcome}
              </p>

              {/* Match indicator */}
              {isMatched && (
                <p className="font-medium mb-3" style={{ fontSize: "var(--type-supporting-mobile)", color: "var(--accent)" }}>
                  Matches your {platformCount} platform{platformCount !== 1 ? "s" : ""}
                </p>
              )}

              <div className="flex-1" />

              {/* CTA */}
              <Button
                kind={isCreator ? KIND.primary : KIND.secondary}
                onClick={() => handleSelect(pkg.tier)}
                overrides={{ BaseButton: { style: { width: "100%" } } }}
              >
                Start &mdash; ${displayPrice}/mo
              </Button>
            </motion.div>
          );
        })}
      </div>

      {/* Trial reassurance */}
      <div className="mt-4">
        <TrustLine lines={APP.ONBOARDING.step6.noCreditCard} />
      </div>
    </OnboardingShell>
  );
}
