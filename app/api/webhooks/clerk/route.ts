import { NextRequest, NextResponse } from "next/server";
import { Webhook } from "svix";
import { getUserByClerkId, createUser, updateUser } from "@/lib/services/db";
import { sendEmail } from "@/lib/services/resend";
import { CLERK_WEBHOOK_SECRET } from "@/lib/env";

export const runtime = "nodejs";

// Register this URL in the Clerk dashboard (Sprint 9):
//   Webhooks → Add endpoint → https://yourdomain.com/api/webhooks/clerk
//   Events: user.created, user.updated

interface ClerkUserEvent {
  type: "user.created" | "user.updated";
  data: {
    id: string;
    email_addresses: Array<{ email_address: string; id: string }>;
    first_name: string | null;
    last_name: string | null;
    primary_email_address_id: string | null;
  };
}

export async function POST(req: NextRequest) {
  const secret = CLERK_WEBHOOK_SECRET;
  if (!secret) {
    console.error("[clerk-webhook] CLERK_WEBHOOK_SECRET not configured");
    return NextResponse.json(
      { error: "Webhook not configured" },
      { status: 503 }
    );
  }

  const payload = await req.text();
  const headers = {
    "svix-id": req.headers.get("svix-id") ?? "",
    "svix-timestamp": req.headers.get("svix-timestamp") ?? "",
    "svix-signature": req.headers.get("svix-signature") ?? "",
  };

  let event: ClerkUserEvent;
  try {
    const wh = new Webhook(secret);
    event = wh.verify(payload, headers) as ClerkUserEvent;
  } catch {
    return NextResponse.json({ error: "Invalid signature" }, { status: 401 });
  }

  const { type, data } = event;

  if (type === "user.created") {
    const primaryEmail = data.email_addresses.find(
      (e) => e.id === data.primary_email_address_id
    );
    const email = primaryEmail?.email_address ?? "";
    const displayName =
      [data.first_name, data.last_name].filter(Boolean).join(" ").trim() || email;

    const existing = await getUserByClerkId(data.id);
    if (!existing) {
      await createUser({
        clerkUserId: data.id,
        email,
        displayName,
        brandName: "",
        tone: "casual",
        platforms: [],
        onboardingComplete: false,
        subscriptionTier: "trial",
      });
      sendEmail({ to: email, template: "welcome", data: { displayName } }).catch(
        (err) => console.error("[clerk-webhook] Welcome email failed:", err)
      );
    }
  }

  if (type === "user.updated") {
    const user = await getUserByClerkId(data.id);
    if (user) {
      const primaryEmail = data.email_addresses.find(
        (e) => e.id === data.primary_email_address_id
      );
      const email = primaryEmail?.email_address;
      const displayName =
        [data.first_name, data.last_name].filter(Boolean).join(" ").trim() || undefined;

      const updates: Parameters<typeof updateUser>[1] = {};
      if (email) updates.email = email;
      if (displayName) updates.displayName = displayName;

      if (Object.keys(updates).length > 0) {
        await updateUser(user.id, updates);
      }
    }
  }

  return NextResponse.json({ ok: true });
}
