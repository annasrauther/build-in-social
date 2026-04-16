"use client";

import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { Button } from "@/components/tremor/Button";
import { ArrowAnimated } from "@/components/marketing/ArrowAnimated";
import { Badge } from "@/components/tremor/Badge";
import { StatusCard } from "@/components/ui/StatusCard";
import { APP } from "@/content/app";
import type { Platform, SubscriptionTier } from "@/lib/types/user";
import type { Video } from "@/lib/types/video";

interface UserProfile {
  id: string;
  displayName: string;
  niche?: string;
  platforms: Platform[];
  subscriptionTier: SubscriptionTier;
  onboardingComplete: boolean;
}

function greetingFor(now = new Date()): string {
  const h = now.getHours();
  if (h < 12) return APP.DASHBOARD.greetingMorning;
  if (h < 18) return APP.DASHBOARD.greetingAfternoon;
  return APP.DASHBOARD.greetingEvening;
}

export default function DashboardPage() {
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [profileError, setProfileError] = useState<string | null>(null);
  const [videos, setVideos] = useState<Video[] | null>(null);

  useEffect(() => {
    let cancelled = false;
    Promise.all([
      fetch("/api/user/profile").then((r) => r.json()),
      fetch("/api/videos").then((r) => r.json()).catch(() => ({ data: [] })),
    ])
      .then(([profileJson, videosJson]) => {
        if (cancelled) return;
        if (profileJson.error) {
          setProfileError(profileJson.error);
        } else if (profileJson.data) {
          setProfile(profileJson.data as UserProfile);
        }
        if (Array.isArray(videosJson?.data)) {
          setVideos(videosJson.data as Video[]);
        } else {
          setVideos([]);
        }
      })
      .catch(() => {
        if (!cancelled) setProfileError("Failed to load dashboard");
      });
    return () => {
      cancelled = true;
    };
  }, []);

  if (!profile && !profileError) {
    return <DashboardSkeleton />;
  }

  if (profileError && !profile) {
    return (
      <Shell title="Dashboard">
        <StatusCard
          variant="error"
          title="Couldn't load dashboard"
          description={APP.COMMON.errorGeneric}
          cta={APP.COMMON.retry}
          onCta={() => window.location.reload()}
          ctaGradient
        />
      </Shell>
    );
  }

  const approved = videos?.filter((v) => v.status === "approved" || v.status === "ready" || v.status === "posted") ?? [];
  const total = videos?.length ?? 0;
  const ready = videos?.filter((v) => v.status === "ready") ?? [];
  const onboardingDone = profile!.onboardingComplete;

  return (
    <Shell title={`${greetingFor()} ${profile!.displayName.split(" ")[0] ?? ""}`.trim()}>
      <p className="mb-6" style={{ fontSize: "var(--type-supporting-desktop)", color: "var(--text-tertiary)" }}>
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
          className="mb-8"
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
              {total > 0 ? APP.DASHBOARD.approved(approved.length, total) : APP.DASHBOARD.noApproved}
            </Badge>
          </div>
          <p style={{ fontSize: 22, fontWeight: 600, color: "var(--text-primary)", marginBottom: 16 }}>
            {total > 0 ? `${total} videos` : "Nothing yet"}
          </p>
          <Button className="group w-full" asChild>
            <a href="/plan/current" className="flex items-center justify-center">
              {total > 0 ? APP.DASHBOARD.reviewCta : APP.DASHBOARD.buildPlanCta}
              <ArrowAnimated />
            </a>
          </Button>
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
                  <span style={{ fontSize: "var(--type-body-mobile)", color: "var(--text-primary)" }} className="truncate">
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

function Shell({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className="px-5 pt-8 pb-14 sm:px-8 sm:pt-10 lg:px-10 lg:pt-8">
      <h1 className="font-sans text-[24px] font-bold tracking-tight mb-2">
        {title}
      </h1>
      {children}
    </div>
  );
}

function DashboardSkeleton() {
  return (
    <Shell title="Dashboard">
      <div className="skeleton-line mb-6 h-4 w-48" />
      <div className="grid gap-4 tablet-sm:grid-cols-2 lg:grid-cols-3">
        {[1, 2, 3].map((i) => (
          <div key={i} className="skeleton-line h-44" />
        ))}
      </div>
    </Shell>
  );
}
