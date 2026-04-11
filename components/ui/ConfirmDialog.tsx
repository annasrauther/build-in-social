"use client";

import { ResponsiveDialog } from "@/components/ui/Dialog";
import { Button, KIND, SIZE } from "baseui/button";

interface ConfirmDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  title: string;
  description: string;
  confirmLabel?: string;
  cancelLabel?: string;
  onConfirm: () => void;
  destructive?: boolean;
}

export function ConfirmDialog({
  open,
  onOpenChange,
  title,
  description,
  confirmLabel = "Confirm",
  cancelLabel = "Cancel",
  onConfirm,
  destructive = false,
}: ConfirmDialogProps) {
  return (
    <ResponsiveDialog
      open={open}
      onClose={() => onOpenChange(false)}
      title={title}
    >
      <p
        className="text-[var(--type-body-mobile)] tablet-sm:text-[var(--type-body-desktop)] mt-2"
        style={{ color: "var(--text-secondary)" }}
      >
        {description}
      </p>

      <div className="flex items-center gap-3 mt-6">
        <Button
          kind={KIND.primary}
          size={SIZE.compact}
          onClick={() => {
            onConfirm();
            onOpenChange(false);
          }}
          overrides={
            destructive
              ? {
                  BaseButton: {
                    style: ({ $theme }) => ({
                      backgroundColor: $theme.colors.negative,
                      color: "#FFFFFF",
                      ":hover": { backgroundColor: $theme.colors.negative400 },
                    }),
                  },
                }
              : undefined
          }
        >
          {confirmLabel}
        </Button>
        <Button
          kind={KIND.tertiary}
          size={SIZE.compact}
          onClick={() => onOpenChange(false)}
        >
          {cancelLabel}
        </Button>
      </div>
    </ResponsiveDialog>
  );
}
