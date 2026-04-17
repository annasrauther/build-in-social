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
      className="relative w-full mt-24 sm:mt-36 overflow-hidden bg-[#141413]"
    >
      {/* Full-width dot grid */}
      <div
        className="pointer-events-none absolute inset-0 select-none opacity-60 bg-[radial-gradient(circle_at_center,theme(colors.brand.500/20)_1.5px,transparent_2px)] [background-size:28px_28px]"
        aria-hidden="true"
      />

      <div className="relative mx-auto max-w-4xl px-4 py-24 sm:px-6 lg:py-32">
        <div className="flex flex-col items-center justify-center text-center">
          <h3
            id="cta-title"
            className="inline-block bg-brand-gradient bg-clip-text p-2 text-4xl font-bold tracking-tighter text-transparent md:text-6xl dark:bg-brand-gradient-dark"
          >
            {LANDING.FINAL_CTA.headline}
          </h3>
          <p className="mx-auto mt-4 max-w-2xl text-gray-400 sm:text-lg">
            <Balancer>{LANDING.FINAL_CTA.subhead}</Balancer>
          </p>

          <div className="mt-14 w-full max-w-xl rounded-[16px] bg-white/5 p-1.5 ring-1 ring-white/[5%] backdrop-blur">
            <div className="rounded-xl bg-[#1C1B1A] p-4 shadow-lg shadow-brand-500/10 ring-1 ring-white/5">
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

          <p className="mt-4 text-xs text-gray-500 sm:text-sm">
            {LANDING.FINAL_CTA.reassurance}
          </p>
        </div>
      </div>
    </section>
  )
}
