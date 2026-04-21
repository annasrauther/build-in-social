"use client";

import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import Link from "next/link";
import { Button } from "@/components/tremor/Button";
import { ArrowAnimated } from "@/components/marketing/ArrowAnimated";
import { Badge } from "@/components/tremor/Badge";
import { StatusCard } from "@/components/ui/StatusCard";
import { APP } from "@/content/app";
import { useWeek } from "@/lib/context/week-context";
import type { SubscriptionTier, User } from "@/lib/types/user";
import type { Video } from "@/lib/types/video";

interface UsageResponse {
  used: number;
  cap: number;
  tier: SubscriptionTier;
  resetAt: string;
}

interface DashboardClientProps {
  profile: User;
  videos: Video[];
  topPerformer: Video | null;
}

function greetingFor(now = new Date()): string {
  const h = now.getHours();
  if (h < 12) return APP.DASHBOARD.greetingMorning;
  if (h < 18) return APP.DASHBOARD.greetingAfternoon;
  return APP.DASHBOARD.greetingEvening;
}

function Shell({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className="px-5 pt-8 pb-14 sm:px-8 sm:pt-10 lg:px-10 lg:pt-8">
      <h1 className="font-serif text-[24px] font-bold tracking-tight mb-6">
        {title}
      </h1>
      <div className="flex flex-col gap-6">
        {children}
      </div>
    </div>
  );
}

export default function DashboardClient({ profile, videos, topPerformer }: DashboardClientProps) {
  const { mode: weekMode } = useWeek();
  const approved = videos.filter(
    (v) => v.status === "approved" || v.status === "ready" || v.status === "posted"
  );
  const total = videos.length;
  const ready = videos.filter((v) => v.status === "ready");
  // Intelligence panel: spec rule — hidden until user has 5+ published videos with metrics.
  const publishedCount = videos.filter((v) => v.status === "posted").length;
  const showIntelligencePanel = publishedCount >= 5;
  const onboardingDone = profile.onboardingComplete;
  const isAutopilot = weekMode === "autopilot";

  // Monthly usage against hard cap. Fetched from /api/billing/usage.
  const [usage, setUsage] = useState<UsageResponse | null>(null);
  useEffect(() => {
    let cancelled = false;
    fetch("/api/billing/usage")
      .then((r) => (r.ok ? r.json() : null))
      .then((j) => {
        if (!cancelled && j?.data) setUsage(j.data as UsageResponse);
      })
      .catch(() => undefined);
    return () => {
      cancelled = true;
    };
  }, []);

  const usageLabel = usage
    ? usage.used >= usage.cap
      ? APP.QUOTA.headerAtCap(usage.cap)
      : usage.used >= Math.floor(usage.cap * 0.8)
        ? APP.QUOTA.headerNearCap(usage.used, usage.cap)
        : APP.QUOTA.headerUsage(usage.used, usage.cap)
    : null;
  const usageTone = usage
    ? usage.used >= usage.cap
      ? "danger"
      : usage.used >= Math.floor(usage.cap * 0.8)
        ? "warning"
        : "muted"
    : "muted";

  const primaryCtaLabel =
    total > 0
      ? APP.DASHBOARD.reviewCta
      : isAutopilot
        ? APP.DASHBOARD.buildPlanCtaAutopilot
        : APP.DASHBOARD.buildPlanCta;

  const title = `${greetingFor()} ${profile.displayName.split(" ")[0] ?? ""}`.trim();

  return (
    <Shell title={title}>
      {/* A6: aria-live region announces async fetch state changes to screen readers */}
      <div
        role="status"
        aria-live="polite"
        aria-atomic="true"
        className="sr-only"
      >
        {APP.A11Y.loaded}
      </div>

      <p style={{ fontSize: "var(--type-supporting-desktop)", color: "var(--text-tertiary)" }}>
        {APP.DASHBOARD.subtitle}
      </p>

      {usageLabel && (
        <div
          className="flex flex-wrap items-center gap-2"
          aria-live="polite"
        >
          <span
            style={{
              fontSize: "var(--type-supporting-desktop)",
              fontWeight: 500,
              color:
                usageTone === "danger"
                  ? "var(--accent)"
                  : usageTone === "warning"
                    ? "var(--accent-green)"
                    : "var(--text-secondary)",
            }}
          >
            {usageLabel}
          </span>
          {usage && usage.used >= usage.cap && (
            <Button asChild className="h-auto px-3 py-1 text-xs">
              <a href="/settings/billing">{APP.SETTINGS_BILLING.upgrade}</a>
            </Button>
          )}
        </div>
      )}

      {!onboardingDone && (
        <StatusCard
          variant="setup"
          title={APP.DASHBOARD.emptyTitle}
          description={APP.DASHBOARD.emptyDescription}
          cta={APP.DASHBOARD.emptyCta}
          ctaHref="/onboarding/start"
          ctaGradient
          className=""
        />
      )}

      <div className="grid gap-5 tablet-sm:grid-cols-2 lg:grid-cols-3">
        {/* Week summary */}
        <motion.div
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.2, ease: [0.16, 1, 0.3, 1] }}
          style={{
            borderRadius: "var(--radius-lg)",
            border: "1px solid var(--border-default)",
            backgroundColor: "var(--bg-surface)",
            padding: 24,
            boxShadow: "var(--shadow-sm)",
          }}
        >
          <div className="flex items-center justify-between mb-3">
            <p style={{ fontSize: "var(--type-supporting-desktop)", color: "var(--text-tertiary)" }}>
              {APP.DASHBOARD.weekSummary}
            </p>
            <Badge variant="default">
              {total > 0
                ? APP.DASHBOARD.approved(approved.length, total)
                : APP.DASHBOARD.noApproved}
            </Badge>
          </div>
          <p style={{ fontSize: 22, fontWeight: 600, color: "var(--text-primary)", marginBottom: 16 }}>
            {total > 0 ? `${total} videos` : "Nothing yet"}
          </p>
          <Button className="group w-full" asChild>
            <Link href="/plan/current" className="flex items-center justify-center">
              {primaryCtaLabel}
              <ArrowAnimated />
            </Link>
          </Button>
          {isAutopilot && (
            <p
              className="mt-3"
              style={{
                fontSize: "var(--type-micro)",
                color: "var(--text-tertiary)",
              }}
            >
              {APP.DASHBOARD.autopilotStatusActive}
              {ready.length > 0 && (
                <span>
                  {APP.DASHBOARD.nextPostPrefix} {ready[0].title}
                </span>
              )}
            </p>
          )}
        </motion.div>

        {/* Next scheduled */}
        <motion.div
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.2, ease: [0.16, 1, 0.3, 1], delay: 0.05 }}
          style={{
            borderRadius: "var(--radius-lg)",
            border: "1px solid var(--border-default)",
            backgroundColor: "var(--bg-surface)",
            padding: 24,
            boxShadow: "var(--shadow-sm)",
          }}
        >
          <p style={{ fontSize: "var(--type-supporting-desktop)", color: "var(--text-tertiary)", marginBottom: 12 }}>
            {APP.DASHBOARD.nextScheduled}
          </p>
          {ready.length === 0 ? (
            <p style={{ fontSize: "var(--type-body-mobile)", color: "var(--text-tertiary)" }}>
              {APP.DASHBOARD.nextScheduledEmpty}
            </p>
          ) : (
            <ul className="space-y-2">
              {ready.slice(0, 3).map((v) => (
                <li key={v.id} className="flex items-center justify-between gap-2">
                  <span
                    style={{ fontSize: "var(--type-body-mobile)", color: "var(--text-primary)" }}
                    className="truncate"
                  >
                    {v.title}
                  </span>
                  <Badge variant="default">{v.platform}</Badge>
                </li>
              ))}
            </ul>
          )}
        </motion.div>

        {/* Top-performer card — shown only once the user has 5+ published
            videos so there's actually signal to surface. Silent intelligence
            data collection continues regardless. */}
        {showIntelligencePanel && (
          <motion.div
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.2, ease: [0.16, 1, 0.3, 1], delay: 0.1 }}
            style={{
              borderRadius: "var(--radius-lg)",
              border: "1px solid var(--border-default)",
              backgroundColor: "var(--bg-surface)",
              padding: 24,
              boxShadow: "var(--shadow-sm)",
            }}
          >
            <p style={{ fontSize: "var(--type-supporting-desktop)", color: "var(--text-tertiary)", marginBottom: 12 }}>
              {APP.DASHBOARD.topPerformer}
            </p>
            {topPerformer ? (
              <>
                <p style={{ fontSize: 15, fontWeight: 600, color: "var(--text-primary)", marginBottom: 4 }} className="line-clamp-2">
                  {topPerformer.title}
                </p>
                <p style={{ fontSize: "var(--type-supporting-desktop)", color: "var(--text-tertiary)" }}>
                  {topPerformer.platform} · {topPerformer.viewCount?.toLocaleString() ?? 0} views
                </p>
              </>
            ) : (
              <p style={{ fontSize: "var(--type-body-mobile)", color: "var(--text-tertiary)" }}>
                {APP.DASHBOARD.topPerformerEmpty}
              </p>
            )}
          </motion.div>
        )}
      </div>
    </Shell>
  );
}
