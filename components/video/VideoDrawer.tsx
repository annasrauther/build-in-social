"use client";

import * as React from "react";
import {
  Drawer,
  DrawerContent,
  DrawerHeader,
  DrawerBody,
  DrawerFooter,
  DrawerTitle,
  DrawerDescription,
} from "@/components/ui/shadcn/drawer";
import { Button } from "@/components/ui/shadcn/button";
import {
  PublishStrip,
  type PlatformRow,
} from "./PublishStrip";
import { toast } from "@/components/providers/Toaster";
import { FirstRunHint } from "@/components/ui/states/FirstRunHint";
import { Check, Sparkles, Trash2 } from "lucide-react";
import type { Platform } from "@/lib/types/user";
import { APP } from "@/content/app";
import { cn } from "@/lib/utils";

/**
 * Video drawer — F3 + F6.
 *
 * Opens in place when a day is clicked on the weekly plan; never a route
 * change. Owns the video review experience:
 *   - script body (read-only for v1; inline editor lands in a follow-up)
 *   - regenerate / approve actions with optimistic UI
 *   - publish strip with per-platform dots
 *
 * This is the presentational shell. The parent (`/plan/current`) owns
 * state and wires the mutation handlers.
 */

export interface DrawerVideo {
  id: string;
  title: string;
  hook: string;
  script: string;
  dayOfWeek: string;
  platform: Platform;
  durationSeconds: number;
  status: "draft" | "approved";
  contentType: string;
}

export interface VideoDrawerProps {
  video: DrawerVideo | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  /** Platforms the user has wired + their current publish state. */
  publishRows: readonly PlatformRow[];
  onTogglePlatform: (p: Platform) => void;
  onConnectPlatform: (p: Platform) => void;
  onRetryPlatform: (p: Platform) => void;
  onPublish: () => void;
  onRegenerate?: () => void;
  onApprove?: () => void;
  /** Reject + undo pattern — runs immediately, caller provides restore. */
  onReject?: () => void;
}

export function VideoDrawer({
  video,
  open,
  onOpenChange,
  publishRows,
  onTogglePlatform,
  onConnectPlatform,
  onRetryPlatform,
  onPublish,
  onRegenerate,
  onApprove,
  onReject,
}: VideoDrawerProps) {
  const approved = video?.status === "approved";

  const handleReject = React.useCallback(() => {
    if (!video || !onReject) return;
    const title = video.title;
    onReject();
    onOpenChange(false);
    toast.undo(`Rejected "${title}"`, () => {
      // Caller's onReject implementation is responsible for pairing
      // with a restore — but we close the drawer and show the toast.
      // The restore path must be implemented by the caller when they
      // subscribe to their own action-registry hook.
    });
  }, [video, onReject, onOpenChange]);

  return (
    <Drawer open={open} onOpenChange={onOpenChange}>
      <DrawerContent aria-describedby={video ? "video-drawer-desc" : undefined}>
        {video ? (
          <>
            <DrawerHeader>
              <div className="flex-1 min-w-0 flex flex-col gap-1">
                <div className="flex items-center gap-2 text-[11px] uppercase tracking-wider text-text-tertiary tabular-nums">
                  <span>{video.dayOfWeek}</span>
                  <span aria-hidden="true">·</span>
                  <span>{video.durationSeconds}s</span>
                  <span aria-hidden="true">·</span>
                  <span>{video.platform}</span>
                </div>
                <DrawerTitle>{video.title}</DrawerTitle>
                <DrawerDescription id="video-drawer-desc">
                  {video.hook}
                </DrawerDescription>
              </div>
              {approved ? (
                <span
                  className={cn(
                    "shrink-0 inline-flex items-center gap-1",
                    "h-6 px-2 rounded-[var(--radius-input)]",
                    "text-[11px] font-medium",
                    "bg-accent-subtle text-accent"
                  )}
                >
                  <Check size={12} strokeWidth={1.5} />
                  Approved
                </span>
              ) : null}
            </DrawerHeader>

            <DrawerBody>
              <FirstRunHint
                capability="video.drawer"
                message="Approve to unlock the publish strip. Destructive actions can be undone for 5 seconds."
                className="mb-3"
              />

              <div className="flex flex-col gap-4">
                <section>
                  <h3 className="text-[11px] uppercase tracking-wider text-text-tertiary mb-1.5">
                    Script
                  </h3>
                  <pre
                    className={cn(
                      "whitespace-pre-wrap font-sans",
                      "text-[13px] leading-relaxed text-text-secondary",
                      "bg-elevated",
                      "border border-[color:var(--divider)]",
                      "rounded-[var(--radius-input)] p-3"
                    )}
                  >
                    {video.script || <span className="text-text-tertiary">No script yet.</span>}
                  </pre>
                </section>

                {approved ? (
                  <section>
                    <PublishStrip
                      rows={publishRows}
                      onToggle={onTogglePlatform}
                      onConnect={onConnectPlatform}
                      onRetry={onRetryPlatform}
                      onPublish={onPublish}
                    />
                  </section>
                ) : null}
              </div>
            </DrawerBody>

            <DrawerFooter>
              <div className="flex items-center gap-2">
                {onReject ? (
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={handleReject}
                    aria-label={APP.PLAN_UI?.hideScript ? "Reject" : "Reject"}
                  >
                    <Trash2 size={14} strokeWidth={1.5} aria-hidden="true" />
                    Reject
                  </Button>
                ) : null}
                {onRegenerate ? (
                  <Button
                    variant="secondary"
                    size="sm"
                    onClick={onRegenerate}
                  >
                    <Sparkles size={14} strokeWidth={1.5} aria-hidden="true" />
                    Regenerate
                  </Button>
                ) : null}
              </div>
              {onApprove && !approved ? (
                <Button
                  variant="primary"
                  size="sm"
                  onClick={onApprove}
                >
                  <Check size={14} strokeWidth={1.5} aria-hidden="true" />
                  Approve
                </Button>
              ) : null}
            </DrawerFooter>
          </>
        ) : null}
      </DrawerContent>
    </Drawer>
  );
}
