import Balancer from "react-wrap-balancer"

export default function Testimonial() {
  return (
    <section id="testimonial" aria-label="Testimonial">
      <figure className="mx-auto">
        <blockquote className="mx-auto max-w-2xl px-4 sm:px-0 text-center text-lg leading-7 sm:text-xl sm:leading-8 font-semibold text-gray-900 md:text-2xl md:leading-9 dark:text-white">
          <p>
            <Balancer>
              &ldquo;I used to spend Sunday nights scripting, recording, and
              editing. Four hours minimum. Now I answer three questions on
              Monday morning, and by Tuesday I have 23 videos scheduled across
              YouTube, Reels, LinkedIn, and X. I genuinely forgot what Sunday stress
              felt like.&rdquo;
            </Balancer>
          </p>
        </blockquote>
        <figcaption className="mt-10 flex items-center justify-center gap-x-5">
          <div className="flex h-11 w-11 items-center justify-center rounded-full bg-brand-100 shadow-lg shadow-brand-500/50 ring-2 ring-white dark:bg-brand-900 dark:ring-gray-700">
            <span className="text-sm font-bold text-brand-500 dark:text-brand-400">PS</span>
          </div>
          <div>
            <p className="font-semibold text-gray-900 dark:text-gray-50">
              Priya Sharma
            </p>
            <p className="text-sm text-gray-600 dark:text-gray-400">
              Solo founder, Funnelkit &mdash; saves 4 hours every week
            </p>
          </div>
        </figcaption>
      </figure>
    </section>
  )
}
