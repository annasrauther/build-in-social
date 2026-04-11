"use client";

import {
  Modal,
  ModalHeader,
  ModalBody,
} from "baseui/modal";
import { BottomSheet } from "./BottomSheet";

/* ─── ResponsiveDialog ────────────────────────────────────
   On mobile (<768px): renders a BottomSheet.
   On desktop: renders a Base Web Modal.
   ───────────────────────────────────────────────────────── */

interface ResponsiveDialogProps {
  open: boolean;
  onClose: () => void;
  children: React.ReactNode;
  /** Title shown in the modal/sheet header */
  title?: string;
}

export function ResponsiveDialog({
  open,
  onClose,
  children,
  title,
}: ResponsiveDialogProps): React.ReactElement {
  return (
    <>
      {/* Mobile: BottomSheet */}
      <div className="tablet-sm:hidden">
        <BottomSheet open={open} onClose={onClose}>
          {title && (
            <h2
              className="text-[var(--type-display-mobile)] font-medium mb-4"
              style={{
                fontFamily: "var(--font-heading)",
                fontWeight: 400,
                color: "var(--text-primary)",
              }}
            >
              {title}
            </h2>
          )}
          {children}
        </BottomSheet>
      </div>

      {/* Desktop: Base Web Modal */}
      <div className="hidden tablet-sm:block">
        <Modal
          isOpen={open}
          onClose={onClose}
        >
          {title && <ModalHeader>{title}</ModalHeader>}
          <ModalBody>{children}</ModalBody>
        </Modal>
      </div>
    </>
  );
}
