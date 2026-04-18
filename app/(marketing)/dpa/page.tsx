import type { Metadata } from "next";
import Link from "next/link";
import { LEGAL } from "@/content/legal";

export const metadata: Metadata = {
  title: "Data Processing Addendum",
  description:
    "A summary of how Build In Social processes customer data, the GDPR lawful bases we rely on, and the rights available to data subjects.",
};

const META = LEGAL.META;

export default function DpaPage() {
  return (
    <main className="max-w-4xl mx-auto px-4 sm:px-6 py-16 sm:py-20">
      <div className="mb-10">
        <h1
          className="font-serif text-3xl sm:text-4xl font-semibold tracking-tight mb-3"
          style={{ color: "var(--text-primary)" }}
        >
          Data Processing Addendum
        </h1>
        <p className="text-sm text-[rgba(0,0,0,0.4)]">
          Last updated: {META.lastUpdated}
        </p>
      </div>

      <div
        role="note"
        className="mb-10 rounded-lg border border-black/[0.08] bg-[rgba(0,0,0,0.02)] p-4 text-[14px] leading-relaxed"
        style={{ color: "var(--text-secondary)" }}
      >
        This page summarizes the default data-processing terms between Build In
        Social and its customers. For enterprise customers who require a
        counter-signed DPA, contact{" "}
        <a
          href={`mailto:${META.legalEmail}`}
          className="transition-colors duration-150 hover:opacity-70"
          style={{ color: "var(--accent)" }}
        >
          {META.legalEmail}
        </a>{" "}
        and we will share the signable version incorporating the EU Standard
        Contractual Clauses and the UK International Data Transfer Addendum.
      </div>

      <div className="prose prose-neutral max-w-none text-[rgba(0,0,0,0.75)] leading-relaxed space-y-10">
        <section>
          <p className="text-[15px]">
            Build In Social is committed to processing personal data lawfully,
            transparently, and with strong safeguards. This addendum explains
            the roles of the parties, the lawful bases we rely on, the rights
            available to data subjects, and the security posture behind the
            service.
          </p>
        </section>

        <section>
          <SectionHeading>1. Our role</SectionHeading>
          <p className="text-[15px]">
            Build In Social acts as a{" "}
            <strong>data processor</strong> for the content customers submit or
            generate through the service (scripts, voice samples, videos, pSEO
            articles, prompts, and any connected-platform post content). The
            customer is the controller of that content.
          </p>
          <p className="text-[15px] mt-3">
            Build In Social acts as a{" "}
            <strong>data controller</strong> for account data it collects
            directly to operate the service: email, name, avatar, billing
            details, login metadata, and audit logs.
          </p>
        </section>

        <section>
          <SectionHeading>2. GDPR lawful bases</SectionHeading>
          <ul className="space-y-2 text-[15px] list-disc pl-5">
            <li>
              <span className="font-medium">Contract (Article 6(1)(b)).</span>{" "}
              Processing is necessary to deliver the service you signed up for:
              generating, rendering, and distributing your content.
            </li>
            <li>
              <span className="font-medium">
                Legitimate interests (Article 6(1)(f)).
              </span>{" "}
              Fraud prevention, rate limiting, abuse detection, and aggregate
              product analytics. You may object at any time.
            </li>
            <li>
              <span className="font-medium">Explicit consent (Article 9).</span>{" "}
              Voice samples are biometric data under GDPR Article 9 and are
              only processed after you opt in to voice cloning. Consent can be
              withdrawn at any time without affecting the lawfulness of earlier
              processing.
            </li>
            <li>
              <span className="font-medium">
                Legal obligation (Article 6(1)(c)).
              </span>{" "}
              Retention of billing records and compliance with tax, accounting,
              and regulatory requirements.
            </li>
          </ul>
        </section>

        <section>
          <SectionHeading>3. Data subject rights</SectionHeading>
          <ul className="space-y-3 text-[15px] list-disc pl-5">
            <li>
              <span className="font-medium">Access (Article 15).</span>{" "}
              Self-serve via{" "}
              <span className="font-medium">
                Settings &rarr; Profile &rarr; Download your data
              </span>
              . Returns a structured JSON export covering your account,
              content, and connected-platform state.
            </li>
            <li>
              <span className="font-medium">Rectification (Article 16).</span>{" "}
              Edit your profile and preferences in{" "}
              <span className="font-medium">Settings &rarr; Profile</span>.
            </li>
            <li>
              <span className="font-medium">Erasure (Article 17).</span>{" "}
              Self-serve via{" "}
              <span className="font-medium">
                Settings &rarr; Profile &rarr; Delete account
              </span>
              . Cascade deletion across our systems completes within 72 hours.
              Sub-processor purge confirmation is received within 30 days.
              Encrypted backups are overwritten within 90 days.
            </li>
            <li>
              <span className="font-medium">Portability (Article 20).</span>{" "}
              The JSON export in the Access flow is structured and
              machine-readable; media files are provided in their original
              container formats.
            </li>
            <li>
              <span className="font-medium">
                Restriction and objection (Articles 18 and 21).
              </span>{" "}
              Email{" "}
              <a
                href={`mailto:${META.contactEmail}`}
                className="transition-colors duration-150 hover:opacity-70"
                style={{ color: "var(--accent)" }}
              >
                {META.contactEmail}
              </a>{" "}
              and we will respond within 30 days.
            </li>
            <li>
              <span className="font-medium">
                Lodging a complaint (Article 77).
              </span>{" "}
              You may complain to your local supervisory authority. We will
              cooperate fully with any regulator exercising GDPR oversight.
            </li>
          </ul>
        </section>

        <section>
          <SectionHeading>4. International transfers</SectionHeading>
          <p className="text-[15px]">
            A number of Build In Social's sub-processors are based in the
            United States. Transfers of personal data from the EEA, UK, or
            Switzerland to those sub-processors are covered by the European
            Commission's Standard Contractual Clauses (SCCs, Module 2 or 3 as
            applicable) and, for UK data, the UK International Data Transfer
            Addendum. A named, current list of sub-processors and their
            jurisdictions is published at{" "}
            <Link
              href="/subprocessors"
              className="transition-colors duration-150 hover:opacity-70"
              style={{ color: "var(--accent)" }}
            >
              buildinsocial.com/subprocessors
            </Link>
            . A copy of the relevant transfer mechanism is available on
            request.
          </p>
        </section>

        <section>
          <SectionHeading>5. Security</SectionHeading>
          <ul className="space-y-2 text-[15px] list-disc pl-5">
            <li>
              <span className="font-medium">Encryption in transit.</span> TLS
              1.2 or higher is enforced on every external endpoint.
            </li>
            <li>
              <span className="font-medium">Encryption at rest.</span>{" "}
              Cloudflare R2 server-side encryption for media; provider-managed
              encryption at rest for our database and queues.
            </li>
            <li>
              <span className="font-medium">Access controls.</span> Production
              access is least-privilege and gated behind Clerk-managed SSO
              with hardware 2FA for engineering staff. Secrets live in a
              dedicated secrets manager and are rotated on a scheduled cadence.
            </li>
            <li>
              <span className="font-medium">Separation of duties.</span>{" "}
              Customer content and account data are logically segregated, and
              analytics pipelines operate on pseudonymous identifiers.
            </li>
            <li>
              <span className="font-medium">Incident response.</span> In line
              with GDPR Article 33, we will notify the competent supervisory
              authority within 72 hours of becoming aware of a personal-data
              breach that is likely to result in risk to data subjects, and we
              will notify affected users without undue delay where required by
              Article 34.
            </li>
          </ul>
          <p className="text-[15px] mt-3 text-[rgba(0,0,0,0.6)]">
            Build In Social does not hold SOC 2 or ISO 27001 certification
            today. We will publish the scope and audit date on this page when
            an audit is completed; we will not claim a certification we have
            not earned.
          </p>
        </section>

        <section>
          <SectionHeading>6. Sub-processors</SectionHeading>
          <p className="text-[15px]">
            The current list of sub-processors, together with each one's
            jurisdiction, purpose, data processed, and retention window, is
            published at{" "}
            <Link
              href="/subprocessors"
              className="transition-colors duration-150 hover:opacity-70"
              style={{ color: "var(--accent)" }}
            >
              buildinsocial.com/subprocessors
            </Link>
            . Build In Social gives at least 30 days' email notice before
            adding or replacing a sub-processor in a way that materially
            changes the processing of customer data.
          </p>
        </section>

        <section>
          <SectionHeading>7. Retention and deletion</SectionHeading>
          <p className="text-[15px]">
            Retention windows for each data category are listed in the{" "}
            <Link
              href="/privacy"
              className="transition-colors duration-150 hover:opacity-70"
              style={{ color: "var(--accent)" }}
            >
              Privacy Policy
            </Link>
            . When you delete your account, production data is purged within
            72 hours and encrypted backups within 90 days. Billing records are
            retained for the period required by tax law in our operating
            jurisdiction, typically 7 to 10 years.
          </p>
        </section>

        <section>
          <SectionHeading>8. Contact</SectionHeading>
          <p className="text-[15px]">
            Privacy questions, data-subject requests, and DPA negotiation
            requests should be sent to{" "}
            <a
              href={`mailto:${META.contactEmail}`}
              className="transition-colors duration-150 hover:opacity-70"
              style={{ color: "var(--accent)" }}
            >
              {META.contactEmail}
            </a>
            . Legal and contractual matters, including counter-signed DPAs,
            should be sent to{" "}
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

        <section>
          <p className="text-[14px] text-[rgba(0,0,0,0.55)]">
            See also:{" "}
            <Link
              href="/privacy"
              className="transition-colors duration-150 hover:opacity-70"
              style={{ color: "var(--accent)" }}
            >
              Privacy Policy
            </Link>
            {" \u00B7 "}
            <Link
              href="/terms"
              className="transition-colors duration-150 hover:opacity-70"
              style={{ color: "var(--accent)" }}
            >
              Terms of Service
            </Link>
            {" \u00B7 "}
            <Link
              href="/subprocessors"
              className="transition-colors duration-150 hover:opacity-70"
              style={{ color: "var(--accent)" }}
            >
              Sub-processors
            </Link>
          </p>
        </section>
      </div>
    </main>
  );
}

function SectionHeading({ children }: { children: React.ReactNode }) {
  return (
    <h2
      className="font-serif text-lg font-semibold mb-3"
      style={{ color: "var(--text-primary)" }}
    >
      {children}
    </h2>
  );
}
