import type { Metadata } from "next";
import Link from "next/link";
import {
  SIGNATURE_HEADER,
  EVENT_HEADER,
  DELIVERY_HEADER,
} from "@/lib/services/webhooks";
import { WEBHOOK_EVENT_TYPES } from "@/lib/types/webhook";

export const metadata: Metadata = {
  title: "Developers — Build In Social",
  description:
    "Pipe Build In Social events into your stack. Outbound webhooks live today, REST API in Q3.",
};

const EVENT_DESCRIPTIONS: Record<(typeof WEBHOOK_EVENT_TYPES)[number], string> = {
  "video.rendered":
    "Fires when a video finishes rendering and its output URL is ready.",
  "video.posted":
    "Fires when Build In Social successfully posts a video to a connected platform.",
  "revision.requested":
    "Fires when a user requests a script revision via the app.",
  "plan.generated": "Fires when a new weekly content plan is generated.",
};

const EXAMPLE_PAYLOAD = `{
  "event": "video.rendered",
  "deliveryId": "dlv_l1a9k8...",
  "timestamp": "2026-04-18T12:34:56.000Z",
  "userId": "user_123",
  "data": {
    "videoId": "video_abc",
    "outputUrl": "https://cdn.buildinsocial.com/...",
    "platform": "youtube",
    "durationSeconds": 38
  }
}`;

const VERIFY_NODE_SNIPPET = `import crypto from "node:crypto";

export function verifySignature(rawBody: string, header: string, secret: string) {
  const expected = crypto
    .createHmac("sha256", secret)
    .update(rawBody)
    .digest("hex");
  return crypto.timingSafeEqual(
    Buffer.from(expected, "hex"),
    Buffer.from(header, "hex"),
  );
}`;

export default function DevelopersPage() {
  return (
    <main id="main-content" className="mx-auto w-full max-w-4xl px-6 py-16 sm:py-24">
      <header className="space-y-4">
        <p className="text-xs font-semibold uppercase tracking-wider text-brand-600">
          Developers
        </p>
        <h1 className="font-serif text-4xl font-semibold text-gray-900 sm:text-5xl dark:text-gray-50">
          Build on Build In Social
        </h1>
        <p className="max-w-2xl text-base leading-7 text-gray-600 dark:text-gray-300">
          You are the partner. Build In Social is the distribution layer.
          Outbound webhooks are live today so you can pipe every event into your
          own stack — Slack alerts, analytics pipelines, CRM automations, or
          whatever you build next. A full REST API is shipping in Q3.
        </p>
        <div className="flex flex-wrap items-center gap-3 pt-2">
          <Link
            href="/settings/webhooks"
            className="inline-flex items-center rounded-md bg-gray-900 px-4 py-2 text-sm font-medium text-white shadow-sm hover:bg-gray-800 dark:bg-gray-50 dark:text-gray-900 dark:hover:bg-gray-200"
          >
            Add a webhook
          </Link>
          <a
            href="/openapi.json"
            className="inline-flex items-center rounded-md border border-gray-200 px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50 dark:border-gray-800 dark:text-gray-200 dark:hover:bg-gray-900"
          >
            OpenAPI spec →
          </a>
        </div>
      </header>

      <section className="mt-16 space-y-6" aria-labelledby="webhooks-heading">
        <div className="flex items-center gap-3">
          <h2
            id="webhooks-heading"
            className="font-serif text-2xl font-semibold text-gray-900 dark:text-gray-50"
          >
            Webhooks
          </h2>
          <span className="inline-flex items-center rounded-full bg-emerald-50 px-2 py-0.5 text-xs font-semibold text-emerald-700 ring-1 ring-emerald-600/30 dark:bg-emerald-400/10 dark:text-emerald-400">
            Live
          </span>
        </div>
        <p className="max-w-2xl text-sm leading-6 text-gray-600 dark:text-gray-300">
          Register an endpoint from{" "}
          <Link
            href="/settings/webhooks"
            className="font-medium text-brand-600 hover:text-brand-700 dark:text-brand-400"
          >
            Settings → Webhooks
          </Link>
          . Every subscription is scoped to a single workspace and signed with
          its own HMAC-SHA256 secret.
        </p>

        <div className="space-y-4">
          <h3 className="text-sm font-semibold uppercase tracking-wider text-gray-500">
            Event types
          </h3>
          <div className="overflow-hidden rounded-lg border border-gray-200 dark:border-gray-800">
            <table className="min-w-full divide-y divide-gray-200 text-sm dark:divide-gray-800">
              <thead className="bg-gray-50 dark:bg-gray-900">
                <tr>
                  <th className="px-4 py-2.5 text-left font-medium text-gray-700 dark:text-gray-300">
                    Event
                  </th>
                  <th className="px-4 py-2.5 text-left font-medium text-gray-700 dark:text-gray-300">
                    Description
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100 bg-white dark:divide-gray-900 dark:bg-gray-950">
                {WEBHOOK_EVENT_TYPES.map((ev) => (
                  <tr key={ev}>
                    <td className="whitespace-nowrap px-4 py-2.5 font-mono text-xs text-gray-900 dark:text-gray-100">
                      {ev}
                    </td>
                    <td className="px-4 py-2.5 text-gray-600 dark:text-gray-300">
                      {EVENT_DESCRIPTIONS[ev]}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        <div className="space-y-3">
          <h3 className="text-sm font-semibold uppercase tracking-wider text-gray-500">
            Payload shape
          </h3>
          <pre className="overflow-x-auto rounded-lg border border-gray-200 bg-gray-50 p-4 text-xs text-gray-900 dark:border-gray-800 dark:bg-gray-900 dark:text-gray-100">
            <code>{EXAMPLE_PAYLOAD}</code>
          </pre>
        </div>

        <div className="space-y-3">
          <h3 className="text-sm font-semibold uppercase tracking-wider text-gray-500">
            Signature verification
          </h3>
          <p className="text-sm leading-6 text-gray-600 dark:text-gray-300">
            Every request includes a{" "}
            <code className="rounded bg-gray-100 px-1 py-0.5 font-mono text-xs dark:bg-gray-900">
              {SIGNATURE_HEADER}
            </code>{" "}
            header — an HMAC-SHA256 hex digest of the raw request body signed
            with your subscription secret. Additional headers:{" "}
            <code className="rounded bg-gray-100 px-1 py-0.5 font-mono text-xs dark:bg-gray-900">
              {EVENT_HEADER}
            </code>{" "}
            and{" "}
            <code className="rounded bg-gray-100 px-1 py-0.5 font-mono text-xs dark:bg-gray-900">
              {DELIVERY_HEADER}
            </code>
            .
          </p>
          <pre className="overflow-x-auto rounded-lg border border-gray-200 bg-gray-50 p-4 text-xs text-gray-900 dark:border-gray-800 dark:bg-gray-900 dark:text-gray-100">
            <code>{VERIFY_NODE_SNIPPET}</code>
          </pre>
        </div>

        <div className="space-y-3">
          <h3 className="text-sm font-semibold uppercase tracking-wider text-gray-500">
            Retry policy
          </h3>
          <ul className="list-disc space-y-1 pl-6 text-sm leading-6 text-gray-600 dark:text-gray-300">
            <li>
              Non-2xx responses are retried up to 3 times with backoffs of 1s,
              5s, and 30s.
            </li>
            <li>
              If all attempts fail, the subscription is marked{" "}
              <span className="font-medium text-yellow-700 dark:text-yellow-500">
                degraded
              </span>{" "}
              and surfaced in the settings UI.
            </li>
            <li>
              Delivery timeout is 10 seconds per attempt. Redirects are not
              followed.
            </li>
          </ul>
        </div>
      </section>

      <section className="mt-20 space-y-6" aria-labelledby="rest-heading">
        <div className="flex items-center gap-3">
          <h2
            id="rest-heading"
            className="font-serif text-2xl font-semibold text-gray-900 dark:text-gray-50"
          >
            REST API
          </h2>
          <span className="inline-flex items-center rounded-full bg-gray-100 px-2 py-0.5 text-xs font-semibold text-gray-700 ring-1 ring-gray-300 dark:bg-gray-900 dark:text-gray-300 dark:ring-gray-700">
            Coming Q3
          </span>
        </div>
        <p className="max-w-2xl text-sm leading-6 text-gray-600 dark:text-gray-300">
          A partner-grade REST API for reading plans, triggering renders, and
          posting revisions on behalf of your users. Planned endpoints:
        </p>
        <ul className="list-disc space-y-1 pl-6 text-sm leading-6 text-gray-600 dark:text-gray-300">
          <li>
            <code className="font-mono text-xs">GET /v1/videos</code> — list
            videos for a workspace
          </li>
          <li>
            <code className="font-mono text-xs">POST /v1/videos/:id/render</code>{" "}
            — kick off a render
          </li>
          <li>
            <code className="font-mono text-xs">POST /v1/plans</code> — request a
            new weekly plan
          </li>
          <li>
            <code className="font-mono text-xs">GET /v1/webhooks</code> — manage
            subscriptions programmatically
          </li>
        </ul>
        <form
          action="/api/waitlist"
          method="post"
          className="mt-4 flex max-w-md flex-col gap-3 sm:flex-row"
        >
          <input type="hidden" name="source" value="developers_api_waitlist" />
          <input
            type="email"
            name="email"
            required
            placeholder="you@yourstartup.com"
            aria-label="Email for the API waitlist"
            className="flex-1 rounded-md border border-gray-200 bg-white px-3 py-2 text-sm dark:border-gray-800 dark:bg-gray-950 dark:text-gray-100"
          />
          <button
            type="submit"
            className="rounded-md bg-gray-900 px-4 py-2 text-sm font-medium text-white hover:bg-gray-800 dark:bg-gray-50 dark:text-gray-900 dark:hover:bg-gray-200"
          >
            Join the API waitlist
          </button>
        </form>
      </section>

      <section className="mt-20 space-y-3" aria-labelledby="spec-heading">
        <h2
          id="spec-heading"
          className="font-serif text-2xl font-semibold text-gray-900 dark:text-gray-50"
        >
          OpenAPI spec
        </h2>
        <p className="max-w-2xl text-sm leading-6 text-gray-600 dark:text-gray-300">
          Everything above is described in a single OpenAPI 3.1 document —
          served statically so you can drop it straight into Postman, Insomnia,
          or your codegen of choice.
        </p>
        <a
          href="/openapi.json"
          className="inline-flex items-center rounded-md border border-gray-200 px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50 dark:border-gray-800 dark:text-gray-200 dark:hover:bg-gray-900"
        >
          /openapi.json →
        </a>
      </section>
    </main>
  );
}
