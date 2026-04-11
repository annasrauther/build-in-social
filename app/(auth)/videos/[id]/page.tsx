"use client";

import Link from "next/link";
import { use } from "react";
import { motion } from "framer-motion";
import { pageVariants, pageTransition, containerVariants, itemVariants } from "@/lib/motion";
import { APP } from "@/content/app";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/Card";
import { ListRow } from "@/components/ui/ListRow";
import { Badge } from "@/components/ui/Badge";
import { Button, KIND, SIZE } from "baseui/button";

const MOCK_VIDEOS: Record<string, {
  id: string; platform: string; title: string;
  durationSeconds: number; status: string;
  hook: string; script: string; pseoSlug: string | null;
}> = {
  v1: {
    id: "v1",
    platform: "YouTube Shorts",
    title: "How I reduced React re-renders by 60% with one pattern",
    durationSeconds: 38,
    status: "ready",
    hook: "Most developers make this mistake without realising it — here\u2019s what I found.",
    script: "Opening hook:\nMost developers add memoization everywhere and wonder why it doesn\u2019t help.\n\nMain:\nThe pattern is context splitting — instead of one giant context, split by update frequency. Reads and writes never share the same provider.\n\nResult:\nRe-renders dropped from 340ms to 140ms on the worst screen. One pattern, no new dependencies.\n\nCTA:\nFollow for more React performance deep dives.",
    pseoSlug: "react-re-renders-pattern",
  },
  v2: {
    id: "v2",
    platform: "LinkedIn",
    title: "I almost killed my SaaS by optimising too early. Here\u2019s what I learned.",
    durationSeconds: 52,
    status: "posted",
    hook: "Here\u2019s what 90 days of consistent building taught me about SaaS distribution.",
    script: "Opening hook:\nI spent two months optimising a feature that 0.3% of users had ever touched.\n\nMain:\nThe lesson: don\u2019t optimise before you know what matters. Ship, measure, listen. The real bottleneck was always distribution, not the product.\n\nTakeaway:\nBuild in public. Not for vanity — for accountability. It forces you to ship things that are specific enough to be shareable.\n\nCTA:\nHave you made this mistake? Drop a comment.",
    pseoSlug: null,
  },
};

type VideoStatus = "draft" | "approved" | "rendering" | "ready" | "posted" | "failed";

export default function VideoDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const video = MOCK_VIDEOS[id];

  if (!video) {
    return (
      <div className="space-y-4 max-w-2xl">
        <Link
          href="/videos"
          className="text-[var(--type-supporting-mobile)] tablet-sm:text-[var(--type-supporting-desktop)]"
          style={{ color: "var(--text-tertiary)" }}
        >
          {APP.VIDEO_DETAIL.backToLibrary}
        </Link>
        <p
          className="text-[var(--type-body-mobile)] tablet-sm:text-[var(--type-body-desktop)]"
          style={{ color: "var(--text-tertiary)" }}
        >
          {APP.VIDEO_DETAIL.notFound}
        </p>
      </div>
    );
  }

  return (
    <motion.div
      className="space-y-6 max-w-2xl"
      variants={pageVariants}
      initial="initial"
      animate="animate"
      transition={pageTransition}
    >
      {/* Back */}
      <Link
        href="/videos"
        className="text-[var(--type-supporting-mobile)] tablet-sm:text-[var(--type-supporting-desktop)] flex items-center gap-1.5 transition-opacity duration-[var(--transition-fast)] hover:opacity-70"
        style={{ color: "var(--text-tertiary)" }}
      >
        {APP.VIDEO_DETAIL.backToLibrary}
      </Link>

      {/* Header */}
      <motion.div variants={itemVariants}>
        <div className="flex items-center gap-2 mb-2 flex-wrap">
          <span
            className="text-[var(--type-supporting-mobile)] tablet-sm:text-[var(--type-supporting-desktop)] font-medium"
            style={{ color: "var(--text-tertiary)" }}
          >
            {video.platform}
          </span>
          <span style={{ color: "var(--border-default)" }}>·</span>
          <span
            className="text-[var(--type-supporting-mobile)] tablet-sm:text-[var(--type-supporting-desktop)]"
            style={{ fontFamily: "var(--font-mono)", fontWeight: 500, color: "var(--text-tertiary)" }}
          >
            {video.durationSeconds}s
          </span>
          <Badge variant={video.status as VideoStatus}>
            {video.status.charAt(0).toUpperCase() + video.status.slice(1)}
          </Badge>
        </div>
        <h2
          className="text-[var(--type-section-mobile)] tablet-sm:text-[var(--type-section-desktop)] leading-snug"
          style={{ fontFamily: "var(--font-heading)", fontWeight: 400, color: "var(--text-primary)" }}
        >
          {video.title}
        </h2>
      </motion.div>

      {/* Video player mockup */}
      <motion.div variants={itemVariants}>
        <Card className="p-0 overflow-hidden">
          {/* 9:16 aspect ratio container */}
          <div className="relative mx-auto" style={{ maxWidth: "260px" }}>
            <div style={{ paddingTop: "177.78%" }} className="relative">
              <div
                className="absolute inset-0 flex flex-col items-center justify-center gap-4"
                style={{ backgroundColor: "var(--text-primary)" }}
              >
                {video.status === "ready" || video.status === "posted" ? (
                  <>
                    <button
                      className="w-14 h-14 rounded-full flex items-center justify-center transition-opacity duration-[var(--transition-fast)] hover:opacity-80"
                      style={{ backgroundColor: "rgba(255,255,255,0.15)" }}
                      aria-label={APP.VIDEO_DETAIL.playVideo}
                    >
                      <svg width="20" height="22" viewBox="0 0 20 22" fill="white">
                        <path d="M2 1.5L18 11L2 20.5V1.5Z" />
                      </svg>
                    </button>
                    <p className="text-[var(--type-supporting-mobile)] text-white opacity-50">
                      {APP.VIDEO_DETAIL.previewUnavailable}
                    </p>
                  </>
                ) : (
                  <p className="text-[var(--type-supporting-mobile)] text-white opacity-40">
                    {APP.VIDEO_DETAIL.notRendered}
                  </p>
                )}
              </div>
            </div>
          </div>

          {/* Download bar */}
          {(video.status === "ready" || video.status === "posted") && (
            <div
              className="flex items-center justify-between px-4 py-3"
              style={{ borderTop: "1px solid rgba(255,255,255,0.08)" }}
            >
              <p
                className="text-[var(--type-supporting-mobile)] tablet-sm:text-[var(--type-supporting-desktop)]"
                style={{ fontFamily: "var(--font-mono)", fontWeight: 500, color: "var(--text-tertiary)" }}
              >
                MP4 · 9:16 · {video.durationSeconds}s
              </p>
              <Button kind={KIND.tertiary} size={SIZE.compact}>
                <svg width="12" height="12" viewBox="0 0 12 12" fill="none">
                  <path d="M6 1v7M3 6l3 3 3-3M1 11h10" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
                {APP.VIDEO_DETAIL.download}
              </Button>
            </div>
          )}
        </Card>
      </motion.div>

      {/* Hook & Script */}
      <motion.div variants={itemVariants}>
        <Card className="space-y-0 p-0">
          <ListRow
            noBorder={false}
            supporting={
              <span
                className="text-[var(--type-body-mobile)] tablet-sm:text-[var(--type-body-desktop)] leading-[1.6] whitespace-normal"
                style={{ color: "var(--text-secondary)" }}
              >
                {video.hook}
              </span>
            }
          >
            <span
              className="text-[var(--type-micro)] font-medium uppercase tracking-[0.08em]"
              style={{ color: "var(--text-tertiary)" }}
            >
              {APP.VIDEO_DETAIL.openingHook}
            </span>
          </ListRow>
          <div className="px-4 py-4">
            <p
              className="text-[var(--type-micro)] font-medium uppercase tracking-[0.08em] mb-1.5"
              style={{ color: "var(--text-tertiary)" }}
            >
              {APP.VIDEO_DETAIL.script}
            </p>
            <pre
              className="text-[var(--type-supporting-mobile)] tablet-sm:text-[var(--type-supporting-desktop)] leading-[1.7] whitespace-pre-wrap"
              style={{ fontFamily: "var(--font-mono)", color: "var(--text-secondary)" }}
            >
              {video.script}
            </pre>
          </div>
        </Card>
      </motion.div>

      {/* pSEO page link */}
      {video.pseoSlug ? (
        <motion.div variants={itemVariants}>
          <Card className="flex items-center justify-between">
            <div>
              <p
                className="text-[var(--type-body-mobile)] tablet-sm:text-[var(--type-body-desktop)] font-medium"
                style={{ color: "var(--text-primary)" }}
              >
                {APP.VIDEO_DETAIL.seoArticle}
              </p>
              <p
                className="text-[var(--type-supporting-mobile)] tablet-sm:text-[var(--type-supporting-desktop)] mt-0.5"
                style={{ fontFamily: "var(--font-mono)", fontWeight: 500, color: "var(--text-tertiary)" }}
              >
                buildinsocial.app/p/{video.pseoSlug}
              </p>
            </div>
            <Link href={`/p/${video.pseoSlug}`}>
              <Button kind={KIND.tertiary} size={SIZE.compact}>
                {APP.VIDEO_DETAIL.viewSeo}
              </Button>
            </Link>
          </Card>
        </motion.div>
      ) : (
        <Card>
          <p
            className="text-[var(--type-supporting-mobile)] tablet-sm:text-[var(--type-supporting-desktop)]"
            style={{ color: "var(--text-tertiary)" }}
          >
            {APP.VIDEO_DETAIL.seoArticlePending}
          </p>
        </Card>
      )}
    </motion.div>
  );
}
