"use client";

import { useEffect, useState } from "react";
import { AvatarPicker } from "@/components/onboarding/AvatarPicker";
import { StatusCard } from "@/components/ui/StatusCard";
import type { SubscriptionTier } from "@/lib/types/user";
import type { AvatarMode } from "@/lib/types/avatar";
import { APP } from "@/content/app";

type Profile = {
  id: string;
  subscriptionTier: SubscriptionTier;
  avatarMode?: AvatarMode;
  stockAvatarId?: string;
  twinAvatarId?: string;
  twinStatus?: "training" | "ready" | "failed";
};

export default function AvatarSettingsPage() {
  const [profile, setProfile] = useState<Profile | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);
  const [mode, setMode] = useState<AvatarMode>("stock");
  const [stockAvatarId, setStockAvatarId] = useState<string | undefined>();

  useEffect(() => {
    let cancelled = false;
    fetch("/api/user/profile")
      .then((r) => r.json())
      .then((j) => {
        if (cancelled) return;
        if (j.error) {
          setError(APP.COMMON.errorGeneric);
          return;
        }
        const p = j.data as Profile;
        setProfile(p);
        if (p.avatarMode) setMode(p.avatarMode);
        if (p.stockAvatarId) setStockAvatarId(p.stockAvatarId);
      })
      .catch(() => !cancelled && setError(APP.COMMON.errorGeneric));
    return () => {
      cancelled = true;
    };
  }, []);

  async function persistMode(nextMode: AvatarMode, nextStockId?: string) {
    setSaving(true);
    try {
      await fetch("/api/settings/avatar", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          avatarMode: nextMode,
          stockAvatarId: nextStockId ?? null,
        }),
      });
    } finally {
      setSaving(false);
    }
  }

  if (error) {
    return (
      <div className="max-w-3xl">
        <StatusCard
          variant="error"
          title="Could not load avatar settings"
          description={error}
        />
      </div>
    );
  }

  if (!profile) {
    return <div className="h-40" aria-hidden />;
  }

  return (
    <div className="flex flex-col gap-6 max-w-3xl">
      <header>
        <h1 className="font-serif text-2xl font-semibold text-[var(--text-primary)]">
          Avatar
        </h1>
        <p className="mt-1 text-sm text-[var(--text-secondary)]">
          Pick a stock AI avatar for your videos, or train a digital twin of
          yourself so every video narrates as you.
        </p>
      </header>

      <AvatarPicker
        tier={profile.subscriptionTier}
        mode={mode}
        stockAvatarId={stockAvatarId}
        twinAvatarId={profile.twinAvatarId}
        twinStatus={profile.twinStatus}
        onModeChange={(m) => {
          setMode(m);
          void persistMode(m, stockAvatarId);
        }}
        onStockSelect={(id) => {
          setStockAvatarId(id);
          void persistMode("stock", id);
        }}
        onTwinStart={() => {
          // Upload flow lives in its own dialog in Phase 2; stub CTA points at
          // a placeholder endpoint so product + engineering can iterate
          // independently without blocking this page on upload UI.
          void fetch("/api/avatar/train", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              sourceClipUrl: "https://placehold.co/placeholder-training-clip.mp4",
            }),
          }).catch(() => undefined);
        }}
      />

      {saving && (
        <p className="text-xs text-[var(--text-tertiary)]">Saving…</p>
      )}
    </div>
  );
}
