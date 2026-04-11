/**
 * check-contrast.ts
 * WCAG 2.1 contrast ratio checker for Build In Social white + black accent token system.
 * Run: npx tsx scripts/check-contrast.ts
 */

// ─── Colour utilities ─────────────────────────────────────

function hexToRgb(hex: string): [number, number, number] {
  const cleaned = hex.replace("#", "");
  const full =
    cleaned.length === 3
      ? cleaned
          .split("")
          .map((c) => c + c)
          .join("")
      : cleaned;
  const r = parseInt(full.slice(0, 2), 16);
  const g = parseInt(full.slice(2, 4), 16);
  const b = parseInt(full.slice(4, 6), 16);
  return [r, g, b];
}

function rgbaToRgb(
  fg: [number, number, number],
  alpha: number,
  bg: [number, number, number]
): [number, number, number] {
  return [
    Math.round(fg[0] * alpha + bg[0] * (1 - alpha)),
    Math.round(fg[1] * alpha + bg[1] * (1 - alpha)),
    Math.round(fg[2] * alpha + bg[2] * (1 - alpha)),
  ];
}

function linearize(c: number): number {
  const sRgb = c / 255;
  return sRgb <= 0.04045 ? sRgb / 12.92 : Math.pow((sRgb + 0.055) / 1.055, 2.4);
}

function relativeLuminance(r: number, g: number, b: number): number {
  return (
    0.2126 * linearize(r) +
    0.7152 * linearize(g) +
    0.0722 * linearize(b)
  );
}

function contrastRatio(
  fg: [number, number, number],
  bg: [number, number, number]
): number {
  const L1 = relativeLuminance(...fg);
  const L2 = relativeLuminance(...bg);
  const lighter = Math.max(L1, L2);
  const darker = Math.min(L1, L2);
  return (lighter + 0.05) / (darker + 0.05);
}

// ─── Token colours ─────────────────────────────────────────

const BG_PAGE: [number, number, number]    = hexToRgb("#FAFAF8");
const BG_SURFACE: [number, number, number] = hexToRgb("#FFFFFF");
const BG_ELEVATED: [number, number, number] = hexToRgb("#F5F3EE");
const BG_DARK: [number, number, number]    = hexToRgb("#1A1612");

const TEXT_PRIMARY: [number, number, number]   = hexToRgb("#1A1612");
const TEXT_SECONDARY: [number, number, number] = hexToRgb("#4A3F2F");
const TEXT_TERTIARY: [number, number, number]  = hexToRgb("#7A6A55");
const TEXT_GOLD: [number, number, number]      = hexToRgb("#6B4F0E");
const TEXT_INVERSE: [number, number, number]   = hexToRgb("#FAFAF8");

const GOLD: [number, number, number]       = hexToRgb("#8B6914");
const GOLD_BRIGHT: [number, number, number] = hexToRgb("#A07820");
const GOLD_DIM: [number, number, number]   = hexToRgb("#C9A84C");

// Composite: lp-gold-subtle (rgba(139,105,20,0.07)) on white
const GOLD_SUBTLE_ON_WHITE = rgbaToRgb([139, 105, 20], 0.07, BG_SURFACE);

// ─── Helpers ───────────────────────────────────────────────

type WcagLevel = "AAA" | "AA" | "AA Large" | "FAIL";

function wcagLevel(ratio: number): WcagLevel {
  if (ratio >= 7)    return "AAA";
  if (ratio >= 4.5)  return "AA";
  if (ratio >= 3)    return "AA Large";
  return "FAIL";
}

interface Check {
  name: string;
  fg: [number, number, number];
  bg: [number, number, number];
  usage: string;
}

const CHECKS: Check[] = [
  // Text on page bg (#FAFAF8)
  { name: "text-primary on bg-page",     fg: TEXT_PRIMARY,   bg: BG_PAGE,    usage: "Body text" },
  { name: "text-secondary on bg-page",   fg: TEXT_SECONDARY, bg: BG_PAGE,    usage: "Secondary text" },
  { name: "text-tertiary on bg-page",    fg: TEXT_TERTIARY,  bg: BG_PAGE,    usage: "Captions, labels" },
  { name: "text-gold on bg-page",        fg: TEXT_GOLD,      bg: BG_PAGE,    usage: "Gold accent text" },

  // Text on white surface
  { name: "text-primary on bg-surface",   fg: TEXT_PRIMARY,   bg: BG_SURFACE,  usage: "Card body" },
  { name: "text-secondary on bg-surface", fg: TEXT_SECONDARY, bg: BG_SURFACE,  usage: "Card secondary" },
  { name: "text-tertiary on bg-surface",  fg: TEXT_TERTIARY,  bg: BG_SURFACE,  usage: "Card captions" },
  { name: "text-gold on bg-surface",      fg: TEXT_GOLD,      bg: BG_SURFACE,  usage: "Eyebrow, gold label" },

  // Text on elevated (#F5F3EE)
  { name: "text-primary on bg-elevated",   fg: TEXT_PRIMARY,   bg: BG_ELEVATED, usage: "HowItWorks section body" },
  { name: "text-secondary on bg-elevated", fg: TEXT_SECONDARY, bg: BG_ELEVATED, usage: "HowItWorks step body" },
  { name: "text-gold on bg-elevated",      fg: TEXT_GOLD,      bg: BG_ELEVATED, usage: "Gold on elevated bg" },

  // Buttons
  { name: "text-inverse on gold (lp-btn-primary)", fg: TEXT_INVERSE, bg: GOLD,       usage: "Primary CTA button" },
  { name: "text-inverse on gold-bright (hover)",   fg: TEXT_INVERSE, bg: GOLD_BRIGHT, usage: "Primary CTA hover" },
  { name: "gold-dim on dark bg (ghost-dark)",       fg: GOLD_DIM,     bg: BG_DARK,    usage: "Final CTA ghost button" },

  // Dark section (FinalCta)
  { name: "text-inverse on dark-section bg",    fg: TEXT_INVERSE, bg: BG_DARK, usage: "FinalCta headline" },
  { name: "text-secondary-dark on dark-section", fg: [250, 250, 248], bg: BG_DARK, usage: "FinalCta subhead (opacity)" },

  // Gold text on gold-subtle bg (eyebrow pill)
  { name: "text-gold on gold-subtle (eyebrow pill)", fg: TEXT_GOLD, bg: GOLD_SUBTLE_ON_WHITE, usage: "Hero eyebrow pill" },

  // Gold as decorative / non-text (informational only)
  { name: "gold on bg-page (eyebrow text, non-body)", fg: GOLD, bg: BG_PAGE, usage: "lp-eyebrow uppercase" },
];

// ─── Run ───────────────────────────────────────────────────

console.log("\n═══════════════════════════════════════════════════════");
console.log("  BUILD IN SOCIAL — Contrast Ratio Report (WCAG 2.1)");
console.log("═══════════════════════════════════════════════════════\n");
console.log(
  "Pair".padEnd(52),
  "Ratio".padEnd(8),
  "Level".padEnd(10),
  "Usage"
);
console.log("─".repeat(100));

let passCount = 0;
let failCount = 0;

for (const check of CHECKS) {
  const ratio = contrastRatio(check.fg, check.bg);
  const level = wcagLevel(ratio);
  const pass = level !== "FAIL";
  if (pass) passCount++; else failCount++;

  const indicator = pass ? "✓" : "✗";
  const ratioStr = ratio.toFixed(2) + ":1";

  console.log(
    `${indicator} ${check.name}`.padEnd(52),
    ratioStr.padEnd(8),
    level.padEnd(10),
    check.usage
  );
}

console.log("─".repeat(100));
console.log(`\n  ✓ ${passCount} passed   ${failCount > 0 ? `✗ ${failCount} failed` : "✗ 0 failed"}\n`);

if (failCount > 0) {
  console.log("  Some pairs failed WCAG AA. Review usages above.\n");
  process.exit(1);
} else {
  console.log("  All pairs meet WCAG AA or better.\n");
}
