"use client";

import { useState, useCallback, useRef, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { PremiumInput } from "@/components/onboarding/PremiumInput";
import { DomainPreviewCard } from "@/components/onboarding/DomainPreviewCard";
import { TrustLine } from "@/components/onboarding/TrustLine";
import { Button, KIND, SIZE } from "baseui/button";
import { useOnboarding } from "@/components/onboarding/OnboardingProvider";
import { inferProduct } from "@/lib/services/infer-product";
import { SOCIAL_PROOF_LINES, EASE_SPRING, DURATION_ENTRY } from "@/lib/constants/onboarding";
import { APP } from "@/content/app";
import type { InferProductResponse } from "@/lib/types/infer-product";

const ease = [...EASE_SPRING] as [number, number, number, number];

const fadeUp = (delay: number) => ({
  initial: { opacity: 0, y: 20 },
  animate: {
    opacity: 1,
    y: 0,
    transition: { duration: DURATION_ENTRY, ease, delay },
  },
});

type InferenceState = "idle" | "loading" | "preview" | "confirmed" | "manual";

export default function StartPage() {
  const { update, goToStep } = useOnboarding();

  const [domainInput, setDomainInput] = useState("");
  const [productDescription, setProductDescription] = useState("");
  const [productName, setProductName] = useState("");
  const [inferenceState, setInferenceState] = useState<InferenceState>("idle");
  const [inferResult, setInferResult] = useState<InferProductResponse | null>(null);
  const [showManualFallback, setShowManualFallback] = useState(false);
  const [manualName, setManualName] = useState("");
  const [manualDescription, setManualDescription] = useState("");
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const abortRef = useRef<AbortController | null>(null);
  const manualNameRef = useRef<HTMLInputElement>(null);

  const canContinue = productDescription.length > 0;

  /* ---- Domain inference ---- */
  const triggerInference = useCallback(async (value: string) => {
    if (!value.trim()) {
      setInferenceState("idle");
      setInferResult(null);
      return;
    }

    abortRef.current?.abort();
    const controller = new AbortController();
    abortRef.current = controller;

    setInferenceState("loading");

    try {
      const result = await inferProduct(value, controller.signal);
      setInferResult(result);
      if (result.confidence >= 0.4 && result.name) {
        setInferenceState("preview");
      } else {
        setInferenceState("manual");
        setShowManualFallback(true);
      }
    } catch (err: unknown) {
      if (err instanceof DOMException && err.name === "AbortError") return;
      setInferenceState("manual");
      setShowManualFallback(true);
    }
  }, []);

  const handleDomainChange = useCallback(
    (value: string) => {
      setDomainInput(value);
      setInferenceState("idle");
      setInferResult(null);
      setProductDescription("");
      setProductName("");

      if (debounceRef.current) clearTimeout(debounceRef.current);
      debounceRef.current = setTimeout(() => {
        triggerInference(value);
      }, 1200);
    },
    [triggerInference],
  );

  useEffect(() => {
    return () => {
      if (debounceRef.current) clearTimeout(debounceRef.current);
    };
  }, []);

  const handleDomainBlur = useCallback(() => {
    if (domainInput.trim() && inferenceState === "idle") {
      triggerInference(domainInput);
    }
  }, [domainInput, inferenceState, triggerInference]);

  function handleConfirmPreview() {
    if (!inferResult) return;
    const desc = inferResult.description || inferResult.name;
    setProductDescription(desc);
    setProductName(inferResult.name);
    setInferenceState("confirmed");
  }

  function handleRejectPreview() {
    setInferenceState("manual");
    setShowManualFallback(true);
    setProductDescription("");
    setTimeout(() => manualNameRef.current?.focus(), 100);
  }

  function handleShowManual() {
    setShowManualFallback(true);
    setInferenceState("manual");
    setTimeout(() => manualNameRef.current?.focus(), 100);
  }

  function handleManualConfirm() {
    if (manualName.trim() && manualDescription.trim()) {
      setProductName(manualName.trim());
      setProductDescription(manualDescription.trim());
      setInferenceState("confirmed");
    }
  }

  function handleContinue() {
    const isManual = showManualFallback && inferenceState === "confirmed" && !domainInput.trim();
    update({
      productInput: isManual ? manualName : domainInput,
      productDescription,
      productDomain: domainInput || undefined,
      productName: productName || undefined,
      productOgImage: inferResult?.ogImage || undefined,
      productFaviconUrl: inferResult?.faviconUrl || undefined,
      productMetaSource: isManual ? "manual" : "domain",
      currentStep: 2,
    });
    goToStep(2);
  }

  return (
    <div
      className="relative flex min-h-dvh items-center justify-center overflow-hidden"
      style={{ backgroundColor: "var(--bg-page)" }}
    >
      <div
        className="relative z-10 flex flex-col items-center px-6 text-center"
        style={{ maxWidth: 480, margin: "0 auto", width: "100%" }}
      >
        {/* Headline */}
        <motion.h1
          {...fadeUp(0)}
          style={{
            fontSize: "var(--type-display-mobile)",
            fontFamily: "var(--font-heading)",
            fontWeight: 400,
            lineHeight: 1.15,
            color: "var(--text-primary)",
            letterSpacing: "-0.01em",
          }}
          className="mb-3 tablet-sm:text-[length:var(--type-display-desktop)]"
        >
          {APP.ONBOARDING.step1.headline}
        </motion.h1>

        {/* Subheading */}
        <motion.p
          {...fadeUp(0.04)}
          style={{
            fontSize: "var(--type-body-mobile)",
            fontWeight: 400,
            lineHeight: 1.6,
            color: "var(--text-secondary)",
          }}
          className="mb-8"
        >
          {APP.ONBOARDING.step1.subheading}
        </motion.p>

        {/* Domain input — primary */}
        <motion.div {...fadeUp(0.08)} className="w-full text-left">
          {!showManualFallback && (
            <PremiumInput
              type="text"
              value={domainInput}
              onChange={(e) => handleDomainChange(e.target.value)}
              onBlur={handleDomainBlur}
              placeholder="yourproduct.com"
              autoFocus
            />
          )}

          {/* Inference states */}
          <AnimatePresence mode="wait">
            {inferenceState === "loading" && (
              <motion.div
                key="loading"
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -4 }}
                transition={{ duration: 0.25 }}
                className="mt-4 flex items-center gap-2"
              >
                <span
                  className="text-[13px]"
                  style={{ color: "var(--text-tertiary)" }}
                >
                  Analyzing
                </span>
                {[0, 1, 2].map((i) => (
                  <motion.span
                    key={i}
                    className="block rounded-full"
                    style={{
                      width: 4,
                      height: 4,
                      backgroundColor: "var(--text-tertiary)",
                    }}
                    animate={{ opacity: [0.3, 1, 0.3] }}
                    transition={{
                      duration: 1,
                      repeat: Infinity,
                      delay: i * 0.2,
                      ease,
                    }}
                  />
                ))}
              </motion.div>
            )}

            {inferenceState === "preview" && inferResult && (
              <motion.div key="preview">
                <DomainPreviewCard
                  domain={domainInput}
                  name={inferResult.name}
                  description={inferResult.description}
                  ogImage={inferResult.ogImage}
                  faviconUrl={inferResult.faviconUrl || `https://www.google.com/s2/favicons?domain=${domainInput}&sz=64`}
                  source={inferResult.source}
                  confidence={inferResult.confidence}
                  onConfirm={handleConfirmPreview}
                  onReject={handleRejectPreview}
                />
              </motion.div>
            )}

            {inferenceState === "confirmed" && (
              <motion.div
                key="confirmed"
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -4 }}
                transition={{ duration: 0.25 }}
                className="mt-4 rounded-[var(--radius-lg)] p-5"
                style={{ backgroundColor: "var(--bg-elevated)" }}
              >
                <div className="flex items-center gap-2.5 mb-1">
                  {inferResult?.faviconUrl && (
                    /* eslint-disable-next-line @next/next/no-img-element */
                    <img
                      src={inferResult.faviconUrl}
                      alt=""
                      width={20}
                      height={20}
                      className="shrink-0 rounded"
                    />
                  )}
                  {productName && (
                    <p
                      className="text-[var(--type-body-mobile)] font-semibold truncate"
                      style={{ color: "var(--text-primary)" }}
                    >
                      {productName}
                    </p>
                  )}
                  <div
                    className="w-5 h-5 rounded-full flex items-center justify-center shrink-0"
                    style={{ backgroundColor: "var(--success-subtle)" }}
                  >
                    <svg width="10" height="8" viewBox="0 0 10 8" fill="none">
                      <path d="M1 4L3.5 6.5L9 1" stroke="var(--success)" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                    </svg>
                  </div>
                </div>
                {domainInput && (
                  <p
                    className="text-[var(--type-supporting-mobile)] mb-2"
                    style={{ fontFamily: "var(--font-mono)", fontWeight: 500, color: "var(--text-tertiary)" }}
                  >
                    {domainInput}
                  </p>
                )}
                <p
                  className="text-[var(--type-body-mobile)] leading-relaxed line-clamp-2"
                  style={{ color: "var(--text-secondary)" }}
                >
                  {productDescription}
                </p>
                <div className="mt-3">
                  <Button
                    kind={KIND.tertiary}
                    size={SIZE.compact}
                    onClick={() => {
                      setInferenceState("idle");
                      setProductDescription("");
                      setProductName("");
                    }}
                  >
                    Change
                  </Button>
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          {/* "No domain yet?" link */}
          {!showManualFallback && inferenceState !== "loading" && inferenceState !== "preview" && inferenceState !== "confirmed" && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.3 }}
              className="mt-4"
            >
              <Button kind={KIND.tertiary} size={SIZE.compact} onClick={handleShowManual}>
                No domain yet? Describe it instead
              </Button>
            </motion.div>
          )}

          {/* Manual fallback */}
          <AnimatePresence>
            {showManualFallback && inferenceState !== "confirmed" && (
              <motion.div
                key="manual-fallback"
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: "auto" }}
                exit={{ opacity: 0, height: 0 }}
                transition={{ duration: DURATION_ENTRY, ease }}
                className="overflow-hidden"
              >
                <div className="mt-4 space-y-4">
                  <PremiumInput
                    ref={manualNameRef}
                    type="text"
                    value={manualName}
                    onChange={(e) => {
                      setManualName(e.target.value);
                      if (manualDescription.trim()) {
                        setProductName(e.target.value.trim());
                      }
                    }}
                    placeholder="What's it called?"
                    autoFocus={showManualFallback}
                  />
                  <textarea
                    value={manualDescription}
                    onChange={(e) => {
                      setManualDescription(e.target.value);
                      if (manualName.trim() && e.target.value.trim()) {
                        setProductDescription(e.target.value.trim());
                        setProductName(manualName.trim());
                      } else {
                        setProductDescription("");
                      }
                    }}
                    placeholder="Describe it in a sentence or two..."
                    rows={3}
                    className="w-full text-[15px] resize-none"
                    style={{
                      border: "none",
                      borderBottom: "1px solid var(--border-subtle)",
                      backgroundColor: "transparent",
                      color: "var(--text-primary)",
                      outline: "none",
                      padding: "8px 0",
                      fontSize: 16,
                      lineHeight: 1.6,
                      caretColor: "var(--accent)",
                    }}
                  />
                  {manualName.trim() && manualDescription.trim() && (
                    <motion.div
                      initial={{ opacity: 0, y: 4 }}
                      animate={{ opacity: 1, y: 0 }}
                    >
                      <Button size={SIZE.compact} onClick={handleManualConfirm}>
                        Confirm
                      </Button>
                    </motion.div>
                  )}
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </motion.div>

        {/* CTA */}
        <motion.div {...fadeUp(0.12)} className="w-full mt-8">
          <Button
            disabled={!canContinue}
            onClick={handleContinue}
            overrides={{ BaseButton: { style: { width: "100%" } } }}
          >
            See my content plan &rarr;
          </Button>
        </motion.div>

        {/* Social proof ticker */}
        <div className="mt-8">
          <TrustLine lines={[...SOCIAL_PROOF_LINES]} />
        </div>
      </div>
    </div>
  );
}
