import type { Metadata } from "next";
import Link from "next/link";
import { SUBPROCESSORS, SUBPROCESSORS_META } from "@/content/subprocessors";

export const metadata: Metadata = {
  title: "Sub-processors",
  description:
    "The third-party vendors Build In Social uses to process user data, what data each one sees, and where it is held.",
};

export default function SubprocessorsPage() {
  return (
    <main className="max-w-4xl mx-auto px-4 sm:px-6 py-16 sm:py-20">
      <div className="mb-10">
        <h1
          className="font-serif text-3xl sm:text-4xl font-semibold tracking-tight mb-3"
          style={{ color: "var(--text-primary)" }}
        >
          Sub-processors
        </h1>
        <p className="text-sm text-[rgba(0,0,0,0.4)]">
          Last updated: {SUBPROCESSORS_META.lastUpdated}
        </p>
      </div>

      <div className="prose prose-neutral max-w-none text-[rgba(0,0,0,0.75)] leading-relaxed space-y-10">
        <section>
          <p className="text-[15px]">
            Build In Social relies on the following third-party vendors to
            deliver the service. Each vendor is engaged under a data-processing
            agreement with confidentiality, security, and onward-transfer
            obligations at least as strict as ours. For EU, UK, and Swiss data,
            transfers outside the EEA are covered by the European Commission's
            Standard Contractual Clauses (SCCs) and, where applicable, the UK
            International Data Transfer Addendum.
          </p>
          <p className="text-[15px] mt-3">
            This list is read with our{" "}
            <Link
              href="/privacy"
              className="transition-colors duration-150 hover:opacity-70"
              style={{ color: "var(--accent)" }}
            >
              Privacy Policy
            </Link>{" "}
            and{" "}
            <Link
              href="/dpa"
              className="transition-colors duration-150 hover:opacity-70"
              style={{ color: "var(--accent)" }}
            >
              Data Processing Addendum
            </Link>
            .
          </p>
        </section>

        <section>
          <SectionHeading>Current sub-processors</SectionHeading>

          {/* Table — visible on md and up */}
          <div className="mt-4 hidden md:block overflow-x-auto rounded-lg border border-black/[0.08]">
            <table className="min-w-full text-left text-[14px]">
              <thead className="bg-[rgba(0,0,0,0.03)] text-[12px] uppercase tracking-wide text-[rgba(0,0,0,0.55)]">
                <tr>
                  <th className="px-3 py-2 font-medium">Vendor</th>
                  <th className="px-3 py-2 font-medium">Jurisdiction</th>
                  <th className="px-3 py-2 font-medium">Purpose</th>
                  <th className="px-3 py-2 font-medium">Data processed</th>
                  <th className="px-3 py-2 font-medium">Retention</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-black/[0.06]">
                {SUBPROCESSORS.map((s) => (
                  <tr key={s.vendor} className="align-top">
                    <td className="px-3 py-3 font-medium">{s.vendor}</td>
                    <td className="px-3 py-3">{s.jurisdiction}</td>
                    <td className="px-3 py-3">{s.purpose}</td>
                    <td className="px-3 py-3">{s.dataProcessed}</td>
                    <td className="px-3 py-3">{s.retention}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Card list — shown on mobile */}
          <ul className="mt-4 space-y-4 md:hidden">
            {SUBPROCESSORS.map((s) => (
              <li
                key={s.vendor}
                className="rounded-lg border border-black/[0.08] p-4"
              >
                <p
                  className="font-semibold text-[15px]"
                  style={{ color: "var(--text-primary)" }}
                >
                  {s.vendor}
                </p>
                <dl className="mt-2 space-y-2 text-[14px]">
                  <Field label="Jurisdiction" value={s.jurisdiction} />
                  <Field label="Purpose" value={s.purpose} />
                  <Field label="Data processed" value={s.dataProcessed} />
                  <Field label="Retention" value={s.retention} />
                </dl>
              </li>
            ))}
          </ul>
        </section>

        <section id="residency" className="scroll-mt-24">
          <SectionHeading>Data residency</SectionHeading>
          <p className="text-[15px]">
            By default, Build In Social stores user-generated content (videos,
            audio, thumbnails, pSEO HTML) in{" "}
            {SUBPROCESSORS_META.defaultStorageRegion} Primary application data
            lives in NoCodeBackend; the contractually pinned region is still
            being confirmed and will be disclosed in the Privacy Policy as soon
            as it is finalized. Self-hosting and bring-your-own-key (BYOK)
            storage tiers are on the roadmap for EU buyers that require
            region-pinned processing; if this is a procurement requirement,
            email{" "}
            <a
              href={`mailto:${SUBPROCESSORS_META.contactEmail}`}
              className="transition-colors duration-150 hover:opacity-70"
              style={{ color: "var(--accent)" }}
            >
              {SUBPROCESSORS_META.contactEmail}
            </a>{" "}
            and we will share the current status.
          </p>
          <p className="text-[15px] mt-3">
            You can export all of your data (JSON plus media) at any time from{" "}
            <span className="font-medium">Settings &rarr; Profile &rarr; Download your data</span>{" "}
            and you can permanently delete your account from{" "}
            <span className="font-medium">Settings &rarr; Profile &rarr; Delete account</span>
            . Cascade deletion across our systems completes within 72 hours;
            sub-processor purge confirmation is received within 30 days.
          </p>
        </section>

        <section>
          <SectionHeading>Changes to this list</SectionHeading>
          <p className="text-[15px]">
            Build In Social notifies account holders by email at least 30 days
            before adding a new sub-processor or replacing an existing one in a
            way that materially changes how your data is processed. The "Last
            updated" date at the top of this page always reflects the current
            version.
          </p>
          <p className="text-[15px] mt-3">
            Questions or objections? Email{" "}
            <a
              href={`mailto:${SUBPROCESSORS_META.contactEmail}`}
              className="transition-colors duration-150 hover:opacity-70"
              style={{ color: "var(--accent)" }}
            >
              {SUBPROCESSORS_META.contactEmail}
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
              href="/dpa"
              className="transition-colors duration-150 hover:opacity-70"
              style={{ color: "var(--accent)" }}
            >
              Data Processing Addendum
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

function Field({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <dt className="text-[12px] uppercase tracking-wide text-[rgba(0,0,0,0.5)]">
        {label}
      </dt>
      <dd className="mt-0.5">{value}</dd>
    </div>
  );
}
