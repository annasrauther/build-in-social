import { permanentRedirect, redirect } from "next/navigation";

/**
 * `/guides` — killed per Phase 6 propagation.
 *
 * Guide content migrates into ⌘K command-palette results and
 * contextual empty-state links on the surfaces where users actually
 * need help. A standalone guides route is a tutorial graveyard.
 */
export default function GuidesPage(): never {
  try {
    permanentRedirect("/plan/current");
  } catch {
    redirect("/plan/current");
  }
}
