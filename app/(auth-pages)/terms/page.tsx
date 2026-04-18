import type { Metadata } from "next";
import Link from "next/link";
import { LEGAL } from "@/content/legal";

export const metadata: Metadata = {
  title: "Terms of Service",
  description: "The terms governing your use of Build In Social.",
};

const T = LEGAL.TERMS;
const META = LEGAL.META;
const BANNER = LEGAL.DRAFT_BANNER;

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
        {/* Draft banner — must be visually prominent */}
        <div
          role="alert"
          aria-label="Legal draft warning"
          className="mb-10 flex gap-3 rounded-lg border border-amber-300 bg-amber-50 p-4 text-amber-900"
        >
          <svg
            width="20"
            height="20"
            viewBox="0 0 20 20"
            fill="none"
            aria-hidden="true"
            className="mt-0.5 shrink-0"
          >
            <path
              d="M10 2L18 17H2L10 2z"
              stroke="currentColor"
              strokeWidth="1.5"
              strokeLinejoin="round"
            />
            <path
              d="M10 8v4"
              stroke="currentColor"
              strokeWidth="1.5"
              strokeLinecap="round"
            />
            <circle cx="10" cy="14.5" r="0.75" fill="currentColor" />
          </svg>
          <div>
            <p className="font-semibold text-[13px] tracking-wide uppercase">
              {BANNER.title}
            </p>
            <p className="mt-1 text-[14px] leading-relaxed">{BANNER.body}</p>
          </div>
        </div>

        <div className="mb-10">
          <h1
            className="text-3xl sm:text-4xl font-semibold tracking-tight mb-3"
            style={{ color: "var(--text-primary)" }}
          >
            {T.title}
          </h1>
          <p className="text-sm text-[rgba(0,0,0,0.4)]">
            Last updated: {META.lastUpdated}
          </p>
        </div>

        <div className="prose prose-neutral max-w-none text-[rgba(0,0,0,0.75)] leading-relaxed space-y-10">
          <section>
            <p className="text-[15px]">{T.intro}</p>
          </section>

          <section>
            <SectionHeading>{T.acceptance.heading}</SectionHeading>
            <p className="text-[15px]">{T.acceptance.body}</p>
          </section>

          <section>
            <SectionHeading>{T.serviceDescription.heading}</SectionHeading>
            <p className="text-[15px]">{T.serviceDescription.body}</p>
          </section>

          <section>
            <SectionHeading>{T.accounts.heading}</SectionHeading>
            <p className="text-[15px]">{T.accounts.body}</p>
          </section>

          <section>
            <SectionHeading>{T.acceptableUse.heading}</SectionHeading>
            <p className="text-[15px]">{T.acceptableUse.intro}</p>
            <ul className="mt-3 space-y-2 text-[15px] list-disc pl-5">
              {T.acceptableUse.bullets.map((b) => (
                <li key={b}>{b}</li>
              ))}
            </ul>
          </section>

          <section>
            <SectionHeading>{T.subscription.heading}</SectionHeading>
            <ul className="space-y-2 text-[15px] list-disc pl-5">
              {T.subscription.bullets.map((b) => (
                <li key={b}>{b}</li>
              ))}
            </ul>
          </section>

          <section>
            <SectionHeading>{T.contentOwnership.heading}</SectionHeading>
            <p className="text-[15px]">
              <strong>
                You own your generated scripts, videos, voice clones, and pSEO
                pages.
              </strong>{" "}
              We grant ourselves only a limited, non-exclusive license to host,
              process, render, and deliver your content for the sole purpose of
              operating the Service. This license terminates when you delete
              the content or close your account.
            </p>
            <p className="mt-3 text-[15px]">{T.contentOwnership.noTraining}</p>
            <p className="mt-3 text-[15px]">{T.contentOwnership.portability}</p>
          </section>

          <section>
            <SectionHeading>{T.limitation.heading}</SectionHeading>
            <p className="text-[15px]">{T.limitation.body}</p>
          </section>

          <section>
            <SectionHeading>{T.indemnification.heading}</SectionHeading>
            <p className="text-[15px]">{T.indemnification.body}</p>
          </section>

          <section>
            <SectionHeading>{T.termination.heading}</SectionHeading>
            <p className="text-[15px]">{T.termination.body}</p>
          </section>

          <section>
            <SectionHeading>{T.dpa.heading}</SectionHeading>
            <p className="text-[15px]">{T.dpa.body}</p>
          </section>

          <section>
            <SectionHeading>{T.sla.heading}</SectionHeading>
            <p className="text-[15px]">{T.sla.body}</p>
          </section>

          <section>
            <SectionHeading>{T.governingLaw.heading}</SectionHeading>
            <p className="text-[15px]">{T.governingLaw.body}</p>
          </section>

          <section>
            <SectionHeading>{T.changes.heading}</SectionHeading>
            <p className="text-[15px]">{T.changes.body}</p>
          </section>

          <section>
            <SectionHeading>{T.contact.heading}</SectionHeading>
            <p className="text-[15px]">
              Questions about these Terms? Email{" "}
              <a
                href={`mailto:${META.legalEmail}`}
                className="transition-colors duration-150 hover:opacity-70"
                style={{ color: "var(--accent)" }}
              >
                {META.legalEmail}
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

function SectionHeading({ children }: { children: React.ReactNode }) {
  return (
    <h2
      className="text-lg font-semibold mb-3"
      style={{ color: "var(--text-primary)" }}
    >
      {children}
    </h2>
  );
}
