"use client";

import { useState, useCallback, useRef, useId } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { RiAddLine, RiCloseLine, RiCheckLine } from "@remixicon/react";
import { PremiumInput } from "@/components/onboarding/PremiumInput";
import { PremiumTextarea } from "@/components/onboarding/PremiumTextarea";
import { DomainPreviewCard } from "@/components/onboarding/DomainPreviewCard";
import { SourceIngestPanel } from "@/components/onboarding/SourceIngestPanel";
import { TrustLine } from "@/components/onboarding/TrustLine";
import { Button } from "@/components/tremor/Button";
import { ArrowAnimated } from "@/components/marketing/ArrowAnimated";
import { Wordmark } from "@/components/ui/Wordmark";
import { useOnboarding } from "@/components/onboarding/OnboardingProvider";
import { inferProduct } from "@/lib/services/infer-product";
import { SOCIAL_PROOF_LINES, EASE_SPRING, DURATION_ENTRY } from "@/lib/constants/onboarding";
import { APP } from "@/content/app";
import type { InferProductResponse } from "@/lib/types/infer-product";
import type { IngestSourceType, IngestTopicCandidate } from "@/lib/types/ingest";

const ease = [...EASE_SPRING] as [number, number, number, number];

/* ─── Niche presets — sourced from content/app.ts ───────────────────────── */

const NICHE_PRESETS = APP.NICHE_PRESETS;

type NicheId = (typeof NICHE_PRESETS)[number]["id"];

/* ─── Niche chip ─────────────────────────────────────────────────────────── */

function NicheChip({
  label,
  selected,
  onRemove,
  onClick,
  isCustom = false,
}: {
  label: string;
  selected: boolean;
  onClick?: () => void;
  onRemove?: () => void;
  isCustom?: boolean;
}) {
  function handleKeyDown(e: React.KeyboardEvent<HTMLElement>) {
    if (onClick && (e.key === "Enter" || e.key === " ")) {
      e.preventDefault();
      onClick();
    }
  }

  return (
    <motion.span
      layout
      initial={{ opacity: 0, scale: 0.88 }}
      animate={{ opacity: 1, scale: 1 }}
      exit={{ opacity: 0, scale: 0.88 }}
      transition={{ type: "spring", stiffness: 500, damping: 30 }}
      role={onClick ? "button" : undefined}
      tabIndex={onClick ? 0 : undefined}
      aria-pressed={onClick ? selected : undefined}
      style={{
        display: "inline-flex",
        alignItems: "center",
        gap: 5,
        padding: isCustom ? "7px 8px 7px 12px" : "10px 12px",
        borderRadius: 99,
        border: `1.5px solid ${selected ? "var(--accent)" : "var(--border-default)"}`,
        backgroundColor: selected
          ? "rgba(217,119,87,0.07)"
          : "var(--bg-elevated)",
        color: selected ? "var(--accent)" : "var(--text-secondary)",
        fontSize: 13,
        fontWeight: selected ? 500 : 400,
        cursor: onClick ? "pointer" : "default",
        userSelect: "none",
        transition: "border-color 130ms ease, background-color 130ms ease, color 130ms ease",
        minHeight: 44,
        whiteSpace: "nowrap",
      }}
      onClick={onClick}
      onKeyDown={handleKeyDown}
    >
      {selected && !isCustom && (
        <RiCheckLine style={{ width: 12, height: 12, flexShrink: 0 }} />
      )}
      <span>{label}</span>
      {isCustom && onRemove && (
        <button
          type="button"
          onClick={(e) => { e.stopPropagation(); onRemove(); }}
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            width: 18,
            height: 18,
            borderRadius: 99,
            backgroundColor: "rgba(217,119,87,0.15)",
            border: "none",
            cursor: "pointer",
            color: "var(--accent)",
            padding: 0,
            marginLeft: 2,
          }}
        >
          <RiCloseLine style={{ width: 11, height: 11 }} />
        </button>
      )}
    </motion.span>
  );
}

/* ─── Right panel ────────────────────────────────────────────────────────── */

const VALUE_PROPS = [
  "The right format for YouTube, Instagram, LinkedIn, and X",
  "Your voice and tone — consistent every week",
  "A search article generated for every video",
  "Autopilot mode when you have nothing to share",
];

function RightPanel({ productName, niches }: { productName?: string; niches: string[] }) {
  const hasContext = !!(productName || niches.length > 0);

  return (
    <div
      className="h-full flex flex-col gap-6"
      style={{
        borderRadius: "var(--radius-lg)",
        border: "1px solid var(--border-default)",
        backgroundColor: "var(--bg-elevated)",
        padding: "32px 28px",
        minHeight: 520,
      }}
    >
      {/* Top: illustration area */}
      <div
        style={{
          flex: 1,
          borderRadius: "var(--radius-md)",
          backgroundColor: "var(--bg-surface)",
          border: "1px solid var(--border-subtle)",
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          padding: "28px 24px",
          gap: 20,
          overflow: "hidden",
          position: "relative",
        }}
      >
        {/* Subtle grid background */}
        <svg
          className="absolute inset-0 w-full h-full opacity-[0.035] dark:opacity-[0.06]"
          xmlns="http://www.w3.org/2000/svg"
        >
          <defs>
            <pattern id="right-grid" x="0" y="0" width="28" height="28" patternUnits="userSpaceOnUse">
              <circle cx="0.5" cy="0.5" r="0.5" fill="currentColor" />
            </pattern>
          </defs>
          <rect width="100%" height="100%" fill="url(#right-grid)" />
        </svg>

        <AnimatePresence mode="wait">
          {hasContext ? (
            <motion.div
              key="context"
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -8 }}
              transition={{ duration: 0.28, ease }}
              className="relative z-10 w-full space-y-3"
            >
              {/* Preview header */}
              <p
                style={{
                  fontSize: 11,
                  fontWeight: 600,
                  letterSpacing: "0.08em",
                  textTransform: "uppercase",
                  color: "var(--text-disabled)",
                  textAlign: "center",
                  marginBottom: 16,
                }}
              >
                Your content engine
              </p>

              {/* Mock video cards */}
              {[
                { platform: "YouTube Shorts", day: "Mon", accent: "#FF0000" },
                { platform: "Instagram Reels", day: "Wed", accent: "#E1306C" },
                { platform: "LinkedIn", day: "Thu", accent: "#0A66C2" },
                { platform: "X", day: "Sat", accent: "var(--text-primary)" },
              ].map((item, i) => (
                <motion.div
                  key={item.platform}
                  initial={{ opacity: 0, x: -12 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.08 * i, duration: 0.22, ease }}
                  style={{
                    display: "flex",
                    alignItems: "center",
                    gap: 10,
                    padding: "9px 12px",
                    borderRadius: "var(--radius-md)",
                    backgroundColor: "var(--bg-elevated)",
                    border: "1px solid var(--border-subtle)",
                  }}
                >
                  <span
                    style={{
                      width: 6,
                      height: 6,
                      borderRadius: "50%",
                      backgroundColor: item.accent,
                      flexShrink: 0,
                    }}
                  />
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div
                      style={{
                        fontSize: 11,
                        fontWeight: 500,
                        color: "var(--text-primary)",
                        marginBottom: 3,
                      }}
                    >
                      {item.platform}
                    </div>
                    <div
                      style={{
                        height: 6,
                        borderRadius: 3,
                        backgroundColor: "var(--border-default)",
                        width: `${55 + i * 10}%`,
                      }}
                    />
                  </div>
                  <span
                    style={{
                      fontSize: 10,
                      color: "var(--text-disabled)",
                      flexShrink: 0,
                    }}
                  >
                    {item.day}
                  </span>
                </motion.div>
              ))}
            </motion.div>
          ) : (
            <motion.div
              key="empty"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.2 }}
              className="relative z-10 text-center"
            >
              {/* Platform dots */}
              <div className="flex items-center justify-center gap-4 mb-5">
                {[
                  { label: "YT", color: "#FF0000" },
                  { label: "IG", color: "#E1306C" },
                  { label: "LI", color: "#0A66C2" },
                  { label: "X",  color: "var(--text-secondary)" },
                ].map((p) => (
                  <div
                    key={p.label}
                    style={{
                      width: 40,
                      height: 40,
                      borderRadius: "var(--radius-md)",
                      backgroundColor: "var(--bg-page)",
                      border: "1px solid var(--border-default)",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      fontSize: 11,
                      fontWeight: 700,
                      color: p.color,
                    }}
                  >
                    {p.label}
                  </div>
                ))}
              </div>
              <p style={{ fontSize: 13, fontWeight: 600, color: "var(--text-primary)", marginBottom: 4 }}>
                One niche. Four platforms.
              </p>
              <p style={{ fontSize: 12, color: "var(--text-tertiary)", lineHeight: 1.6 }}>
                Build In Social formats and posts<br />your content every week.
              </p>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Value props */}
      <div className="space-y-3">
        {VALUE_PROPS.map((prop) => (
          <div key={prop} className="flex items-start gap-2.5">
            <RiCheckLine
              style={{ width: 14, height: 14, color: "var(--accent)", marginTop: 2, flexShrink: 0 }}
            />
            <p style={{ fontSize: 13, color: "var(--text-secondary)", lineHeight: 1.5 }}>{prop}</p>
          </div>
        ))}
      </div>

      {/* Social proof */}
      <div
        style={{
          borderTop: "1px solid var(--border-subtle)",
          paddingTop: 16,
        }}
      >
        <TrustLine lines={[...SOCIAL_PROOF_LINES]} />
      </div>
    </div>
  );
}

/* ─── Inference state type ────────────────────────────────────────────────── */

type InferenceState = "idle" | "loading" | "preview" | "confirmed" | "manual";

/* ─── Page ────────────────────────────────────────────────────────────────── */

export default function StartPage() {
  const { data: onboardingData, update, goToStep } = useOnboarding();
  const customInputId = useId();

  // Source-ingest state
  const [ingestTopics, setIngestTopics] = useState<IngestTopicCandidate[]>(
    onboardingData.sourceTopics ?? []
  );
  const [ingestSourceType, setIngestSourceType] = useState<IngestSourceType | undefined>(
    onboardingData.sourceType
  );

  // Phase 1
  const [domainInput, setDomainInput] = useState("");
  const [productDescription, setProductDescription] = useState("");
  const [productName, setProductName] = useState("");
  const [inferenceState, setInferenceState] = useState<InferenceState>("idle");
  const [inferResult, setInferResult] = useState<InferProductResponse | null>(null);
  const [showManualFallback, setShowManualFallback] = useState(false);
  const [manualName, setManualName] = useState("");
  const [manualDescription, setManualDescription] = useState("");

  // Phase 2
  const [selectedNiches, setSelectedNiches] = useState<Set<NicheId>>(new Set());
  const [customNiches, setCustomNiches] = useState<string[]>([]);
  const [customInput, setCustomInput] = useState("");
  const [showCustomInput, setShowCustomInput] = useState(false);

  const abortRef = useRef<AbortController | null>(null);
  const manualNameRef = useRef<HTMLInputElement>(null);
  const customInputRef = useRef<HTMLInputElement>(null);

  const phase1Done =
    inferenceState === "confirmed" ||
    (showManualFallback && productDescription.length > 0);
  const totalNiches = selectedNiches.size + customNiches.length;
  const canContinue = phase1Done && totalNiches > 0;

  /* ── Inference — fires only on blur ── */
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

  const handleDomainBlur = useCallback(() => {
    if (domainInput.trim() && (inferenceState === "idle" || inferenceState === "manual")) {
      triggerInference(domainInput);
    }
  }, [domainInput, inferenceState, triggerInference]);

  const handleDomainChange = useCallback((value: string) => {
    setDomainInput(value);
    if (!value.trim()) {
      setInferenceState("idle");
      setInferResult(null);
      setProductDescription("");
      setProductName("");
    }
  }, []);

  function handleConfirmPreview() {
    if (!inferResult) return;
    setProductDescription(inferResult.description || inferResult.name);
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

  function toggleNiche(id: NicheId) {
    setSelectedNiches((prev) => {
      const next = new Set(prev);
      next.has(id) ? next.delete(id) : next.add(id);
      return next;
    });
  }

  function commitCustomNiche() {
    const val = customInput.trim();
    if (!val || customNiches.includes(val)) {
      setCustomInput("");
      setShowCustomInput(false);
      return;
    }
    setCustomNiches((prev) => [...prev, val]);
    setCustomInput("");
    setShowCustomInput(false);
  }

  function removeCustomNiche(label: string) {
    setCustomNiches((prev) => prev.filter((n) => n !== label));
  }

  function handleContinue() {
    const isManual = showManualFallback && inferenceState === "confirmed" && !domainInput.trim();
    const selectedLabels = NICHE_PRESETS.filter((n) => selectedNiches.has(n.id)).map((n) => n.label);
    const allNiches = [...selectedLabels, ...customNiches];
    const niche = allNiches.join(", ") || productName?.trim() || productDescription.split(/[.,;:]/)[0]?.trim().slice(0, 80) || "";

    update({
      productInput: isManual ? manualName : domainInput,
      productDescription,
      productDomain: domainInput || undefined,
      productName: productName || undefined,
      productOgImage: inferResult?.ogImage || undefined,
      productFaviconUrl: inferResult?.faviconUrl || undefined,
      productMetaSource: isManual ? "manual" : "domain",
      niche,
      nicheCustomEntries: customNiches,
      sourceTopics: ingestTopics.length ? ingestTopics : undefined,
      sourceType: ingestTopics.length ? ingestSourceType : undefined,
      currentStep: 2,
    });
    goToStep(2);
  }

  /* ── Layout ── */

  const formContent = (
    <div className="flex flex-col gap-7">

      {/* Phase 1: Product identity */}
      <div>
        <p
          style={{
            fontSize: 11,
            fontWeight: 600,
            letterSpacing: "0.08em",
            textTransform: "uppercase",
            color: "var(--text-disabled)",
            marginBottom: 10,
          }}
        >
          {APP.ONBOARDING.step1.productSectionLabel}
        </p>

        {!showManualFallback && (
          <PremiumInput
            type="text"
            value={domainInput}
            onChange={(e) => handleDomainChange(e.target.value)}
            onBlur={handleDomainBlur}
            onKeyDown={(e) => { if (e.key === "Enter") { e.preventDefault(); handleDomainBlur(); } }}
            placeholder={APP.ONBOARDING.step1.websitePlaceholder}
            autoFocus
          />
        )}

        <AnimatePresence mode="wait">
          {inferenceState === "loading" && (
            <motion.div
              key="loading"
              initial={{ opacity: 0, y: 6 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.2 }}
              className="mt-3 flex items-center gap-2"
            >
              <span style={{ fontSize: 13, color: "var(--text-tertiary)" }}>Analyzing</span>
              {[0, 1, 2].map((i) => (
                <motion.span
                  key={i}
                  className="block rounded-full"
                  style={{ width: 3.5, height: 3.5, backgroundColor: "var(--accent)" }}
                  animate={{ opacity: [0.3, 1, 0.3] }}
                  transition={{ duration: 0.9, repeat: Infinity, delay: i * 0.18 }}
                />
              ))}
            </motion.div>
          )}

          {inferenceState === "preview" && inferResult && (
            <motion.div key="preview" initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.25 }}>
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
              transition={{ duration: 0.25 }}
              style={{
                marginTop: 12,
                border: "1px solid var(--border-default)",
                borderRadius: "var(--radius-md)",
                padding: "14px 16px",
                backgroundColor: "var(--bg-elevated)",
              }}
            >
              <div className="flex items-center gap-2.5">
                {inferResult?.faviconUrl && (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img src={inferResult.faviconUrl} alt="" width={16} height={16} className="shrink-0 rounded" />
                )}
                <p style={{ fontSize: 14, fontWeight: 600, color: "var(--text-primary)", flex: 1, minWidth: 0 }} className="truncate">
                  {productName || domainInput}
                </p>
                <span
                  style={{
                    fontSize: 11,
                    fontWeight: 600,
                    color: "var(--success)",
                    backgroundColor: "var(--success-subtle)",
                    padding: "2px 8px",
                    borderRadius: 99,
                    flexShrink: 0,
                  }}
                >
                  Confirmed
                </span>
              </div>
              {productDescription && (
                <p style={{ fontSize: 13, color: "var(--text-tertiary)", marginTop: 6, lineHeight: 1.5 }}>
                  {productDescription}
                </p>
              )}
              <button
                type="button"
                onClick={() => {
                  setInferenceState("idle");
                  setProductDescription("");
                  setProductName("");
                  setShowManualFallback(false);
                }}
                style={{
                  marginTop: 10,
                  fontSize: 12,
                  color: "var(--text-tertiary)",
                  background: "none",
                  border: "none",
                  cursor: "pointer",
                  padding: 0,
                  textDecoration: "underline",
                  textUnderlineOffset: 2,
                }}
              >
                Change
              </button>
            </motion.div>
          )}
        </AnimatePresence>

        {!showManualFallback && !["loading","preview","confirmed"].includes(inferenceState) && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.3 }} className="mt-3">
            <button
              type="button"
              onClick={handleShowManual}
              style={{
                fontSize: 13,
                fontWeight: 500,
                color: "var(--accent)",
                background: "none",
                border: "none",
                cursor: "pointer",
                padding: 0,
                textDecoration: "underline",
                textUnderlineOffset: 3,
              }}
            >
              {APP.ONBOARDING.step1.noWebsiteLink}
            </button>
          </motion.div>
        )}

        <AnimatePresence>
          {showManualFallback && inferenceState !== "confirmed" && (
            <motion.div
              key="manual"
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: "auto" }}
              exit={{ opacity: 0, height: 0 }}
              transition={{ duration: DURATION_ENTRY, ease }}
              className="overflow-hidden"
            >
              <div className="mt-3 space-y-3">
                <PremiumInput
                  ref={manualNameRef}
                  type="text"
                  value={manualName}
                  onChange={(e) => {
                    setManualName(e.target.value);
                    if (manualDescription.trim()) setProductName(e.target.value.trim());
                  }}
                  placeholder={APP.ONBOARDING.step1.manualNamePlaceholder}
                />
                <PremiumTextarea
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
                  placeholder={APP.ONBOARDING.step1.manualDescriptionPlaceholder}
                  rows={3}
                />
                {manualName.trim() && manualDescription.trim() && (
                  <motion.div initial={{ opacity: 0, y: 4 }} animate={{ opacity: 1, y: 0 }}>
                    <Button className="text-sm" onClick={handleManualConfirm}>Confirm</Button>
                  </motion.div>
                )}
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Phase 2: Expertise niche */}
      <AnimatePresence>
        {phase1Done && (
          <motion.div
            key="niche-phase"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.32, ease, delay: 0.08 }}
          >
            <div style={{ height: 1, backgroundColor: "var(--border-subtle)", marginBottom: 20 }} />

            <p
              style={{
                fontSize: 11,
                fontWeight: 600,
                letterSpacing: "0.08em",
                textTransform: "uppercase",
                color: "var(--text-disabled)",
                marginBottom: 10,
              }}
            >
              {APP.ONBOARDING.step1.nichePhaseSectionLabel}
            </p>

            <p style={{ fontSize: 15, fontWeight: 600, color: "var(--text-primary)", marginBottom: 4 }}>
              {APP.ONBOARDING.step1.nichePhaseQuestion}
            </p>
            <p style={{ fontSize: 13, color: "var(--text-tertiary)", lineHeight: 1.5, marginBottom: 10 }}>
              {APP.ONBOARDING.step1.nichePhaseHint}
            </p>
            <p
              style={{
                fontSize: 12,
                color: "var(--text-tertiary)",
                lineHeight: 1.5,
                marginBottom: 16,
                padding: "8px 12px",
                borderRadius: "var(--radius-md)",
                backgroundColor: "var(--bg-elevated)",
                border: "1px solid var(--border-subtle)",
              }}
            >
              {APP.ONBOARDING.step1.noNewsReassurance}
            </p>

            {/* Chips */}
            <div className="flex flex-wrap gap-2 mb-4">
              <AnimatePresence>
                {NICHE_PRESETS.map((n) => (
                  <NicheChip
                    key={n.id}
                    label={n.label}
                    selected={selectedNiches.has(n.id)}
                    onClick={() => toggleNiche(n.id)}
                  />
                ))}
                {customNiches.map((label) => (
                  <NicheChip
                    key={`custom-${label}`}
                    label={label}
                    selected
                    isCustom
                    onRemove={() => removeCustomNiche(label)}
                  />
                ))}
              </AnimatePresence>
            </div>

            {/* Add custom */}
            <AnimatePresence mode="wait">
              {showCustomInput ? (
                <motion.div
                  key="custom-input"
                  initial={{ opacity: 0, y: 4 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -4 }}
                  transition={{ duration: 0.18 }}
                  className="flex items-center gap-2"
                >
                  <div
                    style={{
                      flex: 1,
                      border: "1.5px solid var(--accent)",
                      borderRadius: "var(--radius-md)",
                      backgroundColor: "var(--bg-surface)",
                      padding: "0 12px",
                      display: "flex",
                      alignItems: "center",
                    }}
                  >
                    <input
                      id={customInputId}
                      ref={customInputRef}
                      autoFocus
                      type="text"
                      className="focus:outline-none focus:ring-0"
                      value={customInput}
                      onChange={(e) => setCustomInput(e.target.value)}
                      onKeyDown={(e) => {
                        if (e.key === "Enter") { e.preventDefault(); commitCustomNiche(); }
                        if (e.key === "Escape") { setShowCustomInput(false); setCustomInput(""); }
                      }}
                      placeholder="e.g. Bootstrapped SaaS founders"
                      style={{
                        width: "100%",
                        height: 40,
                        fontSize: 13,
                        color: "var(--text-primary)",
                        backgroundColor: "transparent",
                        border: "none",
                        outline: "none",
                        caretColor: "var(--accent)",
                      }}
                    />
                  </div>
                  <Button className="text-xs shrink-0" onClick={commitCustomNiche} disabled={!customInput.trim()}>
                    Add
                  </Button>
                  <button
                    type="button"
                    onClick={() => { setShowCustomInput(false); setCustomInput(""); }}
                    style={{ background: "none", border: "none", cursor: "pointer", color: "var(--text-tertiary)", padding: 4 }}
                  >
                    <RiCloseLine style={{ width: 16, height: 16 }} />
                  </button>
                </motion.div>
              ) : (
                <motion.div
                  key="add-btn"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  className="flex flex-col gap-1.5"
                >
                  <motion.button
                    type="button"
                    onClick={() => {
                      setShowCustomInput(true);
                      setTimeout(() => customInputRef.current?.focus(), 60);
                    }}
                    style={{
                      display: "inline-flex",
                      alignSelf: "flex-start",
                      alignItems: "center",
                      gap: 6,
                      fontSize: 13,
                      fontWeight: 500,
                      color: "var(--accent)",
                      background: "rgba(217,119,87,0.06)",
                      border: "1.5px dashed var(--accent)",
                      borderRadius: 99,
                      padding: "8px 14px",
                      cursor: "pointer",
                      minHeight: 40,
                      transition: "border-color 130ms ease, color 130ms ease, background-color 130ms ease",
                    }}
                    whileHover={{ backgroundColor: "rgba(217,119,87,0.12)" } as Record<string, string>}
                  >
                    <RiAddLine style={{ width: 14, height: 14 }} />
                    {APP.ONBOARDING.step1.customNicheHint}
                  </motion.button>
                </motion.div>
              )}
            </AnimatePresence>

            {/* Context hint */}
            {totalNiches > 0 && (
              <motion.p
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.2 }}
                style={{ fontSize: 12, color: "var(--text-disabled)", marginTop: 12 }}
              >
                {totalNiches} topic{totalNiches !== 1 ? "s" : ""} selected — you can refine this in Settings at any time.
              </motion.p>
            )}

            {/* Optional source material ingest */}
            <div style={{ marginTop: 20 }}>
              <SourceIngestPanel
                initialTopics={ingestTopics}
                initialSourceType={ingestSourceType}
                onTopicsExtracted={(topics, type) => {
                  setIngestTopics(topics);
                  setIngestSourceType(type);
                }}
              />
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* CTA */}
      <div>
        <Button
          disabled={!canContinue}
          onClick={handleContinue}
          className="group w-full disabled:dark:bg-gray-700/60 disabled:dark:border-gray-600/50 disabled:dark:text-gray-400"
        >
          See my content plan
          <ArrowAnimated />
        </Button>
        {!canContinue && (
          <p style={{ fontSize: 12, color: "var(--text-disabled)", textAlign: "center", marginTop: 8 }}>
            {!phase1Done ? "Add your product to continue" : "Select at least one content topic"}
          </p>
        )}
      </div>
    </div>
  );

  return (
    <div
      className="relative min-h-dvh"
      style={{ backgroundColor: "var(--bg-page)" }}
    >
      {/* Minimal top bar with wordmark — mobile only */}
      <div className="flex items-center justify-between px-6 py-5 lg:hidden">
        <Wordmark size={16} />
      </div>

      {/* Two-column layout on desktop */}
      <div className="mx-auto flex min-h-dvh max-w-5xl flex-col gap-0 lg:flex-row lg:items-start lg:gap-16 lg:px-12 lg:py-14 px-5 pb-12">

        {/* Left: form */}
        <div className="flex-1 lg:max-w-[460px]">
          {/* Wordmark — desktop */}
          <div className="hidden lg:block mb-10">
            <Wordmark size={17} />
          </div>

          {/* Headline */}
          <motion.h1
            initial={{ opacity: 0, y: 18 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4, ease }}
            style={{
              fontSize: "clamp(28px, 5vw, 42px)",
              fontWeight: 700,
              lineHeight: 1.15,
              letterSpacing: "-0.025em",
              marginBottom: 10,
            }}
            className="text-gradient-brand"
          >
            {APP.ONBOARDING.step1.headline}
          </motion.h1>

          <motion.p
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.35, ease, delay: 0.05 }}
            style={{
              fontSize: 15,
              lineHeight: 1.6,
              color: "var(--text-secondary)",
              marginBottom: 32,
            }}
          >
            {APP.ONBOARDING.step1.subheading}
          </motion.p>

          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3, ease, delay: 0.1 }}
          >
            {formContent}
          </motion.div>
        </div>

        {/* Right: value panel — desktop only */}
        <div className="hidden lg:block lg:flex-1 lg:sticky lg:top-14 lg:max-w-[420px]">
          <RightPanel
            productName={productName || undefined}
            niches={[
              ...NICHE_PRESETS.filter((n) => selectedNiches.has(n.id)).map((n) => n.label),
              ...customNiches,
            ]}
          />
        </div>
      </div>
    </div>
  );
}
