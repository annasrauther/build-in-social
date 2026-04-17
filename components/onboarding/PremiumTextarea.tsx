"use client";

import { forwardRef, useState } from "react";

interface PremiumTextareaProps
  extends React.TextareaHTMLAttributes<HTMLTextAreaElement> {
  error?: string;
}

/**
 * Premium textarea — same rotating gradient border as PremiumInput on focus.
 */
export const PremiumTextarea = forwardRef<HTMLTextAreaElement, PremiumTextareaProps>(
  function PremiumTextarea({ error, className = "", onFocus, onBlur, style, ...props }, ref) {
    const [focused, setFocused] = useState(false);

    return (
      <div className={className}>
        {/* Outer clipping wrapper */}
        <div
          className="relative overflow-hidden p-[1.5px] rounded-[calc(var(--radius-md)+1.5px)]"
          style={{
            backgroundColor: error ? "var(--danger)" : "var(--border-default)",
          }}
        >
          {/* Rotating conic-gradient layer */}
          {focused && !error && (
            <div
              className="absolute left-1/2 top-1/2 w-[200%] h-[200%] pointer-events-none"
              style={{
                background:
                  "conic-gradient(from 0deg, transparent 0%, transparent 65%, var(--accent) 78%, #F0A875 85%, var(--accent) 93%, transparent 100%)",
                animation: "spin-gradient 5s linear infinite",
              }}
            />
          )}

          {/* Focused glow ring */}
          {focused && !error && (
            <div
              className="absolute -inset-[3px] pointer-events-none z-0 rounded-[calc(var(--radius-md)+4.5px)]"
              style={{
                boxShadow: "0 0 0 3px rgba(217,119,87,0.16)",
              }}
            />
          )}

          {/* Textarea surface */}
          <div
            className="relative z-[1] overflow-hidden rounded-[var(--radius-md)]"
            style={{ backgroundColor: "var(--bg-surface)" }}
          >
            <textarea
              ref={ref}
              {...props}
              className="focus:outline-none focus:ring-0 focus:border-transparent w-full font-normal bg-transparent border-none outline-none px-[14px] py-[12px] appearance-none resize-none leading-relaxed"
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
