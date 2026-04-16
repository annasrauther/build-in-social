const benefits = [
  {
    title: "Post consistently without lifting a finger",
    description:
      "Set your niche once. Build In Social prepares and posts a full week of video automatically — whether or not you shipped something this week.",
  },
  {
    title: "Reach every audience where they scroll",
    description:
      "YouTube Shorts, Instagram Reels, LinkedIn, and X. Each video matches that platform's algorithm — right duration, hook structure, and posting window.",
  },
  {
    title: "Build 300+ SEO pages per quarter",
    description:
      "Every video builds a Google-indexed landing page. Your long-tail search presence compounds while you focus on your product.",
  },
  {
    title: "Sound like yourself, not a template",
    description:
      "Three-minute setup. Build In Social learns what you build, who it's for, and how you talk about it. Clone your voice on Creator and Studio plans.",
  },
  {
    title: "Spend zero hours a week on social",
    description:
      "Share something specific when you want. Or do nothing — full autopilot runs without you touching it.",
  },
  {
    title: "Never go silent on your channels",
    description:
      "Autopilot draws from your niche, trending topics, and evergreen angles. Your channels stay active even when you are heads-down building.",
  },
  {
    title: "Share a win and let us handle the rest",
    description:
      "Shipped a feature? Learned something? Tell Build In Social in one prompt. It prepares platform-ready video from your input.",
  },
  {
    title: "See what resonates with your audience",
    description:
      "Videos post on your schedule. Performance data flows back so you know which topics and hooks land.",
  },
]

export default function Benefits() {
  return (
    <section aria-labelledby="benefits-title" className="mx-auto mt-44">
      <h2
        id="benefits-title"
        className="inline-block bg-gradient-to-t from-gray-900 to-gray-800 bg-clip-text py-2 text-4xl font-bold tracking-tighter text-transparent md:text-5xl dark:from-gray-50 dark:to-gray-300"
      >
        Why Build In Social
      </h2>
      <dl className="mt-8 grid grid-cols-4 gap-x-10 gap-y-8 sm:mt-12 sm:gap-y-10">
        {benefits.map((benefit, index) => (
          <div key={index} className="col-span-4 sm:col-span-2 lg:col-span-1">
            <dt className="font-semibold text-gray-900 dark:text-gray-50">
              {benefit.title}
            </dt>
            <dd className="mt-2 leading-7 text-gray-600 dark:text-gray-400">
              {benefit.description}
            </dd>
          </div>
        ))}
      </dl>
    </section>
  )
}
