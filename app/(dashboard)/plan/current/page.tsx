"use client";

import { useEffect, useMemo, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Button } from "@/components/tremor/Button";
import { Badge } from "@/components/tremor/Badge";
import { ArrowAnimated } from "@/components/marketing/ArrowAnimated";
import { QualityGate } from "@/components/plan/QualityGate";
import { StatusCard } from "@/components/ui/StatusCard";
import { APP } from "@/content/app";
import { cx } from "@/lib/utils";
import type { Platform } from "@/lib/types/user";

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
  youtube: { label: "YouTube", pillClass: "text-[#FF4444] bg-[rgba(255,68,68,0.08)]" },
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

  function approveVideo(id: string) {
    setVideos((prev) => prev?.map((v) => (v.id === id ? { ...v, status: "approved" as const } : v)) ?? null);
  }
  function approveAll() {
    setVideos((prev) => prev?.map((v) => ({ ...v, status: "approved" as const })) ?? null);
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
            <Button variant="secondary" onClick={startFresh}>{APP.PLAN.startFresh}</Button>
            <Button onClick={approveAll} disabled={approvedCount === videos.length}>{APP.PLAN.approveAll}</Button>
          </div>
        </div>

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
                      <Button
                        variant={v.status === "approved" ? "secondary" : "primary"}
                        onClick={() => approveVideo(v.id)}
                        disabled={v.status === "approved"}
                        className="shrink-0"
                      >
                        {v.status === "approved" ? APP.PLAN_UI.approvedStatus : "Approve"}
                      </Button>
                    </div>
                  </div>
                </motion.li>
              );
            })}
          </AnimatePresence>
        </ul>
      </PlanShell>
    );
  }

  if (mode === "choose") {
    return (
      <PlanShell>
        {genError && (
          <StatusCard
            variant="error"
            title="Generation failed"
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

function PlanShellSkeleton() {
  return (
    <PlanShell>
      <div className="space-y-3">
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
