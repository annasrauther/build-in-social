/**
 * Mock Stripe
 * Replace by updating /lib/services/stripe.ts when STRIPE_SECRET_KEY is ready
 */

const delay = (ms = 600) => new Promise((r) => setTimeout(r, ms));

export async function createCheckoutSession(params: {
  packId: string;
  userId: string;
  credits: number;
  price: number;
}): Promise<{ sessionUrl: string; sessionId: string }> {
  console.log("[MOCK stripe] createCheckoutSession", params.packId);
  await delay();
  // In mock mode, immediately simulate a successful payment
  return {
    sessionUrl: `/api/credits/mock-add?userId=${params.userId}&credits=${params.credits}&packId=${params.packId}`,
    sessionId: `cs_mock_${Date.now()}`,
  };
}

export async function createPortalSession(params: {
  userId: string;
  customerId: string;
}): Promise<{ url: string }> {
  console.log("[MOCK stripe] createPortalSession");
  await delay();
  return { url: "/settings/billing?mock_portal=true" };
}

export async function constructWebhookEvent(payload: string, signature: string) {
  console.log("[MOCK stripe] constructWebhookEvent");
  return {
    type: "checkout.session.completed",
    data: {
      object: {
        metadata: { userId: "user_mock_01", packId: "mid", credits: "15" },
        payment_intent: "pi_mock_01",
      },
    },
  };
}
