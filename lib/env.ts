/**
 * Validated environment variables.
 * Always import from here — never use process.env directly.
 *
 * Zod-validated at module load. In production, missing required secrets throw
 * at startup so the server fails fast instead of silently 500-ing later.
 */

import { z } from "zod";

const isProduction = process.env.NODE_ENV === "production";
// next build runs with NODE_ENV=production but secrets aren't present at compile time.
// Only throw at runtime (server boot), not during the static build phase.
const isBuildPhase = process.env.NEXT_PHASE === "phase-production-build";

/** Required-in-production values: must be present to boot prod, optional in dev. */
const requiredInProd = (label: string) =>
  z
    .string()
    .min(1, `${label} is required`)
    .optional()
    .refine((v) => !isProduction || (v !== undefined && v.length > 0), {
      message: `${label} must be set in production`,
    });

const optional = () => z.string().optional();

const EnvSchema = z.object({
  // ── Auth ──
  NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY: requiredInProd("NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY"),
  CLERK_SECRET_KEY: requiredInProd("CLERK_SECRET_KEY"),
  CLERK_WEBHOOK_SECRET: requiredInProd("CLERK_WEBHOOK_SECRET"),

  // ── Database ── (required in prod — app is useless without it)
  NCB_DATA_API_URL: optional(),
  NCB_INSTANCE: requiredInProd("NCB_INSTANCE"),
  NOCODEBACKEND_SECRET_KEY: requiredInProd("NOCODEBACKEND_SECRET_KEY"),

  // ── AI ── (required in prod — core generation path)
  ANTHROPIC_API_KEY: requiredInProd("ANTHROPIC_API_KEY"),

  // ── Voice / B-roll / Storage ── (required in prod — render pipeline)
  ELEVENLABS_API_KEY: requiredInProd("ELEVENLABS_API_KEY"),
  PEXELS_API_KEY: requiredInProd("PEXELS_API_KEY"),
  R2_ACCESS_KEY_ID: requiredInProd("R2_ACCESS_KEY_ID"),
  R2_SECRET_ACCESS_KEY: requiredInProd("R2_SECRET_ACCESS_KEY"),
  R2_BUCKET_NAME: requiredInProd("R2_BUCKET_NAME"),
  R2_PUBLIC_URL: requiredInProd("R2_PUBLIC_URL"),
  CLOUDFLARE_ACCOUNT_ID: requiredInProd("CLOUDFLARE_ACCOUNT_ID"),

  // ── Payments ── (required in prod for billing flows)
  STRIPE_SECRET_KEY: requiredInProd("STRIPE_SECRET_KEY"),
  NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY: requiredInProd("NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY"),
  STRIPE_WEBHOOK_SECRET: requiredInProd("STRIPE_WEBHOOK_SECRET"),
  STRIPE_PRICE_STARTER_MONTHLY: optional(),
  STRIPE_PRICE_STARTER_ANNUAL: optional(),
  STRIPE_PRICE_SOLO: optional(),
  STRIPE_PRICE_SOLO_ANNUAL: optional(),
  STRIPE_PRICE_CREATOR: optional(),
  STRIPE_PRICE_CREATOR_ANNUAL: optional(),
  STRIPE_PRICE_STUDIO: optional(),
  STRIPE_PRICE_STUDIO_ANNUAL: optional(),

  // ── Email / Queue ── (required in prod — notifications + rate limits)
  RESEND_API_KEY: requiredInProd("RESEND_API_KEY"),
  UPSTASH_REDIS_REST_URL: requiredInProd("UPSTASH_REDIS_REST_URL"),
  UPSTASH_REDIS_REST_TOKEN: requiredInProd("UPSTASH_REDIS_REST_TOKEN"),

  // ── App ──
  NEXT_PUBLIC_APP_URL: z.string().default("http://localhost:3000"),

  // ── Internal secrets ── (required in prod — fail closed without them)
  INTERNAL_SECRET: requiredInProd("INTERNAL_SECRET"),
  CRON_SECRET: requiredInProd("CRON_SECRET"),

  // ── WordPress publishing ── (required in prod to encrypt app passwords)
  WORDPRESS_ENCRYPTION_KEY: requiredInProd("WORDPRESS_ENCRYPTION_KEY"),

  // ── Dev flags ──
  NODE_ENV: z.enum(["development", "test", "production"]).default("development"),
  BYPASS_AUTH: z.string().optional(),
  NEXT_PUBLIC_DEV_AUTH: z.string().optional(),
});

const parsed = EnvSchema.safeParse(process.env);

if (!parsed.success && isProduction && !isBuildPhase) {
  // Throw at runtime (server boot), not during `next build` — secrets aren't
  // present at compile time but must be set before the server accepts traffic.
  console.error(
    "[env] Invalid environment variables:",
    parsed.error.flatten().fieldErrors
  );
  throw new Error("Environment validation failed in production. See log above.");
}

// Dev-mode visibility: warn once at boot about services that will silently fall
// back to mocks. Easy to miss otherwise.
if (!isProduction && typeof window === "undefined") {
  const missing: string[] = [];
  if (!process.env.ANTHROPIC_API_KEY) missing.push("ANTHROPIC_API_KEY (Claude → mock)");
  if (!process.env.STRIPE_SECRET_KEY) missing.push("STRIPE_SECRET_KEY (Stripe → mock)");
  if (!process.env.NOCODEBACKEND_SECRET_KEY) missing.push("NOCODEBACKEND_SECRET_KEY (DB → in-memory)");
  if (!process.env.R2_ACCESS_KEY_ID) missing.push("R2_ACCESS_KEY_ID (R2 → in-memory)");
  if (!process.env.ELEVENLABS_API_KEY) missing.push("ELEVENLABS_API_KEY (voice → mock)");
  if (!process.env.PEXELS_API_KEY) missing.push("PEXELS_API_KEY (b-roll → mock)");
  if (missing.length > 0) {
    console.warn(
      "\n[env] Running in dev with mocked services:\n  - " + missing.join("\n  - ") + "\n"
    );
  }
}

const env = parsed.success ? parsed.data : (process.env as unknown as z.infer<typeof EnvSchema>);

// Public, named exports — keep the existing call sites stable.
export const CLERK_PUBLISHABLE_KEY = env.NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY;
export const CLERK_SECRET_KEY = env.CLERK_SECRET_KEY;
export const CLERK_WEBHOOK_SECRET = env.CLERK_WEBHOOK_SECRET;

export const NCB_DATA_API_URL = env.NCB_DATA_API_URL;
export const NCB_INSTANCE = env.NCB_INSTANCE;
export const NOCODEBACKEND_SECRET_KEY = env.NOCODEBACKEND_SECRET_KEY;

export const ANTHROPIC_API_KEY = env.ANTHROPIC_API_KEY;

export const ELEVENLABS_API_KEY = env.ELEVENLABS_API_KEY;

export const PEXELS_API_KEY = env.PEXELS_API_KEY;

export const R2_ACCESS_KEY_ID = env.R2_ACCESS_KEY_ID;
export const R2_SECRET_ACCESS_KEY = env.R2_SECRET_ACCESS_KEY;
export const R2_BUCKET_NAME = env.R2_BUCKET_NAME;
export const R2_PUBLIC_URL = env.R2_PUBLIC_URL;
export const CLOUDFLARE_ACCOUNT_ID = env.CLOUDFLARE_ACCOUNT_ID;

export const STRIPE_SECRET_KEY = env.STRIPE_SECRET_KEY;
export const STRIPE_PUBLISHABLE_KEY = env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY;
export const STRIPE_WEBHOOK_SECRET = env.STRIPE_WEBHOOK_SECRET;
export const STRIPE_PRICE_STARTER_MONTHLY = env.STRIPE_PRICE_STARTER_MONTHLY;
export const STRIPE_PRICE_STARTER_ANNUAL = env.STRIPE_PRICE_STARTER_ANNUAL;
export const STRIPE_PRICE_SOLO = env.STRIPE_PRICE_SOLO;
export const STRIPE_PRICE_SOLO_ANNUAL = env.STRIPE_PRICE_SOLO_ANNUAL;
export const STRIPE_PRICE_CREATOR = env.STRIPE_PRICE_CREATOR;
export const STRIPE_PRICE_CREATOR_ANNUAL = env.STRIPE_PRICE_CREATOR_ANNUAL;
export const STRIPE_PRICE_STUDIO = env.STRIPE_PRICE_STUDIO;
export const STRIPE_PRICE_STUDIO_ANNUAL = env.STRIPE_PRICE_STUDIO_ANNUAL;

export const RESEND_API_KEY = env.RESEND_API_KEY;

export const UPSTASH_REDIS_REST_URL = env.UPSTASH_REDIS_REST_URL;
export const UPSTASH_REDIS_REST_TOKEN = env.UPSTASH_REDIS_REST_TOKEN;

export const APP_URL = env.NEXT_PUBLIC_APP_URL;

export const INTERNAL_SECRET = env.INTERNAL_SECRET;
export const CRON_SECRET = env.CRON_SECRET;

export const WORDPRESS_ENCRYPTION_KEY = env.WORDPRESS_ENCRYPTION_KEY;

/** @deprecated use NEXT_PUBLIC_DEV_AUTH=1. Kept for one release. */
export const BYPASS_AUTH =
  env.NODE_ENV === "development" &&
  (env.BYPASS_AUTH === "true" || env.NEXT_PUBLIC_DEV_AUTH === "1");

/** Dev-only one-click sign-in. Public so client components can read it. */
export const DEV_AUTH =
  env.NODE_ENV === "development" && env.NEXT_PUBLIC_DEV_AUTH === "1";
