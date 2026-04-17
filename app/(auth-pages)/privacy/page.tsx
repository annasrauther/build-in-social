import type { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = {
  title: "Privacy Policy",
  description: "How Build In Social collects, uses, and protects your data.",
};

const LAST_UPDATED = "April 8, 2026";

export default function PrivacyPage() {
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
            Privacy Policy
          </h1>
          <p className="text-sm text-[rgba(0,0,0,0.4)]">Last updated: {LAST_UPDATED}</p>
        </div>

        <div className="prose prose-neutral max-w-none text-[rgba(0,0,0,0.75)] leading-relaxed space-y-10">
          <section>
            <h2
              className="text-lg font-semibold mb-3"
              style={{ color: "var(--text-primary)" }}
            >
              1. Information We Collect
            </h2>
            <p className="text-[15px]">
              When you sign up for Build In Social, we collect your email address and any profile information
              you provide. As you use the product, we collect usage data including prompts you submit,
              videos you generate, and your subscription activity. We use Clerk for authentication.
            </p>
          </section>

          <section>
            <h2
              className="text-lg font-semibold mb-3"
              style={{ color: "var(--text-primary)" }}
            >
              2. How We Use Your Information
            </h2>
            <p className="text-[15px]">
              We use your information to provide and improve the Build In Social service. We do not sell
              your personal data. We do not use your content to train AI models.
            </p>
          </section>

          <section>
            <h2
              className="text-lg font-semibold mb-3"
              style={{ color: "var(--text-primary)" }}
            >
              3. Third-Party Services
            </h2>
            <p className="text-[15px]">
              Build In Social integrates with third-party services to deliver its features.
              Each service has its own privacy policy governing data they receive.
            </p>
          </section>

          <section>
            <h2
              className="text-lg font-semibold mb-3"
              style={{ color: "var(--text-primary)" }}
            >
              4. Data Retention
            </h2>
            <p className="text-[15px]">
              We retain your account data and generated content for as long as your account is
              active. You may request deletion at any time.
            </p>
          </section>

          <section>
            <h2
              className="text-lg font-semibold mb-3"
              style={{ color: "var(--text-primary)" }}
            >
              5. Security
            </h2>
            <p className="text-[15px]">
              We use industry-standard encryption in transit (TLS) and at rest.
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
              Questions about this policy? Email us at{" "}
              <a
                href="mailto:privacy@buildinsocial.app"
                className="transition-colors duration-150 hover:opacity-70"
                style={{ color: "var(--accent)" }}
              >
                privacy@buildinsocial.app
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
              className="transition-colors duration-150 font-medium"
              style={{ color: "var(--text-primary)" }}
            >
              Privacy
            </Link>
            <Link
              href="/terms"
              className="transition-colors duration-150"
            >
              Terms
            </Link>
          </div>
        </div>
      </footer>
    </div>
  );
}
