"use client";

import { useState, useRef, useCallback } from "react";
import { motion, AnimatePresence, useMotionValue, useTransform, type PanInfo } from "framer-motion";
import { itemVariants } from "@/lib/motion";
import { Button, KIND, SIZE } from "baseui/button";
import { useParticleBurst } from "@/lib/hooks/useParticleBurst";
import { useBreakpoint } from "@/lib/hooks/useBreakpoint";
import { PLATFORM_CONFIGS } from "@/lib/utils/platform-config";
import type { Platform } from "@/lib/types/user";

export type VideoStatus = "draft" | "approved" | "rendering" | "ready" | "posted" | "failed";

export interface PlanVideo {
  id: string;
  platform: Platform;
  title: string;
  hook: string;
  script: string;
  durationSeconds: number;
  contentType: string;
  status: VideoStatus;
  dayOfWeek: string;
  outputUrl?: string;
}

const STATUS_CONFIG: Record<VideoStatus, { label: string; color: string; bg: string }> = {
  draft: { label: "Draft", color: "var(--text-tertiary)", bg: "var(--bg-elevated)" },
  approved: { label: "Approved", color: "var(--success)", bg: "var(--success-subtle)" },
  rendering: { label: "Rendering", color: "var(--warning)", bg: "var(--warning-subtle)" },
  ready: { label: "Ready", color: "var(--accent)", bg: "var(--accent-subtle)" },
  posted: { label: "Posted", color: "var(--text-tertiary)", bg: "var(--bg-elevated)" },
  failed: { label: "Failed", color: "var(--danger)", bg: "var(--danger-subtle)" },
};

const SWIPE_THRESHOLD = 80;

interface VideoCardProps {
  video: PlanVideo;
  index: number;
  onApprove: (id: string) => void;
  onEdit: (video: PlanVideo) => void;
}

export function VideoCard({ video, index, onApprove, onEdit }: VideoCardProps) {
  const [approving, setApproving] = useState(false);
  const [justApproved, setJustApproved] = useState(false);
  const approveRef = useRef<HTMLButtonElement>(null);
  const { isMobile } = useBreakpoint();
  const { fire: fireParticles } = useParticleBurst(approveRef, {
    count: 18,
    colors: ["rgb(36,36,36)", "rgb(60,60,60)", "#F9FAFB", "#F3F4F6"],
    sizeRange: [3, 6],
    gravity: 0.15,
    durationMs: 700,
    spread: "burst",
  });
  const status = STATUS_CONFIG[video.status];
  const cfg = PLATFORM_CONFIGS[video.platform];

  const isApproved = video.status === "approved";
  const isDraft = video.status === "draft";
  const isFailed = video.status === "failed";
  const isRendering = video.status === "rendering";

  // Swipe gesture state
  const dragX = useMotionValue(0);
  const swipeBgOpacity = useTransform(dragX, [-120, -40, 0, 40, 120], [1, 0.5, 0, 0.5, 1]);

  async function handleApprove() {
    setApproving(true);
    await new Promise((r) => setTimeout(r, 400));
    onApprove(video.id);
    setJustApproved(true);
    setApproving(false);
    fireParticles();
  }

  const handleDragEnd = useCallback(
    (_: MouseEvent | TouchEvent | PointerEvent, info: PanInfo) => {
      if (!isDraft) return;
      if (info.offset.x < -SWIPE_THRESHOLD || info.velocity.x < -300) {
        handleApprove();
      }
      if (info.offset.x > SWIPE_THRESHOLD || info.velocity.x > 300) {
        onEdit(video);
      }
    },
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [isDraft, video]
  );

  // Left border color: platform color for drafts, accent for approved, danger for failed
  const leftBorderColor = isFailed
    ? "var(--danger)"
    : isApproved
      ? "var(--accent)"
      : cfg.color;

  return (
    <div className="relative overflow-hidden rounded-[var(--radius-lg)]">
      {/* Swipe action backgrounds — mobile only, drafts only */}
      {isDraft && (
        <div className="tablet-sm:hidden">
          <motion.div
            className="absolute inset-0 flex items-center justify-end pr-6 rounded-[var(--radius-lg)]"
            style={{ backgroundColor: "var(--accent)", opacity: swipeBgOpacity }}
          >
            <span className="text-[13px] font-medium" style={{ color: "var(--text-inverse)" }}>
              Approve
            </span>
          </motion.div>
          <motion.div
            className="absolute inset-0 flex items-center justify-start pl-6 rounded-[var(--radius-lg)]"
            style={{ backgroundColor: "var(--bg-elevated)", opacity: swipeBgOpacity }}
          >
            <span className="text-[13px] font-medium" style={{ color: "var(--text-primary)" }}>
              Edit
            </span>
          </motion.div>
        </div>
      )}

      <motion.div
        variants={itemVariants}
        className="group relative rounded-[var(--radius-lg)] p-4"
        style={{
          borderLeft: `3px solid ${leftBorderColor}`,
          backgroundColor: isApproved
            ? "var(--accent-subtle)"
            : isFailed
              ? "var(--danger-subtle)"
              : "var(--bg-elevated)",
          transition: "all 150ms cubic-bezier(0.25, 0.1, 0.25, 1)",
          x: dragX,
        }}
        {...(isMobile && isDraft
          ? {
              drag: "x" as const,
              dragConstraints: { left: -120, right: 120 },
              dragElastic: 0.2,
              onDragEnd: handleDragEnd,
            }
          : {})}
        whileHover={
          !isApproved && !isFailed && !isMobile
            ? { y: -2, transition: { duration: 0.15 } }
            : undefined
        }
      >
        {/* Top row: platform + content type + duration + status */}
        <div className="flex items-center gap-2 mb-2">
          <span
            style={{
              fontSize: "var(--type-supporting-mobile)",
              fontWeight: 500,
              color: cfg.color,
            }}
          >
            {cfg.label}
          </span>
          <span
            className="px-1.5 py-0.5 rounded-sm"
            style={{
              fontSize: "var(--type-micro)",
              fontFamily: "var(--font-mono)",
              color: "var(--text-tertiary)",
              backgroundColor: "var(--bg-overlay)",
              letterSpacing: "0.03em",
              textTransform: "uppercase",
            }}
          >
            {video.contentType}
          </span>
          <span
            style={{
              fontSize: "var(--type-micro)",
              fontFamily: "var(--font-mono)",
              fontWeight: 500,
              color: "var(--text-tertiary)",
            }}
          >
            {video.durationSeconds}s
          </span>
          <div className="flex-1" />
          <span
            className="inline-flex items-center gap-1.5 text-[11px] font-medium uppercase tracking-[0.06em] px-2 py-0.5 rounded-full"
            style={{ backgroundColor: status.bg, color: status.color }}
          >
            {isRendering && (
              <span
                className="w-1.5 h-1.5 rounded-full"
                style={{
                  backgroundColor: "var(--warning)",
                  animation: "platform-pulse 2s ease-in-out infinite",
                }}
              />
            )}
            {status.label}
          </span>
        </div>

        {/* Title */}
        <p
          className="font-semibold leading-snug mb-1 line-clamp-2"
          title={video.title}
          style={{ fontSize: "var(--type-body-mobile)", color: "var(--text-primary)" }}
        >
          {video.title}
        </p>

        {/* Hook */}
        <p
          className="leading-snug line-clamp-2 italic mb-1"
          style={{ fontSize: "var(--type-supporting-mobile)", color: "var(--text-secondary)" }}
        >
          {video.hook}
        </p>

        {video.status === "approved" && (
          <motion.p
            initial={{ opacity: 0, y: 4 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.35, ease: [0.16, 1, 0.3, 1], delay: 0.15 }}
            style={{ fontSize: 12, color: "var(--text-tertiary)", lineHeight: 1.5, marginTop: 4 }}
          >
            Build In Social will render this once the week is locked.
          </motion.p>
        )}

        {/* Actions */}
        <div className="flex items-center gap-2 mt-3">
          <Button
            kind={KIND.tertiary}
            size={SIZE.compact}
            onClick={() => onEdit(video)}
            aria-label="Edit video"
          >
            <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
              <path d="M9.5 2.5L11.5 4.5L5 11H3V9L9.5 2.5Z" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
            <span className="hidden tablet-sm:inline">Edit</span>
          </Button>

          {isDraft && (
            <Button
              ref={approveRef}
              size={SIZE.compact}
              onClick={handleApprove}
              disabled={approving}
              overrides={{
                BaseButton: {
                  style: {
                    flex: "1 1 0%",
                    opacity: approving ? 0.7 : 1,
                    "@media screen and (min-width: 640px)": {
                      flex: "0 0 auto",
                    },
                  },
                },
              }}
            >
              <AnimatePresence mode="wait">
                {approving ? (
                  <motion.span key="approving" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} transition={{ duration: 0.2 }}>
                    ...
                  </motion.span>
                ) : justApproved ? (
                  <motion.span key="approved" initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 0.2 }} className="flex items-center gap-1">
                    <motion.svg width="10" height="8" viewBox="0 0 10 8" fill="none" initial={{ scale: 0.7 }} animate={{ scale: 1 }} transition={{ duration: 0.25, ease: "easeOut" }}>
                      <path d="M1 4L3.5 6.5L9 1" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                    </motion.svg>
                    Approved
                  </motion.span>
                ) : (
                  <motion.span key="approve" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} transition={{ duration: 0.2 }}>
                    Approve
                  </motion.span>
                )}
              </AnimatePresence>
            </Button>
          )}

          {isApproved && (
            <div className="flex items-center gap-1 px-3 h-8 text-[12px] font-medium" style={{ color: "var(--accent)", opacity: 0.6 }}>
              <svg width="10" height="8" viewBox="0 0 10 8" fill="none">
                <path d="M1 4L3.5 6.5L9 1" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
              Approved
            </div>
          )}

          {video.status === "rendering" && (
            <div className="flex items-center gap-2 px-3 h-8 text-[12px] font-medium" style={{ color: "var(--warning)" }}>
              <motion.span
                className="w-2 h-2 rounded-full"
                style={{ backgroundColor: "var(--warning)" }}
                animate={{ opacity: [0.4, 1, 0.4] }}
                transition={{ duration: 1.5, repeat: Infinity }}
              />
              Rendering...
            </div>
          )}

          {video.status === "ready" && video.outputUrl && (
            <Button
              size={SIZE.compact}
              onClick={(e) => {
                e.stopPropagation();
                window.open(video.outputUrl, "_blank");
              }}
            >
              <svg width="12" height="12" viewBox="0 0 12 12" fill="none" className="mr-1">
                <path d="M6 1v7M3 6l3 3 3-3M2 10h8" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
              Download
            </Button>
          )}
        </div>
      </motion.div>
    </div>
  );
}
