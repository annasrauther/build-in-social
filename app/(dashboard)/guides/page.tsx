import type { Metadata } from "next";
import { RiPlayCircleFill } from "@remixicon/react";

export const metadata: Metadata = {
  title: "Guides · Build In Social",
  description: "Short videos that teach the workflow end-to-end.",
};

interface Guide {
  slug: string;
  title: string;
  blurb: string;
  youtubeId: string;
  duration: string;
}

/**
 * Placeholder YouTube IDs point at publicly-embeddable videos — swap in our
 * own tutorial recordings as they ship. The structure mirrors autoshorts'
 * `/dashboard/tutorials` page: a tight grid of topic-specific explainers that
 * doubles as in-app support deflection and long-tail SEO.
 */
const GUIDES: Guide[] = [
  {
    slug: "what-is-build-in-social",
    title: "What is Build In Social?",
    blurb: "A 90-second walk-through of the weekly rhythm.",
    youtubeId: "dQw4w9WgXcQ",
    duration: "1:32",
  },
  {
    slug: "domain-walkthrough",
    title: "Domain + niche walkthrough",
    blurb: "How we use your niche + quality gate to ship scripts that perform.",
    youtubeId: "dQw4w9WgXcQ",
    duration: "2:47",
  },
  {
    slug: "manual-vs-autopilot",
    title: "Manual vs Autopilot mode",
    blurb: "When to write your own brief and when to let us run the week.",
    youtubeId: "dQw4w9WgXcQ",
    duration: "3:12",
  },
  {
    slug: "create-your-twin",
    title: "Create your digital twin",
    blurb: "Record a 2–5 minute clip; every future video narrates as you.",
    youtubeId: "dQw4w9WgXcQ",
    duration: "2:05",
  },
  {
    slug: "connecting-platforms",
    title: "Connecting your platforms",
    blurb: "OAuth flows for YouTube, Instagram, LinkedIn, and X.",
    youtubeId: "dQw4w9WgXcQ",
    duration: "2:58",
  },
];

export default function GuidesPage() {
  return (
    <div className="p-4 sm:px-6 sm:pb-10 sm:pt-10 lg:px-10 lg:pt-7">
      <header>
        <h1 className="font-serif text-2xl font-bold text-gray-900 dark:text-gray-50 sm:text-3xl">
          Guides
        </h1>
        <p className="mt-2 max-w-2xl text-sm text-gray-600 dark:text-gray-400">
          Short videos that teach the workflow end-to-end. Watch in any order —
          every concept is self-contained.
        </p>
      </header>

      <div className="mt-8 grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
        {GUIDES.map((g) => (
          <article
            key={g.slug}
            className="group flex flex-col overflow-hidden rounded-xl border border-gray-200 bg-white transition-shadow hover:shadow-md dark:border-gray-800 dark:bg-gray-900/40"
          >
            <div className="relative aspect-video bg-gray-100 dark:bg-gray-900">
              <iframe
                title={g.title}
                src={`https://www.youtube-nocookie.com/embed/${g.youtubeId}?modestbranding=1&rel=0`}
                className="absolute inset-0 h-full w-full"
                loading="lazy"
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
                allowFullScreen
              />
            </div>
            <div className="flex flex-1 flex-col gap-1.5 p-4">
              <div className="flex items-center gap-2 text-[11px] uppercase tracking-wide text-gray-500 dark:text-gray-400">
                <RiPlayCircleFill className="size-3.5 text-brand-500" />
                {g.duration}
              </div>
              <h3 className="font-semibold text-gray-900 dark:text-gray-50">
                {g.title}
              </h3>
              <p className="text-sm text-gray-600 dark:text-gray-400">
                {g.blurb}
              </p>
            </div>
          </article>
        ))}
      </div>
    </div>
  );
}
