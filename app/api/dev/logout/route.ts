import { NextResponse } from "next/server";
import { DEV_AUTH } from "@/lib/env";

/**
 * Dev-only sign-out. Clears the `dev-auth` cookie. Gated on DEV_AUTH so the
 * route is invisible in production.
 */
export async function POST(req: Request) {
  if (!DEV_AUTH) {
    return new NextResponse("Not Found", { status: 404 });
  }
  const url = new URL(req.url);
  const res = NextResponse.redirect(new URL("/", url.origin), { status: 303 });
  res.cookies.set("dev-auth", "", { path: "/", maxAge: 0 });
  return res;
}
