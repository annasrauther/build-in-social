import Link from "next/link";
import type { Metadata } from "next";

/**
 * /tools — free toolkit hub. Each tool is no-signup-required and designed to
 * incur near-zero upstream API cost. Conversion funnel: the "Save / export"
 * button on each tool sends visitors to /signup with their tool state held
 * in localStorage so it survives the round-trip.
 */

export const metadata: Metadata = {
  title: "Free tools for builders and sellers — Build In Social",
  description:
    "Platform-native hook generator, content-plan preview, X thread splitter. No signup, no card. For developers, creators, and founders who need distribution.",
  alternates: { canonical: "https://buildinsocial.com/tools" },
};

const TOOLS = [
  {
    href: "/tools/hook-generator",
    title: "Platform-native hook generator",
    body:
      "Paste a topic. Get one hook tuned to YouTube Shorts, Instagram Reels, LinkedIn, and X \u2014 each in the native voice of its platform.",
    badge: "Powered by Claude Haiku",
  },
  {
    href: "/tools/content-plan-preview",
    title: "Free content plan preview",
    body:
      "Drop your niche. See a week of platform-native titles + hooks for four platforms. The same preview your paid plan would ship \u2014 read-only.",
    badge: "No signup",
  },
  {
    href: "/tools/thread-splitter",
    title: "X thread splitter",
    body:
      "Paste a long script. Get it split into a numbered X thread under the 280-char limit, with a hook first and a CTA last. Zero API calls.",
    badge: "Runs in your browser",
  },
];

export default function ToolsHub() {
  return (
    <main className="mx-auto w-full max-w-5xl px-4 sm:px-6 py-12 sm:py-20">
      <header>
        <p className="text-xs uppercase tracking-wider text-[color:var(--accent)]">
          Free tools
        </p>
        <h1 className="mt-2 font-serif text-3xl sm:text-4xl font-medium text-gray-900 dark:text-gray-50">
          Distribution tools for builders and sellers.
        </h1>
        <p className="mt-3 max-w-2xl text-base text-gray-600 dark:text-gray-400">
          No signup, no card. Use them as much as you want. When you&apos;re
          ready to run content on autopilot every week, we&apos;re here.
        </p>
      </header>

      <ul className="mt-10 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {TOOLS.map((t) => (
          <li key={t.href}>
            <Link
              href={t.href}
              className="block h-full rounded-lg border border-[color:var(--border-default)] bg-[color:var(--bg-surface)] p-5 transition hover:border-brand-500"
            >
              <p className="text-xs text-[color:var(--accent)]">{t.badge}</p>
              <h2 className="mt-2 text-base font-medium text-gray-900 dark:text-gray-50">
                {t.title}
              </h2>
              <p className="mt-2 text-sm leading-6 text-gray-600 dark:text-gray-400">
                {t.body}
              </p>
              <p className="mt-4 text-sm font-medium text-[color:var(--accent)]">
                Open tool &rarr;
              </p>
            </Link>
          </li>
        ))}
      </ul>

      <section className="mt-16 rounded-lg border border-brand-500/50 bg-brand-50/50 p-5 dark:bg-brand-950/20">
        <h2 className="text-lg font-medium text-gray-900 dark:text-gray-50">
          Ready to run this every week?
        </h2>
        <p className="mt-2 text-sm text-gray-700 dark:text-gray-300">
          The tools give you one-off output. Build In Social ships platform-
          native videos to four surfaces + an indexable article per video,
          every week, on autopilot.
        </p>
        <Link
          href="/onboarding"
          className="mt-3 inline-block text-sm font-medium text-[color:var(--accent)] underline-offset-4 hover:underline"
        >
          Preview your content free &rarr;
        </Link>
      </section>
    </main>
  );
}
