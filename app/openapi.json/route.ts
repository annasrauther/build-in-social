/**
 * GET /openapi.json — static OpenAPI 3.1 document.
 *
 * Covers:
 *   - the 4 live outbound webhook event payloads
 *   - planned REST API surface (marked x-status: planned)
 */

export const runtime = "nodejs";
export const dynamic = "force-static";

import { NextResponse } from "next/server";
import { WEBHOOK_EVENT_TYPES } from "@/lib/types/webhook";

const spec = {
  openapi: "3.1.0",
  info: {
    title: "Build In Social API",
    version: "0.1.0",
    summary: "Outbound webhooks (live) and REST API (planned).",
    description:
      "Build In Social is a social media distribution partner for indie devs and SaaS founders. This document describes the outbound webhook event payloads (live today) and the planned REST API surface (shipping Q3).",
    contact: { name: "Build In Social", url: "https://buildinsocial.com/developers" },
  },
  servers: [
    { url: "https://buildinsocial.com", description: "Production" },
  ],
  tags: [
    { name: "Webhooks", description: "Outbound event delivery (live)." },
    { name: "Videos", description: "Planned REST endpoints. Coming Q3." },
    { name: "Plans", description: "Planned REST endpoints. Coming Q3." },
  ],
  components: {
    securitySchemes: {
      WebhookSignature: {
        type: "apiKey",
        in: "header",
        name: "X-Build-In-Social-Signature",
        description:
          "HMAC-SHA256 hex digest of the raw request body, signed with the subscription secret.",
      },
      BearerAuth: {
        type: "http",
        scheme: "bearer",
        bearerFormat: "Token",
        description: "Planned. API tokens will be issuable from the dashboard in Q3.",
      },
    },
    schemas: {
      WebhookEnvelope: {
        type: "object",
        required: ["event", "deliveryId", "timestamp", "userId", "data"],
        properties: {
          event: {
            type: "string",
            enum: [...WEBHOOK_EVENT_TYPES, "webhook.test"],
          },
          deliveryId: { type: "string", example: "dlv_l1a9k8abcd" },
          timestamp: { type: "string", format: "date-time" },
          userId: { type: "string" },
          data: { type: "object", additionalProperties: true },
        },
      },
      VideoRenderedPayload: {
        allOf: [
          { $ref: "#/components/schemas/WebhookEnvelope" },
          {
            type: "object",
            properties: {
              event: { type: "string", const: "video.rendered" },
              data: {
                type: "object",
                required: ["videoId", "outputUrl", "platform"],
                properties: {
                  videoId: { type: "string" },
                  outputUrl: { type: "string", format: "uri" },
                  platform: {
                    type: "string",
                    enum: ["youtube", "instagram", "linkedin", "x"],
                  },
                  durationSeconds: { type: "number" },
                },
              },
            },
          },
        ],
      },
      VideoPostedPayload: {
        allOf: [
          { $ref: "#/components/schemas/WebhookEnvelope" },
          {
            type: "object",
            properties: {
              event: { type: "string", const: "video.posted" },
              data: {
                type: "object",
                required: ["videoId", "platform"],
                properties: {
                  videoId: { type: "string" },
                  platform: {
                    type: "string",
                    enum: ["youtube", "instagram", "linkedin", "x"],
                  },
                  platformVideoId: { type: "string" },
                  publishedAt: { type: "string", format: "date-time" },
                },
              },
            },
          },
        ],
      },
      RevisionRequestedPayload: {
        allOf: [
          { $ref: "#/components/schemas/WebhookEnvelope" },
          {
            type: "object",
            properties: {
              event: { type: "string", const: "revision.requested" },
              data: {
                type: "object",
                required: ["videoId", "note"],
                properties: {
                  videoId: { type: "string" },
                  note: { type: "string" },
                  revisionCount: { type: "integer" },
                },
              },
            },
          },
        ],
      },
      PlanGeneratedPayload: {
        allOf: [
          { $ref: "#/components/schemas/WebhookEnvelope" },
          {
            type: "object",
            properties: {
              event: { type: "string", const: "plan.generated" },
              data: {
                type: "object",
                required: ["videoCount"],
                properties: {
                  mode: { type: "string", enum: ["manual", "autopilot"] },
                  videoCount: { type: "integer" },
                  weekNumber: { type: "integer" },
                  platforms: {
                    type: "array",
                    items: { type: "string" },
                  },
                },
              },
            },
          },
        ],
      },
    },
  },
  webhooks: {
    "video.rendered": {
      post: {
        tags: ["Webhooks"],
        summary: "Fires when a video finishes rendering.",
        security: [{ WebhookSignature: [] }],
        requestBody: {
          required: true,
          content: {
            "application/json": {
              schema: { $ref: "#/components/schemas/VideoRenderedPayload" },
            },
          },
        },
        responses: { "200": { description: "Acknowledged" } },
      },
    },
    "video.posted": {
      post: {
        tags: ["Webhooks"],
        summary: "Fires when a video is successfully posted to a platform.",
        security: [{ WebhookSignature: [] }],
        requestBody: {
          required: true,
          content: {
            "application/json": {
              schema: { $ref: "#/components/schemas/VideoPostedPayload" },
            },
          },
        },
        responses: { "200": { description: "Acknowledged" } },
      },
    },
    "revision.requested": {
      post: {
        tags: ["Webhooks"],
        summary: "Fires when a user requests a script revision.",
        security: [{ WebhookSignature: [] }],
        requestBody: {
          required: true,
          content: {
            "application/json": {
              schema: {
                $ref: "#/components/schemas/RevisionRequestedPayload",
              },
            },
          },
        },
        responses: { "200": { description: "Acknowledged" } },
      },
    },
    "plan.generated": {
      post: {
        tags: ["Webhooks"],
        summary: "Fires when a new weekly plan is generated.",
        security: [{ WebhookSignature: [] }],
        requestBody: {
          required: true,
          content: {
            "application/json": {
              schema: { $ref: "#/components/schemas/PlanGeneratedPayload" },
            },
          },
        },
        responses: { "200": { description: "Acknowledged" } },
      },
    },
  },
  paths: {
    "/v1/videos": {
      get: {
        tags: ["Videos"],
        summary: "List videos (planned)",
        description:
          "Returns videos belonging to the authenticated workspace. Shipping Q3.",
        "x-status": "planned",
        security: [{ BearerAuth: [] }],
        responses: { "200": { description: "OK" } },
      },
    },
    "/v1/videos/{id}/render": {
      post: {
        tags: ["Videos"],
        summary: "Trigger a render (planned)",
        "x-status": "planned",
        security: [{ BearerAuth: [] }],
        parameters: [
          {
            name: "id",
            in: "path",
            required: true,
            schema: { type: "string" },
          },
        ],
        responses: { "202": { description: "Accepted" } },
      },
    },
    "/v1/plans": {
      post: {
        tags: ["Plans"],
        summary: "Generate a weekly plan (planned)",
        "x-status": "planned",
        security: [{ BearerAuth: [] }],
        responses: { "201": { description: "Created" } },
      },
    },
    "/v1/webhooks": {
      get: {
        tags: ["Webhooks"],
        summary: "List webhook subscriptions (planned)",
        "x-status": "planned",
        security: [{ BearerAuth: [] }],
        responses: { "200": { description: "OK" } },
      },
    },
  },
} as const;

export function GET() {
  return NextResponse.json(spec, {
    headers: {
      "Cache-Control": "public, max-age=300, s-maxage=300",
    },
  });
}
