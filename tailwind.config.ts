import type { Config } from "tailwindcss"
import forms from "@tailwindcss/forms"

const config: Config = {
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
        // Anthropic warm palette anchored at brand-500 = #D97757 (Anthropic Orange).
        brand: {
          50: "#FBF1EC",
          100: "#F5DDD0",
          200: "#EDC2AE",
          300: "#E5A689",
          400: "#DF8F70",
          500: "#D97757",
          600: "#C76544",
          700: "#A65235",
          800: "#7E3F29",
          900: "#4F2A1C",
          950: "#2A170F",
        },
        // Anthropic neutrals + secondary accents (use directly, e.g. text-anthropic-dark).
        anthropic: {
          dark: "#141413",
          light: "#FAF9F5",
          midGray: "#B0AEA5",
          lightGray: "#E8E6DC",
        },
        accent: {
          orange: "#D97757",
          blue: "#6A9BCC",
          green: "#788C5D",
        },
      },
      fontFamily: {
        sans: ["var(--font-sans)", "system-ui", "sans-serif"],
        serif: ["var(--font-serif)", "system-ui", "sans-serif"],
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
          from: {
            opacity: "0",
            transform: "translate(-50%, -45%) scale(0.95)",
          },
          to: { opacity: "1", transform: "translate(-50%, -50%) scale(1)" },
        },
        drawerSlideLeftAndFade: {
          from: { opacity: "0", transform: "translateX(50%)" },
          to: { opacity: "1", transform: "translateX(0)" },
        },
        "slide-up-fade": {
          from: { opacity: "0", transform: "translateY(12px)" },
          to: { opacity: "1", transform: "translateY(0px)" },
        },
        "slide-down-fade": {
          from: { opacity: "0", transform: "translateY(-26px)" },
          to: { opacity: "1", transform: "translateY(0px)" },
        },
      },
      animation: {
        hide: "hide 150ms cubic-bezier(0.16, 1, 0.3, 1)",
        slideDownAndFade:
          "slideDownAndFade 150ms cubic-bezier(0.16, 1, 0.3, 1)",
        slideLeftAndFade:
          "slideLeftAndFade 150ms cubic-bezier(0.16, 1, 0.3, 1)",
        slideUpAndFade:
          "slideUpAndFade 150ms cubic-bezier(0.16, 1, 0.3, 1)",
        slideRightAndFade:
          "slideRightAndFade 150ms cubic-bezier(0.16, 1, 0.3, 1)",
        accordionOpen:
          "accordionOpen 150ms cubic-bezier(0.87, 0, 0.13, 1)",
        accordionClose:
          "accordionClose 150ms cubic-bezier(0.87, 0, 0.13, 1)",
        drawerSlideLeftAndFade:
          "drawerSlideLeftAndFade 150ms cubic-bezier(0.16, 1, 0.3, 1)",
        dialogOverlayShow:
          "dialogOverlayShow 150ms cubic-bezier(0.16, 1, 0.3, 1)",
        dialogContentShow:
          "dialogContentShow 150ms cubic-bezier(0.16, 1, 0.3, 1)",
        "slide-down-fade": "slide-down-fade ease-in-out",
        "slide-up-fade": "slide-up-fade ease-in-out",
      },
      backgroundImage: {
        "brand-gradient": "linear-gradient(120deg, #F0A875 0%, #D97757 45%, #A65235 100%)",
        "brand-gradient-dark": "linear-gradient(120deg, #F5C4A0 0%, #DF8F70 45%, #D97757 100%)",
      },
    },
  },
  plugins: [forms],
}
export default config
