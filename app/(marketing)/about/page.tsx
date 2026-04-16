import { Button } from "@/components/tremor/Button"
import { ArrowAnimated } from "@/components/marketing/ArrowAnimated"
import Benefits from "@/components/marketing/Benefits"
import TeamGallery from "@/components/marketing/TeamGallery"
import { cx } from "@/lib/utils"
import Balancer from "react-wrap-balancer"
import Link from "next/link"

export default function About() {
  return (
    <div className="mt-36 flex flex-col overflow-hidden px-3">
      <section
        aria-labelledby="about-overview"
        className="animate-slide-up-fade"
        style={{
          animationDuration: "600ms",
          animationFillMode: "backwards",
        }}
      >
        <h1
          id="about-overview"
          className="mt-2 inline-block bg-brand-gradient bg-clip-text py-2 text-4xl font-bold tracking-tighter text-transparent sm:text-6xl md:text-6xl dark:bg-brand-gradient-dark"
        >
          <Balancer>
            You build the product. We run your social channels.
          </Balancer>
        </h1>
        <p className="mt-6 max-w-2xl text-lg text-gray-700 dark:text-gray-400">
          Indie developers and SaaS founders ship constantly. But posting about
          it? That falls off the list every single week. Build In Social is the
          distribution partner that keeps your social channels active — so you
          never go silent while you are heads-down building.
        </p>
      </section>
      <TeamGallery />
      <Benefits />
      <section aria-labelledby="vision-title" className="mx-auto mt-40">
        <h2
          id="vision-title"
          className="inline-block bg-brand-gradient bg-clip-text py-2 text-4xl font-bold tracking-tighter text-transparent md:text-5xl dark:bg-brand-gradient-dark"
        >
          Why we built this
        </h2>
        <div className="mt-6 max-w-prose space-y-4 text-gray-600 dark:text-gray-200">
          <p className="text-lg leading-8">
            We watched founders spend Sunday nights scripting, recording, and
            editing videos for four different platforms. Four hours minimum. Then
            they&apos;d miss a week, lose momentum, and start over. The ones
            with the most interesting things to say were the ones going silent.
          </p>
          <p className="text-lg leading-8">
            Build In Social started with a simple question: what if your social
            presence ran without you? Set your niche once. Answer three
            questions when you have something to share. Or don&apos;t — Build In
            Social keeps posting either way. Every video is native to its
            platform. Every video builds a Google-indexed SEO page. Your
            distribution compounds while you write code.
          </p>
          <p className="text-lg leading-8">
            A social media manager costs $2,000 to $5,000 a month. Build In
            Social starts at $39. We are not building another content tool. We
            are building the distribution partner that every indie founder needs
            but nobody can justify hiring.
          </p>
          <p
            className={cx(
              "w-fit rotate-3 font-serif italic text-3xl text-brand-500 dark:text-brand-400",
            )}
          >
            – The Build In Social team
          </p>
        </div>
        <Button asChild className="group mt-32 h-12 w-full shadow-xl shadow-brand-500/20 text-lg">
          <Link href="/signup" className="flex items-center justify-center">
            Start free trial
            <ArrowAnimated />
          </Link>
        </Button>
      </section>
    </div>
  )
}
