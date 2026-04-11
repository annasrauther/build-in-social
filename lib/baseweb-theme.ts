import { createLightTheme } from "baseui";
import type { Theme } from "baseui";
import type { Font } from "baseui/themes/types";

/**
 * Build In Social Base Web theme.
 *
 * Primary accent: black (rgb(36,36,36))
 * Single neutral accent: black rgb(36,36,36) for all interactive states
 * Fonts: Geist Sans (body/UI), Source Serif 4 (headings), Geist Mono (numbers)
 */

const primitives = {
  /* Primary = black accent */
  primaryFontFamily:
    "var(--font-geist-sans), system-ui, -apple-system, sans-serif",
  primary: "rgb(36, 36, 36)",
  primary50: "rgba(0, 0, 0, 0.05)",
  primary100: "#F9FAFB",
  primary200: "#F3F4F6",
  primary300: "rgba(0, 0, 0, 0.16)",
  primary400: "rgba(0, 0, 0, 0.4)",
  primary500: "rgba(0, 0, 0, 0.54)",
  primary600: "rgb(60, 60, 60)",
  primary700: "rgb(36, 36, 36)",

  /* Negative = danger */
  negative: "#9B1C1C",
  negative50: "rgba(155, 28, 28, 0.08)",
  negative100: "rgba(155, 28, 28, 0.12)",
  negative200: "rgba(155, 28, 28, 0.16)",
  negative300: "#DC2626",
  negative400: "#B91C1C",
  negative500: "#9B1C1C",

  /* Warning */
  warning: "#92400E",
  warning50: "rgba(146, 64, 14, 0.08)",
  warning100: "rgba(146, 64, 14, 0.12)",
  warning200: "rgba(146, 64, 14, 0.16)",
  warning300: "#D97706",
  warning400: "#B45309",
  warning500: "#92400E",

  /* Positive = success green */
  positive: "#1A8917",
  positive50: "rgba(26, 137, 23, 0.08)",
  positive100: "rgba(26, 137, 23, 0.12)",
  positive200: "rgba(26, 137, 23, 0.16)",
  positive300: "#22C55E",
  positive400: "#1A8917",
  positive500: "#166534",

  /* Mono (surfaces) */
  mono100: "#FFFFFF",
  mono200: "#FFFFFF",
  mono300: "#F9FAFB",
  mono400: "#F3F4F6",
  mono500: "rgba(0, 0, 0, 0.10)",
  mono600: "rgba(0, 0, 0, 0.40)",
  mono700: "rgba(0, 0, 0, 0.54)",
  mono800: "rgb(60, 60, 60)",
  mono900: "rgb(36, 36, 36)",
  mono1000: "#0a0a0a",
};

const baseTheme = createLightTheme(primitives);

/**
 * Deep-merge our overrides onto the generated theme.
 * createLightTheme@next only takes primitives, so we override post-creation.
 */
export const theme: Theme = {
  ...baseTheme,

  colors: {
    ...baseTheme.colors,
    /* Surface colors */
    backgroundPrimary: "#FFFFFF",
    backgroundSecondary: "#FFFFFF",
    backgroundTertiary: "#F9FAFB",
    backgroundInversePrimary: "rgb(36, 36, 36)",

    /* Content/text colors */
    contentPrimary: "rgb(36, 36, 36)",
    contentSecondary: "rgba(0, 0, 0, 0.54)",
    contentTertiary: "rgba(0, 0, 0, 0.4)",
    contentInversePrimary: "#FFFFFF",

    /* Border colors */
    borderOpaque: "rgba(0, 0, 0, 0.10)",
    borderTransparent: "rgba(0, 0, 0, 0.06)",
    borderSelected: "rgb(36, 36, 36)",
    // borderFocus is set via inputFill/inputBorder overrides in component theme

  },

  borders: {
    ...baseTheme.borders,
  },

  typography: {
    ...baseTheme.typography,

    /* Display — page titles (Source Serif 4) */
    DisplayLarge: {
      fontFamily: "var(--font-serif), Georgia, 'Times New Roman', serif",
      fontWeight: 400,
      fontSize: "24px",
      lineHeight: "1.2",
    } as Font,
    DisplayMedium: {
      fontFamily: "var(--font-serif), Georgia, 'Times New Roman', serif",
      fontWeight: 400,
      fontSize: "20px",
      lineHeight: "1.2",
    } as Font,
    DisplaySmall: {
      fontFamily: "var(--font-serif), Georgia, 'Times New Roman', serif",
      fontWeight: 400,
      fontSize: "18px",
      lineHeight: "1.2",
    } as Font,

    /* Headings — section headers (Geist) */
    HeadingLarge: {
      fontFamily: "var(--font-geist-sans), system-ui, sans-serif",
      fontWeight: 500,
      fontSize: "16px",
      lineHeight: "1.3",
    },
    HeadingMedium: {
      fontFamily: "var(--font-geist-sans), system-ui, sans-serif",
      fontWeight: 500,
      fontSize: "15px",
      lineHeight: "1.3",
    },
    HeadingSmall: {
      fontFamily: "var(--font-geist-sans), system-ui, sans-serif",
      fontWeight: 500,
      fontSize: "14px",
      lineHeight: "1.3",
    },

    /* Body */
    ParagraphLarge: {
      fontFamily: "var(--font-geist-sans), system-ui, sans-serif",
      fontWeight: 400,
      fontSize: "15px",
      lineHeight: "1.6",
    },
    ParagraphMedium: {
      fontFamily: "var(--font-geist-sans), system-ui, sans-serif",
      fontWeight: 400,
      fontSize: "14px",
      lineHeight: "1.6",
    },
    ParagraphSmall: {
      fontFamily: "var(--font-geist-sans), system-ui, sans-serif",
      fontWeight: 400,
      fontSize: "13px",
      lineHeight: "1.4",
    },
    ParagraphXSmall: {
      fontFamily: "var(--font-geist-sans), system-ui, sans-serif",
      fontWeight: 400,
      fontSize: "12px",
      lineHeight: "1.4",
    },

    /* Labels — Base Web defaults (14/16/18px), only override fontFamily */
    LabelLarge: {
      ...baseTheme.typography.LabelLarge,
      fontFamily: "var(--font-geist-sans), system-ui, sans-serif",
    },
    LabelMedium: {
      ...baseTheme.typography.LabelMedium,
      fontFamily: "var(--font-geist-sans), system-ui, sans-serif",
    },
    LabelSmall: {
      ...baseTheme.typography.LabelSmall,
      fontFamily: "var(--font-geist-sans), system-ui, sans-serif",
    },
    LabelXSmall: {
      ...baseTheme.typography.LabelXSmall,
      fontFamily: "var(--font-geist-sans), system-ui, sans-serif",
    },

    /* Mono — numbers, timestamps */
    MonoParagraphMedium: {
      fontFamily: "var(--font-geist-mono), 'Fira Code', monospace",
      fontWeight: 500,
      fontSize: "14px",
      lineHeight: "1.4",
    },
    MonoParagraphSmall: {
      fontFamily: "var(--font-geist-mono), 'Fira Code', monospace",
      fontWeight: 500,
      fontSize: "13px",
      lineHeight: "1.4",
    },
    MonoParagraphXSmall: {
      fontFamily: "var(--font-geist-mono), 'Fira Code', monospace",
      fontWeight: 500,
      fontSize: "11px",
      lineHeight: "1.4",
    },
  },

  animation: {
    ...baseTheme.animation,
    timing100: "120ms",
    timing200: "120ms",
    timing300: "120ms",
    timing400: "120ms",
  },

  sizing: {
    ...baseTheme.sizing,
  },
};
