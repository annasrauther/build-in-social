/**
 * Webhook subscription types.
 *
 * Outbound webhooks let power users pipe Build In Social events into their
 * own stack (Zapier-style integrations, internal Slack alerts, custom
 * pipelines). Each subscription is scoped to a single user + one or more
 * event types, and is signed with a per-subscription HMAC-SHA256 secret.
 */

export const WEBHOOK_EVENT_TYPES = [
  "video.rendered",
  "video.posted",
  "revision.requested",
  "plan.generated",
] as const;

export type WebhookEventType = (typeof WEBHOOK_EVENT_TYPES)[number];

export type WebhookStatus = "active" | "degraded" | "disabled";

export interface WebhookSubscription {
  id: string;
  userId: string;
  url: string;
  events: WebhookEventType[];
  /** HMAC secret. Stored server-side only, surfaced to the user ONCE at creation. */
  secret: string;
  status: WebhookStatus;
  lastDeliveredAt?: string;
  lastErrorMessage?: string;
  createdAt: string;
}

/** Subscription shape returned to clients — secret never leaves the server after creation. */
export type PublicWebhookSubscription = Omit<WebhookSubscription, "secret"> & {
  secret?: string;
};

/** Payload shape common to every outbound event. */
export interface WebhookEventPayload<
  E extends WebhookEventType | "webhook.test" = WebhookEventType | "webhook.test",
  D = Record<string, unknown>,
> {
  event: E;
  deliveryId: string;
  timestamp: string;
  userId: string;
  data: D;
}
