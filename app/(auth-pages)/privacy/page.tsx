import type { Metadata } from "next";
import Link from "next/link";
import { LEGAL } from "@/content/legal";

export const metadata: Metadata = {
  title: "Privacy Policy",
  description: "How Build In Social collects, uses, and protects your data.",
};

const P = LEGAL.PRIVACY;
const META = LEGAL.META;
const BANNER = LEGAL.DRAFT_BANNER;
const SUBPROCESSORS = LEGAL.SUBPROCESSORS;

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
            {P.title}
          </h1>
          <p className="text-sm text-[rgba(0,0,0,0.4)]">
            Last updated: {META.lastUpdated}
          </p>
        </div>

        <div className="prose prose-neutral max-w-none text-[rgba(0,0,0,0.75)] leading-relaxed space-y-10">
          <section>
            <p className="text-[15px]">{P.intro}</p>
          </section>

          <section>
            <SectionHeading>{P.controller.heading}</SectionHeading>
            <p className="text-[15px]">{P.controller.body}</p>
          </section>

          <section>
            <SectionHeading>{P.dataWeCollect.heading}</SectionHeading>
            <ul className="space-y-3 text-[15px] list-disc pl-5">
              {P.dataWeCollect.categories.map((c) => (
                <li key={c.label}>
                  <span className="font-semibold">{c.label}.</span> {c.body}
                </li>
              ))}
            </ul>
          </section>

          <section>
            <SectionHeading>{P.lawfulBasis.heading}</SectionHeading>
            <p className="text-[15px]">{P.lawfulBasis.body}</p>
            <ul className="mt-3 space-y-2 text-[15px] list-disc pl-5">
              {P.lawfulBasis.bullets.map((b) => (
                <li key={b}>{b}</li>
              ))}
            </ul>
          </section>

          <section>
            <SectionHeading>{P.subprocessors.heading}</SectionHeading>
            <p className="text-[15px]">{P.subprocessors.body}</p>
            <div className="mt-4 overflow-x-auto rounded-lg border border-black/[0.08]">
              <table className="min-w-full text-left text-[14px]">
                <thead className="bg-[rgba(0,0,0,0.03)] text-[12px] uppercase tracking-wide text-[rgba(0,0,0,0.55)]">
                  <tr>
                    <th className="px-3 py-2 font-medium">Subprocessor</th>
                    <th className="px-3 py-2 font-medium">Purpose</th>
                    <th className="px-3 py-2 font-medium">Data</th>
                    <th className="px-3 py-2 font-medium">Region</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-black/[0.06]">
                  {SUBPROCESSORS.map((s) => (
                    <tr key={s.name}>
                      <td className="px-3 py-2 font-medium align-top">
                        {s.name}
                      </td>
                      <td className="px-3 py-2 align-top">{s.purpose}</td>
                      <td className="px-3 py-2 align-top">{s.dataTypes}</td>
                      <td className="px-3 py-2 align-top">{s.region}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </section>

          <section>
            <SectionHeading>{P.doNotTrain.heading}</SectionHeading>
            <p className="text-[15px]">{P.doNotTrain.body}</p>
          </section>

          <section>
            <SectionHeading>{P.userRights.heading}</SectionHeading>
            <p className="text-[15px]">{P.userRights.bodyGdpr}</p>
            <p className="mt-3 text-[15px]">{P.userRights.bodyCcpa}</p>
            <p className="mt-3 text-[15px]">{P.userRights.selfServe}</p>
          </section>

          <section>
            <SectionHeading>{P.retention.heading}</SectionHeading>
            <ul className="space-y-2 text-[15px] list-disc pl-5">
              {P.retention.bullets.map((b) => (
                <li key={b}>{b}</li>
              ))}
            </ul>
          </section>

          <section>
            <SectionHeading>{P.internationalTransfers.heading}</SectionHeading>
            <p className="text-[15px]">{P.internationalTransfers.body}</p>
          </section>

          <section>
            <SectionHeading>{P.children.heading}</SectionHeading>
            <p className="text-[15px]">{P.children.body}</p>
          </section>

          <section>
            <SectionHeading>{P.security.heading}</SectionHeading>
            <p className="text-[15px]">{P.security.body}</p>
          </section>

          <section>
            <SectionHeading>{P.breachNotification.heading}</SectionHeading>
            <p className="text-[15px]">{P.breachNotification.body}</p>
          </section>

          <section>
            <SectionHeading>{P.dpo.heading}</SectionHeading>
            <p className="text-[15px]">{P.dpo.body}</p>
          </section>

          <section>
            <SectionHeading>{P.changes.heading}</SectionHeading>
            <p className="text-[15px]">{P.changes.body}</p>
          </section>

          <section>
            <SectionHeading>{P.contact.heading}</SectionHeading>
            <p className="text-[15px]">
              Questions, requests, or complaints about this policy should be
              sent to{" "}
              <a
                href={`mailto:${META.contactEmail}`}
                className="transition-colors duration-150 hover:opacity-70"
                style={{ color: "var(--accent)" }}
              >
                {META.contactEmail}
              </a>
              . For matters specific to the EU or UK, you may also reach our
              DPO placeholder at{" "}
              <a
                href={`mailto:${META.dpoEmail}`}
                className="transition-colors duration-150 hover:opacity-70"
                style={{ color: "var(--accent)" }}
              >
                {META.dpoEmail}
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
