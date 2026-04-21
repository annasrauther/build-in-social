"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { parseAsString, parseAsStringLiteral, useQueryState } from "nuqs";
import {
  ArrowLeft,
  CalendarClock,
  List as ListIcon,
  Sparkles,
} from "lucide-react";
import { Button } from "@/components/ui/shadcn/button";
import { Kbd } from "@/components/ui/shadcn/kbd";
import { PlanShell } from "@/components/plan/PlanShell";
import { ModeChooser } from "@/components/plan/ModeChooser";
import { DayCard } from "@/components/plan/DayCard";
import { QualityGate } from "@/components/plan/QualityGate";
import { WeekCalendar } from "@/components/plan/WeekCalendar";
import { VideoDrawer, type DrawerVideo } from "@/components/video/VideoDrawer";
import type { PlatformRow, PublishPlatformState } from "@/components/video/PublishStrip";
import {
  QuotaExhaustedDialog,
  type QuotaExhaustedDetails,
} from "@/components/dashboard/QuotaExhaustedDialog";
import {
  EmptyState,
  ErrorState,
  SkeletonRows,
  FirstRunHint,
} from "@/components/ui/states";
import { toast } from "@/components/providers/Toaster";
import {
  useRegisterActions,
  type Action,
} from "@/lib/actions-registry";
import { APP } from "@/content/app";
import { cn } from "@/lib/utils";
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
  contentLanguage?: string;
  platforms: Platform[];
  brandName: string;
  displayName: string;
}

const LAST_MODE_KEY = "bis_last_mode";
const DAY_MAP: Record<string, ScheduledVideo["scheduledDay"]> = {
  mon: "Mon", tue: "Tue", wed: "Wed", thu: "Thu",
  fri: "Fri", sat: "Sat", sun: "Sun",
};

function getInitialMode(): Mode {
  if (typeof window === "undefined") return "choose";
  const saved = window.localStorage.getItem(LAST_MODE_KEY);
  return saved === "manual" || saved === "autopilot" ? saved : "choose";
}

export default function CurrentPlanPage() {
  const router = useRouter();

  // ---- business state (unchanged) ----
  const [mode, setMode] = useState<Mode>(getInitialMode);
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [profileError, setProfileError] = useState<string | null>(null);
  const [videos, setVideos] = useState<PlanVideo[] | null>(null);
  const [loading, setLoading] = useState(false);
  const [genError, setGenError] = useState<string | null>(null);
  const [pushback, setPushback] = useState<string | null>(null);
  const [quotaDetails, setQuotaDetails] = useState<QuotaExhaustedDetails | null>(null);

  // ---- URL-backed view state (nuqs) ----
  const [viewMode, setViewMode] = useQueryState(
    "view",
    parseAsStringLiteral(["list", "calendar"] as const).withDefault("list"),
  );
  const [drawerId, setDrawerId] = useQueryState("day", parseAsString);
  // Per-video publish state; keyed by video id → platform.
  const [publishState, setPublishState] = useState<
    Record<string, Partial<Record<Platform, PublishPlatformState>>>
  >({});
  // Platforms the user has selected in the publish strip (per video).
  const [platformSelection, setPlatformSelection] = useState<
    Record<string, Partial<Record<Platform, boolean>>>
  >({});

  const drawerVideo = useMemo<DrawerVideo | null>(() => {
    if (!drawerId) return null;
    const v = videos?.find((x) => x.id === drawerId);
    return v ?? null;
  }, [drawerId, videos]);

  // ------------------------------------------------------------------
  // Business logic — kept from the prior implementation, untouched.
  // ------------------------------------------------------------------

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
      .catch(() => {
        if (!cancelled) setProfileError("Failed to load profile");
      });
    return () => {
      cancelled = true;
    };
  }, []);

  const niche = profile?.niche?.trim() ?? "";
  const tone = profile?.tone ?? "casual";
  const contentLanguage = profile?.contentLanguage ?? "english";
  const platforms = useMemo<Platform[]>(
    () => (profile?.platforms?.length ? profile.platforms : []),
    [profile],
  );

  const generate = useCallback(
    async (opts: {
      mode: "manual" | "autopilot";
      qualityGateAnswers?: [string, string, string];
      sourceContent?: string;
    }) => {
      setLoading(true);
      setGenError(null);
      setPushback(null);
      try {
        const res = await fetch("/api/plan/generate", {
          method: "POST",
          headers: { "content-type": "application/json" },
          body: JSON.stringify({
            mode: opts.mode,
            platforms,
            niche,
            tone,
            contentLanguage,
            qualityGateAnswers: opts.qualityGateAnswers,
            sourceContent: opts.sourceContent,
          }),
        });
        const json = await res.json();
        if (!res.ok) {
          if (json.error === "quality_gate_failed" && json.pushback) {
            setPushback(json.pushback as string);
          } else {
            setGenError(json.error ?? APP.COMMON.errorGenerate);
          }
          return;
        }
        setVideos(json.data.videos as PlanVideo[]);
        setMode(opts.mode);
        window.localStorage.setItem(LAST_MODE_KEY, opts.mode);
      } catch {
        setGenError(APP.COMMON.errorGenerate);
      } finally {
        setLoading(false);
      }
    },
    [platforms, niche, tone, contentLanguage],
  );

  // Returning autopilot users skip the choose screen.
  const autoGeneratedRef = useRef(false);
  useEffect(() => {
    if (
      !autoGeneratedRef.current &&
      mode === "autopilot" &&
      profile &&
      niche &&
      platforms.length > 0 &&
      !videos &&
      !loading
    ) {
      autoGeneratedRef.current = true;
      generate({ mode: "autopilot" });
    }
  }, [mode, profile, niche, platforms.length, videos, loading, generate]);

  const approveVideo = useCallback(
    async (id: string) => {
      setVideos((prev) =>
        prev?.map((v) => (v.id === id ? { ...v, status: "approved" as const } : v)) ?? null,
      );
      const ok = await triggerRender(id);
      if (!ok) {
        setVideos((prev) =>
          prev?.map((v) => (v.id === id ? { ...v, status: "draft" as const } : v)) ?? null,
        );
        toast.error("We couldn't render that one. Try again.");
      }
    },
    [],
  );

  const approveAll = useCallback(async () => {
    if (!videos) return;
    const targets = videos.filter((v) => v.status !== "approved");
    setVideos((prev) => prev?.map((v) => ({ ...v, status: "approved" as const })) ?? null);
    for (const v of targets) {
      const ok = await triggerRender(v.id);
      if (!ok) {
        setVideos((prev) =>
          prev?.map((x) =>
            targets.some((t) => t.id === x.id) && x.id === v.id
              ? { ...x, status: "draft" as const }
              : x,
          ) ?? null,
        );
        break;
      }
    }
    toast.success(`Approved ${targets.length} draft${targets.length === 1 ? "" : "s"}.`);
  }, [videos]);

  const holdWeekForReview = useCallback(() => {
    setVideos((prev) => prev?.map((v) => ({ ...v, status: "draft" as const })) ?? null);
    toast("Holding this week for review.");
  }, []);

  const startFresh = useCallback(() => {
    setVideos(null);
    setMode(getInitialMode());
    setGenError(null);
    setPushback(null);
    autoGeneratedRef.current = false;
  }, []);

  const switchMode = useCallback(() => {
    const next: Mode =
      mode === "autopilot" ? "manual" : mode === "manual" ? "autopilot" : "choose";
    setMode(next);
    setVideos(null);
    setGenError(null);
    setPushback(null);
  }, [mode]);

  // Reject-with-undo pattern (F3).
  const rejectVideo = useCallback(
    (id: string) => {
      const prev = videos;
      setVideos((v) => v?.filter((x) => x.id !== id) ?? null);
      toast.undo("Rejected draft", () => setVideos(prev));
    },
    [videos],
  );

  // Publish strip — stubbed against profile.platforms.
  const drawerPublishRows = useMemo<readonly PlatformRow[]>(() => {
    if (!drawerVideo) return [];
    const all: Platform[] = platforms.length ? platforms : ["youtube", "instagram", "linkedin", "x"];
    const sel = platformSelection[drawerVideo.id] ?? {};
    const states = publishState[drawerVideo.id] ?? {};
    return all.map<PlatformRow>((p) => ({
      platform: p,
      selected: sel[p] ?? platforms.includes(p),
      state:
        states[p] ?? (platforms.includes(p) ? { status: "ready" } : { status: "disconnected" }),
    }));
  }, [drawerVideo, platforms, platformSelection, publishState]);

  const togglePlatform = useCallback((p: Platform) => {
    if (!drawerVideo) return;
    setPlatformSelection((prev) => ({
      ...prev,
      [drawerVideo.id]: {
        ...prev[drawerVideo.id],
        [p]: !(prev[drawerVideo.id]?.[p] ?? platforms.includes(p)),
      },
    }));
  }, [drawerVideo, platforms]);

  const connectPlatform = useCallback((p: Platform) => {
    toast(`Lazy connect for ${p} lands in Phase 5. Settings → Connections works today.`);
  }, []);

  const retryPlatform = useCallback(
    (p: Platform) => {
      if (!drawerVideo) return;
      setPublishState((prev) => ({
        ...prev,
        [drawerVideo.id]: { ...prev[drawerVideo.id], [p]: { status: "pending" } },
      }));
      // Retry is presentational for now — real publish API wires in Phase 5.
      setTimeout(() => {
        setPublishState((prev) => ({
          ...prev,
          [drawerVideo.id]: { ...prev[drawerVideo.id], [p]: { status: "success" } },
        }));
      }, 600);
    },
    [drawerVideo],
  );

  const publishDrawer = useCallback(() => {
    if (!drawerVideo) return;
    const selected = drawerPublishRows.filter((r) => r.selected && r.state.status !== "disconnected");
    if (selected.length === 0) return;
    setPublishState((prev) => {
      const next = { ...prev[drawerVideo.id] };
      for (const r of selected) next[r.platform] = { status: "pending" };
      return { ...prev, [drawerVideo.id]: next };
    });
    // Stub per-platform completion — real per-platform publish lands in Phase 5.
    selected.forEach((r, i) => {
      setTimeout(() => {
        setPublishState((prev) => {
          const next = { ...prev[drawerVideo.id] };
          // Deterministically succeed all for now.
          next[r.platform] = { status: "success" };
          return { ...prev, [drawerVideo.id]: next };
        });
      }, 400 + i * 200);
    });
    toast.success(`Publishing to ${selected.length} platform${selected.length === 1 ? "" : "s"}.`);
  }, [drawerVideo, drawerPublishRows]);

  // ------------------------------------------------------------------
  // Command palette — register contextual actions for this screen.
  // ------------------------------------------------------------------

  const contextualActions = useMemo<readonly Action[]>(() => {
    const list: Action[] = [];
    if (videos) {
      list.push(
        {
          id: "plan.approve-all",
          label: "Approve all drafts",
          group: "plan",
          scope: "contextual",
          shortcut: ["⌘", "⇧", "A"],
          run: () => approveAll(),
        },
        {
          id: "plan.hold-week",
          label: "Hold this week for review",
          group: "plan",
          scope: "contextual",
          run: () => holdWeekForReview(),
        },
        {
          id: "plan.start-fresh",
          label: "Start fresh",
          hint: "Clear and re-plan",
          group: "plan",
          scope: "contextual",
          run: () => startFresh(),
        },
        {
          id: "plan.view-toggle",
          label: viewMode === "list" ? "Switch to calendar" : "Switch to list",
          group: "plan",
          scope: "contextual",
          run: () => {
            void setViewMode((v) => (v === "list" ? "calendar" : "list"));
          },
        },
      );
    }
    if (mode === "choose" && niche && platforms.length > 0) {
      list.push({
        id: "plan.autopilot",
        label: "Run autopilot",
        hint: "AI drafts the full week",
        group: "plan",
        icon: Sparkles,
        scope: "contextual",
        run: () => generate({ mode: "autopilot" }),
      });
    }
    return list;
  }, [videos, mode, niche, platforms.length, viewMode, approveAll, holdWeekForReview, startFresh, generate]);

  useRegisterActions(contextualActions);

  // ------------------------------------------------------------------
  // Derived rendering
  // ------------------------------------------------------------------

  // Loading shell — skeleton rows matching real layout (no spinner).
  if (!profile && !profileError) {
    return (
      <PlanShell title="This week">
        <SkeletonRows rows={5} height={36} gap={8} />
      </PlanShell>
    );
  }

  if (profileError && !profile) {
    return (
      <PlanShell title="This week">
        <ErrorState
          title="We couldn't load your plan"
          description="Check your connection and try again. If it keeps happening, we want to hear about it."
          onRetry={() => window.location.reload()}
        />
      </PlanShell>
    );
  }

  if (!niche || platforms.length === 0) {
    return (
      <PlanShell title="This week">
        <EmptyState
          icon={CalendarClock}
          title="Finish onboarding first"
          description="Build In Social needs your niche and platform list before it can draft a week."
          action={
            <Button
              variant="primary"
              size="sm"
              onClick={() => router.push("/onboarding")}
            >
              Continue setup
            </Button>
          }
        />
      </PlanShell>
    );
  }

  // --- Week with videos ---
  if (videos) {
    const approvedCount = videos.filter((v) => v.status === "approved").length;
    const subtitle = (
      <>
        <span>{videos.length} drafts</span>
        <span aria-hidden="true"> · </span>
        <span>{approvedCount} approved</span>
        <span aria-hidden="true"> · </span>
        <span
          className={mode === "autopilot" ? "text-accent" : "text-text-tertiary"}
        >
          {mode === "autopilot" ? APP.DASHBOARD.modeAutopilot : APP.DASHBOARD.modeManual}
        </span>
      </>
    );

    const scheduledVideos: ScheduledVideo[] = videos.map((v) => ({
      videoId: v.id,
      title: v.title,
      platform: v.platform,
      scheduledDay: DAY_MAP[v.dayOfWeek.toLowerCase()] ?? "Mon",
      status: v.status,
    }));

    return (
      <PlanShell
        title="This week"
        subtitle={subtitle}
        actions={
          <>
            <ViewToggle
              value={viewMode}
              onChange={(v) => {
                void setViewMode(v);
              }}
            />
            <Button variant="ghost" size="sm" onClick={startFresh}>
              {APP.PLAN.startFresh}
            </Button>
            {mode === "autopilot" ? (
              <Button
                variant="secondary"
                size="sm"
                onClick={holdWeekForReview}
                disabled={videos.every((v) => v.status === "draft")}
              >
                Hold for review
              </Button>
            ) : (
              <Button
                variant="primary"
                size="sm"
                onClick={approveAll}
                disabled={approvedCount === videos.length}
                shortcut={<Kbd keys={["⌘", "⇧", "A"]} />}
              >
                {APP.PLAN.approveAll}
              </Button>
            )}
          </>
        }
      >
        <FirstRunHint
          capability="plan.week-list"
          message="Click any day to review. Destructive actions get an Undo."
          className="mb-3"
        />

        {viewMode === "calendar" ? (
          <div className="animate-fade-in">
            <WeekCalendar initialVideos={scheduledVideos} />
          </div>
        ) : (
          <ul className="flex flex-col gap-2">
            {videos.map((v, i) => (
              <li key={v.id}>
                <DayCard
                  video={v}
                  selected={drawerId === v.id}
                  onOpen={(id) => setDrawerId(id)}
                  onApprove={(id) => approveVideo(id)}
                  onReject={(id) => rejectVideo(id)}
                  onRegenerate={() =>
                    toast("Regenerating single drafts lands with F4 streaming.")
                  }
                  onPublish={(id) => {
                    setDrawerId(id);
                  }}
                  onRename={(id, nextTitle) => {
                    // Optimistic rename — no API route yet for title edits.
                    // This keeps the UI snappy; plug into /api/plan/edit once
                    // that route exists.
                    setVideos((prev) =>
                      prev?.map((v) =>
                        v.id === id ? { ...v, title: nextTitle } : v,
                      ) ?? null,
                    );
                    toast.success("Title updated");
                  }}
                  index={i}
                />
              </li>
            ))}
          </ul>
        )}

        <QuotaExhaustedDialog
          open={quotaDetails !== null}
          onOpenChange={(o) => {
            if (!o) setQuotaDetails(null);
          }}
          details={quotaDetails}
        />

        <VideoDrawer
          video={drawerVideo}
          open={drawerId !== null}
          onOpenChange={(o) => {
            if (!o) setDrawerId(null);
          }}
          publishRows={drawerPublishRows}
          onTogglePlatform={togglePlatform}
          onConnectPlatform={connectPlatform}
          onRetryPlatform={retryPlatform}
          onPublish={publishDrawer}
          onRegenerate={() =>
            toast("Regenerating single drafts lands with F4 streaming. Use Start fresh for now.")
          }
          onApprove={() => {
            if (drawerVideo) {
              approveVideo(drawerVideo.id);
              setDrawerId(null);
            }
          }}
          onReject={() => {
            if (drawerVideo) rejectVideo(drawerVideo.id);
          }}
        />
      </PlanShell>
    );
  }

  // --- Mode chooser ---
  if (mode === "choose") {
    return (
      <PlanShell title="This week" subtitle="Pick a mode to start.">
        {genError && (
          <div className="mb-3">
            <ErrorState
              title={APP.COMMON.errorGenerate}
              description={genError}
              onRetry={() => setGenError(null)}
            />
          </div>
        )}
        <ModeChooser
          onManual={() => setMode("manual")}
          onAutopilot={() => generate({ mode: "autopilot" })}
          loading={loading}
        />
      </PlanShell>
    );
  }

  // --- Manual quality gate ---
  return (
    <PlanShell title="This week" subtitle="Tell Build In Social what you're shipping.">
      <div className="mb-3 flex items-center justify-between">
        <Button
          variant="ghost"
          size="sm"
          onClick={() => setMode("choose")}
        >
          <ArrowLeft size={14} strokeWidth={1.5} aria-hidden="true" />
          {APP.PLAN_UI.back}
        </Button>
        <Button
          variant="link"
          size="sm"
          onClick={switchMode}
        >
          {APP.PLAN_UI.switchToAutopilot}
        </Button>
      </div>
      <QualityGate
        loading={loading}
        serverPushback={pushback ?? undefined}
        onSubmit={(answers, sourceContent) =>
          generate({ mode: "manual", qualityGateAnswers: answers, sourceContent })
        }
        onAutopilot={() => generate({ mode: "autopilot" })}
      />
    </PlanShell>
  );
}

/* ------------------------------------------------------------------ */

function ViewToggle({
  value,
  onChange,
}: {
  value: "list" | "calendar";
  onChange: (v: "list" | "calendar") => void;
}) {
  return (
    <div
      className={cn(
        "inline-flex items-center p-0.5",
        "bg-elevated border border-[color:var(--border)]",
        "rounded-[var(--radius-input)]"
      )}
      role="group"
      aria-label="View"
    >
      <button
        type="button"
        onClick={() => onChange("list")}
        aria-pressed={value === "list"}
        className={cn(
          "inline-flex items-center gap-1 h-6 px-2",
          "text-[12px] font-medium rounded-[4px]",
          "transition-colors duration-fast ease-out-cubic",
          "focus-visible:outline-2 focus-visible:outline-offset-2",
          "focus-visible:[outline-color:var(--focus-ring)]",
          value === "list"
            ? "bg-surface text-text"
            : "bg-transparent text-text-tertiary hover:text-text-secondary"
        )}
      >
        <ListIcon size={12} strokeWidth={1.5} aria-hidden="true" />
        <span className="hidden sm:inline">List</span>
      </button>
      <button
        type="button"
        onClick={() => onChange("calendar")}
        aria-pressed={value === "calendar"}
        className={cn(
          "inline-flex items-center gap-1 h-6 px-2",
          "text-[12px] font-medium rounded-[4px]",
          "transition-colors duration-fast ease-out-cubic",
          "focus-visible:outline-2 focus-visible:outline-offset-2",
          "focus-visible:[outline-color:var(--focus-ring)]",
          value === "calendar"
            ? "bg-surface text-text"
            : "bg-transparent text-text-tertiary hover:text-text-secondary"
        )}
      >
        <CalendarClock size={12} strokeWidth={1.5} aria-hidden="true" />
        <span className="hidden sm:inline">Calendar</span>
      </button>
    </div>
  );
}
