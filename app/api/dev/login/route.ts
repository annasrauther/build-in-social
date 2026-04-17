import { NextResponse } from "next/server";
import { DEV_AUTH } from "@/lib/env";

/**
 * Dev-only one-click sign-in. Sets the `dev-auth` httpOnly cookie that
 * lib/auth.ts reads. Gated on DEV_AUTH (NODE_ENV=development AND
 * NEXT_PUBLIC_DEV_AUTH=1) — returns 404 in any other environment so this
 * route is invisible in production builds.
 */
export async function POST(req: Request) {
  if (!DEV_AUTH) {
    return new NextResponse("Not Found", { status: 404 });
  }
  const url = new URL(req.url);
  const to = url.searchParams.get("to") || "/dashboard";
  const res = NextResponse.redirect(new URL(to, url.origin), { status: 303 });
  res.cookies.set("dev-auth", "1", {
    httpOnly: true,
    sameSite: "lax",
    path: "/",
    secure: false, // dev only — never set on https in prod
    maxAge: 60 * 60 * 24 * 7, // 7 days
  });
  return res;
}
