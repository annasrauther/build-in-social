"use client";

import * as React from "react";
import Link from "next/link";
import { ArrowRight, Sparkles } from "lucide-react";
import { cn } from "@/lib/utils";

/**
 * UpgradeRail — persistent right-rail on free-tool output pages.
 *
 * F1 rule: turn a free-tool artifact into a weekly-plan signup by
 * carrying the artifact into `/signup` (and transitively `/onboarding`)
 * as query params. Never a dead-end island.
 *
 * Intentional restraint: no hero animation, no shadow. Hairline border,
 * iris accent pulse, single primary CTA.
 */

export interface UpgradeRailProps {
  /** Short eyebrow label, e.g. "From Hook Generator". */
  eyebrow?: string;
  /** 1-line pitch, e.g. "Turn this into a weekly plan". */
  title: string;
  /** Optional supporting paragraph. */
  description?: string;
  /** Artifact payload encoded into signup query (e.g. `{ hook, niche }`). */
  payload?: Record<string, string>;
  /** CTA label — defaults to "Plan my week". */
  ctaLabel?: string;
  className?: string;
}

export function UpgradeRail({
  eyebrow,
  title,
  description,
  payload,
  ctaLabel = "Plan my week",
  className,
}: UpgradeRailProps) {
  const href = React.useMemo(() => {
    const params = new URLSearchParams();
    if (payload) {
      for (const [k, v] of Object.entries(payload)) {
        if (v && v.trim()) params.set(k, v.trim().slice(0, 240));
      }
    }
    const q = params.toString();
    return q ? `/signup?${q}` : "/signup";
  }, [payload]);

  return (
    <aside
      aria-label="Upgrade to full plan"
      className={cn(
        "flex flex-col gap-3",
        "rounded-[var(--radius-card)]",
        "border border-[color-mix(in_srgb,var(--accent)_30%,transparent)]",
        "bg-[color-mix(in_srgb,var(--accent)_6%,var(--surface))]",
        "p-4",
        className,
      )}
    >
      {eyebrow ? (
        <div className="flex items-center gap-1.5">
          <Sparkles
            size={12}
            strokeWidth={1.5}
            className="text-accent shrink-0"
            aria-hidden="true"
          />
          <span className="text-[11px] uppercase tracking-wider text-accent">
            {eyebrow}
          </span>
        </div>
      ) : null}
      <div className="flex flex-col gap-1">
        <h3 className="text-[14px] font-medium leading-tight text-text">
          {title}
        </h3>
        {description ? (
          <p className="text-[13px] leading-snug text-text-secondary">
            {description}
          </p>
        ) : null}
      </div>
      <Link
        href={href}
        className={cn(
          "inline-flex items-center justify-center gap-1.5",
          "h-8 px-3 text-[13px] font-medium",
          "bg-accent text-accent-fg",
          "rounded-[var(--radius-input)]",
          "hover:bg-accent-hover",
          "transition-colors duration-fast ease-out-cubic",
          "focus-visible:outline-2 focus-visible:outline-offset-2",
          "focus-visible:[outline-color:var(--focus-ring)]",
          "self-start",
        )}
      >
        {ctaLabel}
        <ArrowRight size={14} strokeWidth={1.5} aria-hidden="true" />
      </Link>
    </aside>
  );
}
