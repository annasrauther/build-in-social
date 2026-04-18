/**
 * Public sub-processor disclosure for /subprocessors.
 *
 * Keep this list honest and comprehensive. If a vendor's region or retention
 * policy is uncertain, say so inline rather than guessing. Do not invent
 * certifications (SOC 2, ISO, etc.) Build In Social does not hold.
 */

export type Subprocessor = {
  vendor: string;
  jurisdiction: string;
  purpose: string;
  dataProcessed: string;
  retention: string;
};

export const SUBPROCESSORS_META = {
  lastUpdated: "April 18, 2026",
  contactEmail: "privacy@buildinsocial.com",
  defaultStorageRegion:
    "Cloudflare R2, automatic/global replication. We do not yet offer a pinned-region storage tier; regional pinning and BYOK are on the roadmap.",
};

export const SUBPROCESSORS: Subprocessor[] = [
  {
    vendor: "Anthropic",
    jurisdiction: "United States",
    purpose:
      "Script generation, quality-gate evaluation, and pSEO article drafting via the Claude API (Haiku and Sonnet).",
    dataProcessed:
      "Product description, niche, quality-gate answers, generated drafts. No account identifiers are sent.",
    retention:
      "Per Anthropic's standard commercial API terms; Build In Social does not grant training rights.",
  },
  {
    vendor: "ElevenLabs",
    jurisdiction: "United States",
    purpose: "Voice synthesis and voice cloning for generated audio tracks.",
    dataProcessed:
      "Voice recordings (biometric data under GDPR Article 9), synthesized audio files, voice clone identifiers.",
    retention:
      "Until you delete the clone in Settings or delete your account. Purged from ElevenLabs on deletion.",
  },
  {
    vendor: "Pexels",
    jurisdiction: "United States",
    purpose: "B-roll stock footage for faceless videos.",
    dataProcessed:
      "Search queries derived from your niche and topic. No personal data is transmitted.",
    retention: "Not applicable. Build In Social only queries Pexels' public library.",
  },
  {
    vendor: "Cloudflare R2",
    jurisdiction: "Global (automatic replication; no pinned region in the current tier)",
    purpose:
      "Object storage for rendered videos, audio tracks, thumbnails, and pSEO article HTML.",
    dataProcessed: "User-generated content.",
    retention:
      "Life of your subscription, plus a 30-day grace period after account deletion for export. Purged from backups within 90 days.",
  },
  {
    vendor: "Cloudflare (CDN / edge)",
    jurisdiction: "Global edge network",
    purpose: "Content delivery, DDoS protection, TLS termination.",
    dataProcessed: "Request metadata (IP, user agent), edge cache of public assets.",
    retention: "Cloudflare's standard log retention windows.",
  },
  {
    vendor: "Vercel",
    jurisdiction: "United States",
    purpose: "Hosting the Next.js application and edge functions.",
    dataProcessed: "Request/response traffic, server logs.",
    retention: "Vercel's standard log retention (typically 30 days).",
  },
  {
    vendor: "Clerk",
    jurisdiction: "United States",
    purpose: "Authentication and session management.",
    dataProcessed:
      "Email, name, avatar, password hash, session tokens, OAuth tokens for connected social platforms.",
    retention: "Life of your account. Purged on account deletion.",
  },
  {
    vendor: "Stripe",
    jurisdiction: "United States / Ireland",
    purpose: "Payments and subscription management.",
    dataProcessed:
      "Billing name, billing address, VAT/tax ID if provided, tokenized payment method, last-4 card digits.",
    retention:
      "Retained per Stripe's policies and applicable tax law (typically 7 to 10 years for financial records).",
  },
  {
    vendor: "Resend",
    jurisdiction: "United States",
    purpose: "Transactional email (welcome, weekly digest, password reset, billing notices).",
    dataProcessed: "Email address, email subject and body.",
    retention: "Resend's standard log retention window.",
  },
  {
    vendor: "NoCodeBackend",
    jurisdiction:
      "Region is not yet contractually pinned. Check current region in our Privacy Policy for the most up-to-date status.",
    purpose: "Primary application database (user records, plans, videos, subscription state).",
    dataProcessed: "Account data, content metadata, subscription state.",
    retention: "Life of your account. Cascade-deleted on account deletion.",
  },
  {
    vendor: "Upstash Redis",
    jurisdiction: "Global (AWS regions)",
    purpose: "Rate limiting, job queue, short-lived caches.",
    dataProcessed: "Rate-limit counters, job metadata. No user content is stored.",
    retention: "Ephemeral. Typically purged within hours to days.",
  },
  {
    vendor: "Sentry",
    jurisdiction: "United States",
    purpose: "Error monitoring and performance tracing.",
    dataProcessed:
      "Error stack traces, pseudonymous user ID, release metadata. PII is scrubbed from breadcrumbs.",
    retention: "90 days by default.",
  },
  {
    vendor: "PostHog",
    jurisdiction: "United States",
    purpose: "Product analytics and feature-adoption measurement.",
    dataProcessed: "Event metadata, pseudonymous user ID. No content payloads.",
    retention: "Per our PostHog project configuration (default 7 years; under review).",
  },
  {
    vendor: "YouTube (Google) API",
    jurisdiction: "United States",
    purpose: "Publishing YouTube Shorts on your behalf.",
    dataProcessed: "OAuth tokens, uploaded video and metadata, post status, basic engagement metrics.",
    retention: "OAuth tokens retained until you disconnect the platform or delete your account.",
  },
  {
    vendor: "Instagram (Meta) API",
    jurisdiction: "United States",
    purpose: "Publishing Instagram Reels on your behalf.",
    dataProcessed: "OAuth tokens, uploaded video and metadata, post status, basic engagement metrics.",
    retention: "OAuth tokens retained until you disconnect the platform or delete your account.",
  },
  {
    vendor: "LinkedIn API",
    jurisdiction: "United States / Ireland",
    purpose: "Publishing LinkedIn posts on your behalf.",
    dataProcessed: "OAuth tokens, post content and metadata, post status, basic engagement metrics.",
    retention: "OAuth tokens retained until you disconnect the platform or delete your account.",
  },
  {
    vendor: "X (Twitter) API",
    jurisdiction: "United States",
    purpose: "Publishing X posts on your behalf.",
    dataProcessed: "OAuth tokens, post content and metadata, post status, basic engagement metrics.",
    retention: "OAuth tokens retained until you disconnect the platform or delete your account.",
  },
];
