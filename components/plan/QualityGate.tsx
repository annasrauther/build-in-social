"use client";

import { useState, useCallback, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Button } from "@/components/tremor/Button";
import { APP } from "@/content/app";

interface QualityGateProps {
  onSubmit: (answers: [string, string, string], sourceContent?: string) => void;
  onAutopilot: () => void;
  loading: boolean;
  /** Optional server-side pushback message when specificityScore < 5. */
  serverPushback?: string;
}

// Spec questions — knowledge-center.md §5. Wording is canonical from APP.QUALITY_GATE.
const QUESTIONS = [
  { label: APP.QUALITY_GATE.q1, placeholder: APP.QUALITY_GATE.q1Placeholder },
  { label: APP.QUALITY_GATE.q2, placeholder: APP.QUALITY_GATE.q2Placeholder },
  { label: APP.QUALITY_GATE.q3, placeholder: APP.QUALITY_GATE.q3Placeholder },
] as const;

function getCharCountColor(len: number): string {
  if (len >= 240) return "var(--success)";
  if (len >= 200) return "var(--warning)";
  return "var(--text-tertiary)";
}

function getSpecificityLabel(score: number): { text: string; color: string } {
  if (score >= 8) return { text: "✓ Specific enough", color: "var(--success)" };
  if (score >= 5) return { text: "Getting there", color: "var(--warning)" };
  return { text: "Too vague", color: "var(--danger)" };
}

function scoreSpecificity(answers: string[]): number {
  const combined = answers.join(" ");
  const wordCount = combined.split(/\s+/).filter(Boolean).length;
  const hasNumbers = /\d/.test(combined);
  const hasSpecificWords = /shipped|built|fixed|deployed|launched|reduced|increased|refactored|debugged|implemented/i.test(combined);
  const avgLength = answers.reduce((s, a) => s + a.trim().length, 0) / 3;

  let score = 0;
  if (wordCount > 10) score += 2;
  if (wordCount > 25) score += 1;
  if (wordCount > 50) score += 1;
  if (hasNumbers) score += 2;
  if (hasSpecificWords) score += 2;
  if (avgLength > 40) score += 1;
  if (avgLength > 80) score += 1;

  return Math.min(10, score);
}

export function QualityGate({ onSubmit, onAutopilot, loading, serverPushback }: QualityGateProps) {
  const [answers, setAnswers] = useState<[string, string, string]>(["", "", ""]);
  const [sourceContent, setSourceContent] = useState("");
  const [pasteOpen, setPasteOpen] = useState(false);
  const [error, setError] = useState("");
  const [score, setScore] = useState(0);
  const debounceRef = useRef<ReturnType<typeof setTimeout>>(undefined);

  const allAnswered = answers.every((a) => a.trim().length >= 20);
  const isReady = allAnswered && score >= 5;

  function setAnswer(i: number, val: string) {
    setAnswers((prev) => {
      const next = [...prev] as [string, string, string];
      next[i] = val;
      return next;
    });
    setError("");

    if (debounceRef.current) clearTimeout(debounceRef.current);
    debounceRef.current = setTimeout(() => {
      setAnswers((current) => {
        setScore(scoreSpecificity(current));
        return current;
      });
    }, 1200);
  }

  function handleSubmit() {
    if (answers.some((a) => a.trim().length < 20)) {
      setError("Each answer needs more detail — specificity is what makes the content great.");
      return;
    }
    onSubmit(answers, sourceContent.trim() || undefined);
  }

  const handleAutoExpand = useCallback((e: React.FormEvent<HTMLTextAreaElement>) => {
    const target = e.currentTarget;
    target.style.height = "auto";
    target.style.height = target.scrollHeight + "px";
  }, []);

  const specLabel = getSpecificityLabel(score);

  return (
    <div className="rounded-[var(--radius-lg)] p-5 sm:p-8 bg-[color:var(--bg-elevated)]">
      {/* Header */}
      <div className="flex flex-col tablet-sm:flex-row tablet-sm:items-start tablet-sm:justify-between gap-2 mb-6">
        <div>
          <h3 className="text-[20px] mb-1 font-normal tracking-[-0.02em] text-[color:var(--text-primary)]">
            {APP.QUALITY_GATE.title}
          </h3>
          <p className="text-[14px] text-[color:var(--text-secondary)]">
            {APP.QUALITY_GATE.subtitle}
          </p>
        </div>
        <Button
          variant="ghost"
          className="text-sm shrink-0 self-start"
          onClick={onAutopilot}
        >
          Use autopilot instead
        </Button>
      </div>

      <div className="space-y-5">
        {QUESTIONS.map((q, i) => {
          const val = answers[i];
          const isValid = val.trim().length >= 20;
          return (
            <div key={q.label}>
              <label className="block text-[14px] font-medium mb-2 text-[color:var(--text-primary)]">
                {q.label}
              </label>
              <textarea
                value={val}
                onChange={(e) => setAnswer(i, e.target.value)}
                onInput={handleAutoExpand}
                placeholder={q.placeholder}
                maxLength={280}
                className="w-full px-4 py-3 text-[15px] leading-[1.6] min-h-[80px] rounded-[var(--radius-md)] overflow-hidden resize-none outline-none transition-all duration-[120ms] border border-[color:var(--border-default)] bg-[color:var(--bg-page)] text-[color:var(--text-primary)]"
                onFocus={(e) => {
                  e.currentTarget.style.borderColor = "var(--accent)";
                  e.currentTarget.style.boxShadow = "0 0 0 3px var(--accent-subtle)";
                }}
                onBlur={(e) => {
                  e.currentTarget.style.borderColor = "var(--border-default)";
                  e.currentTarget.style.boxShadow = "none";
                }}
              />
              <div className="flex items-center justify-between mt-1">
                <AnimatePresence>
                  {isValid && (
                    <motion.span
                      initial={{ opacity: 0, x: -4 }}
                      animate={{ opacity: 1, x: 0 }}
                      exit={{ opacity: 0 }}
                      className="text-[12px] flex items-center gap-1"
                      style={{ color: "var(--success)" }}
                    >
                      <svg width="10" height="8" viewBox="0 0 10 8" fill="none">
                        <path d="M1 4L3.5 6.5L9 1" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                      </svg>
                      Good
                    </motion.span>
                  )}
                </AnimatePresence>
                <span
                  className="text-[12px] ml-auto"
                  style={{
                    color: getCharCountColor(val.length),
                    fontFamily: "var(--font-mono)",
                    fontWeight: 500,
                  }}
                >
                  {val.length} / 280
                </span>
              </div>
            </div>
          );
        })}
      </div>

      {/* Optional source content paste */}
      <div className="mt-5">
        <button
          type="button"
          onClick={() => setPasteOpen((o) => !o)}
          className="flex items-center gap-1.5 text-[13px] font-medium bg-transparent border-none p-0 cursor-pointer min-h-[32px]"
          style={{ color: "var(--text-tertiary)" }}
        >
          <motion.svg
            width="12"
            height="12"
            viewBox="0 0 12 12"
            fill="none"
            animate={{ rotate: pasteOpen ? 45 : 0 }}
            transition={{ duration: 0.15 }}
          >
            <path d="M6 1v10M1 6h10" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
          </motion.svg>
          {APP.QUALITY_GATE.pasteToggle}
        </button>
        <AnimatePresence initial={false}>
          {pasteOpen && (
            <motion.div
              key="paste"
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: "auto", opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              transition={{ duration: 0.22, ease: [0.16, 1, 0.3, 1] }}
              style={{ overflow: "hidden" }}
            >
              <div className="mt-3">
                <label className="block text-[14px] font-medium mb-2 text-[color:var(--text-primary)]">
                  {APP.QUALITY_GATE.pasteLabel}
                </label>
                <textarea
                  value={sourceContent}
                  onChange={(e) => setSourceContent(e.target.value)}
                  onInput={handleAutoExpand}
                  placeholder={APP.QUALITY_GATE.pastePlaceholder}
                  className="w-full px-4 py-3 text-[15px] leading-[1.6] min-h-[100px] rounded-[var(--radius-md)] overflow-hidden resize-none outline-none transition-all duration-[120ms] border border-[color:var(--border-default)] bg-[color:var(--bg-page)] text-[color:var(--text-primary)]"
                  onFocus={(e) => {
                    e.currentTarget.style.borderColor = "var(--accent)";
                    e.currentTarget.style.boxShadow = "0 0 0 3px var(--accent-subtle)";
                  }}
                  onBlur={(e) => {
                    e.currentTarget.style.borderColor = "var(--border-default)";
                    e.currentTarget.style.boxShadow = "none";
                  }}
                />
                <p className="mt-1 text-[12px]" style={{ color: "var(--text-tertiary)" }}>
                  {APP.QUALITY_GATE.pasteHint}
                </p>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Specificity indicator */}
      {answers.some((a) => a.trim().length > 0) && (
        <motion.div
          initial={{ opacity: 0, height: 0 }}
          animate={{ opacity: 1, height: "auto" }}
          className="mt-6 space-y-2"
        >
          <div className="h-1.5 rounded-full overflow-hidden bg-[color:var(--bg-elevated)]">
            <motion.div
              className="h-full rounded-full"
              style={{ backgroundColor: specLabel.color }}
              initial={{ width: 0 }}
              animate={{ width: `${score * 10}%` }}
              transition={{ duration: 0.4, ease: [0.16, 1, 0.3, 1] }}
            />
          </div>
          <p
            className="text-[13px] font-medium"
            style={{ color: specLabel.color }}
          >
            {specLabel.text}
          </p>
          {score < 5 && score > 0 && (
            <p
              className="text-[13px]"
              style={{ color: "var(--warning)" }}
            >
              Add more specific details — names, numbers, outcomes.
            </p>
          )}
        </motion.div>
      )}

      {(error || serverPushback) && (
        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="text-[13px] mt-4 px-4 py-3 rounded-[var(--radius-md)]"
          style={{ color: "var(--danger)", backgroundColor: "var(--danger-subtle)" }}
        >
          {serverPushback ?? error}
        </motion.p>
      )}

      <div className="mt-6">
        <Button
          onClick={handleSubmit}
          disabled={loading || !isReady}
          className={`w-full ${loading || !isReady ? "opacity-40 cursor-not-allowed" : ""}`}
        >
          {loading ? "Building your plan..." : "Build this week\u2019s plan →"}
        </Button>
      </div>
    </div>
  );
}
