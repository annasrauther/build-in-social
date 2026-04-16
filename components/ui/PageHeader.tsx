"use client";

import Link from "next/link";
import { Wordmark } from "@/components/ui/Wordmark";

/**
 * Unified page header — one component for landing, onboarding, and app.
 *
 * Height: 75px. No border by default (matches landing).
 * Pass `border` to show the bottom rule.
 * Pass `right` for contextual actions (CTA, progress bar, avatar, etc.).
 *
 * For app pages, use `appTitle` + `appSubtitle` for the Uber Base display scale.
 */

interface PageHeaderProps {
  /** Content on the right side (buttons, progress bar, etc.) */
  right?: React.ReactNode;
  /** Show bottom border — default false (landing-style) */
  border?: boolean;
  /** App page title (display scale, replaces wordmark when set) */
  appTitle?: string;
  /** App page subtitle (body scale, below title) */
  appSubtitle?: string;
  /** Additional className */
  className?: string;
}

export function PageHeader({
  right,
  border = false,
  appTitle,
  appSubtitle,
  className,
}: PageHeaderProps) {
  return (
    <header
      className={`flex items-center justify-between px-4 tablet-sm:px-8 tablet-lg:px-10 shrink-0 ${className ?? ""}`}
      style={{
        minHeight: 75,
        backgroundColor: "var(--bg-page)",
        borderBottom: border ? "1px solid var(--border-default)" : "none",
      }}
    >
      {appTitle ? (
        <div className="flex flex-col gap-0.5">
          <h1
            className="text-[var(--type-display-mobile)] tablet-sm:text-[var(--type-display-desktop)]"
            style={{
              
              fontWeight: 400,
              lineHeight: 1.2,
              letterSpacing: "-0.02em",
              color: "var(--text-primary)",
            }}
          >
            {appTitle}
          </h1>
          {appSubtitle && (
            <p
              className="text-[var(--type-body-mobile)] tablet-sm:text-[var(--type-body-desktop)]"
              style={{ color: "var(--text-secondary)", lineHeight: 1.6 }}
            >
              {appSubtitle}
            </p>
          )}
        </div>
      ) : (
        <Link href="/" style={{ textDecoration: "none" }}>
          <Wordmark size={22} />
        </Link>
      )}

      {right && <div className="flex items-center gap-3">{right}</div>}
    </header>
  );
}
