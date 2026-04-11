"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Button, KIND, SIZE } from "baseui/button";
import type { PlanVideo } from "./VideoCard";

interface VideoEditDialogProps {
  video: PlanVideo | null;
  onClose: () => void;
  onSave: (id: string, updates: { title: string; hook: string; script: string }) => void;
}

const PLATFORM_LABELS: Record<string, string> = {
  youtube: "YouTube Shorts",
  instagram: "Instagram Reels",
  linkedin: "LinkedIn",
  x: "X",
};

const focusStyle = { borderColor: "var(--accent)", outline: "none", boxShadow: "0 0 0 3px var(--accent-subtle)" };
const blurStyle = { borderColor: "var(--border-default)", boxShadow: "none" };

export function VideoEditDialog({ video, onClose, onSave }: VideoEditDialogProps) {
  const [title, setTitle] = useState("");
  const [hook, setHook] = useState("");
  const [script, setScript] = useState("");

  useEffect(() => {
    if (video) {
      setTitle(video.title);
      setHook(video.hook);
      setScript(video.script);
    }
  }, [video]);

  function handleSave() {
    if (!video) return;
    onSave(video.id, { title, hook, script });
    onClose();
  }

  useEffect(() => {
    function onKey(e: KeyboardEvent) {
      if (e.key === "Escape") onClose();
    }
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, [onClose]);

  return (
    <AnimatePresence>
      {video && (
        <>
          {/* Backdrop */}
          <motion.div
            key="backdrop"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="fixed inset-0 z-50"
            style={{ backgroundColor: "rgba(0,0,0,0.4)" }}
            onClick={onClose}
          />

          {/* Centering container */}
          <div
            className="fixed inset-0 z-50 flex items-center justify-center p-4"
            style={{ pointerEvents: "none" }}
          >
            <motion.div
              key="dialog"
              initial={{ opacity: 0, scale: 0.96, y: 8 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.96, y: 8 }}
              transition={{ duration: 0.25, ease: [0.16, 1, 0.3, 1] }}
              className="w-full max-w-lg rounded-[var(--radius-lg)]"
              style={{
                backgroundColor: "var(--bg-page)",
                border: "1px solid var(--border-default)",
                boxShadow: "var(--shadow-lg, 0 20px 60px rgba(0,0,0,0.15))",
                maxHeight: "85vh",
                display: "flex",
                flexDirection: "column",
                pointerEvents: "auto",
              }}
              role="dialog"
              aria-modal="true"
              aria-label="Edit video"
            >
              {/* Header */}
              <div className="flex items-start justify-between p-6 pb-4" style={{ flexShrink: 0 }}>
                <div>
                  <p className="text-[11px] font-medium uppercase tracking-wide mb-0.5" style={{ color: "var(--text-tertiary)" }}>
                    {PLATFORM_LABELS[video.platform] ?? video.platform} · {video.durationSeconds}s
                  </p>
                  <h2 className="text-[18px]" style={{ color: "var(--text-primary)", fontFamily: "var(--font-heading)", fontWeight: 400, letterSpacing: "-0.02em" }}>
                    Edit video
                  </h2>
                </div>
                <button
                  onClick={onClose}
                  className="w-8 h-8 flex items-center justify-center transition-colors hover:bg-[var(--bg-elevated)]"
                  style={{ color: "var(--text-tertiary)" }}
                  aria-label="Close"
                >
                  <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
                    <path d="M1 1L13 13M13 1L1 13" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
                  </svg>
                </button>
              </div>

              {/* Scrollable body */}
              <div className="space-y-4 px-6 overflow-y-auto" style={{ flex: 1, minHeight: 0 }}>
                {/* Title */}
                <div>
                  <label className="block text-[13px] font-medium mb-2" style={{ color: "var(--text-primary)" }}>
                    Title
                  </label>
                  <input
                    type="text"
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                    maxLength={120}
                    className="w-full px-3 py-2 text-[14px] rounded-[var(--radius-md)] transition-all"
                    style={{
                      border: "1px solid var(--border-default)",
                      backgroundColor: "var(--bg-surface)",
                      color: "var(--text-primary)",
                      outline: "none",
                    }}
                    onFocus={(e) => Object.assign(e.currentTarget.style, focusStyle)}
                    onBlur={(e) => Object.assign(e.currentTarget.style, blurStyle)}
                  />
                </div>

                {/* Hook */}
                <div>
                  <label className="block text-[13px] font-medium mb-2" style={{ color: "var(--text-primary)" }}>
                    Opening hook
                  </label>
                  <textarea
                    value={hook}
                    onChange={(e) => setHook(e.target.value)}
                    rows={2}
                    maxLength={200}
                    className="w-full px-3 py-2 text-[14px] rounded-[var(--radius-md)] resize-none transition-all"
                    style={{
                      border: "1px solid var(--border-default)",
                      backgroundColor: "var(--bg-surface)",
                      color: "var(--text-primary)",
                      outline: "none",
                    }}
                    onFocus={(e) => Object.assign(e.currentTarget.style, focusStyle)}
                    onBlur={(e) => Object.assign(e.currentTarget.style, blurStyle)}
                  />
                </div>

                {/* Script */}
                <div>
                  <label className="block text-[13px] font-medium mb-2" style={{ color: "var(--text-primary)" }}>
                    Script
                  </label>
                  <textarea
                    value={script}
                    onChange={(e) => setScript(e.target.value)}
                    rows={5}
                    className="w-full px-3 py-2 text-[13px] leading-[1.65] rounded-[var(--radius-md)] resize-none transition-all font-mono"
                    style={{
                      border: "1px solid var(--border-default)",
                      backgroundColor: "var(--bg-surface)",
                      color: "var(--text-primary)",
                      outline: "none",
                    }}
                    onFocus={(e) => Object.assign(e.currentTarget.style, focusStyle)}
                    onBlur={(e) => Object.assign(e.currentTarget.style, blurStyle)}
                  />
                </div>
              </div>

              {/* Footer — pinned at bottom */}
              <div className="flex gap-2 p-6 pt-4" style={{ borderTop: "1px solid var(--border-subtle)", flexShrink: 0 }}>
                <Button
                  kind={KIND.secondary}
                  size={SIZE.compact}
                  onClick={onClose}
                  overrides={{ BaseButton: { style: { flex: "1 1 0%" } } }}
                >
                  Cancel
                </Button>
                <Button
                  size={SIZE.compact}
                  onClick={handleSave}
                  overrides={{ BaseButton: { style: { flex: "1 1 0%" } } }}
                >
                  Save changes
                </Button>
              </div>
            </motion.div>
          </div>
        </>
      )}
    </AnimatePresence>
  );
}
