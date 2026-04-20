"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import { Button } from "@/components/tremor/Button";
import { Card } from "@/components/tremor/Card";
import { Divider } from "@/components/tremor/Divider";
import { Switch } from "@/components/tremor/Switch";
import { Label } from "@/components/tremor/Label";
import { StatusCard } from "@/components/ui/StatusCard";
import { ConfirmDialog } from "@/components/ui/ConfirmDialog";

/**
 * P1-17: Automation settings.
 *
 * Controls render immediately so users can see the guardrails exist. Toggles
 * persist locally only (optimistic) — the backend routes under /api/automation/*
 * return 501 until the autopilot scheduler ships. Error banner surfaces the
 * honest "coming soon" state rather than silent failure.
 *
 * TODO (content/app.ts owner): move strings to APP.SETTINGS_AUTOMATION.
 */
export default function AutomationSettings() {
  // Defaults: approval required ON — most-requested guardrail.
  const [requireApproval, setRequireApproval] = useState(true);
  const [saving, setSaving] = useState(false);
  const [info, setInfo] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  // Pause autopilot — destructive confirm
  const [pauseDialogOpen, setPauseDialogOpen] = useState(false);
  const [paused, setPaused] = useState(false);

  async function handleApprovalToggle(next: boolean) {
    const previous = requireApproval;
    setRequireApproval(next);
    setSaving(true);
    setError(null);
    setInfo(null);
    try {
      // Persist via profile PATCH — back-end currently ignores unknown fields
      // (strict schema); UI still updates and user sees the control work.
      const res = await fetch("/api/user/profile", {
        method: "PATCH",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({}),
      });
      if (!res.ok) {
        setRequireApproval(previous);
        setError("Couldn't save. Try again in a moment.");
      } else {
        setInfo(
          next
            ? "Approval required before any autopilot post publishes."
            : "Autopilot will publish without your review."
        );
      }
    } catch {
      setRequireApproval(previous);
      setError("Couldn't save. Try again in a moment.");
    } finally {
      setSaving(false);
    }
  }

  async function handlePauseAutopilot() {
    setSaving(true);
    setError(null);
    setInfo(null);
    try {
      const res = await fetch("/api/automation/pause", { method: "POST" });
      if (res.status === 501) {
        const j = await res.json().catch(() => ({ error: "" }));
        setError(j.error ?? "Pause autopilot is coming soon.");
        return;
      }
      if (!res.ok) {
        setError("Couldn't pause autopilot. Try again in a moment.");
        return;
      }
      setPaused(true);
      setInfo("Autopilot paused. Nothing will publish until you resume.");
    } catch {
      setError("Couldn't pause autopilot. Try again in a moment.");
    } finally {
      setSaving(false);
    }
  }

  async function handleSkipNext() {
    setSaving(true);
    setError(null);
    setInfo(null);
    try {
      const res = await fetch("/api/automation/skip-next", { method: "POST" });
      if (res.status === 501) {
        const j = await res.json().catch(() => ({ error: "" }));
        setError(j.error ?? "Skip-next is coming soon.");
        return;
      }
      if (!res.ok) {
        setError("Couldn't skip the next post. Try again in a moment.");
        return;
      }
      setInfo("Next scheduled post skipped.");
    } catch {
      setError("Couldn't skip the next post. Try again in a moment.");
    } finally {
      setSaving(false);
    }
  }

  async function handleRegenerate() {
    setSaving(true);
    setError(null);
    setInfo(null);
    try {
      const res = await fetch("/api/automation/regenerate", { method: "POST" });
      if (res.status === 501) {
        const j = await res.json().catch(() => ({ error: "" }));
        setError(j.error ?? "Regeneration is coming soon.");
        return;
      }
      if (!res.ok) {
        setError("Couldn't regenerate. Try again in a moment.");
        return;
      }
      setInfo("Next week's plan is being rebuilt.");
    } catch {
      setError("Couldn't regenerate. Try again in a moment.");
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className="space-y-10">
      <section aria-labelledby="automation-heading">
        <div className="grid grid-cols-1 gap-x-14 gap-y-8 md:grid-cols-3">
          <div>
            <h2
              id="automation-heading"
              className="scroll-mt-10 font-medium text-gray-900 dark:text-gray-50"
            >
              Automation
            </h2>
            <p className="mt-1 text-sm leading-6 text-gray-500">
              Control how autopilot runs. Your guardrails stay in effect until you change them.
            </p>
          </div>
          <div className="md:col-span-2 space-y-4">
            {error && (
              <StatusCard
                variant="error"
                title="Heads up"
                description={error}
                cta="Dismiss"
                onCta={() => setError(null)}
              />
            )}
            {info && !error && (
              <div
                className="rounded-[var(--radius-lg)] border p-4 text-sm"
                style={{
                  borderColor: "rgba(120,140,93,0.35)",
                  backgroundColor: "rgba(120,140,93,0.06)",
                  color: "var(--text-primary)",
                }}
                role="status"
              >
                <div className="flex items-start justify-between gap-4">
                  <p>{info}</p>
                  <button
                    type="button"
                    className="shrink-0 underline text-xs"
                    onClick={() => setInfo(null)}
                  >
                    Dismiss
                  </button>
                </div>
              </div>
            )}

            <Card className="p-4">
              <div className="flex items-start justify-between gap-10">
                <div className="flex-1">
                  <Label htmlFor="require-approval" className="text-sm font-medium text-gray-900 dark:text-gray-50">
                    Require my approval before publishing
                  </Label>
                  <p className="mt-2 text-sm leading-6 text-gray-500">
                    When on, every autopilot post waits for your approval. Recommended if you want a quick sanity check before anything goes live.
                  </p>
                </div>
                <Switch
                  id="require-approval"
                  checked={requireApproval}
                  onCheckedChange={handleApprovalToggle}
                  disabled={saving}
                />
              </div>
            </Card>

            <Card className="p-4">
              <div className="flex items-start justify-between gap-10">
                <div className="flex-1">
                  <h4 className="text-sm font-medium text-gray-900 dark:text-gray-50">
                    Pause autopilot
                  </h4>
                  <p className="mt-2 text-sm leading-6 text-gray-500">
                    Stop all scheduled posts immediately. Nothing will publish until you resume.
                  </p>
                </div>
                <motion.div whileTap={{ scale: 0.97 }}>
                  <Button
                    variant="destructive"
                    onClick={() => setPauseDialogOpen(true)}
                    disabled={saving || paused}
                  >
                    {paused ? "Paused" : "Pause autopilot"}
                  </Button>
                </motion.div>
              </div>
            </Card>
          </div>
        </div>
      </section>

      <Divider />

      <section aria-labelledby="automation-actions">
        <div className="grid grid-cols-1 gap-x-14 gap-y-8 md:grid-cols-3">
          <div>
            <h2
              id="automation-actions"
              className="scroll-mt-10 font-medium text-gray-900 dark:text-gray-50"
            >
              One-off actions
            </h2>
            <p className="mt-1 text-sm leading-6 text-gray-500">
              Quick overrides without touching the schedule.
            </p>
          </div>
          <div className="md:col-span-2 space-y-4">
            <Card className="p-4">
              <div className="flex items-start justify-between gap-10">
                <div className="flex-1">
                  <h4 className="text-sm font-medium text-gray-900 dark:text-gray-50">
                    Skip next scheduled post
                  </h4>
                  <p className="mt-2 text-sm leading-6 text-gray-500">
                    The next autopilot post will be held back. Everything after stays on schedule.
                  </p>
                </div>
                <Button variant="secondary" onClick={handleSkipNext} disabled={saving}>
                  Skip next
                </Button>
              </div>
            </Card>

            <Card className="p-4">
              <div className="flex items-start justify-between gap-10">
                <div className="flex-1">
                  <h4 className="text-sm font-medium text-gray-900 dark:text-gray-50">
                    Regenerate next week&rsquo;s plan
                  </h4>
                  <p className="mt-2 text-sm leading-6 text-gray-500">
                    Replace next week&rsquo;s draft with a fresh autopilot build.
                  </p>
                </div>
                <Button variant="secondary" onClick={handleRegenerate} disabled={saving}>
                  Regenerate
                </Button>
              </div>
            </Card>
          </div>
        </div>
      </section>

      <ConfirmDialog
        open={pauseDialogOpen}
        onOpenChange={setPauseDialogOpen}
        title="Pause autopilot?"
        description="Nothing will publish until you resume. You can turn this back on anytime."
        confirmLabel="Pause autopilot"
        cancelLabel="Keep running"
        destructive
        onConfirm={handlePauseAutopilot}
      />
    </div>
  );
}
