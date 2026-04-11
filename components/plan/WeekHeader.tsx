"use client";

import { useRef, useState } from "react";
import { motion } from "framer-motion";
import { useParticleBurst } from "@/lib/hooks/useParticleBurst";
import { Button, KIND, SIZE } from "baseui/button";
import { ConfirmDialog } from "@/components/ui/ConfirmDialog";

interface WeekHeaderProps {
  dateRange: string;
  totalVideos: number;
  approvedVideos: number;
  onApproveAll: () => void;
  onRegenerate: () => void;
  isRegenerating: boolean;
}

export function WeekHeader({
  dateRange,
  totalVideos,
  approvedVideos,
  onApproveAll,
  onRegenerate,
  isRegenerating,
}: WeekHeaderProps) {
  const [showRebuildConfirm, setShowRebuildConfirm] = useState(false);
  const approveAllRef = useRef<HTMLButtonElement>(null);
  const { fire: fireWeekParticles } = useParticleBurst(approveAllRef, {
    count: 60,
    colors: ["rgb(36,36,36)", "rgb(60,60,60)", "#F9FAFB", "#F3F4F6", "#1A8917"],
    sizeRange: [4, 8],
    gravity: 0.2,
    durationMs: 1200,
    spread: "full-width",
    flashOverlay: true,
  });
  const pct = totalVideos > 0 ? Math.round((approvedVideos / totalVideos) * 100) : 0;
  const allApproved = approvedVideos === totalVideos && totalVideos > 0;

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between flex-wrap gap-3">
        <div>
          <p className="text-[11px] font-medium uppercase tracking-[0.08em] mb-0.5" style={{ color: "var(--text-tertiary)" }}>
            Weekly plan
          </p>
          <h2 className="text-[20px]" style={{ color: "var(--text-primary)", letterSpacing: "-0.02em" }}>
            {dateRange}
          </h2>
        </div>

        <div className="flex items-center gap-2">
          <Button
            kind={KIND.secondary}
            onClick={() => setShowRebuildConfirm(true)}
            disabled={isRegenerating}
            overrides={{ BaseButton: { style: { opacity: isRegenerating ? 0.5 : 1 } } }}
          >
            {isRegenerating ? "Rebuilding plan..." : "Rebuild plan"}
          </Button>

          <ConfirmDialog
            open={showRebuildConfirm}
            onOpenChange={setShowRebuildConfirm}
            title="Rebuild this week's plan?"
            description="This replaces all current videos and clears any approvals. Build In Social will generate a fresh plan from scratch."
            confirmLabel="Rebuild plan"
            onConfirm={onRegenerate}
            destructive
          />

          {!allApproved && (
            <Button
              ref={approveAllRef}
              onClick={() => { onApproveAll(); fireWeekParticles(); }}
            >
              Approve all →
            </Button>
          )}

          {allApproved && (
            <span
              className="px-3 py-2 text-[13px] font-medium rounded-[var(--radius-md)]"
              style={{ backgroundColor: "var(--accent-subtle)", color: "var(--accent)" }}
            >
              All approved ✓
            </span>
          )}
        </div>
      </div>

      {/* Progress */}
      <div className="space-y-1">
        <div className="flex items-center justify-between text-[12px]">
          <span style={{ color: "var(--text-tertiary)", fontFamily: "var(--font-mono)", fontWeight: 500, fontSize: 13 }}>
            {approvedVideos}/{totalVideos} approved
          </span>
          <span style={{ color: "var(--text-tertiary)", fontFamily: "var(--font-mono)", fontWeight: 500, fontSize: 13 }}>{pct}%</span>
        </div>
        <div className="h-1.5 rounded-full overflow-hidden" style={{ backgroundColor: "var(--bg-elevated)" }}>
          <motion.div
            className="h-full rounded-full"
            style={{ backgroundColor: "var(--accent)" }}
            initial={{ width: 0 }}
            animate={{ width: `${pct}%` }}
            transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
          />
        </div>
      </div>

      {allApproved && (
        <motion.p
          initial={{ opacity: 0, y: 6 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, ease: [0.16, 1, 0.3, 1], delay: 0.3 }}
          style={{ fontSize: 13, color: "var(--text-secondary)", lineHeight: 1.5 }}
        >
          {approvedVideos} videos queued. Build In Social will begin rendering once you lock the week.
        </motion.p>
      )}
    </div>
  );
}
