"use client";

import { RiPlayCircleFill } from "@remixicon/react"
import Link from "next/link"
import { motion } from "framer-motion"
import { Button } from "@/components/tremor/Button"
import { ArrowAnimated } from "@/components/marketing/ArrowAnimated"
import HeroImage from "./HeroImage"
import { LANDING } from "@/content/landing"

export default function Hero() {
  return (
    <section
      aria-labelledby="hero-title"
      className="mt-32 flex flex-col items-center justify-center text-center sm:mt-40"
    >
      <h1
        id="hero-title"
        className="inline-block animate-slide-up-fade [animation-duration:700ms] bg-brand-gradient bg-clip-text p-2 text-4xl font-bold tracking-tighter text-transparent sm:text-6xl md:text-7xl dark:bg-brand-gradient-dark"
      >
        {LANDING.HERO.headline}
      </h1>
      <p
        className="mt-6 max-w-lg animate-slide-up-fade [animation-duration:900ms] text-lg text-gray-700 dark:text-gray-400"
      >
        {LANDING.HERO.subhead}
      </p>
      <p
        className="mt-4 inline-flex max-w-lg animate-slide-up-fade [animation-duration:1000ms] items-center rounded-full border border-brand-200 bg-brand-50 px-4 py-1.5 text-sm font-semibold text-brand-700 dark:border-brand-900/40 dark:bg-brand-950/30 dark:text-brand-300"
      >
        {LANDING.HERO.callout}
      </p>
      {LANDING.HERO.subCallout ? (
        <p
          className="mt-4 max-w-xl animate-slide-up-fade [animation-duration:1050ms] px-4 text-sm text-gray-600 dark:text-gray-400"
        >
          {LANDING.HERO.subCallout}
        </p>
      ) : null}
      <div
        className="mt-8 flex w-full animate-slide-up-fade [animation-duration:1100ms] flex-col justify-center gap-3 px-3 sm:flex-row"
      >
        <Button asChild className="group h-10 font-semibold mt-2">
          <Link href="/signup" className="flex items-center">
            {LANDING.HERO.primaryCta}
            <ArrowAnimated />
          </Link>
        </Button>
        <Button
          asChild
          variant="light"
          className="group mt-2 gap-x-2 bg-transparent font-semibold hover:bg-transparent dark:bg-transparent hover:dark:bg-transparent"
        >
          <Link
            href="#how-it-works"
            className="ring-1 ring-gray-200 sm:ring-0 dark:ring-gray-900"
          >
            <span className="mr-1 flex size-6 items-center justify-center rounded-full bg-gray-50 transition-all group-hover:bg-gray-200 dark:bg-gray-800 dark:group-hover:bg-gray-700">
              <RiPlayCircleFill
                aria-hidden="true"
                className="size-5 shrink-0 text-gray-900 dark:text-gray-50"
              />
            </span>
            {LANDING.HERO.secondaryCta}
          </Link>
        </Button>
      </div>
      <p className="mt-3 animate-slide-up-fade [animation-duration:1200ms] text-xs text-gray-500 dark:text-gray-500">
        {LANDING.HERO.reassurance}
      </p>
      <div
        className="relative mx-auto mt-20 h-fit w-full max-w-6xl animate-slide-up-fade [animation-duration:1400ms] sm:px-2"
      >
        {/* Radial Glow */}
        <div className="bg-radial-glow absolute inset-0 -top-20 -z-10 h-[150%] w-full opacity-50 dark:opacity-20" />

        {/* Demo video placeholder */}
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7, ease: [0.16, 1, 0.3, 1], delay: 0.2 }}
          className="mb-8 mx-auto w-full max-w-2xl"
        >
          <div className="relative w-full overflow-hidden rounded-2xl shadow-[0_8px_48px_rgba(217,119,87,0.15)] ring-1 ring-brand-200/40 dark:ring-brand-900/30"
            style={{ aspectRatio: "16/9" }}
          >
            {/* TODO: replace /demo-placeholder.mp4 with real product demo */}
            <video
              autoPlay
              muted
              loop
              playsInline
              src="/demo-placeholder.mp4"
              className="absolute inset-0 h-full w-full object-cover"
              aria-label="Build In Social product demo"
            />
            {/* Subtle gradient overlay for polish */}
            <div
              className="absolute inset-0 bg-gradient-to-t from-black/10 to-transparent pointer-events-none"
              aria-hidden="true"
            />
          </div>
        </motion.div>

        <HeroImage />
        <div
          className="absolute inset-x-0 -bottom-20 -mx-10 h-2/4 bg-gradient-to-t from-white via-white to-transparent lg:h-1/4 dark:from-gray-950 dark:via-gray-950"
          aria-hidden="true"
        />
      </div>
    </section>
  )
}
