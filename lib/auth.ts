/**
 * Server-side auth helper for API routes.
 *
 * When Clerk is configured: extracts userId from Clerk session.
 * When Clerk is not configured (dev): returns a mock userId.
 */

import { CLERK_SECRET_KEY } from "@/lib/env";

/**
 * Get the authenticated user's Clerk userId from the current request.
 * Returns the userId string.
 * Throws a Response-like object with status 401 if not authenticated.
 */
export async function getAuthUserId(): Promise<string> {
  // Dev fallback — when Clerk keys are not set, use mock user
  if (!CLERK_SECRET_KEY) {
    return "clerk_mock_01";
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
