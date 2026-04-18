"use client";

import { motion } from "framer-motion";
import { Button } from "@/components/tremor/Button";
import { ArrowAnimated } from "@/components/marketing/ArrowAnimated";
import { Badge } from "@/components/tremor/Badge";
import { StatusCard } from "@/components/ui/StatusCard";
import { APP } from "@/content/app";
import { useWeek } from "@/lib/context/week-context";
import type { User } from "@/lib/types/user";
import type { Video } from "@/lib/types/video";

interface DashboardClientProps {
  profile: User;
  videos: Video[];
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

export default function DashboardClient({ profile, videos }: DashboardClientProps) {
  const { mode: weekMode } = useWeek();
  const approved = videos.filter(
    (v) => v.status === "approved" || v.status === "ready" || v.status === "posted"
  );
  const total = videos.length;
  const ready = videos.filter((v) => v.status === "ready");
  const onboardingDone = profile.onboardingComplete;
  const isAutopilot = weekMode === "autopilot";

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
            <a href="/plan/current" className="flex items-center justify-center">
              {primaryCtaLabel}
              <ArrowAnimated />
            </a>
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

        {/* Top performer */}
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
          <p style={{ fontSize: "var(--type-body-mobile)", color: "var(--text-tertiary)" }}>
            {APP.DASHBOARD.topPerformerEmpty}
          </p>
          <p style={{ fontSize: "var(--type-micro)", color: "var(--text-disabled)", marginTop: 6 }}>
            {APP.DASHBOARD.topPerformerSub}
          </p>
        </motion.div>
      </div>
    </Shell>
  );
}
