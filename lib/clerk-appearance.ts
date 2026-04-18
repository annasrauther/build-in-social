/**
 * Shared Clerk theming. Aligns the Clerk-rendered <SignIn>/<SignUp> with
 * Build In Social's Anthropic-warm palette (brand-500 = #D97757) and
 * Montserrat (headings) + Poppins (body) typography.
 *
 * Shape is validated at the call site via each Clerk component's
 * `appearance` prop — avoids importing `@clerk/shared/types` (a transitive
 * dep that isn't hoisted under pnpm on Vercel builds).
 */
export const clerkAppearance = {
  variables: {
    colorPrimary: "#D97757",
    colorBackground: "#FFFFFF",
    colorText: "#141413",
    colorInputBackground: "#FFFFFF",
    colorInputText: "#141413",
    fontFamily: 'var(--font-sans), Poppins, system-ui, sans-serif',
    borderRadius: "0.5rem",
  },
  elements: {
    rootBox: "w-full",
    card: "shadow-none border border-[var(--border-default)] rounded-[var(--radius-lg)]",
    formButtonPrimary:
      "bg-[#141413] hover:bg-[#252422] text-white normal-case",
    headerTitle: "font-serif tracking-tight",
    headerSubtitle: "font-sans",
  },
};
