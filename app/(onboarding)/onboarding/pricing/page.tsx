"use client";

import { useState, useMemo, useRef, useEffect } from "react";
import { motion } from "framer-motion";
import { OnboardingShell } from "@/components/onboarding/OnboardingShell";
import { TrustLine } from "@/components/onboarding/TrustLine";
import { Button } from "@/components/tremor/Button";
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
    <OnboardingShell step={5} showContinue={false} onBack={() => goToStep(4)} wide>
      {/* Header — centered */}
      <div className="mb-6 text-center">
        <motion.h1
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.12, ease: [...EASE_SPRING] }}
          style={{
            fontWeight: 700,
            fontSize: 28,
            lineHeight: 1.15,
            letterSpacing: "-0.02em",
          }}
          className="text-gradient-brand tablet-sm:text-[34px]"
        >
          {APP.ONBOARDING.step6.title}
        </motion.h1>

        <motion.p
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.12, ease: [...EASE_SPRING], delay: 0.04 }}
          className="mt-3 mx-auto"
          style={{
            fontWeight: 400,
            fontSize: 15,
            lineHeight: 1.6,
            color: "var(--text-secondary)",
            maxWidth: 440,
          }}
        >
          {APP.ONBOARDING.step6.framingLine}
        </motion.p>
      </div>

      {/* Billing toggle */}
      <motion.div
        className="flex justify-center mb-5"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.12, duration: DURATION_ENTRY }}
      >
        <BillingToggle cycle={cycle} onChange={setCycle} />
      </motion.div>

      {/* 3-tier pricing cards — snap-scroll on mobile, grid on desktop */}
      <div
        ref={scrollRef}
        className="flex tablet-sm:grid gap-6 overflow-x-visible tablet-sm:overflow-visible snap-x snap-mandatory pb-2 -mx-4 px-4 tablet-sm:mx-0 tablet-sm:px-0 justify-center pt-6"
        style={{
          gridTemplateColumns: "repeat(3, minmax(0, 340px))",
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
                width: 300,
                minWidth: 280,
                borderRadius: "var(--radius-lg)",
                backgroundColor: isCreator ? "var(--accent-subtle)" : "var(--bg-surface)",
                border: isCreator
                  ? "1.5px solid var(--accent)"
                  : "1.5px solid var(--border-default)",
                boxShadow: isCreator
                  ? "0 0 0 3px rgba(217,119,87,0.10), 0 8px 24px rgba(217,119,87,0.10)"
                  : "var(--shadow-card-landing)",
                padding: 24,
              }}
            >
              {/* Badge */}
              {"badge" in pkg && (pkg as typeof pkg & { badge: string }).badge && (
                <motion.span
                  className="absolute left-1/2 font-semibold px-4 py-1.5 rounded-full whitespace-nowrap"
                  style={{
                    fontSize: "var(--type-micro)",
                    top: -20,
                    transform: "translateX(-50%)",
                    backgroundColor: "var(--accent)",
                    color: "var(--text-inverse)",
                    letterSpacing: "0.01em",
                    zIndex: 10,
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
                  
                  fontWeight: 400,
                  fontSize: "var(--type-section-desktop)",
                  color: "var(--text-primary)",
                }}
              >
                {pkg.name}
              </h3>
              <div className="flex items-baseline gap-1 mb-2">
                <span
                  className="font-medium font-mono"
                  style={{ fontSize: 32, color: "var(--text-primary)", fontWeight: 500 }}
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
                variant={isCreator ? "primary" : "secondary"}
                onClick={() => handleSelect(pkg.tier)}
                className="w-full"
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
