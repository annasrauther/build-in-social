import React from "react"
import { LANDING } from "@/content/landing"
import Balancer from "react-wrap-balancer"
const stats = [
  {
    name: "Built for 4 platforms natively",
  },
  {
    name: "Every video gets a dedicated SEO page",
  },
  {
    name: "From signup to first batch in 3 minutes",
  },
]

export default function Features() {
  return (
    <section
      aria-labelledby="features-title"
      className="mx-auto mt-24 w-full max-w-6xl px-3"
    >
      <h2
        id="features-title"
        className="mt-2 py-2 text-4xl font-bold tracking-tighter text-gray-900 dark:text-gray-50 sm:text-6xl md:text-6xl font-serif"
      >
        {LANDING.FEATURES.headline}
      </h2>
      <p className="mt-6 max-w-2xl text-lg leading-7 text-gray-600 dark:text-gray-300">
        <Balancer>
          Set your niche once. Build In Social creates video formatted for YouTube
          Shorts, Instagram Reels, LinkedIn, and X — then posts it on your
          schedule. Full autopilot, or review first. Your call.
        </Balancer>
      </p>
      {LANDING.FEATURES.builtFor ? (
        <p className="mt-3 max-w-3xl text-sm text-gray-500 dark:text-gray-400">
          {LANDING.FEATURES.builtFor}
        </p>
      ) : null}
      <dl className="mt-12 grid grid-cols-1 gap-y-8 md:grid-cols-3 md:border-y md:border-gray-200 md:py-14 dark:border-[var(--border-default)]">
        {stats.map((stat, index) => (
          <React.Fragment key={index}>
            <div className="border-l-2 border-brand-100 pl-6 md:border-l md:text-center lg:border-gray-200 lg:first:border-none dark:border-[var(--border-default)]">
              <dt className="sr-only">Stat</dt>
              <dd className="text-2xl font-bold tracking-tight text-gray-900 dark:text-gray-50 lg:text-3xl">
                {stat.name}
              </dd>
            </div>
          </React.Fragment>
        ))}
      </dl>
    </section>
  )
}
