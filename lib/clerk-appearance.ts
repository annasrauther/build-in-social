/**
 * Shared Clerk theming. Aligns the Clerk-rendered <SignIn>/<SignUp> with
 * Build In Social's Anthropic-warm palette (brand-500 = #D97757) and
 * Montserrat (headings) + Poppins (body) typography.
 *
 * Shape is validated at the call site via each Clerk component's
 * `appearance` prop — avoids importing `@clerk/shared/types` (a transitive
 * dep that isn't hoisted under pnpm on Vercel builds).
 *
 * P2-27: Exported as a FUNCTION of the resolved theme so the Clerk widget
 * flips with next-themes. Brand tokens from CLAUDE.md:
 *   light bg = #FAF9F5   light text = #141413
 *   dark  bg = #141413   dark  text = #FAF9F5
 */
type Theme = "light" | "dark";

export function clerkAppearance(theme: Theme) {
  const isDark = theme === "dark";
  return {
    variables: {
      colorPrimary: "#D97757",
      colorBackground: isDark ? "#141413" : "#FAF9F5",
      colorText: isDark ? "#FAF9F5" : "#141413",
      colorInputBackground: isDark ? "#1C1B1A" : "#FFFFFF",
      colorInputText: isDark ? "#FAF9F5" : "#141413",
      fontFamily: 'var(--font-sans), Poppins, system-ui, sans-serif',
      borderRadius: "0.5rem",
    },
    elements: {
      rootBox: "w-full",
      card: "shadow-none border border-[var(--border-default)] rounded-[var(--radius-lg)]",
      formButtonPrimary: isDark
        ? "bg-[#FAF9F5] hover:bg-[#E8E6DF] text-[#141413] normal-case"
        : "bg-[#141413] hover:bg-[#252422] text-white normal-case",
      headerTitle: "font-serif tracking-tight",
      headerSubtitle: "font-sans",
    },
  };
}
