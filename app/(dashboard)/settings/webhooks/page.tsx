"use client";

import { useCallback, useEffect, useState } from "react";
import Link from "next/link";
import { Button } from "@/components/tremor/Button";
import { Card } from "@/components/tremor/Card";
import { Input } from "@/components/tremor/Input";
import { Label } from "@/components/tremor/Label";
import { Badge } from "@/components/tremor/Badge";
import { Divider } from "@/components/tremor/Divider";
import { Checkbox } from "@/components/tremor/Checkbox";
import { StatusCard } from "@/components/ui/StatusCard";
import { ConfirmDialog } from "@/components/ui/ConfirmDialog";
import { APP } from "@/content/app";
import {
  WEBHOOK_EVENT_TYPES,
  type PublicWebhookSubscription,
  type WebhookEventType,
  type WebhookStatus,
} from "@/lib/types/webhook";

interface CreatedWithSecret extends PublicWebhookSubscription {
  secret?: string;
}

const STATUS_VARIANT: Record<
  WebhookStatus,
  "default" | "success" | "warning" | "neutral" | "error"
> = {
  active: "success",
  degraded: "warning",
  disabled: "neutral",
};

function statusLabel(status: WebhookStatus): string {
  if (status === "active") return APP.SETTINGS_WEBHOOKS.statusActive;
  if (status === "degraded") return APP.SETTINGS_WEBHOOKS.statusDegraded;
  return APP.SETTINGS_WEBHOOKS.statusDisabled;
}

function formatLastDelivered(iso?: string): string {
  if (!iso) return APP.SETTINGS_WEBHOOKS.lastDeliveredNever;
  try {
    const d = new Date(iso);
    return d.toLocaleString();
  } catch {
    return APP.SETTINGS_WEBHOOKS.lastDeliveredNever;
  }
}

export default function WebhooksSettings() {
  const [subs, setSubs] = useState<PublicWebhookSubscription[] | null>(null);
  const [loadError, setLoadError] = useState<string | null>(null);

  const [addOpen, setAddOpen] = useState(false);
  const [url, setUrl] = useState("");
  const [events, setEvents] = useState<WebhookEventType[]>([]);
  const [saving, setSaving] = useState(false);
  const [saveError, setSaveError] = useState<string | null>(null);

  const [secretReveal, setSecretReveal] = useState<CreatedWithSecret | null>(
    null
  );
  const [copied, setCopied] = useState(false);

  const [deleteId, setDeleteId] = useState<string | null>(null);
  const [deleteError, setDeleteError] = useState<string | null>(null);

  const [testState, setTestState] = useState<{
    id: string;
    status: "sending" | "success" | "failure";
  } | null>(null);

  const refresh = useCallback(async () => {
    setLoadError(null);
    try {
      const res = await fetch("/api/webhooks/outbound");
      const json = await res.json();
      if (!res.ok || json.error) {
        setLoadError(APP.SETTINGS_WEBHOOKS.loadError);
        return;
      }
      setSubs(json.data as PublicWebhookSubscription[]);
    } catch {
      setLoadError(APP.SETTINGS_WEBHOOKS.loadError);
    }
  }, []);

  useEffect(() => {
    void refresh();
  }, [refresh]);

  function toggleEvent(ev: WebhookEventType) {
    setEvents((prev) =>
      prev.includes(ev) ? prev.filter((e) => e !== ev) : [...prev, ev]
    );
  }

  async function handleCreate(e: React.FormEvent) {
    e.preventDefault();
    if (!url.trim() || events.length === 0) return;
    setSaving(true);
    setSaveError(null);
    try {
      const res = await fetch("/api/webhooks/outbound", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ url: url.trim(), events }),
      });
      const json = await res.json();
      if (!res.ok || json.error) {
        setSaveError(
          typeof json.error === "string"
            ? json.error
            : APP.SETTINGS_WEBHOOKS.createError
        );
        return;
      }
      const created = json.data as CreatedWithSecret;
      setSecretReveal(created);
      setAddOpen(false);
      setUrl("");
      setEvents([]);
      await refresh();
    } catch {
      setSaveError(APP.SETTINGS_WEBHOOKS.createError);
    } finally {
      setSaving(false);
    }
  }

  async function handleCopySecret() {
    if (!secretReveal?.secret) return;
    try {
      await navigator.clipboard.writeText(secretReveal.secret);
      setCopied(true);
      setTimeout(() => setCopied(false), 1500);
    } catch {
      // Clipboard blocked — noop.
    }
  }

  async function handleDelete() {
    if (!deleteId) return;
    setDeleteError(null);
    try {
      const res = await fetch(`/api/webhooks/outbound/${deleteId}`, {
        method: "DELETE",
      });
      const json = await res.json().catch(() => ({}));
      if (!res.ok || json.error) {
        setDeleteError(APP.SETTINGS_WEBHOOKS.deleteError);
        return;
      }
      setDeleteId(null);
      await refresh();
    } catch {
      setDeleteError(APP.SETTINGS_WEBHOOKS.deleteError);
    }
  }

  async function handleTest(id: string) {
    setTestState({ id, status: "sending" });
    try {
      const res = await fetch(`/api/webhooks/outbound/${id}/test`, {
        method: "POST",
      });
      const json = await res.json();
      const ok = res.ok && json?.data?.success === true;
      setTestState({ id, status: ok ? "success" : "failure" });
      await refresh();
      setTimeout(() => {
        setTestState((curr) => (curr?.id === id ? null : curr));
      }, 2500);
    } catch {
      setTestState({ id, status: "failure" });
    }
  }

  return (
    <div className="space-y-10">
      <section aria-labelledby="webhooks-heading">
        <div className="grid grid-cols-1 gap-x-14 gap-y-8 md:grid-cols-3">
          <div>
            <h2
              id="webhooks-heading"
              className="scroll-mt-10 font-medium text-gray-900 dark:text-gray-50"
            >
              {APP.SETTINGS_WEBHOOKS.title}
            </h2>
            <p className="mt-1 text-sm leading-6 text-gray-500">
              {APP.SETTINGS_WEBHOOKS.subtitle}
            </p>
            <p className="mt-3 text-xs text-gray-400 dark:text-gray-500">
              {APP.SETTINGS_WEBHOOKS.partnerNote}
            </p>
            <Link
              href="/developers"
              className="mt-3 inline-block text-xs font-medium text-brand-600 hover:text-brand-700 dark:text-brand-400"
            >
              {APP.SETTINGS_WEBHOOKS.developersLink}
            </Link>
          </div>

          <div className="space-y-4 md:col-span-2">
            <div className="flex items-center justify-end">
              <Button onClick={() => setAddOpen(true)}>
                {APP.SETTINGS_WEBHOOKS.addCta}
              </Button>
            </div>

            {loadError && (
              <StatusCard
                variant="error"
                title={APP.SETTINGS_WEBHOOKS.loadError}
                description=""
                cta={APP.COMMON.retry}
                onCta={() => void refresh()}
              />
            )}

            {!loadError && subs === null && <WebhooksSkeleton />}

            {!loadError && subs && subs.length === 0 && (
              <Card className="p-6">
                <h3 className="text-sm font-medium text-gray-900 dark:text-gray-50">
                  {APP.SETTINGS_WEBHOOKS.emptyTitle}
                </h3>
                <p className="mt-2 text-sm text-gray-500">
                  {APP.SETTINGS_WEBHOOKS.emptyDescription}
                </p>
              </Card>
            )}

            {!loadError && subs && subs.length > 0 && (
              <div className="space-y-3">
                {subs.map((s) => (
                  <Card key={s.id} className="p-4">
                    <div className="flex flex-col gap-3 md:flex-row md:items-start md:justify-between">
                      <div className="min-w-0 flex-1">
                        <div className="flex items-center gap-2">
                          <p className="truncate font-mono text-sm text-gray-900 dark:text-gray-50">
                            {s.url}
                          </p>
                          <Badge variant={STATUS_VARIANT[s.status]}>
                            {statusLabel(s.status)}
                          </Badge>
                        </div>
                        <div className="mt-2 flex flex-wrap gap-1.5">
                          {s.events.map((ev) => (
                            <Badge key={ev} variant="neutral">
                              {APP.SETTINGS_WEBHOOKS.eventLabels[ev] ?? ev}
                            </Badge>
                          ))}
                        </div>
                        <p className="mt-2 text-xs text-gray-500">
                          {APP.SETTINGS_WEBHOOKS.columnLastDelivered}
                          {": "}
                          {formatLastDelivered(s.lastDeliveredAt)}
                        </p>
                        {s.lastErrorMessage && s.status === "degraded" && (
                          <p className="mt-1 text-xs text-yellow-700 dark:text-yellow-500">
                            {s.lastErrorMessage}
                          </p>
                        )}
                        {testState?.id === s.id && (
                          <p
                            className={`mt-2 text-xs ${
                              testState.status === "success"
                                ? "text-emerald-600 dark:text-emerald-400"
                                : testState.status === "failure"
                                ? "text-red-600 dark:text-red-400"
                                : "text-gray-500"
                            }`}
                          >
                            {testState.status === "sending"
                              ? APP.SETTINGS_WEBHOOKS.testSending
                              : testState.status === "success"
                              ? APP.SETTINGS_WEBHOOKS.testSuccess
                              : APP.SETTINGS_WEBHOOKS.testFailure}
                          </p>
                        )}
                      </div>
                      <div className="flex shrink-0 items-center gap-2">
                        <Button
                          variant="secondary"
                          onClick={() => void handleTest(s.id)}
                          disabled={testState?.id === s.id && testState.status === "sending"}
                        >
                          {APP.SETTINGS_WEBHOOKS.testCta}
                        </Button>
                        <Button
                          variant="ghost"
                          className="text-red-600 dark:text-red-500"
                          onClick={() => setDeleteId(s.id)}
                        >
                          {APP.SETTINGS_WEBHOOKS.deleteCta}
                        </Button>
                      </div>
                    </div>
                  </Card>
                ))}
              </div>
            )}

            {deleteError && (
              <p className="text-sm text-red-600 dark:text-red-400">
                {deleteError}
              </p>
            )}

            <Divider />
            <div className="space-y-2 text-xs text-gray-500">
              <p>{APP.SETTINGS_WEBHOOKS.signatureHint}</p>
              <p>{APP.SETTINGS_WEBHOOKS.retryHint}</p>
            </div>
          </div>
        </div>
      </section>

      {/* Add dialog */}
      {addOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center">
          <div
            className="fixed inset-0 bg-black/50"
            onClick={() => !saving && setAddOpen(false)}
          />
          <div className="relative z-10 w-full max-w-lg rounded-lg border border-gray-200 bg-white p-6 shadow-lg dark:border-gray-800 dark:bg-gray-950">
            <h2 className="text-lg font-semibold text-gray-900 dark:text-gray-50">
              {APP.SETTINGS_WEBHOOKS.addDialogTitle}
            </h2>
            <p className="mt-1 text-sm text-gray-500">
              {APP.SETTINGS_WEBHOOKS.addDialogSubtitle}
            </p>
            <form onSubmit={handleCreate} className="mt-5 space-y-5">
              <div>
                <Label htmlFor="webhookUrl" className="font-medium">
                  {APP.SETTINGS_WEBHOOKS.urlLabel}
                </Label>
                <Input
                  id="webhookUrl"
                  type="url"
                  className="mt-2"
                  placeholder={APP.SETTINGS_WEBHOOKS.urlPlaceholder}
                  value={url}
                  onChange={(e) => setUrl(e.target.value)}
                  disabled={saving}
                  required
                />
              </div>
              <div>
                <Label className="font-medium">
                  {APP.SETTINGS_WEBHOOKS.eventsLabel}
                </Label>
                <p className="mt-1 text-xs text-gray-500">
                  {APP.SETTINGS_WEBHOOKS.eventsHint}
                </p>
                <div className="mt-3 space-y-2">
                  {WEBHOOK_EVENT_TYPES.map((ev) => (
                    <label
                      key={ev}
                      className="flex items-center gap-2 text-sm text-gray-700 dark:text-gray-300"
                    >
                      <Checkbox
                        checked={events.includes(ev)}
                        onCheckedChange={() => toggleEvent(ev)}
                        disabled={saving}
                      />
                      <span className="font-mono text-xs">{ev}</span>
                      <span className="text-gray-400">
                        {APP.SETTINGS_WEBHOOKS.eventLabels[ev] ?? ""}
                      </span>
                    </label>
                  ))}
                </div>
              </div>
              {saveError && (
                <p className="text-sm text-red-600 dark:text-red-400">
                  {saveError}
                </p>
              )}
              <div className="flex items-center justify-end gap-3">
                <Button
                  type="button"
                  variant="ghost"
                  onClick={() => setAddOpen(false)}
                  disabled={saving}
                >
                  {APP.SETTINGS_WEBHOOKS.cancelCta}
                </Button>
                <Button
                  type="submit"
                  disabled={saving || !url.trim() || events.length === 0}
                >
                  {saving
                    ? APP.SETTINGS_WEBHOOKS.saving
                    : APP.SETTINGS_WEBHOOKS.saveCta}
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Secret reveal */}
      {secretReveal?.secret && (
        <div className="fixed inset-0 z-50 flex items-center justify-center">
          <div
            className="fixed inset-0 bg-black/50"
            onClick={() => setSecretReveal(null)}
          />
          <div className="relative z-10 w-full max-w-lg rounded-lg border border-gray-200 bg-white p-6 shadow-lg dark:border-gray-800 dark:bg-gray-950">
            <h2 className="text-lg font-semibold text-gray-900 dark:text-gray-50">
              {APP.SETTINGS_WEBHOOKS.secretRevealTitle}
            </h2>
            <p className="mt-2 text-sm text-gray-500">
              {APP.SETTINGS_WEBHOOKS.secretRevealDescription}
            </p>
            <div className="mt-4 flex items-center gap-2">
              <code className="min-w-0 flex-1 overflow-x-auto rounded border border-gray-200 bg-gray-50 px-3 py-2 font-mono text-xs text-gray-900 dark:border-gray-800 dark:bg-gray-900 dark:text-gray-100">
                {secretReveal.secret}
              </code>
              <Button variant="secondary" onClick={handleCopySecret}>
                {copied
                  ? APP.SETTINGS_WEBHOOKS.secretCopied
                  : APP.SETTINGS_WEBHOOKS.secretCopy}
              </Button>
            </div>
            <div className="mt-6 flex justify-end">
              <Button onClick={() => setSecretReveal(null)}>
                {APP.SETTINGS_WEBHOOKS.secretDoneCta}
              </Button>
            </div>
          </div>
        </div>
      )}

      <ConfirmDialog
        open={!!deleteId}
        onOpenChange={(open) => !open && setDeleteId(null)}
        title={APP.SETTINGS_WEBHOOKS.deleteConfirmTitle}
        description={APP.SETTINGS_WEBHOOKS.deleteConfirmDescription}
        confirmLabel={APP.SETTINGS_WEBHOOKS.deleteConfirmCta}
        cancelLabel={APP.COMMON.cancel}
        onConfirm={() => void handleDelete()}
        destructive
      />
    </div>
  );
}

function WebhooksSkeleton() {
  return (
    <div className="space-y-3">
      <div className="h-20 animate-pulse rounded bg-gray-100 dark:bg-gray-900" />
      <div className="h-20 animate-pulse rounded bg-gray-100 dark:bg-gray-900" />
    </div>
  );
}
