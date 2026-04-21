"use client"

import Link from "next/link"
import { useRef } from "react"
import { motion, useScroll, useTransform } from "motion/react"
import { PlayCircle } from "lucide-react"
import { MiniPlanner } from "@/components/marketing/MiniPlanner"
import HeroImage from "./HeroImage"
import { LANDING } from "@/content/landing"
import { cn } from "@/lib/utils"

/**
 * Marketing hero — F1 entry.
 *
 * Layout:
 *  - Left column: eyebrow + headline + sub + MiniPlanner + reassurance
 *  - Right column: HeroImage with one pinned scroll moment (the only
 *    scroll choreography on the home page per the design rules).
 *
 * Headline uses Geist + iris `.text-gradient-brand` (no purple→pink).
 * Hairline-bordered MiniPlanner replaces the "Get Started" / "Watch
 * demo" button pair. Watch-demo remains as a quiet secondary link.
 */
export default function Hero() {
  const ref = useRef<HTMLDivElement | null>(null)
  const { scrollYProgress } = useScroll({
    target: ref,
    offset: ["start end", "end start"],
  })
  // One scroll moment: HeroImage rises slightly and fades in as it
  // enters the viewport. Capped amplitudes; zero effect beyond the hero.
  const y = useTransform(scrollYProgress, [0, 0.35, 1], [40, 0, -16])
  const opacity = useTransform(scrollYProgress, [0, 0.15, 0.9, 1], [0, 1, 1, 0.6])

  return (
    <section
      aria-labelledby="hero-title"
      className="relative mx-auto w-full max-w-6xl px-4 pt-24 sm:px-6 sm:pt-32 pb-12"
    >
      <div className="grid gap-10 tablet-sm:grid-cols-[minmax(0,1fr)_minmax(0,420px)] tablet-sm:items-start">
        {/* Left — headline + MiniPlanner */}
        <div className="flex flex-col gap-5">
          <p className="animate-slide-up-fade text-[12px] uppercase tracking-wider text-accent">
            Build In Social
          </p>
          <h1
            id="hero-title"
            className={cn(
              "animate-slide-up-fade",
              "text-[40px] sm:text-[52px] md:text-[60px]",
              "font-medium leading-[1.02] tracking-[-0.02em]",
              "text-text text-balance",
              "text-gradient-brand"
            )}
          >
            {LANDING.HERO.headline}
          </h1>
          <p className="animate-slide-up-fade max-w-xl text-[15px] leading-relaxed text-text-secondary">
            {LANDING.HERO.subhead}
          </p>
          {LANDING.HERO.subCallout ? (
            <p className="animate-slide-up-fade max-w-xl text-[13px] leading-snug text-text-secondary">
              {LANDING.HERO.subCallout}
            </p>
          ) : null}

          <div className="mt-2">
            <MiniPlanner />
          </div>

          <div className="flex items-center gap-3 mt-1">
            <Link
              href="#how-it-works"
              className={cn(
                "inline-flex items-center gap-1.5 h-8 text-[13px] font-medium",
                "text-text-secondary hover:text-text transition-colors duration-fast ease-out-cubic",
                "focus-visible:outline-2 focus-visible:outline-offset-2",
                "focus-visible:[outline-color:var(--focus-ring)] rounded-[4px]"
              )}
            >
              <PlayCircle size={14} strokeWidth={1.5} aria-hidden="true" />
              {LANDING.HERO.secondaryCta}
            </Link>
            <span className="text-[12px] text-text-tertiary">
              {LANDING.HERO.reassurance}
            </span>
          </div>
        </div>

        {/* Right — HeroImage with one scroll moment */}
        <motion.div
          ref={ref}
          style={{ y, opacity }}
          className="relative w-full"
        >
          <div className="bg-radial-glow absolute inset-0 -top-10 -z-10 h-[120%] w-full opacity-40" aria-hidden="true" />
          <HeroImage />
        </motion.div>
      </div>
    </section>
  )
}
