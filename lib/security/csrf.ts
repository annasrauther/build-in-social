import { NextResponse } from "next/server";
import { APP_URL } from "@/lib/env";

/**
 * Defense-in-depth CSRF guard for credential-bearing mutating routes.
 * Clerk session cookies are httpOnly + SameSite=Lax which blocks most
 * cross-site submissions, but we require Origin (or Referer fallback) to
 * match APP_URL for any route that stores credentials or triggers payment.
 */
export function assertSameOrigin(req: Request): NextResponse | null {
  if (!APP_URL) {
    // Fail-closed in any non-local env. In local/dev we skip if APP_URL unset.
    if (process.env.NODE_ENV === "production") {
      return NextResponse.json({ error: "Server misconfigured" }, { status: 500 });
    }
    return null;
  }
  const expected = safeOrigin(APP_URL);
  const got = req.headers.get("origin") ?? deriveOriginFromReferer(req);
  if (!got) return NextResponse.json({ error: "Missing Origin" }, { status: 403 });
  if (got !== expected) return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  return null;
}

function safeOrigin(raw: string): string {
  try {
    const u = new URL(raw);
    return `${u.protocol}//${u.host}`;
  } catch {
    return "";
  }
}

function deriveOriginFromReferer(req: Request): string | null {
  const ref = req.headers.get("referer");
  if (!ref) return null;
  try {
    const u = new URL(ref);
    return `${u.protocol}//${u.host}`;
  } catch {
    return null;
  }
}
