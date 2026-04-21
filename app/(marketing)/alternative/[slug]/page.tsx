import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { Button } from "@/components/tremor/Button";
import { ArrowAnimated } from "@/components/marketing/ArrowAnimated";
import { ALTERNATIVES, getAlternative } from "@/content/alternatives";

export function generateStaticParams() {
  return Object.keys(ALTERNATIVES).map((slug) => ({ slug }));
}

interface PageProps {
  params: Promise<{ slug: string }>;
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { slug } = await params;
  const page = getAlternative(slug);
  if (!page) {
    return { title: "Not found" };
  }
  return {
    title: `${page.headline} — Build In Social`,
    description: page.subhead.slice(0, 160),
    openGraph: {
      title: page.headline,
      description: page.subhead.slice(0, 160),
      url: `https://buildinsocial.com/alternative/${page.slug}`,
      type: "article",
    },
    alternates: {
      canonical: `https://buildinsocial.com/alternative/${page.slug}`,
    },
  };
}

export default async function AlternativePage({ params }: PageProps) {
  const { slug } = await params;
  const page = getAlternative(slug);
  if (!page) notFound();

  return (
    <main className="mx-auto w-full max-w-4xl px-4 sm:px-6 py-12 sm:py-20">
      <header>
        <p className="text-xs uppercase tracking-wider text-[color:var(--accent)]">
          Alternative comparison
        </p>
        <h1 className="mt-2 font-serif text-3xl sm:text-4xl font-medium text-gray-900 dark:text-gray-50">
          {page.headline}
        </h1>
        <p className="mt-3 text-base text-gray-600 dark:text-gray-400 max-w-3xl">
          {page.subhead}
        </p>
      </header>

      <section className="mt-8 rounded-lg border border-[color:var(--border-default)] bg-[color:var(--bg-surface)] p-5">
        <h2 className="text-sm font-medium text-gray-900 dark:text-gray-50">
          Which one should you pick?
        </h2>
        <p className="mt-2 text-sm leading-6 text-gray-600 dark:text-gray-400">
          {page.summary}
        </p>
      </section>

      <section className="mt-10">
        <h2 className="font-serif text-2xl font-medium text-gray-900 dark:text-gray-50">
          Head-to-head
        </h2>
        <div className="mt-4 overflow-x-auto rounded-lg border border-[color:var(--border-default)]">
          <table className="w-full text-sm">
            <thead className="bg-gray-50 dark:bg-gray-900/40">
              <tr className="text-left">
                <th className="px-4 py-3 font-medium text-gray-700 dark:text-gray-300">
                  Feature
                </th>
                <th className="px-4 py-3 font-medium text-gray-700 dark:text-gray-300">
                  {page.competitorName}
                </th>
                <th className="px-4 py-3 font-medium text-gray-700 dark:text-gray-300">
                  Build In Social
                </th>
              </tr>
            </thead>
            <tbody>
              {page.table.map((row) => (
                <tr
                  key={row.feature}
                  className="border-t border-[color:var(--border-default)] align-top"
                >
                  <td className="px-4 py-3 font-medium text-gray-900 dark:text-gray-50">
                    {row.feature}
                  </td>
                  <td
                    className={
                      "px-4 py-3 text-gray-700 dark:text-gray-300 " +
                      (row.winsFor === "competitor"
                        ? "bg-brand-50/40 dark:bg-brand-950/20"
                        : "")
                    }
                  >
                    {row.competitor}
                  </td>
                  <td
                    className={
                      "px-4 py-3 text-gray-700 dark:text-gray-300 " +
                      (row.winsFor === "build-in-social"
                        ? "bg-brand-50/40 dark:bg-brand-950/20"
                        : "")
                    }
                  >
                    {row.buildInSocial}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <p className="mt-3 text-xs text-gray-500">
          Shaded cell = advantage. Un-shaded = tie or not decisive.
        </p>
      </section>

      <section className="mt-12 rounded-lg border border-brand-500/50 bg-brand-50/50 p-6 dark:bg-brand-950/20 flex flex-col items-start gap-3">
        <h2 className="text-lg font-medium text-gray-900 dark:text-gray-50">
          Try Build In Social
        </h2>
        <p className="text-sm text-gray-700 dark:text-gray-300 max-w-2xl">
          Drop your niche. See a free week of platform-native content in under
          2 minutes. No card required to preview — pay only when you ship.
        </p>
        <Link href="/onboarding">
          <Button variant="primary" className="group">
            {page.ctaLabel}
            <ArrowAnimated />
          </Button>
        </Link>
      </section>

      {page.competitorUrl && (
        <p className="mt-8 text-xs text-gray-500">
          External reference:{" "}
          <a
            href={page.competitorUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="underline"
          >
            {page.competitorName}
          </a>
          . Feature facts reflect what was publicly documented as of this
          page&apos;s publish date.
        </p>
      )}
    </main>
  );
}
