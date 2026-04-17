import { NextRequest, NextResponse } from "next/server";
import { getUserByClerkId, updateUser, createUser } from "@/lib/services/db";
import { requireAuth } from "@/lib/auth";
import { z } from "zod";
import { createClerkClient } from "@clerk/nextjs/server";
import { CLERK_SECRET_KEY } from "@/lib/env";

const platformSchema = z.enum(["youtube", "instagram", "linkedin", "x"]);
const profileUpdateSchema = z.object({
  displayName: z.string().max(100).optional(),
  brandName: z.string().max(100).optional(),
  niche: z.string().max(200).optional(),
  tone: z.enum(["professional", "casual", "nerdy-warm", "fun-energetic"]).optional(),
  platforms: z.array(platformSchema).optional(),
  voiceNotes: z.string().max(1000).optional(),
}).strict();

/**
 * User profile API — uses Clerk auth.
 */
export async function GET() {
  let userId: string;
  try {
    userId = await requireAuth();
  } catch {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  try {
    let user = await getUserByClerkId(userId);

    // Auto-create user if webhook hasn't fired yet (race condition on first signup)
    if (!user) {
      try {
        if (CLERK_SECRET_KEY) {
          const clerk = createClerkClient({ secretKey: CLERK_SECRET_KEY });
          const clerkUser = await clerk.users.getUser(userId);
          user = await createUser({
            clerkUserId: userId,
            email: clerkUser.emailAddresses[0]?.emailAddress ?? "",
            displayName: [clerkUser.firstName, clerkUser.lastName].filter(Boolean).join(" ") || "User",
            brandName: "",
            tone: "casual",
            platforms: [],
            onboardingComplete: false,
            subscriptionTier: "trial",
          });
        }
      } catch {
        // If Clerk lookup fails, return 404 — webhook will create the user eventually
      }
    }

    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }
    return NextResponse.json({ data: user, error: null });
  } catch {
    return NextResponse.json({ error: "Failed to fetch profile" }, { status: 500 });
  }
}

export async function PATCH(req: NextRequest) {
  let userId: string;
  try {
    userId = await requireAuth();
  } catch {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  try {
    const raw = await req.json();
    const parsed = profileUpdateSchema.safeParse(raw);
    if (!parsed.success) {
      return NextResponse.json({ error: "Invalid fields", details: parsed.error.flatten() }, { status: 400 });
    }
    const user = await getUserByClerkId(userId);
    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }
    const updated = await updateUser(user.id, parsed.data);
    return NextResponse.json({ data: updated, error: null });
  } catch {
    return NextResponse.json({ error: "Failed to update profile" }, { status: 500 });
  }
}
