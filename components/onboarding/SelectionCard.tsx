"use client";

import { useRef, useEffect } from "react";
import { motion, useAnimationControls } from "framer-motion";
import { Check } from "lucide-react";

interface SelectionCardProps {
  selected: boolean;
  onSelect: () => void;
  icon?: React.ReactNode;
  title: string;
  description?: string;
  /** Optional trailing content (e.g. badge, extra info) */
  trailing?: React.ReactNode;
}

export function SelectionCard({
  selected,
  onSelect,
  icon,
  title,
  description,
  trailing,
}: SelectionCardProps) {
  const controls = useAnimationControls();
  const prevSelected = useRef(selected);

  // Scale pulse on selection
  useEffect(() => {
    if (selected && !prevSelected.current) {
      controls.start({
        scale: [1, 1.02, 1],
        transition: { duration: 0.12, ease: [0.16, 1, 0.3, 1] },
      });
    }
    prevSelected.current = selected;
  }, [selected, controls]);

  return (
    <motion.button
      type="button"
      onClick={onSelect}
      className="relative w-full text-left"
      style={{
        minHeight: 44,
        padding: "16px 20px",
        borderRadius: "var(--radius-lg)",
        border: "none",
        backgroundColor: selected ? "var(--accent-subtle)" : "var(--bg-elevated)",
        cursor: "pointer",
        outline: "none",
      }}
      animate={controls}
      whileTap={{ scale: 0.98 }}
      transition={{ duration: 0.15 }}
    >
      <div className="flex items-start gap-3">
        {/* Icon */}
        {icon && (
          <div
            className="shrink-0 mt-0.5"
            style={{ color: "var(--text-primary)" }}
          >
            {icon}
          </div>
        )}

        {/* Content */}
        <div className="flex-1 min-w-0">
          <p
            style={{
              fontSize: "var(--type-body-mobile)",
              fontWeight: 500,
              color: "var(--text-primary)",
              lineHeight: 1.4,
            }}
          >
            {title}
          </p>
          {description && (
            <p
              className="mt-1"
              style={{
                fontSize: "var(--type-supporting-mobile)",
                color: "var(--text-secondary)",
                lineHeight: 1.5,
              }}
            >
              {description}
            </p>
          )}
        </div>

        {/* Trailing */}
        {trailing && <div className="shrink-0">{trailing}</div>}
      </div>

      {/* Checkmark badge */}
      <motion.div
        className="absolute flex items-center justify-center"
        style={{
          top: 12,
          right: 12,
          width: 24,
          height: 24,
          borderRadius: "50%",
          backgroundColor: selected ? "var(--accent)" : "var(--bg-overlay)",
          border: "none",
        }}
        initial={false}
        animate={{
          scale: selected ? 1 : 0.85,
          opacity: 1,
        }}
        transition={{
          type: "spring",
          stiffness: 500,
          damping: 25,
        }}
      >
        {selected && (
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ type: "spring", stiffness: 500, damping: 25 }}
          >
            <Check size={14} color="var(--text-inverse)" strokeWidth={2.5} />
          </motion.div>
        )}
      </motion.div>
    </motion.button>
  );
}
