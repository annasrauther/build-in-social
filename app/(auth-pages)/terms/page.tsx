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
        <div className="max-w-4xl mx-auto px-4 sm:px-6 h-14 flex items-center justify-between">
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
            &larr; Back to home
          </Link>
        </div>
      </header>

      {/* Content */}
      <main className="max-w-4xl mx-auto px-4 sm:px-6 py-16 sm:py-20">
        <div className="mb-10">
          <h1
            className="text-3xl sm:text-4xl font-semibold tracking-tight mb-3"
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
              By creating an account or using Build In Social, you agree to these Terms of Service.
              These terms apply to all users including free and paid plan subscribers.
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
              your domain presence across multiple platforms.
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
              You are responsible for keeping your account credentials secure. Plans include Solo,
              Creator, and Studio tiers.
            </p>
          </section>

          <section>
            <h2
              className="text-lg font-semibold mb-3"
              style={{ color: "var(--text-primary)" }}
            >
              4. Intellectual Property
            </h2>
            <p className="text-[15px]">
              You own the content you generate using Build In Social. Build In Social retains no rights
              to your generated content.
            </p>
          </section>

          <section>
            <h2
              className="text-lg font-semibold mb-3"
              style={{ color: "var(--text-primary)" }}
            >
              5. Payments and Billing
            </h2>
            <p className="text-[15px]">
              Payments are processed by Stripe. All prices are in USD. You may cancel your subscription
              at any time.
            </p>
          </section>

          <section>
            <h2
              className="text-lg font-semibold mb-3"
              style={{ color: "var(--text-primary)" }}
            >
              6. Contact
            </h2>
            <p className="text-[15px]">
              Questions about these terms? Email us at{" "}
              <a
                href="mailto:legal@buildinsocial.app"
                className="transition-colors duration-150 hover:opacity-70"
                style={{ color: "var(--accent)" }}
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
        <div className="max-w-4xl mx-auto px-4 sm:px-6 py-8 flex flex-col sm:flex-row items-center justify-between gap-3">
          <p className="text-xs text-[rgba(0,0,0,0.3)]">
            &copy; {new Date().getFullYear()} Build In Social. All rights reserved.
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
