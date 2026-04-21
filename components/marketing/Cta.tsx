import Link from "next/link";
import Balancer from "react-wrap-balancer";
import { Button } from "@/components/ui/shadcn/button";
import { ArrowRight } from "lucide-react";
import { LANDING } from "@/content/landing";

/**
 * Final CTA — hairline-edged panel on elevated surface. No shadows,
 * no gradients, iris-tinted dot texture echoing the Hero. Sends
 * visitors into onboarding.
 */
export default function Cta() {
  return (
    <section
      aria-labelledby="cta-title"
      className="relative w-full mt-24 sm:mt-36"
    >
      <div className="mx-auto max-w-5xl px-4 sm:px-6">
        <div
          className="relative overflow-hidden rounded-[var(--radius-modal)] border border-[color:var(--border)] bg-surface"
        >
          {/* Subtle iris dot field — low opacity, no gradient. */}
          <div
            className="pointer-events-none absolute inset-0 select-none opacity-40 bg-[radial-gradient(circle_at_center,color-mix(in_srgb,var(--accent)_25%,transparent)_1px,transparent_1.5px)] [background-size:24px_24px]"
            aria-hidden="true"
          />

          <div className="relative px-6 py-14 sm:px-10 sm:py-20 flex flex-col items-center text-center">
            <h2
              id="cta-title"
              className="text-[32px] sm:text-[44px] leading-[1.05] tracking-[-0.02em] font-medium text-text text-gradient-brand"
            >
              <Balancer>{LANDING.FINAL_CTA.headline}</Balancer>
            </h2>
            <p className="mx-auto mt-4 max-w-2xl text-[15px] leading-relaxed text-text-secondary">
              <Balancer>{LANDING.FINAL_CTA.subhead}</Balancer>
            </p>

            <div className="mt-8 flex flex-col items-center gap-3 sm:flex-row">
              <Button asChild variant="primary" size="lg">
                <Link href="/onboarding">
                  {LANDING.FINAL_CTA.ctaLabel}
                  <ArrowRight size={14} strokeWidth={1.5} aria-hidden="true" />
                </Link>
              </Button>
              <Link
                href="/pricing"
                prefetch
                className="text-[13px] text-text-secondary hover:text-text transition-colors duration-fast ease-out-cubic underline-offset-4 hover:underline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:[outline-color:var(--focus-ring)] rounded-[4px] px-1"
              >
                See pricing
              </Link>
            </div>

            <p className="mt-4 text-[12px] text-text-tertiary">
              {LANDING.FINAL_CTA.reassurance}
            </p>
          </div>
        </div>
      </div>
    </section>
  );
}
