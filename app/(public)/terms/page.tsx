import type { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = {
  title: "Terms of Service",
  description: "The terms governing your use of Build In Social.",
};

const LAST_UPDATED = "April 8, 2026";

export default function TermsPage() {
  return (
    <div className="min-h-screen bg-white">
      {/* Nav */}
      <header className="border-b border-black/[0.07] bg-white/90 backdrop-blur-sm sticky top-0 z-40">
        <div className="max-w-4xl mx-auto px-4 tablet-sm:px-6 h-14 flex items-center justify-between">
          <Link href="/" className="flex items-center gap-2 group">
            <div
              className="w-7 h-7 rounded-lg flex items-center justify-center transition-transform duration-200 group-hover:scale-105"
              style={{ background: "var(--accent)" }}
            >
              <svg
                width="16"
                height="16"
                viewBox="0 0 16 16"
                fill="none"
                aria-hidden="true"
              >
                <path
                  d="M8 1.5L13.5 5v6L8 14.5 2.5 11V5L8 1.5z"
                  stroke="white"
                  strokeWidth="1.5"
                  strokeLinejoin="round"
                />
                <circle cx="8" cy="8" r="2" fill="white" />
              </svg>
            </div>
            <span
              className="font-semibold tracking-tight"
              style={{ color: "var(--text-primary)" }}
            >
              Build In Social
            </span>
          </Link>
          <Link
            href="/"
            className="text-sm transition-colors duration-150"
            style={{ color: "var(--text-tertiary)" }}
          >
            ← Back to home
          </Link>
        </div>
      </header>

      {/* Content */}
      <main className="max-w-4xl mx-auto px-4 tablet-sm:px-6 py-16 tablet-sm:py-20">
        <div className="mb-10">
          <h1
            className="text-3xl tablet-sm:text-4xl font-semibold tracking-tight mb-3"
            style={{ color: "var(--text-primary)" }}
          >
            Terms of Service
          </h1>
          <p className="text-sm text-[rgba(0,0,0,0.4)]">Last updated: {LAST_UPDATED}</p>
        </div>

        <div className="prose prose-neutral max-w-none text-[rgba(0,0,0,0.75)] leading-relaxed space-y-10">
          <section>
            <h2
              className="text-lg font-semibold mb-3"
              style={{ color: "var(--text-primary)" }}
            >
              1. Acceptance of Terms
            </h2>
            <p className="text-[15px]">
              By creating an account or using Build In Social, you agree to these Terms of Service. If you
              do not agree, do not use the service. These terms apply to all users including free
              and paid plan subscribers.
            </p>
          </section>

          <section>
            <h2
              className="text-lg font-semibold mb-3"
              style={{ color: "var(--text-primary)" }}
            >
              2. Description of Service
            </h2>
            <p className="text-[15px]">
              Build In Social is an AI-powered social media distribution partner that builds and maintains
              your domain presence. It generates platform-native videos, pSEO landing pages, and
              social posts for YouTube Shorts, Instagram Reels, LinkedIn, and X — running on manual
              or autopilot mode each week.
            </p>
          </section>

          <section>
            <h2
              className="text-lg font-semibold mb-3"
              style={{ color: "var(--text-primary)" }}
            >
              3. Accounts and Subscriptions
            </h2>
            <p className="text-[15px]">
              You are responsible for keeping your account credentials secure. Build In Social operates on
              a subscription model. Plans include Solo, Creator, and Studio tiers, billed monthly or
              annually. Subscription features are tied to your active plan and are subject to the
              limits of that tier. You may not share accounts between individuals or organisations.
            </p>
          </section>

          <section>
            <h2
              className="text-lg font-semibold mb-3"
              style={{ color: "var(--text-primary)" }}
            >
              4. Acceptable Use
            </h2>
            <p className="text-[15px]">You may not use Build In Social to:</p>
            <ul className="mt-3 space-y-1.5 text-[15px] list-disc list-inside">
              <li>Generate content that is illegal, defamatory, or harassing</li>
              <li>Impersonate real people or organisations without authorisation</li>
              <li>Produce spam or bulk unsolicited content</li>
              <li>Circumvent platform terms of service of YouTube, Instagram, LinkedIn, or X</li>
              <li>Attempt to reverse-engineer or scrape the Build In Social platform</li>
              <li>Resell or redistribute generated content as a competing AI service</li>
            </ul>
            <p className="mt-3 text-[15px]">
              We reserve the right to suspend or terminate accounts that violate these terms.
            </p>
          </section>

          <section>
            <h2
              className="text-lg font-semibold mb-3"
              style={{ color: "var(--text-primary)" }}
            >
              5. Intellectual Property
            </h2>
            <p className="text-[15px]">
              You own the content you generate using Build In Social, subject to the terms of the underlying
              AI providers (Anthropic, ElevenLabs). Build In Social retains no rights to your
              generated content. You grant Build In Social a limited licence to store and deliver your
              content within the platform.
            </p>
          </section>

          <section>
            <h2
              className="text-lg font-semibold mb-3"
              style={{ color: "var(--text-primary)" }}
            >
              6. Payments and Billing
            </h2>
            <p className="text-[15px]">
              Payments are processed by Stripe. All prices are in USD. Subscription fees are billed
              in advance on a monthly or annual basis. You may cancel your subscription at any time;
              cancellation takes effect at the end of the current billing period. We do not offer
              pro-rated refunds for mid-period cancellations.
            </p>
          </section>

          <section>
            <h2
              className="text-lg font-semibold mb-3"
              style={{ color: "var(--text-primary)" }}
            >
              7. Service Availability
            </h2>
            <p className="text-[15px]">
              Build In Social is provided on an &ldquo;as is&rdquo; basis. We do not guarantee uninterrupted or
              error-free service. Generation times depend on third-party AI providers and may vary.
              We are not liable for content generated that does not meet your expectations.
            </p>
          </section>

          <section>
            <h2
              className="text-lg font-semibold mb-3"
              style={{ color: "var(--text-primary)" }}
            >
              8. Limitation of Liability
            </h2>
            <p className="text-[15px]">
              To the maximum extent permitted by law, Build In Social&apos;s liability for any claim arising from
              use of the service is limited to the amount you paid us in the 3 months preceding the
              claim. We are not liable for indirect, incidental, or consequential damages.
            </p>
          </section>

          <section>
            <h2
              className="text-lg font-semibold mb-3"
              style={{ color: "var(--text-primary)" }}
            >
              9. Changes to Terms
            </h2>
            <p className="text-[15px]">
              We may update these terms at any time. Continued use of Build In Social after changes
              constitutes acceptance of the updated terms. We will notify you by email for material
              changes at least 14 days in advance.
            </p>
          </section>

          <section>
            <h2
              className="text-lg font-semibold mb-3"
              style={{ color: "var(--text-primary)" }}
            >
              10. Contact
            </h2>
            <p className="text-[15px]">
              Questions about these terms? Email us at{" "}
              <a
                href="mailto:legal@buildinsocial.app"
                className="transition-colors duration-150"
                style={{ color: "var(--accent)" }}
                onMouseEnter={(e) =>
                  ((e.currentTarget as HTMLAnchorElement).style.color = "var(--accent-hover)")
                }
                onMouseLeave={(e) =>
                  ((e.currentTarget as HTMLAnchorElement).style.color = "var(--accent)")
                }
              >
                legal@buildinsocial.app
              </a>
              .
            </p>
          </section>
        </div>
      </main>

      {/* Footer */}
      <footer
        className="border-t border-black/[0.06] mt-10"
        style={{ background: "var(--bg-surface)" }}
      >
        <div className="max-w-4xl mx-auto px-4 tablet-sm:px-6 py-8 flex flex-col tablet-sm:flex-row items-center justify-between gap-3">
          <p className="text-xs text-[rgba(0,0,0,0.3)]">
            © {new Date().getFullYear()} Build In Social. All rights reserved.
          </p>
          <div
            className="flex items-center gap-5 text-xs"
            style={{ color: "var(--text-tertiary)" }}
          >
            <Link
              href="/privacy"
              className="transition-colors duration-150"
            >
              Privacy
            </Link>
            <Link
              href="/terms"
              className="transition-colors duration-150 font-medium"
              style={{ color: "var(--text-primary)" }}
            >
              Terms
            </Link>
          </div>
        </div>
      </footer>
    </div>
  );
}
