"use client";

import { useEffect, useState } from "react";
import { Button } from "@/components/tremor/Button";
import { Card } from "@/components/tremor/Card";
import { Divider } from "@/components/tremor/Divider";
import { StatusCard } from "@/components/ui/StatusCard";
import { Input } from "@/components/tremor/Input";
import { Label } from "@/components/tremor/Label";
import { APP } from "@/content/app";
import type { ContentLanguage, ContentTone, Platform } from "@/lib/types/user";

interface Profile {
  id: string;
  displayName: string;
  brandName: string;
  niche?: string;
  tone: ContentTone;
  contentLanguage?: ContentLanguage;
  platforms: Platform[];
  voiceNotes?: string;
}

const TONE_OPTIONS: { id: ContentTone; label: string }[] = [
  { id: "professional", label: "Professional" },
  { id: "casual", label: "Casual" },
  { id: "nerdy-warm", label: "Nerdy & warm" },
  { id: "fun-energetic", label: "Fun & energetic" },
];

const LANGUAGE_OPTIONS: { id: ContentLanguage; label: string }[] = [
  { id: "english", label: "English" },
  { id: "spanish", label: "Spanish" },
  { id: "bilingual", label: "Bilingual (English + Spanish)" },
];

export default function ProfileSettings() {
  const [profile, setProfile] = useState<Profile | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);
  const [savedAt, setSavedAt] = useState<number | null>(null);

  // Export state
  const [exporting, setExporting] = useState(false);
  const [exportError, setExportError] = useState<string | null>(null);
  const [exportReady, setExportReady] = useState(false);

  // Delete state
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [deleteTyped, setDeleteTyped] = useState("");
  const [deleting, setDeleting] = useState(false);
  const [deleteError, setDeleteError] = useState<string | null>(null);

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
          contentLanguage: profile.contentLanguage,
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

  async function handleExport() {
    setExporting(true);
    setExportError(null);
    setExportReady(false);
    try {
      const res = await fetch("/api/user/export", { method: "POST" });
      if (!res.ok) {
        setExportError(APP.SETTINGS_PROFILE.exportDataError);
        return;
      }
      const blob = await res.blob();
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      // Pull the server-suggested filename if present.
      const disposition = res.headers.get("content-disposition") ?? "";
      const match = /filename="?([^";]+)"?/i.exec(disposition);
      a.download = match?.[1] ?? `build-in-social-export-${Date.now()}.json`;
      document.body.appendChild(a);
      a.click();
      a.remove();
      URL.revokeObjectURL(url);
      setExportReady(true);
    } catch {
      setExportError(APP.SETTINGS_PROFILE.exportDataError);
    } finally {
      setExporting(false);
    }
  }

  async function handleDelete() {
    if (deleteTyped !== "DELETE") return;
    setDeleting(true);
    setDeleteError(null);
    try {
      const res = await fetch("/api/user/delete", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ confirm: "DELETE" }),
      });
      const json = await res.json().catch(() => ({}));
      if (!res.ok || json.error) {
        setDeleteError(
          typeof json.error === "string"
            ? json.error
            : APP.SETTINGS_PROFILE.deleteAccountError
        );
        return;
      }
      // Success: redirect home with a flag the landing page could surface.
      window.location.href = "/?account_deleted=1";
    } catch {
      setDeleteError(APP.SETTINGS_PROFILE.deleteAccountError);
    } finally {
      setDeleting(false);
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
                  <Label className="font-medium">
                    {APP.SETTINGS_PROFILE.contentLanguageLabel}
                  </Label>
                  <p className="mt-1 text-xs text-gray-500">
                    {APP.SETTINGS_PROFILE.contentLanguageDescription}
                  </p>
                  <div className="mt-2 flex flex-wrap gap-2">
                    {LANGUAGE_OPTIONS.map((opt) => (
                      <button
                        type="button"
                        key={opt.id}
                        onClick={() =>
                          setProfile({ ...profile, contentLanguage: opt.id })
                        }
                        className={`rounded-md px-3 py-1.5 text-sm transition ${
                          (profile.contentLanguage ?? "english") === opt.id
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

      {/* Data export — GDPR Article 20 */}
      <section aria-labelledby="data-export">
        <div className="grid grid-cols-1 gap-x-14 gap-y-8 md:grid-cols-3">
          <div>
            <h2
              id="data-export"
              className="scroll-mt-10 font-medium text-gray-900 dark:text-gray-50"
            >
              {APP.SETTINGS_PROFILE.exportDataTitle}
            </h2>
            <p className="mt-1 text-sm leading-6 text-gray-500">
              {APP.SETTINGS_PROFILE.exportDataDescription}
            </p>
          </div>
          <div className="md:col-span-2">
            <Card className="p-4">
              <div className="flex items-start justify-between gap-10">
                <div>
                  <h4 className="text-sm font-medium text-gray-900 dark:text-gray-50">
                    {APP.SETTINGS_PROFILE.exportDataTitle}
                  </h4>
                  <p className="mt-2 text-sm leading-6 text-gray-500">
                    {exporting
                      ? APP.SETTINGS_PROFILE.exportDataPreparing
                      : exportReady
                      ? APP.SETTINGS_PROFILE.exportDataReady
                      : APP.SETTINGS_PROFILE.exportDataDescription}
                  </p>
                  {exportError && (
                    <p className="mt-2 text-sm text-red-600 dark:text-red-400">
                      {exportError}
                    </p>
                  )}
                </div>
                <Button
                  variant="secondary"
                  onClick={handleExport}
                  disabled={exporting}
                >
                  {exporting
                    ? APP.SETTINGS_PROFILE.exportDataPreparing
                    : APP.SETTINGS_PROFILE.exportDataCta}
                </Button>
              </div>
            </Card>
          </div>
        </div>
      </section>

      <Divider />

      {/* Danger zone — GDPR Article 17 */}
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
              {APP.SETTINGS_PROFILE.deleteAccountDescription}
            </p>
          </div>
          <div className="space-y-6 md:col-span-2">
            <Card className="p-4">
              <div className="flex items-start justify-between gap-10">
                <div>
                  <h4 className="text-sm font-medium text-gray-900 dark:text-gray-50">
                    {APP.SETTINGS_PROFILE.deleteAccountTitle}
                  </h4>
                  <p className="mt-2 text-sm leading-6 text-gray-500">
                    {APP.SETTINGS_PROFILE.deleteAccountDescription}
                  </p>
                </div>
                <Button
                  variant="secondary"
                  className="text-red-600 dark:text-red-500"
                  onClick={() => {
                    setDeleteTyped("");
                    setDeleteError(null);
                    setDeleteDialogOpen(true);
                  }}
                >
                  {APP.SETTINGS_PROFILE.deleteAccountTitle}
                </Button>
              </div>
            </Card>
          </div>
        </div>
      </section>

      {/*
        Typed-confirmation delete dialog. ConfirmDialog doesn't take a child
        input, so this is a local composition with the same visual treatment.
      */}
      {deleteDialogOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center">
          <div
            className="fixed inset-0 bg-black/50"
            onClick={() => !deleting && setDeleteDialogOpen(false)}
          />
          <div className="relative z-10 w-full max-w-md rounded-lg border border-gray-200 bg-white p-6 shadow-lg dark:border-gray-800 dark:bg-gray-950">
            <h2 className="text-lg font-semibold text-gray-900 dark:text-gray-50">
              {APP.SETTINGS_PROFILE.deleteAccountTitle}
            </h2>
            <p className="mt-2 text-sm text-gray-500 dark:text-gray-400">
              {APP.SETTINGS_PROFILE.deleteAccountDescription}
            </p>
            <div className="mt-4">
              <Label htmlFor="deleteConfirm" className="font-medium">
                {APP.SETTINGS_PROFILE.deleteAccountConfirmPrompt}
              </Label>
              <Input
                id="deleteConfirm"
                type="text"
                className="mt-2"
                autoComplete="off"
                value={deleteTyped}
                onChange={(e) => setDeleteTyped(e.target.value)}
                disabled={deleting}
                placeholder="DELETE"
              />
            </div>
            {deleteError && (
              <p className="mt-3 text-sm text-red-600 dark:text-red-400">
                {deleteError}
              </p>
            )}
            {deleting && (
              <p className="mt-3 text-sm text-gray-500 dark:text-gray-400">
                {APP.SETTINGS_PROFILE.deleteAccountProcessing}
              </p>
            )}
            <div className="mt-6 flex items-center gap-3">
              <Button
                variant="destructive"
                disabled={deleteTyped !== "DELETE" || deleting}
                onClick={handleDelete}
              >
                {APP.SETTINGS_PROFILE.deleteAccountConfirmCta}
              </Button>
              <Button
                variant="ghost"
                disabled={deleting}
                onClick={() => setDeleteDialogOpen(false)}
              >
                {APP.COMMON.cancel}
              </Button>
            </div>
          </div>
        </div>
      )}
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
