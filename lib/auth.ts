/**
 * Server-side auth helper for API routes.
 *
 * When Clerk is configured: extracts userId from Clerk session.
 * When NEXT_PUBLIC_DEV_AUTH=1 (dev only): reads the `dev-auth` cookie set by
 * /api/dev/login. No cookie = unauthenticated, so /login still works.
 */

import { cookies } from "next/headers";
import { CLERK_SECRET_KEY, DEV_AUTH } from "@/lib/env";

const DEV_COOKIE = "dev-auth";
const MOCK_USER_ID = "clerk_mock_01";

/**
 * Get the authenticated user's Clerk userId from the current request.
 * Returns the userId string.
 * Throws an error with message "UNAUTHORIZED" if not authenticated.
 *
 * Dev-auth path requires both:
 *   - NODE_ENV === "development"
 *   - NEXT_PUBLIC_DEV_AUTH === "1"
 *   - dev-auth cookie set to "1" (via /api/dev/login)
 * In production (or staging) with Clerk misconfigured, this throws — never
 * silently authenticates as a mock user.
 */
export async function getAuthUserId(): Promise<string> {
  if (DEV_AUTH) {
    const c = await cookies();
    if (c.get(DEV_COOKIE)?.value === "1") return MOCK_USER_ID;
    throw new Error("UNAUTHORIZED");
  }

  if (!CLERK_SECRET_KEY) {
    // Misconfigured environment: refuse rather than fall back.
    throw new Error("UNAUTHORIZED");
  }

  const { auth } = await import("@clerk/nextjs/server");
  const { userId } = await auth();

  if (!userId) {
    throw new Error("UNAUTHORIZED");
  }

  return userId;
}

/**
 * Wrapper that catches auth errors and returns a 401 Response.
 * Use in API routes: `const userId = await requireAuth();`
 */
export async function requireAuth(): Promise<string> {
  return getAuthUserId();
}
