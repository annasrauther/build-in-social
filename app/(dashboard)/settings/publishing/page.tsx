"use client";

/**
 * Settings → Publishing
 *
 * Connect a WordPress site as a first-class publishing destination for pSEO
 * articles. The user's app password is encrypted at rest (AES-256-GCM) and
 * is never re-rendered to the UI after save.
 *
 * Tier gate: Creator + Studio + Trial only. Starter/Solo see a locked card
 * with an upgrade CTA. Enforcement ALSO lives in the API routes — this is
 * just the UI surface.
 */

import { useCallback, useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { Button } from "@/components/tremor/Button";
import { Card } from "@/components/tremor/Card";
import { Input } from "@/components/tremor/Input";
import { Label } from "@/components/tremor/Label";
import { Switch } from "@/components/tremor/Switch";
import { Divider } from "@/components/tremor/Divider";
import { Badge } from "@/components/tremor/Badge";
import { StatusCard } from "@/components/ui/StatusCard";
import { ConfirmDialog } from "@/components/ui/ConfirmDialog";
import { APP } from "@/content/app";
import { useUser } from "@/lib/context/user-context";
import { canUseFeature } from "@/lib/billing/capabilities";
import type { PublicWordPressConnection } from "@/lib/types/wordpress";

type TestState =
  | { kind: "idle" }
  | { kind: "testing" }
  | { kind: "success"; siteTitle: string | null }
  | { kind: "error"; message: string };

function formatTimestamp(iso: string | undefined | null): string {
  if (!iso) return "—";
  try {
    return new Date(iso).toLocaleString();
  } catch {
    return "—";
  }
}

export default function PublishingSettings() {
  const { user, isLoading: userLoading } = useUser();
  const tier = user.subscriptionTier;
  const isUnlocked = canUseFeature(tier, "publish_wordpress");

  const [connection, setConnection] =
    useState<PublicWordPressConnection | null>(null);
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState<string | null>(null);

  // Form state
  const [siteUrl, setSiteUrl] = useState("");
  const [username, setUsername] = useState("");
  const [appPassword, setAppPassword] = useState("");
  const [saving, setSaving] = useState(false);
  const [saveError, setSaveError] = useState<string | null>(null);
  const [testState, setTestState] = useState<TestState>({ kind: "idle" });

  const [confirmDisconnect, setConfirmDisconnect] = useState(false);
  const [disconnectError, setDisconnectError] = useState<string | null>(null);
  const [togglingEnabled, setTogglingEnabled] = useState(false);

  const copy = APP.SETTINGS_PUBLISHING;

  const refresh = useCallback(async () => {
    setLoadError(null);
    setLoading(true);
    try {
      const res = await fetch("/api/publishing/wordpress/connect");
      if (res.status === 401) {
        setConnection(null);
        return;
      }
      const json = (await res.json()) as {
        data: PublicWordPressConnection | null;
        error: string | null;
      };
      if (!res.ok || json.error) {
        setLoadError(copy.loadError);
        return;
      }
      setConnection(json.data);
    } catch {
      setLoadError(copy.loadError);
    } finally {
      setLoading(false);
    }
  }, [copy.loadError]);

  useEffect(() => {
    if (!isUnlocked) {
      setLoading(false);
      return;
    }
    void refresh();
  }, [isUnlocked, refresh]);

  const canSubmit = useMemo(
    () =>
      siteUrl.trim().length > 0 &&
      username.trim().length > 0 &&
      appPassword.trim().length > 0 &&
      !saving,
    [siteUrl, username, appPassword, saving]
  );

  async function handleTest(e?: React.MouseEvent) {
    e?.preventDefault();
    if (!canSubmit) return;
    setTestState({ kind: "testing" });
    setSaveError(null);
    try {
      const res = await fetch("/api/publishing/wordpress/test", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({
          siteUrl: siteUrl.trim(),
          username: username.trim(),
          appPassword,
        }),
      });
      const json = (await res.json()) as {
        data: {
          ok: boolean;
          siteTitle?: string | null;
          error?: string;
        } | null;
        error: string | null;
      };
      if (!res.ok || json.error) {
        setTestState({
          kind: "error",
          message: json.error ?? copy.testFailure,
        });
        return;
      }
      if (!json.data?.ok) {
        setTestState({
          kind: "error",
          message: json.data?.error ?? copy.testFailure,
        });
        return;
      }
      setTestState({
        kind: "success",
        siteTitle: json.data?.siteTitle ?? null,
      });
    } catch {
      setTestState({ kind: "error", message: copy.testFailure });
    }
  }

  async function handleSave(e: React.FormEvent) {
    e.preventDefault();
    if (!canSubmit) return;
    setSaving(true);
    setSaveError(null);
    try {
      const res = await fetch("/api/publishing/wordpress/connect", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({
          siteUrl: siteUrl.trim(),
          username: username.trim(),
          appPassword,
          enabled: true,
        }),
      });
      const json = (await res.json()) as {
        data: { connection: PublicWordPressConnection; siteTitle: string | null } | null;
        error: string | null;
      };
      if (!res.ok || json.error || !json.data) {
        setSaveError(json.error ?? copy.saveError);
        return;
      }
      setConnection(json.data.connection);
      // Clear the form for safety — never keep the password in memory.
      setAppPassword("");
      setTestState({ kind: "idle" });
    } catch {
      setSaveError(copy.saveError);
    } finally {
      setSaving(false);
    }
  }

  async function handleToggleEnabled(next: boolean) {
    if (!connection) return;
    setTogglingEnabled(true);
    try {
      const res = await fetch("/api/publishing/wordpress/connect", {
        method: "PATCH",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ enabled: next }),
      });
      const json = (await res.json()) as {
        data: PublicWordPressConnection | null;
        error: string | null;
      };
      if (res.ok && !json.error && json.data) {
        setConnection(json.data);
      }
    } catch {
      // revert is handled by the next refresh
    } finally {
      setTogglingEnabled(false);
    }
  }

  async function handleDisconnect() {
    setDisconnectError(null);
    try {
      const res = await fetch("/api/publishing/wordpress/connect", {
        method: "DELETE",
      });
      const json = (await res.json().catch(() => ({ error: null }))) as {
        error: string | null;
      };
      if (!res.ok || json.error) {
        setDisconnectError(copy.disconnectError);
        return;
      }
      setConnection(null);
      setConfirmDisconnect(false);
      setSiteUrl("");
      setUsername("");
      setAppPassword("");
      setTestState({ kind: "idle" });
    } catch {
      setDisconnectError(copy.disconnectError);
    }
  }

  if (userLoading) {
    return <SkeletonCard />;
  }

  if (!isUnlocked) {
    return <LockedState />;
  }

  return (
    <div className="space-y-10">
      <section aria-labelledby="publishing-heading">
        <div className="grid grid-cols-1 gap-x-14 gap-y-8 md:grid-cols-3">
          <div>
            <h2
              id="publishing-heading"
              className="scroll-mt-10 font-medium text-gray-900 dark:text-gray-50"
            >
              {copy.title}
            </h2>
            <p className="mt-1 text-sm leading-6 text-gray-500">
              {copy.subtitle}
            </p>
            <p className="mt-4 text-xs text-gray-400 dark:text-gray-500">
              {copy.roadmapNote}
            </p>
          </div>

          <div className="space-y-5 md:col-span-2">
            {loading && !connection && !loadError && <SkeletonCard />}
            {loadError && (
              <StatusCard
                variant="error"
                title={loadError}
                description=""
                cta={APP.COMMON.retry}
                onCta={() => void refresh()}
              />
            )}

            {!loading && !connection && (
              <ConnectionForm
                copy={copy}
                siteUrl={siteUrl}
                username={username}
                appPassword={appPassword}
                setSiteUrl={setSiteUrl}
                setUsername={setUsername}
                setAppPassword={setAppPassword}
                canSubmit={canSubmit}
                saving={saving}
                saveError={saveError}
                testState={testState}
                onTest={handleTest}
                onSubmit={handleSave}
              />
            )}

            {!loading && connection && (
              <ConnectedStatus
                connection={connection}
                togglingEnabled={togglingEnabled}
                onToggle={handleToggleEnabled}
                onDisconnect={() => setConfirmDisconnect(true)}
                copy={copy}
              />
            )}
          </div>
        </div>
      </section>

      <ConfirmDialog
        open={confirmDisconnect}
        onOpenChange={(open) => !open && setConfirmDisconnect(false)}
        title={copy.disconnectTitle}
        description={copy.disconnectDescription}
        confirmLabel={copy.disconnectConfirm}
        cancelLabel={APP.COMMON.cancel}
        onConfirm={() => void handleDisconnect()}
        destructive
      />
      {disconnectError && (
        <p className="text-sm text-red-600 dark:text-red-400">
          {disconnectError}
        </p>
      )}
    </div>
  );
}

// ─── Subcomponents ───────────────────────────────────────────────────────────

type Copy = typeof APP.SETTINGS_PUBLISHING;

function ConnectionForm(props: {
  copy: Copy;
  siteUrl: string;
  username: string;
  appPassword: string;
  setSiteUrl: (v: string) => void;
  setUsername: (v: string) => void;
  setAppPassword: (v: string) => void;
  canSubmit: boolean;
  saving: boolean;
  saveError: string | null;
  testState: TestState;
  onTest: (e?: React.MouseEvent) => void;
  onSubmit: (e: React.FormEvent) => void;
}) {
  const {
    copy,
    siteUrl,
    username,
    appPassword,
    setSiteUrl,
    setUsername,
    setAppPassword,
    canSubmit,
    saving,
    saveError,
    testState,
    onTest,
    onSubmit,
  } = props;

  return (
    <Card className="p-6">
      <div>
        <h3 className="text-sm font-medium text-gray-900 dark:text-gray-50">
          {copy.wpCardTitle}
        </h3>
        <p className="mt-2 text-sm text-gray-500">{copy.wpCardSubtitle}</p>
        <ul className="mt-3 space-y-1 text-xs text-gray-500">
          {copy.wpBenefitBullets.map((b, i) => (
            <li key={i} className="flex gap-2">
              <span aria-hidden className="text-brand-500">
                •
              </span>
              {b}
            </li>
          ))}
        </ul>
      </div>

      <Divider className="my-5" />

      <form onSubmit={onSubmit} className="space-y-5">
        <div>
          <Label htmlFor="wp-site" className="font-medium">
            {copy.siteUrlLabel}
          </Label>
          <Input
            id="wp-site"
            type="url"
            autoComplete="url"
            className="mt-2"
            placeholder={copy.siteUrlPlaceholder}
            value={siteUrl}
            onChange={(e) => setSiteUrl(e.target.value)}
            disabled={saving}
            required
          />
          <p className="mt-1 text-xs text-gray-500">{copy.siteUrlHelp}</p>
        </div>

        <div>
          <Label htmlFor="wp-user" className="font-medium">
            {copy.usernameLabel}
          </Label>
          <Input
            id="wp-user"
            type="text"
            autoComplete="username"
            className="mt-2"
            placeholder={copy.usernamePlaceholder}
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            disabled={saving}
            required
          />
        </div>

        <div>
          <Label htmlFor="wp-password" className="font-medium">
            {copy.appPasswordLabel}
          </Label>
          <Input
            id="wp-password"
            type="password"
            autoComplete="new-password"
            className="mt-2 font-mono"
            placeholder={copy.appPasswordPlaceholder}
            value={appPassword}
            onChange={(e) => setAppPassword(e.target.value)}
            disabled={saving}
            required
          />
          <p className="mt-1 text-xs text-gray-500">{copy.appPasswordHelp}</p>
          <Link
            href={copy.appPasswordHelpLinkHref}
            target="_blank"
            rel="noopener noreferrer"
            className="mt-1 inline-block text-xs font-medium text-brand-600 hover:text-brand-700 dark:text-brand-400"
          >
            {copy.appPasswordHelpLinkLabel}
          </Link>
        </div>

        <TestFeedback state={testState} copy={copy} />

        {saveError && (
          <p className="text-sm text-red-600 dark:text-red-400">{saveError}</p>
        )}

        <div className="flex flex-wrap items-center justify-end gap-3">
          <Button
            type="button"
            variant="secondary"
            onClick={onTest}
            disabled={!canSubmit || testState.kind === "testing"}
          >
            {testState.kind === "testing" ? copy.testing : copy.testCta}
          </Button>
          <Button type="submit" disabled={!canSubmit}>
            {saving ? copy.saving : copy.saveCta}
          </Button>
        </div>
      </form>
    </Card>
  );
}

function TestFeedback({ state, copy }: { state: TestState; copy: Copy }) {
  if (state.kind === "idle") return null;
  if (state.kind === "testing") {
    return (
      <p className="text-sm text-gray-500" aria-live="polite">
        {copy.testing}
      </p>
    );
  }
  if (state.kind === "success") {
    const msg = state.siteTitle
      ? copy.testSuccessWithTitle(state.siteTitle)
      : copy.testSuccessNoTitle;
    return (
      <p
        className="text-sm text-emerald-600 dark:text-emerald-400"
        aria-live="polite"
      >
        ✓ {msg}
      </p>
    );
  }
  return (
    <p className="text-sm text-red-600 dark:text-red-400" aria-live="polite">
      {copy.testFailure} {state.message}
    </p>
  );
}

function ConnectedStatus(props: {
  connection: PublicWordPressConnection;
  togglingEnabled: boolean;
  onToggle: (next: boolean) => void;
  onDisconnect: () => void;
  copy: Copy;
}) {
  const { connection, togglingEnabled, onToggle, onDisconnect, copy } = props;
  return (
    <div className="space-y-4">
      <Card className="p-6">
        <div className="flex flex-wrap items-start justify-between gap-4">
          <div className="min-w-0">
            <div className="flex items-center gap-2">
              <h3 className="text-sm font-medium text-gray-900 dark:text-gray-50">
                {copy.statusTitle}
              </h3>
              <Badge variant={connection.enabled ? "success" : "neutral"}>
                {connection.enabled ? "Enabled" : "Disabled"}
              </Badge>
            </div>
            <dl className="mt-3 grid grid-cols-1 gap-x-6 gap-y-2 text-xs text-gray-500 sm:grid-cols-2">
              <div>
                <dt className="font-medium text-gray-600 dark:text-gray-400">
                  {copy.statusSiteUrl}
                </dt>
                <dd className="font-mono text-gray-900 dark:text-gray-100 break-all">
                  {connection.siteUrl}
                </dd>
              </div>
              <div>
                <dt className="font-medium text-gray-600 dark:text-gray-400">
                  {copy.statusUsername}
                </dt>
                <dd className="text-gray-900 dark:text-gray-100">
                  {connection.username}
                </dd>
              </div>
              <div>
                <dt className="font-medium text-gray-600 dark:text-gray-400">
                  {copy.statusLastTested}
                </dt>
                <dd className="text-gray-900 dark:text-gray-100">
                  {formatTimestamp(connection.lastTestedAt)}
                </dd>
              </div>
              <div>
                <dt className="font-medium text-gray-600 dark:text-gray-400">
                  {copy.statusLastPublished}
                </dt>
                <dd className="text-gray-900 dark:text-gray-100">
                  {connection.lastPublishedAt
                    ? formatTimestamp(connection.lastPublishedAt)
                    : copy.statusLastPublishedNever}
                </dd>
              </div>
            </dl>
          </div>
          <Button
            variant="ghost"
            className="text-red-600 dark:text-red-500"
            onClick={onDisconnect}
          >
            {copy.disconnectCta}
          </Button>
        </div>

        <Divider className="my-5" />

        <div className="flex flex-wrap items-start justify-between gap-4">
          <div className="min-w-0 flex-1">
            <p className="text-sm font-medium text-gray-900 dark:text-gray-50">
              {copy.enabledToggleLabel}
            </p>
            <p className="mt-1 text-xs text-gray-500">
              {copy.enabledToggleDescription}
            </p>
          </div>
          <Switch
            checked={connection.enabled}
            onCheckedChange={(v) => onToggle(!!v)}
            disabled={togglingEnabled}
            aria-label={copy.enabledToggleLabel}
          />
        </div>
      </Card>
    </div>
  );
}

function LockedState() {
  const copy = APP.SETTINGS_PUBLISHING;
  return (
    <div className="space-y-10">
      <section>
        <div className="grid grid-cols-1 gap-x-14 gap-y-8 md:grid-cols-3">
          <div>
            <h2 className="font-medium text-gray-900 dark:text-gray-50">
              {copy.title}
            </h2>
            <p className="mt-1 text-sm leading-6 text-gray-500">
              {copy.subtitle}
            </p>
          </div>
          <div className="md:col-span-2">
            <Card className="p-6">
              <div className="flex items-start gap-3">
                <Badge variant="warning">Creator+</Badge>
                <div>
                  <h3 className="text-sm font-medium text-gray-900 dark:text-gray-50">
                    {copy.lockedTitle}
                  </h3>
                  <p className="mt-2 text-sm text-gray-500">
                    {copy.lockedDescription}
                  </p>
                  <div className="mt-4">
                    <Button asChild>
                      <Link href="/settings/billing">{copy.lockedCta}</Link>
                    </Button>
                  </div>
                </div>
              </div>
            </Card>
          </div>
        </div>
      </section>
    </div>
  );
}

function SkeletonCard() {
  return (
    <div className="space-y-3">
      <div className="h-32 animate-pulse rounded bg-gray-100 dark:bg-gray-900" />
      <div className="h-24 animate-pulse rounded bg-gray-100 dark:bg-gray-900" />
    </div>
  );
}
