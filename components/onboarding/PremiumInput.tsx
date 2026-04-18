"use client";

import { forwardRef, useState, useEffect } from "react";

interface PremiumInputProps
  extends React.InputHTMLAttributes<HTMLInputElement> {
  error?: string;
}

/**
 * Premium input — enclosed box with rotating conic-gradient border on focus.
 * No blue, no browser outline. Warm orange spin on focus.
 */
export const PremiumInput = forwardRef<HTMLInputElement, PremiumInputProps>(
  function PremiumInput({ error, className = "", onFocus, onBlur, style, autoFocus, ...props }, ref) {
    const [focused, setFocused] = useState(false);

    // autoFocus fires before React state hydrates — manually sync focused state
    useEffect(() => {
      if (autoFocus) setFocused(true);
    // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    return (
      <div className={className}>
        {/* Outer clipping wrapper — creates the gradient border space */}
        <div
          className="relative overflow-hidden p-[1.5px] rounded-[calc(var(--radius-md)+1.5px)]"
          style={{
            backgroundColor: error ? "var(--danger)" : "var(--border-default)",
          }}
        >
          {/* Focus beam — traveling gradient border, only visible on focus */}
          {focused && !error && <div className="focus-beam-layer" />}

          {/* Focused glow ring */}
          {focused && !error && (
            <div
              className="absolute -inset-[3px] pointer-events-none z-0 rounded-[calc(var(--radius-md)+4.5px)]"
              style={{
                boxShadow: "0 0 0 3px rgba(217,119,87,0.16)",
              }}
            />
          )}

          {/* Input surface */}
          <div
            className="relative z-[1] overflow-hidden rounded-[var(--radius-md)]"
            style={{ backgroundColor: "var(--bg-surface)" }}
          >
            <input
              ref={ref}
              autoFocus={autoFocus}
              {...props}
              className="focus:outline-none focus:ring-0 focus:border-transparent w-full h-[52px] font-normal bg-transparent border-none outline-none px-[14px] appearance-none"
              onFocus={(e) => {
                setFocused(true);
                onFocus?.(e);
              }}
              onBlur={(e) => {
                setFocused(false);
                onBlur?.(e);
              }}
              style={{
                fontSize: "var(--type-body-mobile)",
                color: "var(--text-primary)",
                caretColor: "var(--accent)",
                ...style,
              }}
            />
          </div>
        </div>

        {error && (
          <p
            className="mt-2 pl-1"
            style={{
              fontSize: "var(--type-supporting-mobile)",
              color: "var(--danger)",
            }}
          >
            {error}
          </p>
        )}
      </div>
    );
  },
);
