import { Button } from "@/components/tremor/Button"
import { ArrowAnimated } from "@/components/marketing/ArrowAnimated"
import Benefits from "@/components/marketing/Benefits"
import TeamGallery from "@/components/marketing/TeamGallery"
import { cx } from "@/lib/utils"
import Balancer from "react-wrap-balancer"
import Link from "next/link"

const ABOUT_READY = false

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
          className="mt-2 inline-block bg-brand-gradient bg-clip-text py-2 text-4xl font-bold tracking-tighter text-transparent sm:text-6xl md:text-6xl dark:bg-brand-gradient-dark font-serif"
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
          className="inline-block py-2 text-4xl font-bold tracking-tighter text-gray-900 dark:text-gray-50 md:text-5xl font-serif"
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
        </div>
      </section>

      {ABOUT_READY && (
        <section
          aria-labelledby="founders-title"
          className="mx-auto mt-32 w-full max-w-4xl"
        >
          <h2
            id="founders-title"
            className="inline-block bg-brand-gradient bg-clip-text py-2 text-3xl font-bold tracking-tighter text-transparent md:text-4xl dark:bg-brand-gradient-dark"
          >
            Who&apos;s behind Build In Social
          </h2>
          <p className="mt-4 max-w-prose text-gray-600 dark:text-gray-300">
            We&apos;re a small, named team. Enterprise buyers need to know who
            they&apos;re trusting; we agree.
          </p>

          <div className="mt-10 grid grid-cols-1 gap-6 md:grid-cols-2">
            {/* Founder 1 */}
            <div className="rounded-xl border border-gray-200 bg-white/60 p-6 shadow-sm dark:border-gray-800 dark:bg-gray-900/40">
              <div className="flex items-center gap-4">
                <div
                  aria-hidden="true"
                  className="h-14 w-14 rounded-full bg-brand-100 ring-1 ring-brand-200 dark:bg-brand-900/40 dark:ring-brand-800"
                />
                <div>
                  <p className="text-lg font-semibold text-gray-900 dark:text-gray-100">
                    [FOUNDER NAME]
                  </p>
                  <p className="text-sm text-gray-500 dark:text-gray-400">
                    [FOUNDER ROLE]
                  </p>
                </div>
              </div>
              <p className="mt-4 text-sm text-gray-600 dark:text-gray-300">
                [ONE-SENTENCE BIO]
              </p>
              <a
                href="[LINKEDIN URL]"
                className="mt-4 inline-block text-sm font-medium text-brand-600 hover:underline dark:text-brand-400"
              >
                LinkedIn &rarr;
              </a>
            </div>

            {/* Founder 2 */}
            <div className="rounded-xl border border-gray-200 bg-white/60 p-6 shadow-sm dark:border-gray-800 dark:bg-gray-900/40">
              <div className="flex items-center gap-4">
                <div
                  aria-hidden="true"
                  className="h-14 w-14 rounded-full bg-brand-100 ring-1 ring-brand-200 dark:bg-brand-900/40 dark:ring-brand-800"
                />
                <div>
                  <p className="text-lg font-semibold text-gray-900 dark:text-gray-100">
                    [FOUNDER NAME]
                  </p>
                  <p className="text-sm text-gray-500 dark:text-gray-400">
                    [FOUNDER ROLE]
                  </p>
                </div>
              </div>
              <p className="mt-4 text-sm text-gray-600 dark:text-gray-300">
                [ONE-SENTENCE BIO]
              </p>
              <a
                href="[LINKEDIN URL]"
                className="mt-4 inline-block text-sm font-medium text-brand-600 hover:underline dark:text-brand-400"
              >
                LinkedIn &rarr;
              </a>
            </div>
          </div>

          {/* Company registration — required by EU/UK buyers (Mike persona) */}
          <div className="mt-10 rounded-xl border border-gray-200 bg-gray-50/60 p-6 text-sm text-gray-600 dark:border-gray-800 dark:bg-gray-900/40 dark:text-gray-300">
            <p className="font-semibold text-gray-900 dark:text-gray-100">
              Company
            </p>
            <dl className="mt-3 grid grid-cols-1 gap-2 sm:grid-cols-2">
              <div>
                <dt className="text-xs uppercase tracking-wide text-gray-500 dark:text-gray-400">
                  Legal entity
                </dt>
                <dd>[LEGAL ENTITY NAME]</dd>
              </div>
              <div>
                <dt className="text-xs uppercase tracking-wide text-gray-500 dark:text-gray-400">
                  Country of incorporation
                </dt>
                <dd>[COUNTRY OF INCORPORATION]</dd>
              </div>
              <div>
                <dt className="text-xs uppercase tracking-wide text-gray-500 dark:text-gray-400">
                  Registration number
                </dt>
                <dd>[REGISTRATION NUMBER]</dd>
              </div>
              <div>
                <dt className="text-xs uppercase tracking-wide text-gray-500 dark:text-gray-400">
                  Contact
                </dt>
                <dd>
                  <a
                    href="mailto:hello@buildinsocial.com"
                    className="text-brand-600 hover:underline dark:text-brand-400"
                  >
                    hello@buildinsocial.com
                  </a>
                </dd>
              </div>
            </dl>
          </div>
        </section>
      )}

      <section className="mx-auto mt-32 w-full max-w-4xl">
        <p
          className={cx(
            "mt-12 w-fit rotate-3 font-serif italic text-3xl text-brand-500 dark:text-brand-400",
          )}
        >
          – The Build In Social team
        </p>

        <Button asChild className="group mt-16 h-12 w-full shadow-xl shadow-brand-500/20 text-lg">
          <Link href="/signup" className="flex items-center justify-center">
            Join the waitlist
            <ArrowAnimated />
          </Link>
        </Button>
      </section>
    </div>
  )
}
