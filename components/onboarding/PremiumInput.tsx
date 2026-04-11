"use client";

import { forwardRef, useState } from "react";
import { motion } from "framer-motion";

interface PremiumInputProps
  extends React.InputHTMLAttributes<HTMLInputElement> {
  error?: string;
}

export const PremiumInput = forwardRef<HTMLInputElement, PremiumInputProps>(
  function PremiumInput({ error, className = "", onFocus, onBlur, ...props }, ref) {
    const [focused, setFocused] = useState(false);

    return (
      <div className={className}>
        <div className="relative">
          <input
            ref={ref}
            {...props}
            onFocus={(e) => {
              setFocused(true);
              onFocus?.(e);
            }}
            onBlur={(e) => {
              setFocused(false);
              onBlur?.(e);
            }}
            style={{
              width: "100%",
              height: 56,
              fontSize: "var(--type-body-mobile)",
              fontFamily: "var(--font-sans)",
              fontWeight: 400,
              color: "var(--text-primary)",
              backgroundColor: "transparent",
              border: "none",
              borderBottom: `1px solid ${error ? "var(--danger)" : "var(--border-subtle)"}`,
              outline: "none",
              padding: "0 0 4px 0",
              caretColor: "var(--accent)",
              transition: "border-color 120ms ease",
            }}
          />

          {/* Animated focus underline — left to right wipe */}
          <motion.div
            style={{
              position: "absolute",
              bottom: 0,
              left: 0,
              right: 0,
              height: 2,
              backgroundColor: error ? "var(--danger)" : "var(--accent)",
              transformOrigin: "left",
            }}
            initial={false}
            animate={{ scaleX: focused ? 1 : 0 }}
            transition={{ duration: 0.12, ease: [0.16, 1, 0.3, 1] }}
          />
        </div>

        {error && (
          <motion.p
            initial={{ opacity: 0, y: -4 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.12 }}
            className="mt-2"
            style={{ fontSize: "var(--type-supporting-mobile)", color: "var(--danger)" }}
          >
            {error}
          </motion.p>
        )}
      </div>
    );
  },
);
