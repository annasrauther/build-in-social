"use client";

import { useEffect, useState, use } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Card } from "@/components/tremor/Card";
import { Badge } from "@/components/tremor/Badge";
import { Button } from "@/components/tremor/Button";
import { StatusCard } from "@/components/ui/StatusCard";
import { APP } from "@/content/app";
import type { Series, SeriesStatus } from "@/lib/types/series";

function statusVariant(status: SeriesStatus): "success" | "warning" | "default" {
  switch (status) {
    case "active":
      return "success";
    case "paused":
      return "warning";
    default:
      return "default";
  }
}

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

  async function togglePause() {
    if (!series || busy) return;
    setBusy(true);
    try {
      const next = series.status === "active" ? "pause" : "activate";
      const res = await fetch(`/api/series/${id}/${next}`, { method: "POST" });
      const json = await res.json();
      if (res.ok) setSeries(json.data);
    } finally {
      setBusy(false);
    }
  }

  async function onDelete() {
    if (!series || busy) return;
    if (!window.confirm(APP.SERIES.detail.deleteConfirm)) return;
    setBusy(true);
    try {
      const res = await fetch(`/api/series/${id}`, { method: "DELETE" });
      if (res.ok) router.push("/series");
      else setBusy(false);
    } catch {
      setBusy(false);
    }
  }

  if (notFound) {
    return (
      <div className="p-4 sm:px-6 sm:pb-10 sm:pt-10 lg:px-10 lg:pt-7">
        <StatusCard
          variant="notFound"
          title={APP.SERIES.detail.notFound}
          description="It may have been deleted."
          cta="Back to series"
          ctaHref="/series"
        />
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-4 sm:px-6 sm:pb-10 sm:pt-10 lg:px-10 lg:pt-7">
        <StatusCard
          variant="error"
          title="Couldn't load series"
          description={error}
          cta={APP.COMMON.retry}
          onCta={() => window.location.reload()}
          ctaGradient
        />
      </div>
    );
  }

  if (!series) {
    return (
      <div className="p-4 sm:px-6 sm:pb-10 sm:pt-10 lg:px-10 lg:pt-7">
        <div
          className="skeleton-line"
          style={{ height: 220, borderRadius: "var(--radius-lg)" }}
        />
      </div>
    );
  }

  return (
    <div className="p-4 sm:px-6 sm:pb-10 sm:pt-10 lg:px-10 lg:pt-7 max-w-4xl">
      <header className="mb-6">
        <Link
          href="/series"
          className="text-sm text-gray-500 hover:text-gray-900 dark:text-gray-400 hover:dark:text-gray-100"
        >
          {APP.SERIES.detail.backToList}
        </Link>
        <div className="mt-2 flex flex-wrap items-start justify-between gap-3">
          <div>
            <h1 className="text-xl font-medium text-gray-900 dark:text-gray-50">
              {series.name}
            </h1>
            <p className="mt-1 text-sm text-gray-500 dark:text-gray-400 line-clamp-2">
              {series.topic}
            </p>
          </div>
          <Badge variant={statusVariant(series.status)}>
            {APP.SERIES.statusLabels[series.status]}
          </Badge>
        </div>
      </header>

      <Card className="p-5">
        <dl className="grid gap-4 sm:grid-cols-2">
          <Field label={APP.SERIES.detail.fields.mode}>
            {APP.SERIES.modeLabels[series.mode]}
            {series.heygenAvatarSource ? ` · ${series.heygenAvatarSource}` : ""}
          </Field>
          <Field label={APP.SERIES.detail.fields.cadence}>
            {APP.SERIES.frequencyLabels[series.frequency]}
          </Field>
          <Field label={APP.SERIES.detail.fields.platforms}>
            {series.platforms.join(", ")}
          </Field>
          <Field label={APP.SERIES.detail.fields.nextVideo}>
            {series.nextVideoAt
              ? new Date(series.nextVideoAt).toLocaleString()
              : APP.SERIES.detail.neverScheduled}
          </Field>
          <Field label={APP.SERIES.detail.fields.creditsConsumed}>
            {series.creditsConsumed ?? 0}
          </Field>
        </dl>
      </Card>

      <div className="mt-4 flex flex-wrap items-center gap-3">
        {series.status !== "completed" && (
          <Button variant="secondary" onClick={togglePause} disabled={busy}>
            {series.status === "active"
              ? APP.SERIES.detail.pause
              : APP.SERIES.detail.resume}
          </Button>
        )}
        <Button
          variant="destructive"
          onClick={onDelete}
          disabled={busy}
        >
          {APP.SERIES.detail.delete}
        </Button>
      </div>
    </div>
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
    <div>
      <dt className="text-xs uppercase tracking-wide text-gray-500 dark:text-gray-500">
        {label}
      </dt>
      <dd className="mt-1 text-sm text-gray-900 dark:text-gray-50">{children}</dd>
    </div>
  );
}
