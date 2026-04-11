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
              videos you generate, and your subscription activity. We use Clerk for authentication — their
              privacy policy governs the collection of authentication credentials.
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
              We use your information to provide and improve the Build In Social service — generating your
              content, managing your account and subscription, processing payments, and sending
              transactional emails. We do not sell your personal data. We do not use your content
              to train AI models.
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
              Build In Social integrates with the following third-party services to deliver its features:
            </p>
            <ul className="mt-3 space-y-1.5 text-[15px] list-disc list-inside">
              <li><strong>Clerk</strong> — Authentication and identity management</li>
              <li><strong>Stripe</strong> — Payment processing</li>
              <li><strong>ElevenLabs</strong> — AI voice synthesis</li>
              <li><strong>Anthropic (Claude)</strong> — Script and content generation</li>
              <li><strong>Cloudflare R2</strong> — Media file storage</li>
              <li><strong>Pexels</strong> — Stock footage for faceless videos</li>
            </ul>
            <p className="mt-3 text-[15px]">
              Each service has its own privacy policy governing data they receive. Your prompts and
              generated content may be transmitted to these services to fulfill your requests.
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
              active. You may request deletion of your account and associated data at any time by
              contacting us at the email below. Deletion requests are processed within 30 days.
            </p>
          </section>

          <section>
            <h2
              className="text-lg font-semibold mb-3"
              style={{ color: "var(--text-primary)" }}
            >
              5. Cookies
            </h2>
            <p className="text-[15px]">
              Build In Social uses cookies strictly necessary for authentication (via Clerk) and for
              remembering your preferences such as theme selection. We do not use advertising or
              cross-site tracking cookies.
            </p>
          </section>

          <section>
            <h2
              className="text-lg font-semibold mb-3"
              style={{ color: "var(--text-primary)" }}
            >
              6. Security
            </h2>
            <p className="text-[15px]">
              We use industry-standard encryption in transit (TLS) and at rest. Authentication is
              handled by Clerk, which provides secure session management. We do not store passwords.
              No system is perfectly secure — if you believe your account has been compromised,
              contact us immediately.
            </p>
          </section>

          <section>
            <h2
              className="text-lg font-semibold mb-3"
              style={{ color: "var(--text-primary)" }}
            >
              7. Your Rights
            </h2>
            <p className="text-[15px]">
              Depending on your location, you may have rights to access, correct, or delete your
              personal data, or to object to or restrict its processing. To exercise any of these
              rights, contact us at the address below.
            </p>
          </section>

          <section>
            <h2
              className="text-lg font-semibold mb-3"
              style={{ color: "var(--text-primary)" }}
            >
              8. Changes to This Policy
            </h2>
            <p className="text-[15px]">
              We may update this policy periodically. When we do, we will update the &ldquo;Last updated&rdquo;
              date above and, for material changes, notify you by email.
            </p>
          </section>

          <section>
            <h2
              className="text-lg font-semibold mb-3"
              style={{ color: "var(--text-primary)" }}
            >
              9. Contact
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
