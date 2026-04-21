import { redirect, permanentRedirect } from "next/navigation";

/**
 * `/dashboard` is dead (F3). The daily loop lives on `/plan/current`.
 *
 * 308 permanent redirect so browsers / history treat it as the canonical move.
 * Authentication is enforced upstream by middleware + `getOrCreateUser()` on
 * the plan page itself, so we don't need to re-check here.
 */
export default function DashboardPage(): never {
  // permanentRedirect emits a 308 in RSC. Falls back to redirect() if needed.
  try {
    permanentRedirect("/plan/current");
  } catch {
    redirect("/plan/current");
  }
}
