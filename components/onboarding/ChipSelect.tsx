"use client";

import { useState, useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { EASE_SPRING, STAGGER_CHILDREN } from "@/lib/constants/onboarding";

interface ChipSelectProps {
  options: readonly string[];
  selected: string[];
  onChange: (selected: string[]) => void;
  max?: number;
  searchable?: boolean;
  placeholder?: string;
}

export function ChipSelect({
  options,
  selected,
  onChange,
  max = 3,
  searchable = true,
  placeholder = "Search...",
}: ChipSelectProps) {
  const [query, setQuery] = useState("");

  const filtered = useMemo(() => {
    if (!query.trim()) return [...options];
    const q = query.toLowerCase();
    return options.filter((o) => o.toLowerCase().includes(q));
  }, [options, query]);

  const toggle = (option: string) => {
    if (selected.includes(option)) {
      onChange(selected.filter((s) => s !== option));
    } else if (selected.length < max) {
      onChange([...selected, option]);
    }
  };

  return (
    <div>
      {/* Search */}
      {searchable && (
        <div className="mb-4">
          <input
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder={placeholder}
            style={{
              width: "100%",
              height: 44,
              fontSize: 15,
              fontFamily: "var(--font-sans)",
              color: "var(--text-primary)",
              backgroundColor: "transparent",
              border: "none",
              borderBottom: "1px solid var(--border-subtle)",
              outline: "none",
              padding: "0 0 4px 0",
              caretColor: "var(--accent)",
            }}
          />
        </div>
      )}

      {/* Counter */}
      <div className="mb-3 flex items-center justify-between">
        <p style={{ fontSize: "var(--type-supporting-mobile)", color: "var(--text-tertiary)" }}>
          <motion.span
            key={selected.length}
            initial={{ opacity: 0, y: -4 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.12 }}
            style={{ display: "inline-block" }}
          >
            {selected.length}
          </motion.span>
          {" / "}{max} selected
        </p>
      </div>

      {/* Chips grid */}
      <motion.div
        className="flex flex-wrap gap-2"
        initial="hidden"
        animate="visible"
        variants={{
          hidden: {},
          visible: { transition: { staggerChildren: STAGGER_CHILDREN } },
        }}
      >
        <AnimatePresence>
          {filtered.map((option) => {
            const isSelected = selected.includes(option);
            const isDisabled = !isSelected && selected.length >= max;

            return (
              <motion.button
                key={option}
                type="button"
                onClick={() => !isDisabled && toggle(option)}
                variants={{
                  hidden: { opacity: 0, y: 8 },
                  visible: {
                    opacity: 1,
                    y: 0,
                    transition: { duration: 0.3, ease: [...EASE_SPRING] },
                  },
                }}
                whileTap={isDisabled ? undefined : { scale: 0.95 }}
                style={{
                  height: 44,
                  padding: "0 16px",
                  borderRadius: 22,
                  fontSize: "var(--type-body-mobile)",
                  fontWeight: isSelected ? 500 : 400,
                  fontFamily: "var(--font-sans)",
                  cursor: isDisabled ? "default" : "pointer",
                  border: "none",
                  backgroundColor: isSelected ? "var(--accent-subtle)" : "var(--bg-elevated)",
                  color: isSelected ? "var(--text-primary)" : "var(--text-primary)",
                  opacity: isDisabled ? 0.4 : 1,
                  transition: "background-color 120ms, color 120ms, border-color 120ms, opacity 120ms",
                }}
              >
                {option}
              </motion.button>
            );
          })}
        </AnimatePresence>
      </motion.div>
    </div>
  );
}
