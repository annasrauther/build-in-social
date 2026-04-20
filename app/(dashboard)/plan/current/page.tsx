"use client";

import { useEffect, useMemo, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { RiCalendarLine, RiListUnordered } from "@remixicon/react";
import { Button } from "@/components/tremor/Button";
import { Badge } from "@/components/tremor/Badge";
import { ArrowAnimated } from "@/components/marketing/ArrowAnimated";
import { QualityGate } from "@/components/plan/QualityGate";
import { StatusCard } from "@/components/ui/StatusCard";
import { WeekCalendar } from "@/components/plan/WeekCalendar";
import {
  QuotaExhaustedDialog,
  type QuotaExhaustedDetails,
} from "@/components/dashboard/QuotaExhaustedDialog";
import { APP } from "@/content/app";
import { cx } from "@/lib/utils";
import type { Platform, SubscriptionTier } from "@/lib/types/user";
import type { ScheduledVideo } from "@/lib/types/schedule";

type Mode = "choose" | "manual" | "autopilot";

interface PlanVideo {
  id: string;
  platform: Platform;
  title: string;
  hook: string;
  script: string;
  durationSeconds: number;
  contentType: string;
  status: "draft" | "approved";
  dayOfWeek: string;
}

interface UserProfile {
  id: string;
  niche?: string;
  tone: string;
  platforms: Platform[];
  brandName: string;
  displayName: string;
}

const PLATFORM_META: Record<Platform, { label: string; pillClass: string }> = {
  youtube: { label: "YouTube", pillClass: "text-[#FF0000] bg-[rgba(255,0,0,0.08)]" },
  instagram: { label: "Instagram", pillClass: "text-[#E1306C] bg-[rgba(225,48,108,0.08)]" },
  linkedin: { label: "LinkedIn", pillClass: "text-[#0A66C2] bg-[rgba(10,102,194,0.08)]" },
  x: { label: "X", pillClass: "text-[color:var(--text-secondary)] bg-[color:var(--bg-elevated)]" },
};

const SPRING = [0.16, 1, 0.3, 1] as const;

export default function CurrentPlanPage() {
  const [mode, setMode] = useState<Mode>("choose");
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [profileError, setProfileError] = useState<string | null>(null);
  const [videos, setVideos] = useState<PlanVideo[] | null>(null);
  const [loading, setLoading] = useState(false);
  const [genError, setGenError] = useState<string | null>(null);
  const [pushback, setPushback] = useState<string | null>(null);
  const [viewMode, setViewMode] = useState<"list" | "calendar">("list");
  const [quotaDetails, setQuotaDetails] = useState<QuotaExhaustedDetails | null>(null);

  // Call /api/render/faceless for a video; return true on success.
  // Surfaces the hard-cap dialog when the API responds 402 quota_exhausted.
  async function triggerRender(videoId: string): Promise<boolean> {
    try {
      const res = await fetch("/api/render/faceless", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ videoId }),
      });
      if (res.status === 402) {
        const j = (await res.json().catch(() => ({}))) as {
          error?: string;
          tier?: SubscriptionTier;
          cap?: number;
          resetAt?: string;
          upgradeTo?: SubscriptionTier | null;
        };
        if (j.error === "quota_exhausted" && j.tier && j.cap && j.resetAt) {
          setQuotaDetails({
            tier: j.tier,
            cap: j.cap,
            resetAt: j.resetAt,
            upgradeTo: j.upgradeTo ?? null,
          });
          return false;
        }
      }
      return res.ok;
    } catch {
      return false;
    }
  }

  useEffect(() => {
    let cancelled = false;
    fetch("/api/user/profile")
      .then((r) => r.json())
      .then((j) => {
        if (cancelled) return;
        if (j.error) setProfileError(j.error);
        else if (j.data) setProfile(j.data as UserProfile);
      })
      .catch(() => { if (!cancelled) setProfileError("Failed to load profile"); });
    return () => { cancelled = true; };
  }, []);

  const niche = profile?.niche?.trim() ?? "";
  const tone = profile?.tone ?? "casual";
  const platforms = useMemo<Platform[]>(
    () => (profile?.platforms?.length ? profile.platforms : []),
    [profile],
  );

  async function generate(opts: {
    mode: "manual" | "autopilot";
    qualityGateAnswers?: [string, string, string];
  }) {
    setLoading(true);
    setGenError(null);
    setPushback(null);
    try {
      const res = await fetch("/api/plan/generate", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ mode: opts.mode, platforms, niche, tone, qualityGateAnswers: opts.qualityGateAnswers }),
      });
      const json = await res.json();
      if (!res.ok) {
        if (json.error === "quality_gate_failed" && json.pushback) setPushback(json.pushback as string);
        else setGenError(json.error ?? APP.COMMON.errorGenerate);
        return;
      }
      setVideos(json.data.videos as PlanVideo[]);
      setMode(opts.mode);
    } catch {
      setGenError(APP.COMMON.errorGenerate);
    } finally {
      setLoading(false);
    }
  }

  async function approveVideo(id: string) {
    // Approve optimistically; fire the render and revert on quota rejection.
    setVideos((prev) =>
      prev?.map((v) => (v.id === id ? { ...v, status: "approved" as const } : v)) ?? null,
    );
    const ok = await triggerRender(id);
    if (!ok) {
      setVideos((prev) =>
        prev?.map((v) => (v.id === id ? { ...v, status: "draft" as const } : v)) ?? null,
      );
    }
  }
  async function approveAll() {
    if (!videos) return;
    const targets = videos.filter((v) => v.status !== "approved");
    // Flip all to approved first; back out any that the quota rejects.
    setVideos((prev) => prev?.map((v) => ({ ...v, status: "approved" as const })) ?? null);
    for (const v of targets) {
      const ok = await triggerRender(v.id);
      if (!ok) {
        // Quota dialog has been shown — revert the remaining videos we haven't
        // rendered yet back to draft so the user can upgrade and retry.
        setVideos((prev) =>
          prev?.map((x) =>
            targets.some((t) => t.id === x.id) && x.status === "approved" && x.id === v.id
              ? { ...x, status: "draft" as const }
              : x,
          ) ?? null,
        );
        break;
      }
    }
  }
  // P1-16: In autopilot mode, videos publish automatically.
  // "Hold for review" is the inverted default — user intervenes only to stop.
  // Reverts status to "draft" on all videos so the autopilot loop won't publish.
  function holdWeekForReview() {
    setVideos((prev) => prev?.map((v) => ({ ...v, status: "draft" as const })) ?? null);
  }
  function startFresh() {
    setVideos(null);
    setMode("choose");
    setGenError(null);
    setPushback(null);
  }

  if (!profile && !profileError) return <PlanShellSkeleton />;

  if (profileError && !profile) {
    return (
      <PlanShell>
        <StatusCard
          variant="error"
          title="Couldn't load your plan"
          description={APP.COMMON.errorGeneric}
          cta={APP.COMMON.retry}
          onCta={() => window.location.reload()}
          ctaGradient
        />
      </PlanShell>
    );
  }

  if (!niche || platforms.length === 0) {
    return (
      <PlanShell>
        <StatusCard
          variant="setup"
          title="Finish onboarding first"
          description="Build In Social needs your niche and platform list before it can build a week of content."
          cta="Continue setup"
          ctaHref="/onboarding/start"
          ctaGradient
        />
      </PlanShell>
    );
  }

  if (videos) {
    const approvedCount = videos.filter((v) => v.status === "approved").length;

    // Map PlanVideos → ScheduledVideo for calendar
    const scheduledVideos: ScheduledVideo[] = videos.map((v) => {
      const dayMap: Record<string, ScheduledVideo["scheduledDay"]> = {
        mon: "Mon", tue: "Tue", wed: "Wed", thu: "Thu",
        fri: "Fri", sat: "Sat", sun: "Sun",
      };
      return {
        videoId: v.id,
        title: v.title,
        platform: v.platform,
        scheduledDay: dayMap[v.dayOfWeek.toLowerCase()] ?? "Mon",
        status: v.status,
      };
    });

    return (
      <PlanShell>
        {/* Week header */}
        <div className="mb-8 flex flex-col tablet-sm:flex-row tablet-sm:items-end tablet-sm:justify-between gap-4">
          <div>
            <h2 className="font-serif text-xl font-bold tracking-tight">
              {APP.PLAN.weeklyPlanLabel}
            </h2>
            <p className="mt-1 text-[13px] text-[color:var(--text-tertiary)]">
              {APP.DASHBOARD.approved(approvedCount, videos.length)} ·{" "}
              <span className={mode === "autopilot" ? "text-[color:var(--accent)]" : "text-[color:var(--text-tertiary)]"}>
                {mode === "autopilot" ? APP.DASHBOARD.modeAutopilot : APP.DASHBOARD.modeManual}
              </span>
            </p>
          </div>
          <div className="flex gap-2">
            {/* View toggle */}
            <div className="flex items-center rounded-[var(--radius-md)] border border-[color:var(--border-default)] overflow-hidden">
              <button
                onClick={() => setViewMode("list")}
                className={cx(
                  "flex items-center gap-1.5 px-3 min-h-[36px] text-[12px] font-medium transition-colors duration-150",
                  viewMode === "list"
                    ? "bg-[color:var(--bg-elevated)] text-[color:var(--text-primary)]"
                    : "bg-transparent text-[color:var(--text-tertiary)] hover:text-[color:var(--text-secondary)]"
                )}
                aria-label={APP.PLAN_UI.listView}
                title={APP.PLAN_UI.listView}
              >
                <RiListUnordered className="h-3.5 w-3.5" aria-hidden="true" />
                <span className="hidden sm:inline">{APP.PLAN_UI.listView}</span>
              </button>
              <button
                onClick={() => setViewMode("calendar")}
                className={cx(
                  "flex items-center gap-1.5 px-3 min-h-[36px] text-[12px] font-medium transition-colors duration-150",
                  viewMode === "calendar"
                    ? "bg-[color:var(--bg-elevated)] text-[color:var(--text-primary)]"
                    : "bg-transparent text-[color:var(--text-tertiary)] hover:text-[color:var(--text-secondary)]"
                )}
                aria-label={APP.PLAN_UI.calendarView}
                title={APP.PLAN_UI.calendarView}
              >
                <RiCalendarLine className="h-3.5 w-3.5" aria-hidden="true" />
                <span className="hidden sm:inline">{APP.PLAN_UI.calendarView}</span>
              </button>
            </div>
            <Button variant="secondary" onClick={startFresh}>{APP.PLAN.startFresh}</Button>
            {/* P1-16: autopilot publishes automatically — show "Hold" (inverted default).
                Manual mode keeps Approve All. */}
            {mode === "autopilot" ? (
              <Button
                variant="secondary"
                onClick={holdWeekForReview}
                disabled={videos.every((v) => v.status === "draft")}
              >
                Hold this week for review
              </Button>
            ) : (
              <Button onClick={approveAll} disabled={approvedCount === videos.length}>{APP.PLAN.approveAll}</Button>
            )}
          </div>
        </div>

        {/* Calendar view */}
        {viewMode === "calendar" && (
          <motion.div
            key="calendar"
            initial={{ opacity: 0, y: 6 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
          >
            <WeekCalendar initialVideos={scheduledVideos} />
          </motion.div>
        )}

        {/* Quota-exhausted dialog — shown when the render API returns 402. */}
        <QuotaExhaustedDialog
          open={quotaDetails !== null}
          onOpenChange={(o) => { if (!o) setQuotaDetails(null); }}
          details={quotaDetails}
        />

        {/* List view */}
        {viewMode === "list" && (
          <ul className="space-y-3">
            <AnimatePresence initial={false}>
              {videos.map((v, i) => {
                const meta = PLATFORM_META[v.platform];
                return (
                  <motion.li
                    key={v.id}
                    layout
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -4 }}
                    transition={{ duration: 0.22, ease: SPRING, delay: i * 0.04 }}
                  >
                    <div
                      className={cx(
                        "rounded-[var(--radius-lg)] px-5 py-4 shadow-[var(--shadow-sm)] border transition-[border-color,background-color] duration-200",
                        v.status === "approved"
                          ? "border-[rgba(120,140,93,0.35)] bg-[rgba(120,140,93,0.04)]"
                          : "border-[color:var(--border-default)] bg-[color:var(--bg-surface)]",
                      )}
                    >
                      <div className="flex items-start justify-between gap-4">
                        <div className="min-w-0 flex-1">
                          {/* Meta row */}
                          <div className="flex items-center gap-2 mb-2 flex-wrap">
                            <span
                              className={cx(
                                "text-[11px] font-semibold uppercase tracking-[0.04em] px-2 py-0.5 rounded-full",
                                meta.pillClass,
                              )}
                            >
                              {meta.label}
                            </span>
                            <span className="text-[12px] text-[color:var(--text-tertiary)]">
                              {v.dayOfWeek} · {v.durationSeconds}s
                            </span>
                            {v.status === "approved" && (
                              <span className="text-[11px] font-semibold text-[color:var(--accent-green)]">
                                ✓ {APP.PLAN_UI.approvedStatus}
                              </span>
                            )}
                          </div>
                          <p className="truncate text-[15px] font-semibold leading-[1.4] text-[color:var(--text-primary)]">
                            {v.title}
                          </p>
                          <p className="mt-1 line-clamp-2 text-[13px] leading-[1.6] text-[color:var(--text-secondary)]">
                            {v.hook}
                          </p>
                        </div>
                        {/* P1-16: hide per-video approve in autopilot mode — videos publish automatically. */}
                        {mode === "autopilot" ? null : (
                          <Button
                            variant={v.status === "approved" ? "secondary" : "primary"}
                            onClick={() => approveVideo(v.id)}
                            disabled={v.status === "approved"}
                            className="shrink-0"
                          >
                            {v.status === "approved" ? APP.PLAN_UI.approvedStatus : "Approve"}
                          </Button>
                        )}
                      </div>
                    </div>
                  </motion.li>
                );
              })}
            </AnimatePresence>
          </ul>
        )}
      </PlanShell>
    );
  }

  if (mode === "choose") {
    return (
      <PlanShell>
        {genError && (
          <StatusCard
            variant="error"
            title={APP.COMMON.errorGenerate}
            description={genError}
            cta={APP.COMMON.retry}
            onCta={() => setGenError(null)}
            className="mb-6"
          />
        )}
        <div className="grid gap-4 tablet-sm:grid-cols-2">
          <ModeCard
            title={APP.PLAN.manualTitle}
            description={APP.PLAN.manualDescription}
            cta={APP.PLAN_UI.shareWhatsNew}
            icon={
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7" />
                <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5Z" />
              </svg>
            }
            onClick={() => setMode("manual")}
            disabled={loading}
          />
          <ModeCard
            title={APP.PLAN.autopilotTitle}
            description={APP.PLAN.autopilotDescription}
            cta={loading ? "Building…" : "Hand it to autopilot"}
            badge={APP.PLAN.autopilotBadge}
            highlighted
            icon={
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                <polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2" />
              </svg>
            }
            onClick={() => generate({ mode: "autopilot" })}
            disabled={loading}
          />
        </div>
      </PlanShell>
    );
  }

  return (
    <PlanShell>
      <div className="mb-5">
        <button
          onClick={() => setMode("choose")}
          className="flex items-center gap-1.5 min-h-[44px] text-[13px] cursor-pointer bg-transparent border-none p-0 text-[color:var(--text-tertiary)]"
        >
          <svg width="14" height="14" viewBox="0 0 14 14" fill="none"><path d="M9 12L4 7l5-5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" /></svg>
          {APP.PLAN_UI.back}
        </button>
      </div>
      <QualityGate
        loading={loading}
        serverPushback={pushback ?? undefined}
        onSubmit={(answers) => generate({ mode: "manual", qualityGateAnswers: answers })}
        onAutopilot={() => generate({ mode: "autopilot" })}
      />
    </PlanShell>
  );
}

/* ── Layout shell ─────────────────────────────────────────────────────────── */

function PlanShell({ children }: { children: React.ReactNode }) {
  return (
    <div className="px-6 pt-8 pb-12 sm:px-8">
      <header className="mb-8">
        <h1 className="text-gradient-brand font-serif text-[26px] font-extrabold tracking-tight leading-tight mb-1.5">
          This week
        </h1>
        <p className="text-[14px] text-[color:var(--text-tertiary)]">
          {APP.DASHBOARD.subtitle}
        </p>
      </header>
      {children}
    </div>
  );
}

// Keep the quota dialog mounted at the root of the page so it fires no matter
// which branch of the render tree produced the 402. Imported and used in the
// exported default component below via the closure.

function PlanShellSkeleton() {
  return (
    <PlanShell>
      <div className="space-y-3" aria-live="polite" aria-busy="true">
        <span className="sr-only">{APP.A11Y.loading}</span>
        {[1, 2].map((i) => (
          <div key={i} className="skeleton-line h-24" />
        ))}
      </div>
    </PlanShell>
  );
}


function ModeCard({
  title,
  description,
  cta,
  badge,
  icon,
  highlighted = false,
  onClick,
  disabled,
}: {
  title: string;
  description: string;
  cta: string;
  badge?: string;
  icon?: React.ReactNode;
  highlighted?: boolean;
  onClick: () => void;
  disabled?: boolean;
}) {
  return (
    <motion.div
      whileHover={{ y: -2, boxShadow: highlighted ? "0 8px 32px rgba(217,119,87,0.18)" : "0 4px 20px rgba(0,0,0,0.08)" }}
      transition={{ duration: 0.18, ease: SPRING }}
      className={cx(
        "flex flex-col p-6 rounded-[var(--radius-lg)] border-[1.5px]",
        highlighted
          ? "border-[color:var(--accent)] bg-[color:var(--accent-subtle)] shadow-[0_4px_20px_rgba(217,119,87,0.10)]"
          : "border-[color:var(--border-default)] bg-[color:var(--bg-surface)] shadow-[var(--shadow-sm)]",
        disabled ? "cursor-default" : "cursor-pointer",
      )}
    >
      {/* Icon + badge row */}
      <div className="flex items-center justify-between mb-4">
        <div
          className={cx(
            "flex items-center justify-center w-10 h-10 rounded-[var(--radius-md)]",
            highlighted
              ? "bg-[rgba(217,119,87,0.15)] text-[color:var(--accent)]"
              : "bg-[color:var(--bg-elevated)] text-[color:var(--text-secondary)]",
          )}
        >
          {icon}
        </div>
        {badge && <Badge variant="default">{badge}</Badge>}
      </div>

      <h3 className="text-[16px] font-bold tracking-[-0.01em] mb-2 text-[color:var(--text-primary)]">
        {title}
      </h3>
      <p className="flex-1 mb-5 text-[14px] leading-[1.6] text-[color:var(--text-secondary)]">
        {description}
      </p>
      <Button
        variant={highlighted ? "primary" : "secondary"}
        onClick={onClick}
        disabled={disabled}
        className="group self-start"
      >
        {cta}
        <ArrowAnimated />
      </Button>
    </motion.div>
  );
}
