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

  // ── Database ──
  NCB_DATA_API_URL: optional(),
  NCB_INSTANCE: optional(),
  NOCODEBACKEND_SECRET_KEY: optional(),

  // ── AI ──
  ANTHROPIC_API_KEY: optional(),

  // ── Voice / B-roll / Storage ──
  ELEVENLABS_API_KEY: optional(),
  PEXELS_API_KEY: optional(),
  R2_ACCESS_KEY_ID: optional(),
  R2_SECRET_ACCESS_KEY: optional(),
  R2_BUCKET_NAME: optional(),
  R2_PUBLIC_URL: optional(),
  CLOUDFLARE_ACCOUNT_ID: optional(),

  // ── Payments ── (required in prod for billing flows)
  STRIPE_SECRET_KEY: requiredInProd("STRIPE_SECRET_KEY"),
  NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY: requiredInProd("NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY"),
  STRIPE_WEBHOOK_SECRET: requiredInProd("STRIPE_WEBHOOK_SECRET"),
  STRIPE_PRICE_SOLO: optional(),
  STRIPE_PRICE_CREATOR: optional(),
  STRIPE_PRICE_STUDIO: optional(),

  // ── Email / Queue ──
  RESEND_API_KEY: optional(),
  UPSTASH_REDIS_REST_URL: optional(),
  UPSTASH_REDIS_REST_TOKEN: optional(),

  // ── App ──
  NEXT_PUBLIC_APP_URL: z.string().default("http://localhost:3000"),

  // ── Internal secrets ── (required in prod — fail closed without them)
  INTERNAL_SECRET: requiredInProd("INTERNAL_SECRET"),
  CRON_SECRET: requiredInProd("CRON_SECRET"),

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
export const STRIPE_PRICE_SOLO = env.STRIPE_PRICE_SOLO;
export const STRIPE_PRICE_CREATOR = env.STRIPE_PRICE_CREATOR;
export const STRIPE_PRICE_STUDIO = env.STRIPE_PRICE_STUDIO;

export const RESEND_API_KEY = env.RESEND_API_KEY;

export const UPSTASH_REDIS_REST_URL = env.UPSTASH_REDIS_REST_URL;
export const UPSTASH_REDIS_REST_TOKEN = env.UPSTASH_REDIS_REST_TOKEN;

export const APP_URL = env.NEXT_PUBLIC_APP_URL;

export const INTERNAL_SECRET = env.INTERNAL_SECRET;
export const CRON_SECRET = env.CRON_SECRET;

/** @deprecated use NEXT_PUBLIC_DEV_AUTH=1. Kept for one release. */
export const BYPASS_AUTH =
  env.NODE_ENV === "development" &&
  (env.BYPASS_AUTH === "true" || env.NEXT_PUBLIC_DEV_AUTH === "1");

/** Dev-only one-click sign-in. Public so client components can read it. */
export const DEV_AUTH =
  env.NODE_ENV === "development" && env.NEXT_PUBLIC_DEV_AUTH === "1";
