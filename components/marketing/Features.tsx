import React from "react"
import { LANDING } from "@/content/landing"
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
        className="mt-2 inline-block bg-brand-gradient bg-clip-text py-2 text-4xl font-bold tracking-tighter text-transparent sm:text-6xl md:text-6xl dark:bg-brand-gradient-dark"
      >
        {LANDING.FEATURES.headline}
      </h2>
      <p className="mt-6 max-w-3xl text-lg leading-7 text-gray-600 dark:text-gray-300">
        Set your niche once. Build In Social creates video formatted for YouTube
        Shorts, Instagram Reels, LinkedIn, and X — then posts it on your
        schedule. Full autopilot, or review first. Your call.
      </p>
      <dl className="mt-12 grid grid-cols-1 gap-y-8 md:grid-cols-3 md:border-y md:border-gray-200 md:py-14 dark:border-gray-800">
        {stats.map((stat, index) => (
          <React.Fragment key={index}>
            <div className="border-l-2 border-brand-100 pl-6 md:border-l md:text-center lg:border-gray-200 lg:first:border-none dark:border-gray-800">
              <dd className="inline-block bg-brand-gradient bg-clip-text text-2xl font-bold tracking-tight text-transparent lg:text-xl dark:bg-brand-gradient-dark">
                {stat.name}
              </dd>
            </div>
          </React.Fragment>
        ))}
      </dl>
    </section>
  )
}
