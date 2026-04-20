/**
 * Mock Resend email service
 * Replace by updating /lib/services/resend.ts when RESEND_API_KEY is ready
 */

const delay = (ms = 200) => new Promise((r) => setTimeout(r, ms));

export type EmailTemplate =
  | "welcome"
  | "plan-ready"
  | "video-complete"
  | "voice-ready"
  | "billing-confirmed"
  | "render-failed"
  | "publish-success"
  | "quota-warning";

export async function sendEmail(params: {
  to: string;
  template: EmailTemplate;
  data?: Record<string, unknown>;
}): Promise<{ id: string }> {
  console.log("[MOCK resend] sendEmail", params.template, "→", params.to);
  await delay();
  return { id: `email_${Date.now()}` };
}
