"use client";

import { useEffect, useState } from "react";
import { Button } from "@/components/tremor/Button";
import { Card } from "@/components/tremor/Card";
import { Divider } from "@/components/tremor/Divider";
import { StatusCard } from "@/components/ui/StatusCard";
import { Input } from "@/components/tremor/Input";
import { Label } from "@/components/tremor/Label";
import { APP } from "@/content/app";
import type { ContentTone, Platform } from "@/lib/types/user";

interface Profile {
  id: string;
  displayName: string;
  brandName: string;
  niche?: string;
  tone: ContentTone;
  platforms: Platform[];
  voiceNotes?: string;
}

const TONE_OPTIONS: { id: ContentTone; label: string }[] = [
  { id: "professional", label: "Professional" },
  { id: "casual", label: "Casual" },
  { id: "nerdy-warm", label: "Nerdy & warm" },
  { id: "fun-energetic", label: "Fun & energetic" },
];

export default function ProfileSettings() {
  const [profile, setProfile] = useState<Profile | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);
  const [savedAt, setSavedAt] = useState<number | null>(null);

  useEffect(() => {
    let cancelled = false;
    fetch("/api/user/profile")
      .then((r) => r.json())
      .then((j) => {
        if (cancelled) return;
        if (j.error) setError(j.error);
        else setProfile(j.data as Profile);
      })
      .catch(() => {
        if (!cancelled) setError(APP.COMMON.errorGeneric);
      });
    return () => {
      cancelled = true;
    };
  }, []);

  async function handleSave(e: React.FormEvent) {
    e.preventDefault();
    if (!profile) return;
    setSaving(true);
    setError(null);
    setSavedAt(null);
    try {
      const res = await fetch("/api/user/profile", {
        method: "PATCH",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({
          displayName: profile.displayName,
          brandName: profile.brandName,
          niche: profile.niche,
          tone: profile.tone,
          voiceNotes: profile.voiceNotes,
        }),
      });
      const json = await res.json();
      if (!res.ok || json.error) {
        setError(json.error?.toString?.() ?? APP.COMMON.errorSave);
      } else {
        setSavedAt(Date.now());
      }
    } catch {
      setError(APP.COMMON.errorSave);
    } finally {
      setSaving(false);
    }
  }

  if (!profile && !error) return <ProfileSkeleton />;
  if (!profile)
    return (
      <StatusCard
        variant="error"
        title="Couldn't load profile"
        description={error ?? APP.COMMON.errorGeneric}
        cta={APP.COMMON.retry}
        onCta={() => window.location.reload()}
      />
    );

  return (
    <div className="space-y-10">
      <section aria-labelledby="profile-heading">
        <form onSubmit={handleSave}>
          <div className="grid grid-cols-1 gap-x-14 gap-y-8 md:grid-cols-3">
            <div>
              <h2
                id="profile-heading"
                className="scroll-mt-10 font-medium text-gray-900 dark:text-gray-50"
              >
                {APP.SETTINGS_PROFILE.title}
              </h2>
              <p className="mt-1 text-sm leading-6 text-gray-500">
                {APP.SETTINGS_PROFILE.subtitle}
              </p>
            </div>
            <div className="md:col-span-2">
              <div className="grid grid-cols-1 gap-4">
                <div>
                  <Label htmlFor="displayName" className="font-medium">
                    Display name
                  </Label>
                  <Input
                    id="displayName"
                    type="text"
                    className="mt-2"
                    value={profile.displayName}
                    onChange={(e) =>
                      setProfile({ ...profile, displayName: e.target.value })
                    }
                  />
                </div>

                <div>
                  <Label htmlFor="niche" className="font-medium">
                    {APP.SETTINGS_PROFILE.nicheLabel}
                  </Label>
                  <Input
                    id="niche"
                    type="text"
                    className="mt-2"
                    placeholder={APP.SETTINGS_PROFILE.nichePlaceholder}
                    value={profile.niche ?? ""}
                    onChange={(e) =>
                      setProfile({ ...profile, niche: e.target.value })
                    }
                  />
                </div>

                <div>
                  <Label className="font-medium">
                    {APP.SETTINGS_PROFILE.toneLabel}
                  </Label>
                  <p className="mt-1 text-xs text-gray-500">
                    {APP.SETTINGS_PROFILE.toneDescription}
                  </p>
                  <div className="mt-2 flex flex-wrap gap-2">
                    {TONE_OPTIONS.map((opt) => (
                      <button
                        type="button"
                        key={opt.id}
                        onClick={() =>
                          setProfile({ ...profile, tone: opt.id })
                        }
                        className={`rounded-md px-3 py-1.5 text-sm transition ${
                          profile.tone === opt.id
                            ? "bg-brand-500 text-white"
                            : "bg-gray-100 text-gray-700 hover:bg-gray-200 dark:bg-gray-900 dark:text-gray-300 dark:hover:bg-gray-800"
                        }`}
                      >
                        {opt.label}
                      </button>
                    ))}
                  </div>
                </div>

                <div>
                  <Label htmlFor="voiceNotes" className="font-medium">
                    {APP.SETTINGS_PROFILE.voicePrefsLabel}
                    <span className="ml-2 text-xs font-normal text-gray-400">
                      {APP.SETTINGS_PROFILE.voicePrefsOptional}
                    </span>
                  </Label>
                  <textarea
                    id="voiceNotes"
                    className="mt-2 w-full rounded-md border border-gray-200 bg-white px-3 py-2 text-sm dark:border-gray-800 dark:bg-gray-950"
                    rows={4}
                    placeholder={APP.SETTINGS_PROFILE.voicePrefsPlaceholder}
                    value={profile.voiceNotes ?? ""}
                    onChange={(e) =>
                      setProfile({ ...profile, voiceNotes: e.target.value })
                    }
                  />
                </div>

                <div className="mt-2 flex items-center justify-end gap-3">
                  {error && (
                    <p className="text-sm text-red-600 dark:text-red-400">
                      {error}
                    </p>
                  )}
                  {savedAt && !saving && (
                    <p className="text-sm text-green-600 dark:text-green-400">
                      {APP.SETTINGS_PROFILE.saved}
                    </p>
                  )}
                  <Button type="submit" disabled={saving}>
                    {saving
                      ? APP.SETTINGS_PROFILE.saving
                      : APP.SETTINGS_PROFILE.saveCta}
                  </Button>
                </div>
              </div>
            </div>
          </div>
        </form>
      </section>

      <Divider />

      <section aria-labelledby="danger-zone">
        <div className="grid grid-cols-1 gap-x-14 gap-y-8 md:grid-cols-3">
          <div>
            <h2
              id="danger-zone"
              className="scroll-mt-10 font-medium text-gray-900 dark:text-gray-50"
            >
              Danger zone
            </h2>
            <p className="mt-1 text-sm leading-6 text-gray-500">
              Account deletion permanently removes your data. Use the billing
              portal to cancel your subscription before deleting.
            </p>
          </div>
          <div className="space-y-6 md:col-span-2">
            <Card className="p-4">
              <div className="flex items-start justify-between gap-10">
                <div>
                  <h4 className="text-sm font-medium text-gray-900 dark:text-gray-50">
                    Delete account
                  </h4>
                  <p className="mt-2 text-sm leading-6 text-gray-500">
                    Permanently delete your account and all associated data.
                    This action cannot be undone.
                  </p>
                </div>
                <Button
                  variant="secondary"
                  className="text-red-600 dark:text-red-500"
                  onClick={() => {
                    alert(
                      "Account deletion is not yet wired up — request via support."
                    );
                  }}
                >
                  Delete
                </Button>
              </div>
            </Card>
          </div>
        </div>
      </section>
    </div>
  );
}

function ProfileSkeleton() {
  return (
    <div className="space-y-4">
      <div className="h-6 w-40 animate-pulse rounded bg-gray-100 dark:bg-gray-900" />
      <div className="h-32 animate-pulse rounded bg-gray-100 dark:bg-gray-900" />
      <div className="h-32 animate-pulse rounded bg-gray-100 dark:bg-gray-900" />
    </div>
  );
}
