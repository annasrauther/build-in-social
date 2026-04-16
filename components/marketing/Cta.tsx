"use client"
import Balancer from "react-wrap-balancer"
import { Button } from "@/components/tremor/Button"
import { Input } from "@/components/tremor/Input"
import { ArrowAnimated } from "@/components/marketing/ArrowAnimated"
import { LANDING } from "@/content/landing"

export default function Cta() {
  return (
    <section
      aria-labelledby="cta-title"
      className="mx-auto mb-20 mt-24 max-w-6xl p-1 px-2 sm:mt-36"
    >
      <div className="relative flex items-center justify-center">
        {/* Dot-grid pattern replacement for the 820-div mask */}
        <div
          className="mask pointer-events-none absolute inset-0 -z-10 select-none opacity-70 bg-[radial-gradient(circle_at_center,theme(colors.brand.500/15)_1.5px,transparent_2px)] [background-size:28px_28px]"
          aria-hidden="true"
        />
        <div className="max-w-4xl">
          <div className="flex flex-col items-center justify-center text-center">
            <div>
              <h3
                id="cta-title"
                className="inline-block bg-brand-gradient bg-clip-text p-2 text-4xl font-bold tracking-tighter text-transparent md:text-6xl dark:bg-brand-gradient-dark"
              >
                {LANDING.FINAL_CTA.headline}
              </h3>
              <p className="mx-auto mt-4 max-w-2xl text-gray-600 sm:text-lg dark:text-gray-300">
                <Balancer>
                  {LANDING.FINAL_CTA.subhead}
                </Balancer>
              </p>
            </div>
            <div className="mt-14 w-full rounded-[16px] bg-gray-300/5 p-1.5 ring-1 ring-black/[3%] backdrop-blur dark:bg-gray-900/10 dark:ring-white/[3%]">
              <div className="rounded-xl bg-white p-4 shadow-lg shadow-brand-500/10 ring-1 ring-black/5 dark:bg-gray-950 dark:shadow-brand-500/10 dark:ring-white/5">
                <form
                  className="flex flex-col items-center gap-3 sm:flex-row"
                  onSubmit={(e) => e.preventDefault()}
                >
                  <label htmlFor="email" className="sr-only">
                    Email address
                  </label>
                  <Input
                    name="email"
                    type="email"
                    autoComplete="email"
                    required
                    id="email"
                    className="h-10 w-full min-w-0 flex-auto"
                    inputClassName="h-full"
                    placeholder="Your email"
                  />
                  <Button
                    className="group h-10 w-full sm:w-fit sm:flex-none"
                    type="submit"
                    variant="primary"
                  >
                    {LANDING.FINAL_CTA.ctaLabel}
                    <ArrowAnimated />
                  </Button>
                </form>
              </div>
            </div>
            <p className="mt-4 text-xs text-gray-600 sm:text-sm dark:text-gray-300">
              {LANDING.FINAL_CTA.reassurance}
            </p>
          </div>
        </div>
      </div>
    </section>
  )
}
