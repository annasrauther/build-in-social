"use client";

import { useMemo, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { RiLockLine, RiSparklingLine } from "@remixicon/react";
import { STOCK_AVATARS, AVATAR_VIBE_LABELS } from "@/content/avatars";
import type { StockAvatar, AvatarMode } from "@/lib/types/avatar";
import type { SubscriptionTier } from "@/lib/types/user";

const TIER_ORDER: Record<SubscriptionTier, number> = {
  trial: 0,
  starter: 1,
  solo: 2,
  creator: 3,
  studio: 4,
};

/**
 * Minimum tier required for `twin` mode. Creator $79+ unlocks 1 twin;
 * Studio $149 unlocks unlimited.
 */
const TWIN_MIN_TIER: SubscriptionTier = "creator";

function canUseTier(
  current: SubscriptionTier | null,
  required: SubscriptionTier | null,
): boolean {
  if (required === null) return true;
  if (current === null) return false;
  return TIER_ORDER[current] >= TIER_ORDER[required];
}

function tierLabel(tier: SubscriptionTier | null): string {
  if (tier === null) return "Free";
  return tier.charAt(0).toUpperCase() + tier.slice(1);
}

interface AvatarPickerProps {
  /** Current user's subscription tier. `null` = not on a paid plan yet. */
  tier: SubscriptionTier | null;
  /** The currently-selected mode ("stock" or "twin"). */
  mode: AvatarMode;
  stockAvatarId?: string;
  twinAvatarId?: string;
  twinStatus?: "training" | "ready" | "failed";
  onModeChange: (mode: AvatarMode) => void;
  onStockSelect: (avatarId: string) => void;
  onTwinStart?: () => void;
  /** Render compactly (onboarding step vs full settings page). */
  compact?: boolean;
}

export function AvatarPicker({
  tier,
  mode,
  stockAvatarId,
  twinAvatarId,
  twinStatus,
  onModeChange,
  onStockSelect,
  onTwinStart,
  compact = false,
}: AvatarPickerProps) {
  const [filter, setFilter] = useState<StockAvatar["vibe"] | "all">("all");
  const [page, setPage] = useState(0);
  const twinUnlocked = canUseTier(tier, TWIN_MIN_TIER);

  const PAGE_SIZE = 12;

  const filtered = useMemo(
    () =>
      filter === "all"
        ? STOCK_AVATARS
        : STOCK_AVATARS.filter((a) => a.vibe === filter),
    [filter],
  );

  const totalPages = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE));
  // Clamp the active page when the filter shrinks the list beyond the cursor.
  const currentPage = Math.min(page, totalPages - 1);
  const pagedAvatars = useMemo(
    () =>
      filtered.slice(currentPage * PAGE_SIZE, currentPage * PAGE_SIZE + PAGE_SIZE),
    [filtered, currentPage],
  );

  function changeFilter(next: StockAvatar["vibe"] | "all") {
    setFilter(next);
    setPage(0);
  }

  const vibes: Array<StockAvatar["vibe"] | "all"> = [
    "all",
    "founder",
    "host",
    "teacher",
    "reporter",
    "creator",
    "expert",
    "builder",
    "seller",
  ];

  return (
    <div className="flex flex-col gap-4">
      {/* ── Mode toggle ── */}
      <div
        className="flex rounded-[var(--radius-md)] p-1"
        style={{ backgroundColor: "var(--bg-overlay)" }}
        role="tablist"
        aria-label="Avatar source"
      >
        <button
          type="button"
          role="tab"
          aria-selected={mode === "stock"}
          onClick={() => onModeChange("stock")}
          className="flex-1 rounded-[calc(var(--radius-md)-2px)] py-2 text-sm font-medium transition-colors"
          style={{
            backgroundColor: mode === "stock" ? "var(--bg-elevated)" : "transparent",
            color: mode === "stock" ? "var(--text-primary)" : "var(--text-tertiary)",
            boxShadow: mode === "stock" ? "0 1px 2px rgba(0,0,0,0.06)" : "none",
          }}
        >
          Stock avatars
        </button>
        <button
          type="button"
          role="tab"
          aria-selected={mode === "twin"}
          onClick={() => onModeChange("twin")}
          className="flex-1 rounded-[calc(var(--radius-md)-2px)] py-2 text-sm font-medium transition-colors flex items-center justify-center gap-1.5"
          style={{
            backgroundColor: mode === "twin" ? "var(--bg-elevated)" : "transparent",
            color: mode === "twin" ? "var(--text-primary)" : "var(--text-tertiary)",
            boxShadow: mode === "twin" ? "0 1px 2px rgba(0,0,0,0.06)" : "none",
          }}
        >
          <RiSparklingLine size={14} />
          Create your twin
          {!twinUnlocked && (
            <RiLockLine size={12} style={{ opacity: 0.6 }} />
          )}
        </button>
      </div>

      <AnimatePresence mode="wait">
        {mode === "stock" ? (
          <motion.div
            key="stock"
            initial={{ opacity: 0, y: 4 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -4 }}
            transition={{ duration: 0.18 }}
            className="flex flex-col gap-3"
          >
            {/* Vibe filter chips */}
            <div className="flex flex-wrap gap-1.5">
              {vibes.map((v) => {
                const selected = filter === v;
                return (
                  <button
                    key={v}
                    type="button"
                    onClick={() => changeFilter(v)}
                    className="px-2.5 py-1 text-xs font-medium rounded-full transition-colors"
                    style={{
                      backgroundColor: selected
                        ? "var(--accent)"
                        : "var(--bg-overlay)",
                      color: selected ? "var(--text-inverse)" : "var(--text-secondary)",
                      border: "1px solid transparent",
                    }}
                  >
                    {v === "all" ? "All" : AVATAR_VIBE_LABELS[v]}
                  </button>
                );
              })}
            </div>

            {/* Stock grid */}
            <div
              className={`grid gap-2 ${compact ? "grid-cols-4 sm:grid-cols-6" : "grid-cols-3 sm:grid-cols-4 lg:grid-cols-6"}`}
            >
              {pagedAvatars.map((a) => {
                const unlocked = canUseTier(tier, a.minTier);
                const isSelected = stockAvatarId === a.id;
                return (
                  <button
                    key={a.id}
                    type="button"
                    onClick={() => unlocked && onStockSelect(a.id)}
                    disabled={!unlocked}
                    aria-label={`${a.name} — ${a.description}`}
                    aria-pressed={isSelected}
                    className="relative aspect-[9/16] overflow-hidden rounded-[var(--radius-md)] transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--accent)] focus-visible:ring-offset-2 focus-visible:ring-offset-[var(--bg-elevated)]"
                    style={{
                      border: isSelected
                        ? "2px solid var(--accent)"
                        : "1px solid var(--border-default)",
                      cursor: unlocked ? "pointer" : "not-allowed",
                      opacity: unlocked ? 1 : 0.5,
                      boxShadow: isSelected
                        ? "0 0 0 3px rgba(217,119,87,0.12)"
                        : "none",
                    }}
                  >
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img
                      src={a.thumbnailUrl}
                      alt={a.name}
                      className="absolute inset-0 w-full h-full object-cover"
                    />
                    <span
                      className="absolute bottom-0 left-0 right-0 px-1.5 py-1 text-[10px] font-semibold text-white"
                      style={{
                        background:
                          "linear-gradient(to top, rgba(0,0,0,0.72) 40%, transparent)",
                      }}
                    >
                      {a.name}
                    </span>
                    {!unlocked && (
                      <span
                        className="absolute top-1 right-1 flex items-center gap-1 px-1.5 py-0.5 rounded-full text-[9px] font-semibold"
                        style={{
                          backgroundColor: "rgba(20,20,19,0.78)",
                          color: "white",
                        }}
                      >
                        <RiLockLine size={9} />
                        {tierLabel(a.minTier)}
                      </span>
                    )}
                  </button>
                );
              })}
            </div>

            {totalPages > 1 && (
              <div className="mt-3 flex items-center justify-between text-xs text-[color:var(--text-tertiary)]">
                <span>
                  {currentPage * PAGE_SIZE + 1}&ndash;
                  {Math.min((currentPage + 1) * PAGE_SIZE, filtered.length)} of {filtered.length}
                </span>
                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() => setPage(Math.max(0, currentPage - 1))}
                    disabled={currentPage === 0}
                    className="rounded-md px-2 py-1 disabled:opacity-40"
                    style={{ border: "1px solid var(--border-default)" }}
                  >
                    Prev
                  </button>
                  <span>
                    {currentPage + 1} / {totalPages}
                  </span>
                  <button
                    type="button"
                    onClick={() =>
                      setPage(Math.min(totalPages - 1, currentPage + 1))
                    }
                    disabled={currentPage + 1 >= totalPages}
                    className="rounded-md px-2 py-1 disabled:opacity-40"
                    style={{ border: "1px solid var(--border-default)" }}
                  >
                    Next
                  </button>
                </div>
              </div>
            )}
          </motion.div>
        ) : (
          <motion.div
            key="twin"
            initial={{ opacity: 0, y: 4 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -4 }}
            transition={{ duration: 0.18 }}
            className="flex flex-col gap-3"
          >
            {!twinUnlocked ? (
              <div
                className="rounded-[var(--radius-lg)] p-4 flex items-start gap-3"
                style={{
                  border: "1px dashed var(--border-default)",
                  backgroundColor: "var(--bg-elevated)",
                }}
              >
                <RiLockLine
                  size={18}
                  style={{ color: "var(--text-tertiary)", marginTop: 2 }}
                />
                <div className="flex-1">
                  <p className="text-sm font-semibold text-[var(--text-primary)]">
                    Your digital twin unlocks on Creator ($79/mo)
                  </p>
                  <p className="mt-1 text-sm text-[var(--text-secondary)]">
                    Record a 2–5 minute clip of yourself; every video narrates as
                    you — same face, same voice. Stock avatars keep you moving
                    in the meantime.
                  </p>
                </div>
              </div>
            ) : twinAvatarId && twinStatus === "ready" ? (
              <div
                className="rounded-[var(--radius-lg)] p-4 flex items-center gap-3"
                style={{
                  border: "1px solid var(--accent)",
                  backgroundColor: "var(--bg-elevated)",
                  boxShadow: "0 0 0 3px rgba(217,119,87,0.1)",
                }}
              >
                <div
                  className="shrink-0 rounded-full flex items-center justify-center"
                  style={{
                    width: 40,
                    height: 40,
                    backgroundColor: "var(--accent)",
                    color: "var(--text-inverse)",
                  }}
                >
                  <RiSparklingLine size={18} />
                </div>
                <div className="flex-1">
                  <p className="text-sm font-semibold text-[var(--text-primary)]">
                    Your twin is ready
                  </p>
                  <p className="text-sm text-[var(--text-secondary)]">
                    Avatar id <span className="font-mono text-xs">{twinAvatarId.slice(0, 20)}…</span>
                  </p>
                </div>
              </div>
            ) : twinStatus === "training" ? (
              <div
                className="rounded-[var(--radius-lg)] p-4 flex items-center gap-3"
                style={{
                  border: "1px solid var(--border-default)",
                  backgroundColor: "var(--bg-elevated)",
                }}
              >
                <motion.div
                  className="shrink-0 rounded-full"
                  style={{
                    width: 10,
                    height: 10,
                    backgroundColor: "var(--accent)",
                  }}
                  animate={{ opacity: [0.3, 1, 0.3] }}
                  transition={{ duration: 1.2, repeat: Infinity }}
                />
                <div className="flex-1">
                  <p className="text-sm font-semibold text-[var(--text-primary)]">
                    Training your twin…
                  </p>
                  <p className="text-sm text-[var(--text-secondary)]">
                    This usually takes 2–5 minutes. We&apos;ll email you when it&apos;s
                    ready.
                  </p>
                </div>
              </div>
            ) : (
              <div
                className="rounded-[var(--radius-lg)] p-4 flex flex-col gap-3"
                style={{
                  border: "1px solid var(--border-default)",
                  backgroundColor: "var(--bg-elevated)",
                }}
              >
                <p className="text-sm text-[var(--text-secondary)] leading-relaxed">
                  Upload a 2–5 minute clip of yourself talking to camera
                  (daylight, quiet room, phone is fine). We train a digital twin
                  that narrates every future video as you.
                </p>
                <button
                  type="button"
                  onClick={onTwinStart}
                  className="self-start px-4 py-2 rounded-[var(--radius-md)] text-sm font-medium transition-colors"
                  style={{
                    backgroundColor: "var(--accent)",
                    color: "var(--text-inverse)",
                  }}
                >
                  Start training
                </button>
              </div>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
