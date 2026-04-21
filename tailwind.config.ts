import type { Config } from "tailwindcss"
import forms from "@tailwindcss/forms"

/**
 * Build In Social — Tailwind config
 *
 * Dark-only. All color utilities reference CSS custom properties defined in
 * `app/globals.css`. Radix grayDark (neutrals) + irisDark (accent) are the
 * source of truth. Legacy `brand-*` / `anthropic-*` / `accent-*` keys are
 * retained and aliased for screen-by-screen migration, but every new
 * component must use the new scale.
 */
const config: Config = {
  // `.dark` is always applied at the html root — kept as a selector so legacy
  // `dark:` utilities continue to resolve while we migrate screens.
  darkMode: "selector",
  content: [
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
    "./lib/**/*.{js,ts,jsx,tsx,mdx}",
    "./content/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        // ---- Radix grayDark scale (neutrals) ----
        gray: {
          1: "var(--gray-1)",
          2: "var(--gray-2)",
          3: "var(--gray-3)",
          4: "var(--gray-4)",
          5: "var(--gray-5)",
          6: "var(--gray-6)",
          7: "var(--gray-7)",
          8: "var(--gray-8)",
          9: "var(--gray-9)",
          10: "var(--gray-10)",
          11: "var(--gray-11)",
          12: "var(--gray-12)",
        },
        // ---- Radix irisDark scale (accent) ----
        iris: {
          1: "var(--iris-1)",
          2: "var(--iris-2)",
          3: "var(--iris-3)",
          4: "var(--iris-4)",
          5: "var(--iris-5)",
          6: "var(--iris-6)",
          7: "var(--iris-7)",
          8: "var(--iris-8)",
          9: "var(--iris-9)",
          10: "var(--iris-10)",
          11: "var(--iris-11)",
          12: "var(--iris-12)",
        },
        // ---- Semantic aliases (preferred in new components) ----
        bg: "var(--bg)",
        surface: "var(--surface)",
        elevated: "var(--elevated)",
        border: "var(--border)",
        divider: "var(--divider)",
        text: {
          DEFAULT: "var(--text)",
          secondary: "var(--text-secondary)",
          tertiary: "var(--text-tertiary)",
          disabled: "var(--text-disabled)",
        },
        accent: {
          DEFAULT: "var(--accent)",
          hover: "var(--accent-hover)",
          fg: "var(--accent-fg)",
          subtle: "var(--accent-subtle)",
          // Legacy positional keys — retained for migration
          orange: "var(--accent)",
          blue: "var(--iris-10)",
          green: "var(--success)",
        },
        success: "var(--success)",
        warning: "var(--warning)",
        danger: "var(--danger)",

        // ---- Legacy brand scale (mapped to iris) — remove once migration is complete ----
        brand: {
          50: "var(--iris-3)",
          100: "var(--iris-4)",
          200: "var(--iris-5)",
          300: "var(--iris-6)",
          400: "var(--iris-7)",
          500: "var(--iris-9)",
          600: "var(--iris-10)",
          700: "var(--iris-11)",
          800: "var(--iris-11)",
          900: "var(--iris-12)",
          950: "var(--iris-12)",
        },
        anthropic: {
          dark: "var(--bg)",
          light: "var(--text)",
          midGray: "var(--text-tertiary)",
          lightGray: "var(--text-secondary)",
        },
        platform: {
          youtube: "#ff2d55",
          instagram: "#d946ef",
          linkedin: "#5b5bd6",
          x: "var(--text)",
        },
      },
      fontFamily: {
        sans: ["var(--font-sans)", "ui-sans-serif", "system-ui", "sans-serif"],
        serif: ["var(--font-sans)", "ui-sans-serif", "system-ui", "sans-serif"],
        mono: ["var(--font-mono)", "ui-monospace", "monospace"],
      },
      borderRadius: {
        input: "var(--radius-input)",
        card: "var(--radius-card)",
        modal: "var(--radius-modal)",
      },
      screens: {
        "mobile-sm": "375px",
        "mobile-md": "390px",
        "mobile-lg": "428px",
        "tablet-sm": "768px",
        "tablet-md": "834px",
        "tablet-lg": "1024px",
        "desktop-sm": "1280px",
        "desktop-md": "1440px",
        "desktop-lg": "1920px",
      },
      transitionTimingFunction: {
        "out-cubic": "cubic-bezier(0.22, 1, 0.36, 1)",
      },
      transitionDuration: {
        fast: "120ms",
        default: "180ms",
      },
      keyframes: {
        hide: {
          from: { opacity: "1" },
          to: { opacity: "0" },
        },
        slideDownAndFade: {
          from: { opacity: "0", transform: "translateY(-6px)" },
          to: { opacity: "1", transform: "translateY(0)" },
        },
        slideLeftAndFade: {
          from: { opacity: "0", transform: "translateX(6px)" },
          to: { opacity: "1", transform: "translateX(0)" },
        },
        slideUpAndFade: {
          from: { opacity: "0", transform: "translateY(6px)" },
          to: { opacity: "1", transform: "translateY(0)" },
        },
        slideRightAndFade: {
          from: { opacity: "0", transform: "translateX(-6px)" },
          to: { opacity: "1", transform: "translateX(0)" },
        },
        accordionOpen: {
          from: { height: "0px" },
          to: { height: "var(--radix-accordion-content-height)" },
        },
        accordionClose: {
          from: { height: "var(--radix-accordion-content-height)" },
          to: { height: "0px" },
        },
        dialogOverlayShow: {
          from: { opacity: "0" },
          to: { opacity: "1" },
        },
        dialogContentShow: {
          from: { opacity: "0", transform: "translate(-50%, -45%) scale(0.98)" },
          to: { opacity: "1", transform: "translate(-50%, -50%) scale(1)" },
        },
        drawerSlideLeftAndFade: {
          from: { opacity: "0", transform: "translateX(50%)" },
          to: { opacity: "1", transform: "translateX(0)" },
        },
        "slide-up-fade": {
          from: { opacity: "0", transform: "translateY(8px)" },
          to: { opacity: "1", transform: "translateY(0px)" },
        },
        "slide-down-fade": {
          from: { opacity: "0", transform: "translateY(-8px)" },
          to: { opacity: "1", transform: "translateY(0px)" },
        },
      },
      animation: {
        hide: "hide 180ms cubic-bezier(0.22, 1, 0.36, 1)",
        slideDownAndFade: "slideDownAndFade 180ms cubic-bezier(0.22, 1, 0.36, 1)",
        slideLeftAndFade: "slideLeftAndFade 180ms cubic-bezier(0.22, 1, 0.36, 1)",
        slideUpAndFade: "slideUpAndFade 180ms cubic-bezier(0.22, 1, 0.36, 1)",
        slideRightAndFade: "slideRightAndFade 180ms cubic-bezier(0.22, 1, 0.36, 1)",
        accordionOpen: "accordionOpen 180ms cubic-bezier(0.22, 1, 0.36, 1)",
        accordionClose: "accordionClose 180ms cubic-bezier(0.22, 1, 0.36, 1)",
        drawerSlideLeftAndFade: "drawerSlideLeftAndFade 180ms cubic-bezier(0.22, 1, 0.36, 1)",
        dialogOverlayShow: "dialogOverlayShow 180ms cubic-bezier(0.22, 1, 0.36, 1)",
        dialogContentShow: "dialogContentShow 180ms cubic-bezier(0.22, 1, 0.36, 1)",
        "slide-down-fade": "slide-down-fade 180ms cubic-bezier(0.22, 1, 0.36, 1)",
        "slide-up-fade": "slide-up-fade 180ms cubic-bezier(0.22, 1, 0.36, 1)",
      },
      backgroundImage: {
        // Iris-based; no more purple→pink gradients.
        "brand-gradient":
          "linear-gradient(120deg, var(--iris-11) 0%, var(--iris-9) 55%, var(--iris-8) 100%)",
        "brand-gradient-dark":
          "linear-gradient(120deg, var(--iris-11) 0%, var(--iris-9) 55%, var(--iris-8) 100%)",
      },
    },
  },
  plugins: [forms],
}
export default config
