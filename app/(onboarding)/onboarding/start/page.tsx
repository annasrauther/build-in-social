import { permanentRedirect, redirect } from "next/navigation";

/**
 * Legacy `/onboarding/start` → merged into `/onboarding` per the F2
 * redesign. Kept as a 308 redirect so Clerk-issued bookmarks and
 * existing fallbackRedirectUrls still land in the right place.
 */
export default function OnboardingStartPage(): never {
  try {
    permanentRedirect("/onboarding");
  } catch {
    redirect("/onboarding");
  }
}
