/**
 * Rate limiting utility using Upstash Redis.
 * Falls back to a no-op when Redis is not configured (dev without Redis).
 */

import { NextResponse } from "next/server";
import { UPSTASH_REDIS_REST_URL, UPSTASH_REDIS_REST_TOKEN } from "@/lib/env";

type RateLimitResult = { success: boolean; remaining: number };

let ratelimitModule: typeof import("@upstash/ratelimit") | null = null;
let redisModule: typeof import("@upstash/redis") | null = null;

async function getModules() {
  if (!ratelimitModule || !redisModule) {
    try {
      ratelimitModule = await import("@upstash/ratelimit");
      redisModule = await import("@upstash/redis");
    } catch {
      return null;
    }
  }
  return { Ratelimit: ratelimitModule!.Ratelimit, Redis: redisModule!.Redis };
}

const limiters = new Map<string, { limit: (id: string) => Promise<RateLimitResult> }>();

async function getLimiter(
  key: string,
  maxRequests: number,
  windowMs: string
): Promise<{ limit: (id: string) => Promise<RateLimitResult> }> {
  if (limiters.has(key)) return limiters.get(key)!;

  const url = UPSTASH_REDIS_REST_URL;
  const token = UPSTASH_REDIS_REST_TOKEN;

  if (!url || !token) {
    // No-op limiter for dev without Redis
    const noop = { limit: async () => ({ success: true, remaining: 999 }) };
    limiters.set(key, noop);
    return noop;
  }

  const modules = await getModules();
  if (!modules) {
    const noop = { limit: async () => ({ success: true, remaining: 999 }) };
    limiters.set(key, noop);
    return noop;
  }

  const { Ratelimit, Redis } = modules;
  const redis = new Redis({ url, token });
  const limiter = new Ratelimit({
    redis,
    limiter: Ratelimit.slidingWindow(maxRequests, windowMs as `${number} ${"s" | "m" | "h" | "d"}`),
    prefix: `bis:rl:${key}`,
  });

  limiters.set(key, limiter);
  return limiter;
}

/**
 * Check rate limit for a user on a specific endpoint.
 * Returns null if within limit, or a 429 NextResponse if exceeded.
 */
export async function checkRateLimit(
  userId: string,
  endpoint: string,
  maxRequests: number = 10,
  window: string = "1 m"
): Promise<NextResponse | null> {
  const limiter = await getLimiter(endpoint, maxRequests, window);
  const { success } = await limiter.limit(userId);

  if (!success) {
    return NextResponse.json(
      { data: null, error: { message: "Rate limit exceeded. Please wait." } },
      { status: 429 }
    );
  }

  return null;
}
