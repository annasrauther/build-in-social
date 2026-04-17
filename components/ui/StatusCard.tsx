"use client";

import { motion } from "framer-motion";
import { ArrowAnimated } from "@/components/marketing/ArrowAnimated";

/* ─── Illustrations — 96px, white ───────────────────────────────────────── */

function ErrorIllustration() {
  return (
    <svg width="96" height="96" viewBox="0 0 80 80" fill="none" aria-hidden="true" style={{ flexShrink: 0 }}>
      <path d="M12 40 A28 28 0 1 1 40 68" stroke="rgba(255,255,255,0.1)" strokeWidth="1.5" strokeLinecap="round" />
      <path d="M40 68 A28 28 0 0 1 68 40" stroke="rgba(255,255,255,0.05)" strokeWidth="1.5" strokeLinecap="round" />
      <path d="M20 40 A20 20 0 1 1 40 60" stroke="rgba(255,255,255,0.2)" strokeWidth="1.5" strokeLinecap="round" />
      <path d="M40 60 A20 20 0 0 1 60 40" stroke="rgba(255,255,255,0.08)" strokeWidth="1.5" strokeLinecap="round" />
      <path d="M28 40 A12 12 0 1 1 40 52" stroke="rgba(255,255,255,0.38)" strokeWidth="1.5" strokeLinecap="round" />
      <circle cx="40" cy="40" r="3.5" fill="var(--accent)" opacity="0.9" />
      <line x1="36" y1="36" x2="44" y2="44" stroke="rgba(255,255,255,0.5)" strokeWidth="1.5" strokeLinecap="round" />
      <line x1="44" y1="36" x2="36" y2="44" stroke="rgba(255,255,255,0.5)" strokeWidth="1.5" strokeLinecap="round" />
      <circle cx="14" cy="32" r="2" fill="rgba(255,255,255,0.18)" />
      <circle cx="66" cy="52" r="1.5" fill="rgba(255,255,255,0.12)" />
      <circle cx="22" cy="62" r="1.5" fill="rgba(255,255,255,0.08)" />
    </svg>
  );
}

function EmptyIllustration() {
  return (
    <svg width="96" height="96" viewBox="0 0 80 80" fill="none" aria-hidden="true" style={{ flexShrink: 0 }}>
      {[20, 32, 44, 56].map((x) =>
        [20, 32, 44, 56].map((y) => (
          <circle
            key={`${x}-${y}`}
            cx={x} cy={y} r="1.5"
            fill={x === 44 && y === 32 ? "var(--accent)" : "rgba(255,255,255,0.12)"}
            opacity={x === 44 && y === 32 ? 0.9 : 1}
          />
        ))
      )}
      <circle cx="44" cy="32" r="8" stroke="rgba(255,255,255,0.2)" strokeWidth="1" fill="none" />
      <circle cx="44" cy="32" r="14" stroke="rgba(255,255,255,0.08)" strokeWidth="1" fill="none" strokeDasharray="2 4" />
      <path d="M50 38 L60 52 M55 52 L60 52 L60 47" stroke="rgba(255,255,255,0.28)" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

function SetupIllustration() {
  return (
    <svg width="96" height="96" viewBox="0 0 80 80" fill="none" aria-hidden="true" style={{ flexShrink: 0 }}>
      <line x1="16" y1="28" x2="64" y2="28" stroke="rgba(255,255,255,0.1)" strokeWidth="1" />
      <line x1="16" y1="40" x2="64" y2="40" stroke="rgba(255,255,255,0.1)" strokeWidth="1" />
      <line x1="16" y1="52" x2="64" y2="52" stroke="rgba(255,255,255,0.06)" strokeWidth="1" />
      <line x1="24" y1="22" x2="24" y2="58" stroke="rgba(255,255,255,0.08)" strokeWidth="1" />
      <rect x="28" y="24" width="28" height="6" rx="3" fill="rgba(255,255,255,0.16)" />
      <rect x="28" y="36" width="20" height="6" rx="3" fill="rgba(255,255,255,0.1)" />
      <rect x="28" y="48" width="24" height="6" rx="3" fill="rgba(255,255,255,0.07)" />
      <circle cx="18" cy="27" r="2.5" fill="var(--accent)" opacity="0.7" />
      <circle cx="18" cy="39" r="2.5" fill="rgba(255,255,255,0.18)" />
      <circle cx="18" cy="51" r="2.5" fill="rgba(255,255,255,0.1)" />
      <path d="M56 40 L62 40 M59 37 L62 40 L59 43" stroke="rgba(255,255,255,0.4)" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

function NotFoundIllustration() {
  return (
    <svg width="96" height="96" viewBox="0 0 80 80" fill="none" aria-hidden="true" style={{ flexShrink: 0 }}>
      <circle cx="36" cy="36" r="16" stroke="rgba(255,255,255,0.25)" strokeWidth="1.5" strokeDasharray="3 3" />
      <circle cx="36" cy="36" r="10" stroke="rgba(255,255,255,0.14)" strokeWidth="1" />
      <line x1="48" y1="48" x2="60" y2="60" stroke="rgba(255,255,255,0.32)" strokeWidth="2" strokeLinecap="round" />
      <line x1="32" y1="32" x2="40" y2="40" stroke="rgba(255,255,255,0.42)" strokeWidth="1.5" strokeLinecap="round" />
      <line x1="40" y1="32" x2="32" y2="40" stroke="rgba(255,255,255,0.42)" strokeWidth="1.5" strokeLinecap="round" />
      <circle cx="20" cy="20" r="1.5" fill="rgba(255,255,255,0.14)" />
      <circle cx="58" cy="24" r="1.5" fill="rgba(255,255,255,0.1)" />
      <circle cx="18" cy="54" r="1" fill="rgba(255,255,255,0.08)" />
    </svg>
  );
}

/* ─── Gradient CTA ───────────────────────────────────────────────────────── */

const GRADIENT = "linear-gradient(135deg, #FAFAFA 0%, #9CA3AF 100%)";

function GradientCta({
  label,
  onClick,
  href,
}: {
  label: string;
  onClick?: () => void;
  href?: string;
}) {
  const baseStyle: React.CSSProperties = {
    background: GRADIENT,
    color: "#141413",
    border: "none",
    borderRadius: "var(--radius-md)",
    padding: "10px 18px",
    fontSize: "var(--type-body-mobile)",
    fontWeight: 600,
    cursor: "pointer",
    display: "inline-flex",
    alignItems: "center",
    gap: 6,
    minHeight: 44,
    letterSpacing: "-0.01em",
    textDecoration: "none",
  };

  if (href) {
    return (
      <a href={href} style={baseStyle} className="group">
        {label}<ArrowAnimated />
      </a>
    );
  }
  return (
    <button type="button" onClick={onClick} style={baseStyle} className="group">
      {label}<ArrowAnimated />
    </button>
  );
}

/* ─── Card ───────────────────────────────────────────────────────────────── */

type StatusVariant = "error" | "empty" | "setup" | "notFound";

const ILLUSTRATIONS: Record<StatusVariant, React.ReactNode> = {
  error: <ErrorIllustration />,
  empty: <EmptyIllustration />,
  setup: <SetupIllustration />,
  notFound: <NotFoundIllustration />,
};

const BORDER_COLORS: Record<StatusVariant, string> = {
  error: "rgba(217,119,87,0.2)",
  empty: "var(--border-default)",
  setup: "rgba(217,119,87,0.15)",
  notFound: "var(--border-default)",
};

const BG_COLORS: Record<StatusVariant, string> = {
  error: "rgba(217,119,87,0.04)",
  empty: "var(--bg-surface)",
  setup: "rgba(217,119,87,0.03)",
  notFound: "var(--bg-surface)",
};

interface StatusCardProps {
  variant?: StatusVariant;
  title: string;
  description?: string;
  cta?: string;
  onCta?: () => void;
  ctaHref?: string;
  ctaGradient?: boolean;
  secondaryCta?: string;
  onSecondaryCta?: () => void;
  secondaryCtaHref?: string;
  className?: string;
}

export function StatusCard({
  variant = "error",
  title,
  description,
  cta,
  onCta,
  ctaHref,
  ctaGradient,
  secondaryCta,
  onSecondaryCta,
  secondaryCtaHref,
  className = "",
}: StatusCardProps) {
  return (
    <motion.div
      className={className}
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.25, ease: [0.16, 1, 0.3, 1] }}
      style={{
        display: "flex",
        gap: 24,
        alignItems: "flex-start",
        borderRadius: "var(--radius-lg)",
        border: `1px solid ${BORDER_COLORS[variant]}`,
        backgroundColor: BG_COLORS[variant],
        padding: "28px 32px",
        boxShadow: "var(--shadow-sm)",
      }}
    >
      {ILLUSTRATIONS[variant]}

      <div style={{ flex: 1, minWidth: 0 }}>
        <p
          className="font-sans"
          style={{
            fontWeight: 700,
            fontSize: 17,
            color: "var(--text-primary)",
            letterSpacing: "-0.01em",
            marginBottom: description ? 6 : 0,
          }}
        >
          {title}
        </p>
        {description && (
          <p
            style={{
              fontSize: "var(--type-body-mobile)",
              color: "var(--text-secondary)",
              lineHeight: 1.6,
              marginBottom: (cta || secondaryCta) ? 20 : 0,
            }}
          >
            {description}
          </p>
        )}
        {(cta || secondaryCta) && (
          <div style={{ display: "flex", gap: 8, flexWrap: "wrap", alignItems: "center" }}>
            {/* Primary CTA */}
            {cta && (
              ctaGradient ? (
                <GradientCta label={cta} onClick={onCta} href={ctaHref} />
              ) : ctaHref ? (
                <a
                  href={ctaHref}
                  className="group inline-flex items-center gap-1.5 font-semibold"
                  style={{
                    padding: "10px 18px",
                    minHeight: 44,
                    borderRadius: "var(--radius-md)",
                    backgroundColor: "var(--bg-elevated)",
                    border: "1px solid var(--border-default)",
                    color: "var(--text-primary)",
                    fontSize: "var(--type-body-mobile)",
                    textDecoration: "none",
                  }}
                >
                  {cta}<ArrowAnimated />
                </a>
              ) : (
                <button
                  type="button"
                  onClick={onCta}
                  className="group inline-flex items-center gap-1.5 font-semibold"
                  style={{
                    padding: "10px 18px",
                    minHeight: 44,
                    borderRadius: "var(--radius-md)",
                    backgroundColor: "var(--bg-elevated)",
                    border: "1px solid var(--border-default)",
                    color: "var(--text-primary)",
                    fontSize: "var(--type-body-mobile)",
                    cursor: "pointer",
                  }}
                >
                  {cta}<ArrowAnimated />
                </button>
              )
            )}

            {/* Secondary CTA */}
            {secondaryCta && (
              secondaryCtaHref ? (
                <a
                  href={secondaryCtaHref}
                  style={{
                    padding: "10px 14px",
                    minHeight: 44,
                    color: "var(--text-tertiary)",
                    fontSize: "var(--type-body-mobile)",
                    textDecoration: "none",
                    display: "inline-flex",
                    alignItems: "center",
                  }}
                >
                  {secondaryCta}
                </a>
              ) : (
                <button
                  type="button"
                  onClick={onSecondaryCta}
                  style={{
                    padding: "10px 14px",
                    minHeight: 44,
                    color: "var(--text-tertiary)",
                    fontSize: "var(--type-body-mobile)",
                    background: "none",
                    border: "none",
                    cursor: "pointer",
                    display: "inline-flex",
                    alignItems: "center",
                  }}
                >
                  {secondaryCta}
                </button>
              )
            )}
          </div>
        )}
      </div>
    </motion.div>
  );
}
