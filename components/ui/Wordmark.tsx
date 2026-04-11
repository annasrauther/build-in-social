/**
 * Unified Build In Social wordmark.
 *
 * Two-weight treatment:
 *   "Build In" — Geist 400, --text-primary
 *   "Social"  — Geist 700, --text-primary
 *
 * On dark backgrounds, pass variant="inverse" to use --text-inverse for both.
 * This component is the single source of truth for the brand wordmark.
 * Use it in LandingNav, OnboardingShell, Sidebar, and MobileNav.
 */

interface WordmarkProps {
  /** Size in px — defaults to 18 */
  size?: number;
  /** "default" for light bg, "inverse" for dark bg */
  variant?: "default" | "inverse";
  className?: string;
}

export function Wordmark({
  size = 18,
  variant = "default",
  className,
}: WordmarkProps) {
  const color = variant === "inverse" ? "var(--text-inverse)" : "var(--text-primary)";

  return (
    <span
      className={className}
      style={{
        fontSize: size,
        fontFamily: "var(--font-sans)",
        letterSpacing: "-0.03em",
        lineHeight: 1,
        whiteSpace: "nowrap",
        color,
      }}
    >
      <span style={{ fontWeight: 400 }}>Build In </span>
      <span style={{ fontWeight: 700 }}>Social</span>
    </span>
  );
}
