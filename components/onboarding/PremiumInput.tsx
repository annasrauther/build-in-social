"use client";

import { forwardRef, useState, useEffect, useId } from "react";

interface PremiumInputProps
  extends React.InputHTMLAttributes<HTMLInputElement> {
  error?: string;
  /** Optional visible label rendered above the input with `htmlFor` pairing. */
  label?: string;
  /** Accessible label when a visible label is not used. Passed through to the input. */
  "aria-label"?: string;
}

/**
 * Premium input — enclosed box with rotating conic-gradient border on focus.
 * No blue, no browser outline. Warm orange spin on focus.
 */
export const PremiumInput = forwardRef<HTMLInputElement, PremiumInputProps>(
  function PremiumInput(
    {
      error,
      className = "",
      onFocus,
      onBlur,
      style,
      autoFocus,
      label,
      id: idProp,
      ...props
    },
    ref,
  ) {
    const [focused, setFocused] = useState(false);
    const reactId = useId();
    const id = idProp ?? reactId;

    // autoFocus fires before React state hydrates — manually sync focused state
    useEffect(() => {
      if (autoFocus) setFocused(true);
      // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

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
              id={id}
              autoFocus={autoFocus}
              aria-invalid={error ? true : undefined}
              {...props}
              className="focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-500 focus-visible:ring-offset-2 focus-visible:ring-offset-[var(--bg-surface)] w-full h-[52px] font-normal bg-transparent border-none px-[14px] appearance-none"
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
