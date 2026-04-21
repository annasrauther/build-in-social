"use client";

import * as React from "react";
import { ExternalLink, Loader2, RotateCw } from "lucide-react";
import type { Platform } from "@/lib/types/user";
import { cn } from "@/lib/utils";
import {
  PLATFORM_ICON,
  PLATFORM_LABEL,
} from "./platform-icons";

/**
 * Publish strip — F6.
 *
 * Publish is one button + per-platform dots. Disconnected platforms show
 * inline Connect. Progress: pending → iris (success, links to live post)
 * → amber (failure, inline reason + Retry). Partial success is the default
 * mental model; one platform failing does not revert others.
 *
 * Business logic (OAuth connect, actual publish HTTP call, per-platform
 * retry) is owned by the caller via the per-platform callbacks — this
 * component is strictly presentational.
 */

export type PublishPlatformState =
  | { status: "disconnected" }
  | { status: "ready" }
  | { status: "pending" }
  | { status: "success"; liveUrl?: string }
  | { status: "failed"; reason?: string }
  /**
   * Server returned 501 — platform OAuth / publishing not yet implemented
   * for this account tier or for this platform. Distinct from "failed"
   * so the UI doesn't cry wolf when the backend is known-stubbed.
   */
  | { status: "not-implemented"; reason?: string };

export interface PlatformRow {
  platform: Platform;
  state: PublishPlatformState;
  /** Whether the user wants to publish to this platform (toggle). */
  selected: boolean;
}

export interface PublishStripProps {
  rows: readonly PlatformRow[];
  onToggle: (platform: Platform) => void;
  onConnect: (platform: Platform) => void;
  onRetry: (platform: Platform) => void;
  onPublish: () => void;
  /** Disable the publish button (e.g. script not approved). */
  disabled?: boolean;
  className?: string;
}

function PlatformDot({ state }: { state: PublishPlatformState }) {
  // 6px dot state indicator; visible even when platform tile is compact.
  const color =
    state.status === "success"
      ? "bg-accent"
      : state.status === "failed"
      ? "bg-[color:var(--warning)]"
      : state.status === "not-implemented"
      ? "bg-[color:var(--iris-7)]"
      : state.status === "pending"
      ? "bg-text-tertiary animate-pulse"
      : state.status === "ready"
      ? "bg-text-tertiary"
      : "bg-[color:var(--border)]";
  return (
    <span
      aria-hidden="true"
      className={cn("inline-block h-1.5 w-1.5 rounded-full", color)}
    />
  );
}

function PlatformTile({
  row,
  onToggle,
  onConnect,
  onRetry,
}: {
  row: PlatformRow;
  onToggle: (p: Platform) => void;
  onConnect: (p: Platform) => void;
  onRetry: (p: Platform) => void;
}) {
  const Icon = PLATFORM_ICON[row.platform];
  const label = PLATFORM_LABEL[row.platform];
  const { state, selected } = row;

  const isDisconnected = state.status === "disconnected";
  const isFailed = state.status === "failed";
  const isSuccess = state.status === "success";
  const isPending = state.status === "pending";
  const isNotImplemented = state.status === "not-implemented";

  return (
    <div
      className={cn(
        "group flex items-center gap-2 px-2 h-7",
        "text-[12px] leading-none",
        "rounded-[var(--radius-input)]",
        "border transition-colors duration-fast ease-out-cubic",
        isSuccess
          ? "border-[color-mix(in_srgb,var(--accent)_30%,transparent)] bg-accent-subtle text-text"
          : isFailed
          ? "border-[color-mix(in_srgb,var(--warning)_30%,transparent)] bg-[color:var(--warning-subtle)] text-text"
          : isNotImplemented
          ? "border-[color-mix(in_srgb,var(--iris-7)_35%,transparent)] bg-[color-mix(in_srgb,var(--iris-7)_10%,var(--surface))] text-text"
          : selected
          ? "border-[color:var(--border-interactive)] bg-surface text-text"
          : "border-[color:var(--border)] bg-transparent text-text-secondary",
        "hover:bg-[color-mix(in_srgb,var(--gray-12)_4%,transparent)]"
      )}
    >
      {isPending ? (
        <Loader2
          size={12}
          strokeWidth={1.5}
          className="animate-spin shrink-0 text-text-tertiary"
          aria-hidden="true"
        />
      ) : (
        <Icon
          size={12}
          className="shrink-0"
          aria-hidden="true"
        />
      )}
      <button
        type="button"
        onClick={() => onToggle(row.platform)}
        disabled={isDisconnected || isPending}
        className={cn(
          "flex-1 text-left font-medium truncate",
          "focus-visible:outline-2 focus-visible:outline-offset-2",
          "focus-visible:[outline-color:var(--focus-ring)]",
          "rounded-[3px] disabled:cursor-not-allowed"
        )}
        aria-pressed={selected}
      >
        {label}
      </button>
      <PlatformDot state={state} />
      {isDisconnected ? (
        <button
          type="button"
          onClick={() => onConnect(row.platform)}
          className="text-[11px] text-accent hover:underline"
        >
          Connect
        </button>
      ) : null}
      {isFailed ? (
        <button
          type="button"
          onClick={() => onRetry(row.platform)}
          className="inline-flex items-center gap-0.5 text-[11px] text-[color:var(--warning)] hover:brightness-125"
        >
          <RotateCw size={10} strokeWidth={1.5} />
          Retry
        </button>
      ) : null}
      {isSuccess && state.liveUrl ? (
        <a
          href={state.liveUrl}
          target="_blank"
          rel="noreferrer"
          className="inline-flex items-center gap-0.5 text-[11px] text-accent hover:underline"
        >
          View
          <ExternalLink size={10} strokeWidth={1.5} />
        </a>
      ) : null}
      {isNotImplemented ? (
        <span
          className="text-[11px] text-[color:var(--iris-11)]"
          title={state.reason}
        >
          Soon
        </span>
      ) : null}
    </div>
  );
}

export function PublishStrip({
  rows,
  onToggle,
  onConnect,
  onRetry,
  onPublish,
  disabled,
  className,
}: PublishStripProps) {
  const selectedCount = rows.filter((r) => r.selected).length;
  const successCount = rows.filter((r) => r.state.status === "success").length;
  const failedCount = rows.filter((r) => r.state.status === "failed").length;
  const pendingCount = rows.filter((r) => r.state.status === "pending").length;
  const pendingLabel = rows.filter(
    (r) => r.state.status === "not-implemented",
  ).length;
  const anyPosted =
    successCount > 0 || failedCount > 0 || pendingCount > 0 || pendingLabel > 0;

  return (
    <div className={cn("flex flex-col gap-2", className)}>
      <div className="flex items-center justify-between">
        <span className="text-[11px] uppercase tracking-wider text-text-tertiary">
          Publish
        </span>
        {anyPosted ? (
          <span className="text-[12px] text-text-secondary tabular-nums">
            Live on {successCount} of {rows.length}
            {failedCount > 0 ? (
              <span className="text-[color:var(--warning)]"> · {failedCount} failed</span>
            ) : null}
          </span>
        ) : null}
      </div>
      <div className="flex flex-wrap gap-1.5">
        {rows.map((row) => (
          <PlatformTile
            key={row.platform}
            row={row}
            onToggle={onToggle}
            onConnect={onConnect}
            onRetry={onRetry}
          />
        ))}
      </div>
      <button
        type="button"
        onClick={onPublish}
        disabled={disabled || selectedCount === 0 || pendingCount > 0}
        className={cn(
          "inline-flex items-center justify-center gap-1.5",
          "h-8 px-3 text-[13px] font-medium",
          "bg-accent text-accent-fg",
          "rounded-[var(--radius-input)]",
          "hover:bg-accent-hover",
          "disabled:pointer-events-none disabled:opacity-50",
          "transition-colors duration-fast ease-out-cubic",
          "focus-visible:outline-2 focus-visible:outline-offset-2",
          "focus-visible:[outline-color:var(--focus-ring)]"
        )}
      >
        {pendingCount > 0
          ? `Publishing to ${pendingCount}…`
          : selectedCount === 0
          ? "Select a platform"
          : `Publish to ${selectedCount}`}
      </button>
    </div>
  );
}
