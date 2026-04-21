"use client";

import { useRef, useEffect } from "react";
import { motion, useAnimationControls } from "motion/react";
import { Check } from "lucide-react";

interface SelectionCardProps {
  selected: boolean;
  onSelect: () => void;
  icon?: React.ReactNode;
  title: string;
  description?: string;
  /** Optional trailing content (e.g. badge, extra info) */
  trailing?: React.ReactNode;
  /**
   * ARIA variant — determines semantic role.
   *  - "radio"    → role="radio" + aria-checked (single-select groups)
   *  - "checkbox" → role="checkbox" + aria-checked (multi-select groups)
   * Defaults to "radio".
   */
  variant?: "radio" | "checkbox";
}

export function SelectionCard({
  selected,
  onSelect,
  icon,
  title,
  description,
  trailing,
  variant = "radio",
}: SelectionCardProps) {
  const controls = useAnimationControls();
  const prevSelected = useRef(selected);

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
    <div
      className="relative overflow-hidden rounded-[calc(var(--radius-lg)+1.5px)] transition-shadow duration-150"
      style={{
        padding: selected ? "1.5px" : 0,
        boxShadow: selected ? "0 0 0 3px rgba(217,119,87,0.16)" : "none",
        backgroundColor: selected ? "transparent" : "transparent",
      }}
    >
      {/* Traveling focus beam — only rendered when selected */}
      {selected && (
        <motion.div
          animate={{ opacity: 1 }}
          initial={{ opacity: 0 }}
          transition={{ duration: 0.2 }}
          className="focus-beam-layer"
        />
      )}

      <motion.button
        type="button"
        onClick={onSelect}
        role={variant}
        aria-checked={selected}
        className="relative w-full text-left min-h-[44px] px-5 py-4 cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--accent)] focus-visible:ring-offset-2 focus-visible:ring-offset-[var(--bg-page)] z-[1] rounded-[var(--radius-lg)]"
        style={{
          backgroundColor: "var(--bg-elevated)",
          border: selected ? "none" : "1px solid var(--border-default)",
        }}
        animate={controls}
        whileTap={{ scale: 0.98 }}
        transition={{ duration: 0.15 }}
      >
        <div className="flex items-start gap-3">
          {/* Icon */}
          {icon && (
            <div className="shrink-0 mt-0.5" style={{ color: "var(--text-primary)" }}>
              {icon}
            </div>
          )}

          {/* Content */}
          <div className="flex-1 min-w-0">
            <p
              className="font-medium leading-snug"
              style={{
                fontSize: "var(--type-body-mobile)",
                color: "var(--text-primary)",
              }}
            >
              {title}
            </p>
            {description && (
              <p
                className="mt-1 leading-normal"
                style={{
                  fontSize: "var(--type-supporting-mobile)",
                  color: "var(--text-secondary)",
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
          className="absolute top-3 right-3 w-6 h-6 rounded-full flex items-center justify-center border-none"
          style={{
            backgroundColor: selected ? "var(--accent)" : "var(--bg-overlay)",
          }}
          initial={false}
          animate={{ scale: selected ? 1 : 0.85, opacity: 1 }}
          transition={{ type: "spring", stiffness: 500, damping: 25 }}
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
    </div>
  );
}
