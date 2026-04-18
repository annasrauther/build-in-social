import {
  RiSettings3Line,
  RiEyeLine,
  RiSendPlaneLine,
} from "@remixicon/react"
const steps = [
  {
    num: "1",
    title: "Describe what you build",
    description:
      "Your niche, your audience, your tone. Three minutes, once. Never again.",
    icon: RiSettings3Line,
  },
  {
    num: "2",
    title: "Review your batch, or let it fly",
    description:
      "Each week, Build In Social prepares up to 23 videos. Review them, or let autopilot post on schedule.",
    icon: RiEyeLine,
  },
  {
    num: "3",
    title: "Videos go live across four platforms",
    description:
      "YouTube Shorts, Reels, LinkedIn, X. Each one native. Each one building an SEO page behind it.",
    icon: RiSendPlaneLine,
  },
]

export default function CodeExample() {
  return (
    <section
      id="how-it-works"
      aria-labelledby="code-example-title"
      className="mx-auto mt-20 w-full max-w-6xl px-3"
    >
      <h2
        id="code-example-title"
        className="text-gradient-brand mt-2 py-2 text-4xl font-bold tracking-tighter sm:text-6xl md:text-6xl"
      >
        How it works
      </h2>
      <p className="mt-6 max-w-2xl text-lg text-gray-600 dark:text-gray-400">
        Three steps. Three minutes. Up to 23 videos — formatted for YouTube
        Shorts, Instagram Reels, LinkedIn, and X — scheduled for the week.
      </p>
      <dl className="mt-10 grid grid-cols-1 gap-8 sm:gap-10 sm:grid-cols-3">
        {steps.map((item) => (
          <div
            key={item.num}
          >
            <div className="w-fit rounded-lg p-2 shadow-md shadow-brand-400/30 ring-1 ring-black/5 dark:shadow-brand-500/30 dark:ring-white/5">
              <item.icon
                aria-hidden="true"
                className="size-6 text-brand-500 dark:text-brand-400"
              />
            </div>
            <dt className="mt-6 font-semibold text-gray-900 dark:text-gray-50">
              <span className="inline-block bg-gradient-to-t from-brand-900 to-brand-500 bg-clip-text text-lg font-bold text-transparent dark:from-brand-700 dark:to-brand-400">
                {item.num}.
              </span>{" "}
              {item.title}
            </dt>
            <dd className="mt-2 leading-7 text-gray-600 dark:text-gray-400">
              {item.description}
            </dd>
          </div>
        ))}
      </dl>
    </section>
  )
}
