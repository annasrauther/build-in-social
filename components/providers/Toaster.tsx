"use client";

import { Toaster as SonnerToaster, toast as sonnerToast } from "sonner";
import type { ExternalToast } from "sonner";

/**
 * Sonner toaster mounted once at app root (via `components/providers.tsx`).
 *
 * Dark-only styling via our token CSS vars. The `toast.undo(...)` helper
 * is the product's destructive-action pattern — show a toast with an
 * "Undo" action for 5 seconds instead of a confirm dialog.
 */
export function Toaster() {
  return (
    <SonnerToaster
      position="bottom-right"
      theme="dark"
      offset={16}
      gap={8}
      visibleToasts={4}
      duration={4000}
      closeButton={false}
      toastOptions={{
        unstyled: false,
        classNames: {
          toast: [
            "!bg-[color:var(--elevated)]",
            "!text-[color:var(--text)]",
            "!border !border-[color:var(--border)]",
            "!rounded-[var(--radius-card)]",
            "!px-3 !py-2.5 !text-[13px] !leading-snug",
            "!font-[family-name:var(--font-sans)]",
          ].join(" "),
          title: "!text-[color:var(--text)] !font-medium",
          description: "!text-[color:var(--text-secondary)]",
          actionButton: [
            "!bg-[color:var(--accent)]",
            "!text-white",
            "!rounded-[var(--radius-input)]",
            "!px-2.5 !h-7 !text-[12px]",
          ].join(" "),
          cancelButton: [
            "!bg-transparent",
            "!text-[color:var(--text-secondary)]",
            "!rounded-[var(--radius-input)]",
            "!px-2.5 !h-7 !text-[12px]",
            "hover:!bg-[color-mix(in_srgb,var(--gray-12)_4%,transparent)]",
          ].join(" "),
          success:
            "!border-[color:var(--success-subtle)] [&_[data-icon]_svg]:!text-[color:var(--success)]",
          error:
            "!border-[color:var(--danger-subtle)] [&_[data-icon]_svg]:!text-[color:var(--danger)]",
          info: "",
          warning:
            "[&_[data-icon]_svg]:!text-[color:var(--warning)]",
        },
      }}
    />
  );
}

// -------------------------------------------------------------------
// toast API wrapper — re-exports sonner's toast plus our undo helper.
// -------------------------------------------------------------------

interface UndoOptions extends ExternalToast {
  /** Milliseconds before the toast auto-dismisses and the action is no longer reversible. Default 5000. */
  duration?: number;
  /** Label shown on the undo action button. Default "Undo". */
  actionLabel?: string;
}

/**
 * Destructive-action toast with an Undo affordance.
 *
 * Usage: execute the mutation immediately (optimistic), then call this.
 * The caller provides an `onUndo` callback that restores the pre-mutation
 * state. Sonner's action button runs synchronously when clicked.
 *
 * ```ts
 * rejectScript(dayId); // executes immediately
 * toast.undo("Rejected Monday's script", () => restoreScript(dayId));
 * ```
 */
function undo(
  message: string,
  onUndo: () => void,
  opts: UndoOptions = {}
): string | number {
  const { duration = 5000, actionLabel = "Undo", ...rest } = opts;
  return sonnerToast(message, {
    duration,
    action: {
      label: actionLabel,
      onClick: () => onUndo(),
    },
    ...rest,
  });
}

export const toast = Object.assign(sonnerToast, { undo });
