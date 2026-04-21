"use client";

import * as React from "react";
import { Pencil, Sparkles } from "lucide-react";
import { Button } from "@/components/ui/shadcn/button";
import { cn } from "@/lib/utils";
import { APP } from "@/content/app";

/**
 * Mode chooser — manual vs autopilot.
 *
 * The cleaner replacement for the old ModeCard pair. Hairline borders,
 * no shadows, iris accent. Typography does the hierarchy, not size.
 */

export interface ModeChooserProps {
  onManual: () => void;
  onAutopilot: () => void;
  disabled?: boolean;
  loading?: boolean;
}

export function ModeChooser({
  onManual,
  onAutopilot,
  disabled,
  loading,
}: ModeChooserProps) {
  return (
    <div className="grid gap-3 tablet-sm:grid-cols-2">
      <ModeTile
        icon={Pencil}
        title={APP.PLAN.manualTitle}
        description={APP.PLAN.manualDescription}
        cta={APP.PLAN_UI.shareWhatsNew}
        onClick={onManual}
        disabled={disabled || loading}
      />
      <ModeTile
        icon={Sparkles}
        title={APP.PLAN.autopilotTitle}
        description={APP.PLAN.autopilotDescription}
        badge={APP.PLAN.autopilotBadge}
        cta={loading ? "Building…" : APP.PLAN.autopilotCta}
        emphasis
        onClick={onAutopilot}
        disabled={disabled || loading}
      />
    </div>
  );
}

function ModeTile({
  icon: Icon,
  title,
  description,
  badge,
  cta,
  emphasis,
  onClick,
  disabled,
}: {
  icon: typeof Pencil;
  title: string;
  description: string;
  badge?: string;
  cta: string;
  emphasis?: boolean;
  onClick: () => void;
  disabled?: boolean;
}) {
  return (
    <div
      className={cn(
        "flex flex-col gap-3",
        "p-4",
        "rounded-[var(--radius-card)]",
        "border",
        emphasis
          ? "border-[color-mix(in_srgb,var(--accent)_30%,transparent)] bg-accent-subtle"
          : "border-[color:var(--border)] bg-surface",
        "transition-colors duration-fast ease-out-cubic",
        "hover:bg-[color-mix(in_srgb,var(--gray-12)_3%,var(--surface))]"
      )}
    >
      <div className="flex items-center justify-between gap-2">
        <span
          className={cn(
            "inline-flex h-7 w-7 items-center justify-center",
            "rounded-[var(--radius-input)]",
            emphasis
              ? "bg-[color-mix(in_srgb,var(--accent)_20%,transparent)] text-accent"
              : "bg-elevated text-text-secondary"
          )}
          aria-hidden="true"
        >
          <Icon size={14} strokeWidth={1.5} />
        </span>
        {badge ? (
          <span
            className={cn(
              "inline-flex items-center h-5 px-1.5",
              "text-[11px] leading-none font-medium",
              "rounded-[4px]",
              emphasis
                ? "bg-[color-mix(in_srgb,var(--accent)_20%,transparent)] text-accent"
                : "bg-elevated text-text-secondary"
            )}
          >
            {badge}
          </span>
        ) : null}
      </div>
      <div className="flex flex-col gap-1">
        <h3 className="text-[14px] font-medium leading-tight text-text">
          {title}
        </h3>
        <p className="text-[13px] leading-snug text-text-secondary">
          {description}
        </p>
      </div>
      <div className="mt-auto">
        <Button
          variant={emphasis ? "primary" : "secondary"}
          size="sm"
          onClick={onClick}
          disabled={disabled}
        >
          {cta}
        </Button>
      </div>
    </div>
  );
}
