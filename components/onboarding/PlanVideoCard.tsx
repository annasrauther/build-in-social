"use client";

import { motion } from "framer-motion";
import { PLATFORM_CONFIGS } from "@/lib/utils/platform-config";
import type { PlanPreviewVideo } from "@/lib/types/onboarding";
import type { Platform } from "@/lib/types/user";

function PlatformIcon({ platform }: { platform: Platform }) {
  const size = 14;
  switch (platform) {
    case "youtube":
      return (
        <svg width={size} height={size} viewBox="0 0 24 24" fill="none">
          <path d="M23.498 6.186a3.016 3.016 0 0 0-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505A3.017 3.017 0 0 0 .502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 0 0 2.122 2.136c1.871.505 9.376.505 9.376.505s7.505 0 9.377-.505a3.015 3.015 0 0 0 2.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814ZM9.545 15.568V8.432L15.818 12l-6.273 3.568Z" fill="currentColor" />
        </svg>
      );
    case "instagram":
      return (
        <svg width={size} height={size} viewBox="0 0 24 24" fill="none">
          <rect x="2" y="2" width="20" height="20" rx="5" stroke="currentColor" strokeWidth="1.5" />
          <circle cx="12" cy="12" r="5" stroke="currentColor" strokeWidth="1.5" />
          <circle cx="17.5" cy="6.5" r="1.25" fill="currentColor" />
        </svg>
      );
    case "linkedin":
      return (
        <svg width={size} height={size} viewBox="0 0 24 24" fill="none">
          <rect x="2" y="2" width="20" height="20" rx="3" stroke="currentColor" strokeWidth="1.5" />
          <path d="M7 10v7M7 7.01V7M11 17v-4.5c0-1.38 1.12-2.5 2.5-2.5s2.5 1.12 2.5 2.5V17" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
      );
    case "x":
      return (
        <svg width={size} height={size} viewBox="0 0 24 24" fill="none">
          <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231 5.45-6.231Zm-1.161 17.52h1.833L7.084 4.126H5.117L17.083 19.77Z" fill="currentColor" />
        </svg>
      );
  }
}

interface PlanVideoCardProps {
  video: PlanPreviewVideo;
  delay?: number;
}

export function PlanVideoCard({ video, delay = 0 }: PlanVideoCardProps) {
  const cfg = PLATFORM_CONFIGS[video.platform];

  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay, duration: 0.3, ease: [0.16, 1, 0.3, 1] }}
      className="rounded-[var(--radius-lg)] px-[14px] py-3 border-l-[3px]"
      style={{
        backgroundColor: "var(--bg-elevated)",
        borderLeftColor: cfg.color,
      }}
    >
      {/* Top row: platform icon + name + content type badge + duration */}
      <div className="flex items-center gap-2 mb-2">
        <span className="shrink-0" style={{ color: cfg.color }}>
          <PlatformIcon platform={video.platform} />
        </span>
        <span
          className="font-medium"
          style={{
            fontSize: "var(--type-supporting-mobile)",
            color: "var(--text-secondary)",
          }}
        >
          {cfg.label}
        </span>
        <span
          className="px-1.5 py-2 rounded-sm font-mono uppercase tracking-wider"
          style={{
            fontSize: "var(--type-micro)",
            color: "var(--text-tertiary)",
            backgroundColor: "var(--bg-overlay)",
          }}
        >
          {video.contentType}
        </span>
        <span
          className="ml-auto font-mono font-medium"
          style={{
            fontSize: "var(--type-micro)",
            color: "var(--text-tertiary)",
          }}
        >
          {video.durationSeconds}s
        </span>
      </div>

      {/* Title */}
      <p
        className="mb-1.5 font-semibold leading-snug"
        style={{ fontSize: "var(--type-body-mobile)", color: "var(--text-primary)" }}
      >
        {video.title}
      </p>

      {/* Hook */}
      <p
        className="mb-1.5 italic leading-snug"
        style={{ fontSize: "var(--type-supporting-mobile)", color: "var(--text-secondary)" }}
      >
        {video.hook}
      </p>

      {/* Body */}
      <p
        className="mb-2 leading-relaxed"
        style={{ fontSize: "var(--type-supporting-mobile)", color: "var(--text-secondary)" }}
      >
        {video.body}
      </p>

      {/* CTA */}
      <p
        className="font-mono"
        style={{
          fontSize: "var(--type-supporting-mobile)",
          color: "var(--text-tertiary)",
        }}
      >
        {video.cta}
      </p>
    </motion.div>
  );
}
