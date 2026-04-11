/**
 * Validated environment variables.
 * Always import from here — never use process.env directly.
 */

function env(key: string, required = true): string {
  const value = process.env[key];
  if (!value && required) {
    throw new Error(`Missing required environment variable: ${key}`);
  }
  return value ?? "";
}

function envOptional(key: string): string | undefined {
  return process.env[key] || undefined;
}

// ── Auth (added in Sprint 9) ──
export const CLERK_PUBLISHABLE_KEY = envOptional("NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY");
export const CLERK_SECRET_KEY = envOptional("CLERK_SECRET_KEY");

// ── Database ──
export const NCB_DATA_API_URL = envOptional("NCB_DATA_API_URL");
export const NCB_INSTANCE = envOptional("NCB_INSTANCE");
export const NOCODEBACKEND_SECRET_KEY = envOptional("NOCODEBACKEND_SECRET_KEY");

// ── AI ──
export const ANTHROPIC_API_KEY = envOptional("ANTHROPIC_API_KEY");

// ── Voice ──
export const ELEVENLABS_API_KEY = envOptional("ELEVENLABS_API_KEY");

// ── B-roll ──
export const PEXELS_API_KEY = envOptional("PEXELS_API_KEY");

// ── Storage ──
export const R2_ACCESS_KEY_ID = envOptional("R2_ACCESS_KEY_ID");
export const R2_SECRET_ACCESS_KEY = envOptional("R2_SECRET_ACCESS_KEY");
export const R2_BUCKET_NAME = envOptional("R2_BUCKET_NAME");
export const R2_PUBLIC_URL = envOptional("R2_PUBLIC_URL");
export const CLOUDFLARE_ACCOUNT_ID = envOptional("CLOUDFLARE_ACCOUNT_ID");

// ── Payments ──
export const STRIPE_SECRET_KEY = envOptional("STRIPE_SECRET_KEY");
export const STRIPE_PUBLISHABLE_KEY = envOptional("NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY");
export const STRIPE_WEBHOOK_SECRET = envOptional("STRIPE_WEBHOOK_SECRET");

// ── Email ──
export const RESEND_API_KEY = envOptional("RESEND_API_KEY");

// ── Queue ──
export const UPSTASH_REDIS_REST_URL = envOptional("UPSTASH_REDIS_REST_URL");
export const UPSTASH_REDIS_REST_TOKEN = envOptional("UPSTASH_REDIS_REST_TOKEN");

// ── App ──
export const APP_URL = process.env.NEXT_PUBLIC_APP_URL ?? "http://localhost:3000";

// ── Internal ──
export const INTERNAL_SECRET = envOptional("INTERNAL_SECRET");

// ── Feature flags (server-side only) ──
export const BYPASS_AUTH =
  process.env.NODE_ENV === "development" &&
  process.env.BYPASS_AUTH === "true";
