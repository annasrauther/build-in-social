"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { ArrowLeft, Sparkles } from "lucide-react";
import { PlanShell } from "@/components/plan/PlanShell";
import { Button } from "@/components/ui/shadcn/button";
import { Input, Textarea } from "@/components/ui/shadcn/input";
import { toast } from "@/components/providers/Toaster";
import { APP } from "@/content/app";
import { cn } from "@/lib/utils";
import type {
  SeriesMode,
  HeygenAvatarSource,
  PostingFrequency,
} from "@/lib/types/series";
import type { FacelessStyle, Platform } from "@/lib/types/user";
import type { ContentType } from "@/lib/types/video";

const MODES: readonly SeriesMode[] = [
  "faceless",
  "stock-ai-avatar",
  "heygen-avatar",
  "combo",
];

const FREQUENCIES: readonly PostingFrequency[] = ["daily", "3x-week", "5x-week"];

const PLATFORMS: readonly Platform[] = ["youtube", "instagram", "linkedin", "x"];
const PLATFORM_LABELS: Record<Platform, string> = {
  youtube: "YouTube Shorts",
  instagram: "Instagram Reels",
  linkedin: "LinkedIn",
  x: "X",
};

export default function CreateSeriesPage() {
  const router = useRouter();

  const [name, setName] = useState("");
  const [topic, setTopic] = useState("");
  const [mode, setMode] = useState<SeriesMode>("faceless");
  const [heygenSource, setHeygenSource] = useState<HeygenAvatarSource>("licensed");
  const [frequency, setFrequency] = useState<PostingFrequency>("3x-week");
  const [platforms, setPlatforms] = useState<Platform[]>([
    "youtube",
    "linkedin",
  ]);
  const [submitting, setSubmitting] = useState(false);

  const needsHeygenSource = mode === "heygen-avatar";
  const canSubmit =
    name.trim().length > 0 && topic.trim().length > 0 && platforms.length > 0;

  function togglePlatform(p: Platform) {
    setPlatforms((prev) =>
      prev.includes(p) ? prev.filter((x) => x !== p) : [...prev, p],
    );
  }

  async function submit() {
    if (!canSubmit || submitting) return;
    setSubmitting(true);
    const defaultContentType: ContentType = "domain-tip";
    const defaultFacelessStyle: FacelessStyle = "slide";
    const body = {
      name: name.trim(),
      topic: topic.trim(),
      contentType: defaultContentType,
      facelessStyle: defaultFacelessStyle,
      frequency,
      platforms,
      mode,
      ...(needsHeygenSource ? { heygenAvatarSource: heygenSource } : {}),
    };
    try {
      const res = await fetch("/api/series", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify(body),
      });
      const json = await res.json();
      if (!res.ok) {
        toast.error(json.error ?? APP.COMMON.errorSave);
        setSubmitting(false);
        return;
      }
      toast.success(`Series "${name.trim()}" created.`);
      router.push(`/series/${json.data.id}`);
    } catch {
      toast.error(APP.COMMON.errorSave);
      setSubmitting(false);
    }
  }

  return (
    <PlanShell
      title="New series"
      subtitle="Define a recurring format once. Plans inherit it."
      actions={
        <Button asChild variant="ghost" size="sm">
          <Link href="/series">
            <ArrowLeft size={14} strokeWidth={1.5} aria-hidden="true" />
            Cancel
          </Link>
        </Button>
      }
    >
      <div className="max-w-2xl flex flex-col gap-6">
        <Field
          label="Name"
          hint="Short handle for the feed. Think file-name, not sentence."
        >
          <Input
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="Weekly build log"
            maxLength={60}
            autoFocus
          />
        </Field>

        <Field
          label="Topic"
          hint="One sentence. The generator keeps every draft on theme."
        >
          <Textarea
            value={topic}
            onChange={(e) => setTopic(e.target.value)}
            placeholder="Lessons from shipping Build In Social to the first 100 users"
            maxLength={240}
            rows={2}
          />
        </Field>

        <Field label="Mode" hint="How the videos are produced.">
          <div className="grid gap-1.5 sm:grid-cols-2">
            {MODES.map((m) => {
              const selected = mode === m;
              const copy = APP.SERIES.create.modeOptions[m];
              return (
                <ChoiceTile
                  key={m}
                  selected={selected}
                  onClick={() => setMode(m)}
                  title={copy.label}
                  hint={copy.helper}
                />
              );
            })}
          </div>
          {needsHeygenSource ? (
            <div className="mt-3 grid gap-1.5 sm:grid-cols-2">
              {(["licensed", "twin"] as HeygenAvatarSource[]).map((src) => (
                <ChoiceTile
                  key={src}
                  selected={heygenSource === src}
                  onClick={() => setHeygenSource(src)}
                  title={src === "licensed" ? "Licensed face" : "Your twin"}
                  hint={
                    src === "licensed"
                      ? "Pick from HeyGen's marketplace."
                      : "Record a clip later; HeyGen trains a twin."
                  }
                />
              ))}
            </div>
          ) : null}
        </Field>

        <Field label="Cadence">
          <div className="flex flex-wrap gap-1.5">
            {FREQUENCIES.map((f) => {
              const selected = frequency === f;
              return (
                <button
                  key={f}
                  type="button"
                  onClick={() => setFrequency(f)}
                  aria-pressed={selected}
                  className={cn(
                    "inline-flex items-center h-7 px-2.5",
                    "text-[12px] font-medium leading-none",
                    "rounded-[var(--radius-input)]",
                    "border transition-colors duration-fast ease-out-cubic",
                    "focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:[outline-color:var(--focus-ring)]",
                    selected
                      ? "bg-accent-subtle text-text border-[color-mix(in_srgb,var(--accent)_30%,transparent)]"
                      : "bg-transparent text-text-secondary border-[color:var(--border)] hover:bg-[color-mix(in_srgb,var(--gray-12)_4%,transparent)]",
                  )}
                >
                  {APP.SERIES.frequencyLabels[f]}
                </button>
              );
            })}
          </div>
        </Field>

        <Field label="Platforms" hint="At least one.">
          <div className="flex flex-wrap gap-1.5">
            {PLATFORMS.map((p) => {
              const selected = platforms.includes(p);
              return (
                <button
                  key={p}
                  type="button"
                  onClick={() => togglePlatform(p)}
                  aria-pressed={selected}
                  className={cn(
                    "inline-flex items-center h-7 px-2.5",
                    "text-[12px] font-medium leading-none",
                    "rounded-[var(--radius-input)]",
                    "border transition-colors duration-fast ease-out-cubic",
                    "focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:[outline-color:var(--focus-ring)]",
                    selected
                      ? "bg-accent-subtle text-text border-[color-mix(in_srgb,var(--accent)_30%,transparent)]"
                      : "bg-transparent text-text-secondary border-[color:var(--border)] hover:bg-[color-mix(in_srgb,var(--gray-12)_4%,transparent)]",
                  )}
                >
                  {PLATFORM_LABELS[p]}
                </button>
              );
            })}
          </div>
        </Field>

        <div className="flex items-center justify-between pt-2 border-t border-[color:var(--divider)]">
          <span className="text-[12px] text-text-tertiary">
            You can edit any of these later.
          </span>
          <Button
            variant="primary"
            size="md"
            onClick={submit}
            disabled={!canSubmit || submitting}
          >
            <Sparkles
              size={14}
              strokeWidth={1.5}
              aria-hidden="true"
              className={submitting ? "animate-pulse" : undefined}
            />
            {submitting ? "Creating…" : "Create series"}
          </Button>
        </div>
      </div>
    </PlanShell>
  );
}

function Field({
  label,
  hint,
  children,
}: {
  label: React.ReactNode;
  hint?: React.ReactNode;
  children: React.ReactNode;
}) {
  return (
    <div className="flex flex-col gap-1.5">
      <span className="text-[12px] font-medium leading-none text-text">
        {label}
      </span>
      {children}
      {hint ? (
        <p className="text-[12px] leading-snug text-text-tertiary">{hint}</p>
      ) : null}
    </div>
  );
}

function ChoiceTile({
  selected,
  onClick,
  title,
  hint,
}: {
  selected: boolean;
  onClick: () => void;
  title: string;
  hint: string;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      aria-pressed={selected}
      className={cn(
        "flex flex-col gap-0.5 p-3 text-left",
        "rounded-[var(--radius-card)]",
        "border transition-colors duration-fast ease-out-cubic",
        "focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:[outline-color:var(--focus-ring)]",
        selected
          ? "bg-accent-subtle border-[color-mix(in_srgb,var(--accent)_30%,transparent)]"
          : "bg-surface border-[color:var(--border)] hover:bg-[color-mix(in_srgb,var(--gray-12)_3%,var(--surface))]",
      )}
    >
      <span className="text-[13px] font-medium leading-tight text-text">
        {title}
      </span>
      <span className="text-[12px] leading-snug text-text-secondary">
        {hint}
      </span>
    </button>
  );
}
