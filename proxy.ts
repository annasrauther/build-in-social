import { clerkMiddleware, createRouteMatcher } from "@clerk/nextjs/server";
import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

// Protected routes — everything else is public or renders 404.
// We invert the match (protect known app/API paths only) so unknown URLs
// show the real 404 page instead of bouncing anonymous visitors to /login.
const isProtectedRoute = createRouteMatcher([
  "/dashboard(.*)",
  "/plan(.*)",
  "/videos(.*)",
  "/settings(.*)",
  "/api/user/(.*)",
  "/api/videos(.*)",
  "/api/plan/(.*)",
  "/api/generate/(.*)",
  "/api/script/(.*)",
  "/api/render-jobs/(.*)",
  // /api/render/* and /api/cron/* self-authenticate via INTERNAL_SECRET; keep out of Clerk.
  "/api/billing/(.*)",
  "/api/brand(.*)",
  "/api/upload/(.*)",
  "/api/voice/(.*)",
  "/api/publishing/(.*)",
  "/api/settings/(.*)",
  "/api/automation/(.*)",
  "/api/schedule/(.*)",
  "/api/pseo/(.*)",
  "/api/ingest",
  "/api/webhooks/outbound(.*)",
  "/api/onboard/complete",
]);

// When Clerk keys are not configured, OR when NEXT_PUBLIC_DEV_AUTH=1 is set
// AND we're running locally (NODE_ENV=development), skip Clerk middleware.
// On Vercel (NODE_ENV=production for all deployments), devAuth is always false
// so Clerk always runs — even if NEXT_PUBLIC_DEV_AUTH=1 is in Vercel env vars.
const hasClerkKeys =
  !!process.env.NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY &&
  !!process.env.CLERK_SECRET_KEY;
const devAuth =
  process.env.NODE_ENV === "development" &&
  process.env.NEXT_PUBLIC_DEV_AUTH === "1";

function bypassMiddleware(_req: NextRequest) {
  return NextResponse.next();
}

const clerkHandler = clerkMiddleware(async (auth, req) => {
  if (isProtectedRoute(req)) {
    await auth.protect();
  }
});

export default hasClerkKeys && !devAuth ? clerkHandler : bypassMiddleware;

export const config = {
  matcher: [
    // Skip Next.js internals and all static files
    "/((?!_next|[^?]*\\.(?:html?|css|js(?!on)|jpe?g|webp|png|gif|svg|ttf|woff2?|ico|csv|docx?|xlsx?|zip|webmanifest)).*)",
    // Always run for API routes
    "/(api|trpc)(.*)",
  ],
};
