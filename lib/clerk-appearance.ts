import type { Appearance } from "@clerk/types";

/**
 * Shared Clerk theming. Aligns the Clerk-rendered <SignIn>/<SignUp> with
 * Build In Social's Anthropic-warm palette (brand-500 = #D97757) and
 * Poppins/Lora typography.
 */
export const clerkAppearance: Appearance = {
  variables: {
    colorPrimary: "#D97757",
    colorBackground: "#FFFFFF",
    colorText: "#141413",
    colorInputBackground: "#FFFFFF",
    colorInputText: "#141413",
    fontFamily: 'var(--font-poppins), Poppins, system-ui, sans-serif',
    borderRadius: "0.5rem",
  },
  elements: {
    rootBox: "w-full",
    card: "shadow-none border border-[var(--border-default)] rounded-[var(--radius-lg)]",
    formButtonPrimary:
      "bg-[#141413] hover:bg-[#252422] text-white normal-case",
    headerTitle: "font-sans tracking-tight",
    headerSubtitle: "font-sans",
  },
};
