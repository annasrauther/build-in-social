"use client";

import { useRef, useCallback } from "react";
import { motion, AnimatePresence, type PanInfo } from "framer-motion";

const EASE = [0.16, 1, 0.3, 1] as const;
const DISMISS_THRESHOLD = 100;

interface BottomSheetProps {
  open: boolean;
  onClose: () => void;
  children: React.ReactNode;
  /** Max height as viewport percentage (default: 85) */
  maxHeight?: number;
}

export function BottomSheet({
  open,
  onClose,
  children,
  maxHeight = 85,
}: BottomSheetProps): React.ReactElement {
  const sheetRef = useRef<HTMLDivElement>(null);

  const handleDragEnd = useCallback(
    (_: MouseEvent | TouchEvent | PointerEvent, info: PanInfo) => {
      if (info.offset.y > DISMISS_THRESHOLD || info.velocity.y > 300) {
        onClose();
      }
    },
    [onClose]
  );

  return (
    <AnimatePresence>
      {open && (
        <>
          {/* Backdrop — rgba(0,0,0,0.40) + blur(4px) */}
          <motion.div
            className="fixed inset-0 z-50 bg-black/40 backdrop-blur-[4px]"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.12 }}
            onClick={onClose}
          />

          {/* Sheet */}
          <motion.div
            ref={sheetRef}
            className="fixed inset-x-0 bottom-0 z-50 rounded-t-[var(--radius-lg)] overflow-y-auto"
            style={{
              maxHeight: `${maxHeight}vh`,
              backgroundColor: "var(--bg-page)",
              borderTop: "1px solid var(--border-default)",
              paddingBottom: "env(safe-area-inset-bottom)",
            }}
            initial={{ y: "100%" }}
            animate={{ y: 0 }}
            exit={{ y: "100%" }}
            transition={{ duration: 0.2, ease: EASE }}
            drag="y"
            dragConstraints={{ top: 0 }}
            dragElastic={0.1}
            onDragEnd={handleDragEnd}
          >
            {/* Drag handle */}
            <div
              className="sticky top-0 flex justify-center pt-3 pb-2 z-10"
              style={{ backgroundColor: "var(--bg-page)" }}
            >
              <div
                className="rounded-full"
                style={{
                  width: 32,
                  height: 4,
                  backgroundColor: "var(--border-strong)",
                }}
              />
            </div>

            {/* Content */}
            <div className="px-4 pb-6">{children}</div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
