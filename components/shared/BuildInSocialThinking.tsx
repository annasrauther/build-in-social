"use client";

import { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";

const SEQUENCES = {
  plan: [
    "Build In Social is reading your context...",
    "Analysing what each algorithm rewards this week...",
    "Building your YouTube hooks...",
    "Matching durations to Instagram Reels...",
    "Writing your LinkedIn scripts...",
    "Optimising your X cadence...",
    "Running the quality check...",
    "Your plan is almost ready...",
  ],
  render: [
    "Build In Social is working on your video...",
    "Generating your voiceover...",
    "Sourcing the right B-roll...",
    "Assembling in the right format...",
    "Almost done...",
  ],
  pseo: [
    "Writing your SEO page...",
    "Adding schema markup...",
    "Your page will be indexed shortly...",
  ],
} as const;

type Sequence = keyof typeof SEQUENCES;

interface BuildInSocialThinkingProps {
  sequence: Sequence;
  estimatedMs?: number;
  isComplete?: boolean;
}

export function BuildInSocialThinking({
  sequence,
  estimatedMs,
  isComplete = false,
}: BuildInSocialThinkingProps) {
  const messages = SEQUENCES[sequence];
  const [messageIndex, setMessageIndex] = useState(0);
  const [progress, setProgress] = useState(0);
  const startRef = useRef(Date.now());

  const defaultMs = sequence === "plan" ? 8000 : sequence === "render" ? 15000 : 5000;
  const duration = estimatedMs ?? defaultMs;

  // Rotate messages: hold 2200ms each, crossfade 400ms
  useEffect(() => {
    if (isComplete) return;
    const interval = setInterval(() => {
      setMessageIndex((prev) => (prev + 1) % messages.length);
    }, 2600); // 2200ms hold + 400ms crossfade
    return () => clearInterval(interval);
  }, [messages.length, isComplete]);

  // Progress bar animation — animate to 85% over estimatedMs
  useEffect(() => {
    if (isComplete) {
      setProgress(100);
      return;
    }
    const frame = () => {
      const elapsed = Date.now() - startRef.current;
      const pct = Math.min((elapsed / duration) * 85, 85);
      setProgress(pct);
      if (pct < 85) {
        rafId = requestAnimationFrame(frame);
      }
    };
    let rafId = requestAnimationFrame(frame);
    return () => cancelAnimationFrame(rafId);
  }, [duration, isComplete]);

  return (
    <div className="flex flex-col items-center py-16 gap-6">
      {/* Rotating message */}
      <div style={{ minHeight: 24 }}>
        <AnimatePresence mode="wait">
          <motion.p
            key={messageIndex}
            initial={{ opacity: 0, y: 6 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -6 }}
            transition={{ duration: 0.4 }}
            className="text-[14px] text-center"
            style={{ color: "var(--text-secondary)" }}
          >
            {messages[messageIndex]}
          </motion.p>
        </AnimatePresence>
      </div>

      {/* Progress bar */}
      <div
        className="w-full max-w-xs overflow-hidden"
        style={{
          height: 2,
          backgroundColor: "var(--bg-elevated)",
          borderRadius: "var(--radius-xs)",
        }}
      >
        <motion.div
          style={{
            height: "100%",
            backgroundColor: "var(--accent)",
            borderRadius: "var(--radius-xs)",
            width: `${progress}%`,
          }}
          animate={
            !isComplete && progress >= 85
              ? { opacity: [0.6, 1, 0.6] }
              : { opacity: 1 }
          }
          transition={
            !isComplete && progress >= 85
              ? { duration: 1.2, repeat: Infinity, ease: "easeInOut" }
              : { duration: 0.3 }
          }
        />
      </div>
    </div>
  );
}
