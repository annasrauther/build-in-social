"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import { pageVariants, pageTransition } from "@/lib/motion";
import { APP } from "@/content/app";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/Card";
import { Progress } from "@/components/ui/Progress";
import { Button } from "baseui/button";

const PREVIEW_METRICS = [
  { label: APP.INTELLIGENCE.metricBestPlatform, value: "LinkedIn", sub: "4.2\u00d7 avg reach" },
  { label: APP.INTELLIGENCE.metricTopContent, value: "Case study", sub: "62% higher watch time" },
  { label: APP.INTELLIGENCE.metricBestDay, value: "Tuesday", sub: "3.1\u00d7 impressions" },
  { label: APP.INTELLIGENCE.metricHookScore, value: "\u2014", sub: "Needs 5+ videos" },
];

export default function IntelligencePage() {
  return (
    <motion.div
      className="max-w-3xl"
      variants={pageVariants}
      initial="initial"
      animate="animate"
      transition={pageTransition}
    >
      <div className="relative">
        {/* Blurred preview cards */}
        <div
          className="grid grid-cols-1 tablet-sm:grid-cols-2 gap-4 mb-4"
          style={{ filter: "blur(6px)", pointerEvents: "none", userSelect: "none" }}
        >
          {PREVIEW_METRICS.map((m) => (
            <Card key={m.label}>
              <CardContent>
                <p
                  className="text-[var(--type-micro)] font-medium uppercase tracking-[0.07em] mb-2"
                  style={{ color: "var(--text-tertiary)" }}
                >
                  {m.label}
                </p>
                <p
                  className="text-[var(--type-display-desktop)] font-medium"
                  style={{
                    color: "var(--accent)",
                    fontFamily: "var(--font-mono)",
                    letterSpacing: "-0.02em",
                  }}
                >
                  {m.value}
                </p>
                <p
                  className="text-[var(--type-supporting-mobile)] mt-1"
                  style={{ color: "var(--text-secondary)" }}
                >
                  {m.sub}
                </p>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Blurred chart */}
        <Card className="mb-4" style={{ filter: "blur(6px)", pointerEvents: "none", userSelect: "none" } as React.CSSProperties}>
          <CardContent>
            <div className="h-32 flex items-end gap-2">
              {[40, 65, 50, 80, 55, 90, 70].map((h, i) => (
                <div
                  key={i}
                  className="flex-1 rounded-t"
                  style={{
                    height: `${h}%`,
                    backgroundColor: "var(--accent-subtle)",
                  }}
                />
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Lock overlay */}
        <motion.div
          initial={{ opacity: 0, scale: 0.96 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.4, ease: [0.16, 1, 0.3, 1] }}
          className="absolute inset-0 flex items-center justify-center"
        >
          <Card className="p-8 text-center max-w-sm mx-4" style={{ boxShadow: "var(--shadow-lg)" }}>
            <div
              className="w-12 h-12 rounded-full flex items-center justify-center mx-auto mb-4"
              style={{ backgroundColor: "var(--accent-subtle)" }}
            >
              <svg width="20" height="22" viewBox="0 0 20 22" fill="none">
                <rect
                  x="2"
                  y="10"
                  width="16"
                  height="12"
                  rx="2"
                  stroke="var(--accent)"
                  strokeWidth="1.5"
                />
                <path
                  d="M6 10V6a4 4 0 018 0v4"
                  stroke="var(--accent)"
                  strokeWidth="1.5"
                  strokeLinecap="round"
                />
              </svg>
            </div>
            <h2
              className="text-[var(--type-display-mobile)] tablet-sm:text-[var(--type-display-desktop)] mb-2"
              style={{
                fontFamily: "var(--font-heading)",
                fontWeight: 400,
                color: "var(--text-primary)",
              }}
            >
              {APP.INTELLIGENCE.lockedTitle}
            </h2>
            <p
              className="text-[var(--type-body-mobile)] tablet-sm:text-[var(--type-body-desktop)] leading-[1.6] mb-5"
              style={{ color: "var(--text-secondary)" }}
            >
              {APP.INTELLIGENCE.lockedDescription}
            </p>
            <div
              className="flex items-center justify-between px-4 py-2.5 rounded-[var(--radius-md)] mb-4"
              style={{ backgroundColor: "var(--bg-elevated)" }}
            >
              <span
                className="text-[var(--type-supporting-desktop)]"
                style={{ color: "var(--text-secondary)" }}
              >
                {APP.INTELLIGENCE.videosPublished}
              </span>
              <span
                className="text-[var(--type-supporting-desktop)] font-medium"
                style={{
                  color: "var(--text-primary)",
                  fontFamily: "var(--font-mono)",
                }}
              >
                0 / 5
              </span>
            </div>
            <Progress value={0} className="mb-5" />
            <Link href="/plan/current">
              <Button>{APP.INTELLIGENCE.lockCta}</Button>
            </Link>
          </Card>
        </motion.div>
      </div>
    </motion.div>
  );
}
