"use client";

import { motion } from "framer-motion";
import { ArrowAnimated } from "@/components/marketing/ArrowAnimated";
import { Button } from "@/components/tremor/Button";

/* ─── Illustrations — theme-aware via currentColor, fill a 64×64 viewBox ──── */

const svgBase = {
  width: "100%",
  height: "100%",
  viewBox: "0 0 64 64",
  fill: "none",
  "aria-hidden": true as const,
  style: { color: "var(--text-secondary)" },
};

function ErrorIllustration() {
  return (
    <svg {...svgBase}>
      {/* Concentric rings — outer to inner */}
      <circle cx="32" cy="32" r="28" stroke="currentColor" strokeWidth="1.5" strokeOpacity="0.15" />
      <circle cx="32" cy="32" r="20" stroke="currentColor" strokeWidth="1.5" strokeOpacity="0.3" strokeDasharray="3 4" />
      <circle cx="32" cy="32" r="12" stroke="currentColor" strokeWidth="1.5" strokeOpacity="0.5" />
      {/* Accent disk with X */}
      <circle cx="32" cy="32" r="8" fill="var(--accent)" opacity="0.9" />
      <line x1="28" y1="28" x2="36" y2="36" stroke="white" strokeWidth="2" strokeLinecap="round" />
      <line x1="36" y1="28" x2="28" y2="36" stroke="white" strokeWidth="2" strokeLinecap="round" />
    </svg>
  );
}

function EmptyIllustration() {
  return (
    <svg {...svgBase}>
      {/* 4×4 dot grid spanning the viewBox */}
      {[10, 22, 34, 46].map((x) =>
        [10, 22, 34, 46].map((y) => {
          const isCenter = x === 34 && y === 22;
          return (
            <circle
              key={`${x}-${y}`}
              cx={x}
              cy={y}
              r={isCenter ? 3 : 2}
              fill={isCenter ? "var(--accent)" : "currentColor"}
              opacity={isCenter ? 0.95 : 0.3}
            />
          );
        })
      )}
      {/* Halo around the accent dot */}
      <circle cx="34" cy="22" r="8" stroke="var(--accent)" strokeWidth="1.2" strokeOpacity="0.35" fill="none" />
      <circle cx="34" cy="22" r="14" stroke="currentColor" strokeWidth="1" strokeOpacity="0.25" strokeDasharray="2 3" fill="none" />
      {/* Rising trend line */}
      <path d="M38 34 L48 48 M48 48 L48 42 M48 48 L42 48" stroke="currentColor" strokeWidth="1.8" strokeOpacity="0.5" strokeLinecap="round" strokeLinejoin="round" fill="none" />
    </svg>
  );
}

function SetupIllustration() {
  return (
    <svg {...svgBase}>
      {/* 3 checklist rows, spanning full width */}
      {[16, 32, 48].map((y, i) => (
        <g key={y}>
          {/* Checkbox circle */}
          <circle
            cx="12"
            cy={y}
            r="4"
            stroke="currentColor"
            strokeWidth="1.5"
            strokeOpacity="0.5"
            fill={i === 0 ? "var(--accent)" : "none"}
            opacity={i === 0 ? 0.95 : 1}
          />
          {i === 0 && (
            <path d="M10 16 L11.5 17.5 L14 15" stroke="white" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" fill="none" />
          )}
          {/* Row text bar */}
          <rect
            x="22"
            y={y - 3}
            width={[34, 26, 30][i]}
            height="6"
            rx="3"
            fill="currentColor"
            opacity={[0.35, 0.22, 0.15][i]}
          />
        </g>
      ))}
    </svg>
  );
}

function NotFoundIllustration() {
  return (
    <svg {...svgBase}>
      {/* Magnifying glass — handle */}
      <line x1="42" y1="42" x2="56" y2="56" stroke="currentColor" strokeWidth="3" strokeOpacity="0.5" strokeLinecap="round" />
      {/* Outer dashed search ring */}
      <circle cx="28" cy="28" r="20" stroke="currentColor" strokeWidth="1.5" strokeOpacity="0.3" strokeDasharray="3 3" fill="none" />
      {/* Inner solid lens */}
      <circle cx="28" cy="28" r="14" stroke="currentColor" strokeWidth="2" strokeOpacity="0.55" fill="none" />
      {/* Accent X at lens center */}
      <circle cx="28" cy="28" r="5" fill="var(--accent)" opacity="0.9" />
      <line x1="25" y1="25" x2="31" y2="31" stroke="white" strokeWidth="1.8" strokeLinecap="round" />
      <line x1="31" y1="25" x2="25" y2="31" stroke="white" strokeWidth="1.8" strokeLinecap="round" />
    </svg>
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
      className={`flex flex-col items-start gap-4 p-5 sm:flex-row sm:items-start sm:gap-6 sm:p-7 ${className}`}
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.25, ease: [0.16, 1, 0.3, 1] }}
      style={{
        borderRadius: "var(--radius-lg)",
        border: `1px solid ${BORDER_COLORS[variant]}`,
        backgroundColor: BG_COLORS[variant],
        boxShadow: "var(--shadow-sm)",
      }}
    >
      <div className="shrink-0 [&>svg]:h-16 [&>svg]:w-16 sm:[&>svg]:h-24 sm:[&>svg]:w-24">
        {ILLUSTRATIONS[variant]}
      </div>

      <div className="min-w-0 flex-1">
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
          <div className="flex flex-wrap items-center gap-2">
            {cta && (
              <Button
                asChild={Boolean(ctaHref)}
                variant={ctaGradient ? "primary" : "secondary"}
                onClick={ctaHref ? undefined : onCta}
                className="group"
              >
                {ctaHref ? (
                  <a href={ctaHref}>
                    {cta}
                    <ArrowAnimated />
                  </a>
                ) : (
                  <>
                    {cta}
                    <ArrowAnimated />
                  </>
                )}
              </Button>
            )}

            {secondaryCta && (
              <Button
                asChild={Boolean(secondaryCtaHref)}
                variant="ghost"
                onClick={secondaryCtaHref ? undefined : onSecondaryCta}
              >
                {secondaryCtaHref ? (
                  <a href={secondaryCtaHref}>{secondaryCta}</a>
                ) : (
                  <>{secondaryCta}</>
                )}
              </Button>
            )}
          </div>
        )}
      </div>
    </motion.div>
  );
}
