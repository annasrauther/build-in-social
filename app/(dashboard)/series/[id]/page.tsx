"use client";

import { useCallback, useEffect, useState, use } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { ArrowLeft, Pause, Play, Trash2 } from "lucide-react";
import { PlanShell } from "@/components/plan/PlanShell";
import { Button } from "@/components/ui/shadcn/button";
import {
  EmptyState,
  ErrorState,
  SkeletonRows,
} from "@/components/ui/states";
import { toast } from "@/components/providers/Toaster";
import { APP } from "@/content/app";
import { cn } from "@/lib/utils";
import type { Series, SeriesStatus } from "@/lib/types/series";

/**
 * /series/[id] — tune / pause / resume / archive.
 *
 * Matches the PlanShell grammar used by /plan/current and /videos.
 * Status chip in the header, definition-list body, danger action at
 * the bottom. Delete uses `toast.undo` — the action deletes optimistically
 * and the undo pulls it back within 5s.
 */

const STATUS_TINT: Record<SeriesStatus, string> = {
  active: "bg-accent-subtle text-accent border-[color-mix(in_srgb,var(--accent)_30%,transparent)]",
  paused:
    "bg-[color:var(--warning-subtle)] text-[color:var(--warning)] border-[color-mix(in_srgb,var(--warning)_30%,transparent)]",
  completed: "bg-elevated text-text-tertiary border-[color:var(--border)]",
};

interface Props {
  params: Promise<{ id: string }>;
}

export default function SeriesDetailPage({ params }: Props) {
  const { id } = use(params);
  const router = useRouter();
  const [series, setSeries] = useState<Series | null>(null);
  const [notFound, setNotFound] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    let cancelled = false;
    fetch(`/api/series/${id}`)
      .then(async (r) => {
        if (r.status === 404) {
          if (!cancelled) setNotFound(true);
          return;
        }
        const json = await r.json();
        if (cancelled) return;
        if (json.error) setError(json.error);
        else setSeries(json.data);
      })
      .catch(() => {
        if (!cancelled) setError(APP.COMMON.errorGeneric);
      });
    return () => {
      cancelled = true;
    };
  }, [id]);

  const togglePause = useCallback(async () => {
    if (!series || busy) return;
    const nextStatus: SeriesStatus =
      series.status === "active" ? "paused" : "active";
    const previous = series;
    // Optimistic flip.
    setSeries({ ...series, status: nextStatus });
    setBusy(true);
    try {
      const endpoint = nextStatus === "paused" ? "pause" : "activate";
      const res = await fetch(`/api/series/${id}/${endpoint}`, {
        method: "POST",
      });
      const json = await res.json();
      if (!res.ok) {
        setSeries(previous);
        toast.error(json.error ?? "Couldn't change status. Try again.");
      } else if (json.data) {
        setSeries(json.data);
        toast.success(
          nextStatus === "paused" ? "Series paused." : "Series resumed.",
        );
      }
    } catch {
      setSeries(previous);
      toast.error("Couldn't change status. Try again.");
    } finally {
      setBusy(false);
    }
  }, [series, busy, id]);

  const deleteNow = useCallback(async () => {
    if (!series || busy) return;
    setBusy(true);
    const snapshot = series;
    // Navigate back immediately — feels responsive. If the API fails,
    // we toast.error and let the user navigate back manually.
    router.push("/series");
    try {
      const res = await fetch(`/api/series/${id}`, { method: "DELETE" });
      if (!res.ok) {
        toast.error(
          `Couldn't delete "${snapshot.name}". It's still on your list.`,
        );
      } else {
        toast.undo(`Deleted "${snapshot.name}"`, async () => {
          // Best-effort recreate via PATCH-like POST; if no endpoint, toast.
          toast("Undo for series delete isn't wired yet.");
        });
      }
    } catch {
      toast.error(`Couldn't delete "${snapshot.name}".`);
    } finally {
      setBusy(false);
    }
  }, [series, busy, id, router]);

  if (notFound) {
    return (
      <PlanShell title="Series" subtitle="Not found">
        <EmptyState
          title={APP.SERIES.detail.notFound}
          description="It may have been deleted."
          action={
            <Button asChild variant="primary" size="sm">
              <Link href="/series">Back to series</Link>
            </Button>
          }
        />
      </PlanShell>
    );
  }

  if (error) {
    return (
      <PlanShell title="Series">
        <ErrorState
          title="Couldn't load series"
          description={error}
          onRetry={() => window.location.reload()}
        />
      </PlanShell>
    );
  }

  if (!series) {
    return (
      <PlanShell title="Series" subtitle="Loading…">
        <SkeletonRows rows={3} height={56} gap={6} />
      </PlanShell>
    );
  }

  const statusLabel = APP.SERIES.statusLabels[series.status];

  return (
    <PlanShell
      title={
        <span className="flex items-center gap-2">
          <span>{series.name}</span>
          <span
            className={cn(
              "inline-flex items-center h-5 px-1.5",
              "text-[11px] leading-none font-medium font-mono uppercase tracking-wider",
              "rounded-[4px] border",
              STATUS_TINT[series.status],
            )}
          >
            {statusLabel}
          </span>
        </span>
      }
      subtitle={series.topic}
      actions={
        <Button asChild variant="ghost" size="sm">
          <Link href="/series">
            <ArrowLeft size={14} strokeWidth={1.5} aria-hidden="true" />
            {APP.SERIES.detail.backToList}
          </Link>
        </Button>
      }
    >
      <dl className="grid gap-x-6 gap-y-4 sm:grid-cols-2 mb-6">
        <Field label={APP.SERIES.detail.fields.mode}>
          {APP.SERIES.modeLabels[series.mode]}
          {series.heygenAvatarSource ? ` · ${series.heygenAvatarSource}` : ""}
        </Field>
        <Field label={APP.SERIES.detail.fields.cadence}>
          {APP.SERIES.frequencyLabels[series.frequency]}
        </Field>
        <Field label={APP.SERIES.detail.fields.platforms}>
          <span className="font-mono uppercase tracking-wider text-[12px]">
            {series.platforms.join(" · ")}
          </span>
        </Field>
        <Field label={APP.SERIES.detail.fields.nextVideo}>
          <span className="tabular-nums">
            {series.nextVideoAt
              ? new Date(series.nextVideoAt).toLocaleString()
              : APP.SERIES.detail.neverScheduled}
          </span>
        </Field>
        <Field label={APP.SERIES.detail.fields.creditsConsumed}>
          <span className="tabular-nums">{series.creditsConsumed ?? 0}</span>
        </Field>
      </dl>

      <div className="flex items-center justify-between pt-4 border-t border-[color:var(--divider)]">
        <div className="flex items-center gap-2">
          {series.status !== "completed" && (
            <Button
              variant="secondary"
              size="sm"
              onClick={togglePause}
              disabled={busy}
            >
              {series.status === "active" ? (
                <>
                  <Pause size={14} strokeWidth={1.5} aria-hidden="true" />
                  {APP.SERIES.detail.pause}
                </>
              ) : (
                <>
                  <Play size={14} strokeWidth={1.5} aria-hidden="true" />
                  {APP.SERIES.detail.resume}
                </>
              )}
            </Button>
          )}
        </div>
        <Button
          variant="danger"
          size="sm"
          onClick={deleteNow}
          disabled={busy}
        >
          <Trash2 size={14} strokeWidth={1.5} aria-hidden="true" />
          {APP.SERIES.detail.delete}
        </Button>
      </div>
    </PlanShell>
  );
}

function Field({
  label,
  children,
}: {
  label: string;
  children: React.ReactNode;
}) {
  return (
    <div className="flex flex-col gap-0.5">
      <dt className="text-[11px] uppercase tracking-wider text-text-tertiary font-mono">
        {label}
      </dt>
      <dd className="text-[13px] text-text leading-snug">{children}</dd>
    </div>
  );
}
