"use client";

import { motion } from "motion/react";
import { LANDING } from "@/content/landing";
import { useSafeMotion } from "@/lib/hooks/useSafeMotion";

/**
 * Pull-quote row that surfaces the core partner positioning line.
 * Placed just above the Cta section — highest-converting position after
 * the Features section has established value.
 */
export default function PartnerCallout() {
  const { transition } = useSafeMotion();
  return (
    <section
      aria-label="Value proposition"
      className="mx-auto mt-24 w-full max-w-3xl px-8 sm:mt-32"
    >
      <h2 className="sr-only">Why Build In Social</h2>
      <motion.blockquote
        variants={{
          hidden: { opacity: 0, y: 20 },
          visible: {
            opacity: 1,
            y: 0,
            transition: transition({ duration: 0.5, ease: [0.16, 1, 0.3, 1] }),
          },
        }}
        initial="hidden"
        whileInView="visible"
        viewport={{ once: true, margin: "-80px" }}
        className="relative rounded-2xl border border-brand-100 bg-brand-50 py-16 px-8 text-center dark:border-brand-900/40 dark:bg-brand-950/20"
      >
        {/* Radial brand glow */}
        <div
          aria-hidden="true"
          className="pointer-events-none absolute inset-0 rounded-2xl bg-[radial-gradient(ellipse_at_center,theme(colors.brand.500/8)_0%,transparent_70%)]"
        />
        {/* Brand accent bar */}
        <div
          aria-hidden="true"
          className="mx-auto mb-8 h-1 w-12 rounded-full bg-brand-500"
        />
        <p className="relative font-serif text-2xl font-semibold tracking-tight text-gray-900 dark:text-gray-50">
          {LANDING.PARTNER_CALLOUT.quote}
        </p>
        {/* Em-dash attribution line */}
        <p
          aria-hidden="true"
          className="relative mt-6 font-sans text-sm text-brand-500"
        >
          &#8212; Build In Social
        </p>
      </motion.blockquote>
    </section>
  );
}
