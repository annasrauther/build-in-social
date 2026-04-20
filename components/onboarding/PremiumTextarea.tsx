"use client";

import { forwardRef, useId, useState } from "react";

interface PremiumTextareaProps
  extends React.TextareaHTMLAttributes<HTMLTextAreaElement> {
  error?: string;
  /** Optional visible label rendered above the textarea with `htmlFor` pairing. */
  label?: string;
  /** Accessible label when a visible label is not used. Passed through to the textarea. */
  "aria-label"?: string;
}

/**
 * Premium textarea — same rotating gradient border as PremiumInput on focus.
 */
export const PremiumTextarea = forwardRef<HTMLTextAreaElement, PremiumTextareaProps>(
  function PremiumTextarea(
    { error, className = "", onFocus, onBlur, style, label, id: idProp, ...props },
    ref,
  ) {
    const [focused, setFocused] = useState(false);
    const reactId = useId();
    const id = idProp ?? reactId;

    return (
      <div className={className}>
        {label && (
          <label
            htmlFor={id}
            className="mb-1.5 block"
            style={{
              fontSize: "var(--type-supporting-mobile)",
              fontWeight: 500,
              color: "var(--text-primary)",
            }}
          >
            {label}
          </label>
        )}

        {/* Outer clipping wrapper */}
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

          {/* Textarea surface */}
          <div
            className="relative z-[1] overflow-hidden rounded-[var(--radius-md)]"
            style={{ backgroundColor: "var(--bg-surface)" }}
          >
            <textarea
              ref={ref}
              id={id}
              aria-invalid={error ? true : undefined}
              {...props}
              className="focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-500 focus-visible:ring-offset-2 focus-visible:ring-offset-[var(--bg-surface)] w-full font-normal bg-transparent border-none px-[14px] py-[12px] appearance-none resize-none leading-relaxed"
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
