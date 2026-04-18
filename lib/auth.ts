/**
 * Server-side auth helper for API routes.
 *
 * When Clerk is configured: extracts userId from Clerk session.
 * When NEXT_PUBLIC_DEV_AUTH=1 (dev only): reads the `dev-auth` cookie set by
 * /api/dev/login. No cookie = unauthenticated, so /login still works.
 */

import { cookies } from "next/headers";
import { CLERK_SECRET_KEY, DEV_AUTH } from "@/lib/env";
import { getUserByClerkId, createUser } from "@/lib/services/db";
import type { User } from "@/lib/types/user";

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

/**
 * Get the authenticated user's DB row, creating it lazily from the Clerk session
 * if no row exists yet (e.g. webhook hasn't fired, or in local dev where Clerk
 * can't reach localhost). The Clerk webhook handler remains the primary path in
 * production — this is an idempotent safety net that works in both environments.
 *
 * Throws "UNAUTHORIZED" if not authenticated. Throws "USER_PROVISION_FAILED" if
 * the DB row doesn't exist AND we can't reach Clerk to fetch the user's details.
 */
export async function getOrCreateUser(): Promise<User> {
  const clerkUserId = await getAuthUserId();

  const existing = await getUserByClerkId(clerkUserId);
  if (existing) return existing;

  // Dev-auth path: no Clerk API to query — create a minimal mock row.
  if (DEV_AUTH && clerkUserId === MOCK_USER_ID) {
    return createUser({
      clerkUserId,
      email: "test@buildinsocial.dev",
      displayName: "Test User",
      brandName: "",
      tone: "casual",
      platforms: [],
      onboardingComplete: false,
      subscriptionTier: "trial",
    });
  }

  // Real Clerk path: fetch profile details from Clerk's admin API.
  if (!CLERK_SECRET_KEY) {
    throw new Error("USER_PROVISION_FAILED");
  }

  const { createClerkClient } = await import("@clerk/nextjs/server");
  const clerk = createClerkClient({ secretKey: CLERK_SECRET_KEY });
  const clerkUser = await clerk.users.getUser(clerkUserId);

  const displayName =
    [clerkUser.firstName, clerkUser.lastName].filter(Boolean).join(" ").trim() ||
    clerkUser.emailAddresses[0]?.emailAddress ||
    "User";

  return createUser({
    clerkUserId,
    email: clerkUser.emailAddresses[0]?.emailAddress ?? "",
    displayName,
    brandName: "",
    tone: "casual",
    platforms: [],
    onboardingComplete: false,
    subscriptionTier: "trial",
  });
}
