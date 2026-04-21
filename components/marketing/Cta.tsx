import Link from "next/link";
import Balancer from "react-wrap-balancer";
import { Button } from "@/components/tremor/Button";
import { ArrowAnimated } from "@/components/marketing/ArrowAnimated";
import { LANDING } from "@/content/landing";

/**
 * Final CTA — sends visitors straight into the onboarding preview flow. No
 * email capture: the product is live, so there's no waitlist to collect
 * for. The preview itself is free; activation is the conversion event.
 */
export default function Cta() {
  return (
    <section
      aria-labelledby="cta-title"
      className="relative w-full mt-24 sm:mt-36 overflow-hidden bg-anthropic-dark"
    >
      <div
        className="pointer-events-none absolute inset-0 select-none opacity-60 bg-[radial-gradient(circle_at_center,theme(colors.brand.500/20)_1.5px,transparent_2px)] [background-size:28px_28px]"
        aria-hidden="true"
      />

      <div className="relative mx-auto max-w-4xl px-4 py-16 sm:px-6 sm:py-24 lg:py-32">
        <div className="flex flex-col items-center justify-center text-center">
          <h2
            id="cta-title"
            className="inline-block bg-brand-gradient bg-clip-text p-2 text-4xl font-bold tracking-tighter text-transparent md:text-6xl dark:bg-brand-gradient-dark font-serif"
          >
            {LANDING.FINAL_CTA.headline}
          </h2>
          <p className="mx-auto mt-4 max-w-2xl text-gray-400 sm:text-lg">
            <Balancer>{LANDING.FINAL_CTA.subhead}</Balancer>
          </p>

          <div className="mt-10 flex flex-col items-center gap-4 sm:flex-row">
            <Link href="/onboarding">
              <Button
                variant="primary"
                className="group min-h-11 px-6 text-base"
              >
                {LANDING.FINAL_CTA.ctaLabel}
                <ArrowAnimated />
              </Button>
            </Link>
            <Link
              href="/pricing"
              className="text-sm text-gray-300 hover:text-white underline-offset-4 hover:underline"
            >
              See pricing
            </Link>
          </div>

          <p className="mt-4 text-xs text-gray-500 sm:text-sm">
            {LANDING.FINAL_CTA.reassurance}
          </p>
        </div>
      </div>
    </section>
  );
}
