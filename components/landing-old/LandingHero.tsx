"use client";

import { useState, useEffect, useCallback } from "react";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";
import { LANDING } from "@/content/landing";

const ease = [0.16, 1, 0.3, 1] as const;

/**
 * Hero — Medium membership exact match.
 * Left ~65%: light colored bg, headline, CTAs.
 * Right ~35%: top = illustration on dark gradient, bottom = solid lighter color
 * with readable dark text (badge, headline, subtitle).
 */

interface HeroSlide {
  bg: string;
  badge: string;
  headline: string;
  subtitle: string;
  image: string;
  stat: string;
  statLabel: string;
}

const slides: HeroSlide[] = [
  {
    bg: "rgb(225, 233, 248)",
    badge: "23 videos \u00B7 1 week",
    headline: "Posted everywhere. You wrote nothing.",
    subtitle: "Indie dev, 2 products, zero social team",
    image: "/hero-growth.png",
    stat: "23",
    statLabel: "videos per week across 4 platforms",
  },
  {
    bg: "rgb(248, 210, 228)",
    badge: "Platform-native \u00B7 Auto-formatted",
    headline: "One idea. Four platforms. Done by Monday.",
    subtitle: "Your message, their format \u2014 not a copy-paste",
    image: "/hero-platforms.png",
    stat: "4",
    statLabel: "platforms \u2014 YouTube, Instagram, LinkedIn, X",
  },
  {
    bg: "rgb(255, 240, 215)",
    badge: "Consistent \u00B7 52 weeks",
    headline: "Consistency is what compounds.",
    subtitle: "The algorithm rewards people who show up",
    image: "/hero-consistency.png",
    stat: "10+",
    statLabel: "hours saved every week on content",
  },
  {
    bg: "rgb(210, 245, 225)",
    badge: "Real signal \u00B7 No fluff metrics",
    headline: "You\u2019ll know what\u2019s actually working.",
    subtitle: "Per-post stats across every platform, in one place",
    image: "/hero-signals.png",
    stat: "1",
    statLabel: "SEO page auto-generated per video",
  },
  {
    bg: "rgb(235, 222, 255)",
    badge: "Set & forget \u00B7 Save 10+ hours",
    headline: "Get your weekend back.",
    subtitle: "The engine runs in the background. You just live.",
    image: "/hero-automation.png",
    stat: "0",
    statLabel: "filming, scripting, or editing required",
  },
  {
    bg: "rgb(255, 245, 210)",
    badge: "True fans \u00B7 Build context",
    headline: "Turn impressions into audience.",
    subtitle: "Stop renting reach. Start building a community you own.",
    image: "/hero-growth.png",
    stat: "14",
    statLabel: "day free trial \u2014 no credit card needed",
  },
  {
    bg: "rgb(208, 248, 242)",
    badge: "ROI \u00B7 Real impact",
    headline: "Views without business are just vanity.",
    subtitle: "Drive actual pipeline and revenue from your personal brand.",
    image: "/hero-signals.png",
    stat: "$39",
    statLabel: "per month \u2014 less than one freelance post",
  },
];

const INTERVAL = 7000;

export function LandingHero() {
  const [index, setIndex] = useState(0);

  const next = useCallback(() => {
    setIndex((prev) => (prev + 1) % slides.length);
  }, []);

  useEffect(() => {
    const id = setInterval(next, INTERVAL);
    return () => clearInterval(id);
  }, [next]);

  const slide = slides[index];

  return (
    <section className="lp-hero">
      {/* Left side — light colored bg with headline */}
      <motion.div
        className="lp-hero-left"
        animate={{ backgroundColor: slide.bg }}
        transition={{ duration: 0.8, ease: "easeInOut" }}
      >
        <motion.h1
          initial={{ opacity: 0, y: 24 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7, ease }}
          style={{
            fontFamily: "var(--lp-serif)",
            fontSize: "clamp(28px, 8vw, 85px)",
            fontWeight: 400,
            letterSpacing: "-0.055em",
            lineHeight: 1.035,
            color: "rgb(0, 0, 0)",
            maxWidth: 600,
            marginTop: 32,
          }}
        >
          {LANDING.HERO.headline}
        </motion.h1>

        <div>
          <motion.p
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, ease, delay: 0.1 }}
            style={{
              fontFamily: "var(--lp-sans)",
              fontSize: "clamp(16px, 2.5vw, 20px)",
              fontWeight: 400,
              lineHeight: "28px",
              color: "var(--lp-text-secondary)",
              maxWidth: 520,
              marginBottom: 32,
            }}
          >
            {LANDING.HERO.subhead}
          </motion.p>

          <motion.div
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, ease, delay: 0.2 }}
            className="flex flex-col tablet-sm:flex-row tablet-sm:items-center gap-3"
          >
            <Link href="/onboarding/hook" className="lp-btn-primary">
              {LANDING.HERO.primaryCta}
            </Link>
            <Link href="#pricing" className="lp-btn-ghost">
              View plans
            </Link>
          </motion.div>
        </div>
      </motion.div>

      {/* Right side — Unified Vertical Column */}
      <div className="lp-hero-right">
        <AnimatePresence initial={false}>
          <motion.div
            key={index}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.5, ease: "easeInOut" }}
            style={{
              position: "absolute",
              inset: 0,
              display: "flex",
              flexDirection: "column",
              backgroundColor: slide.bg,
              backgroundImage: `
                radial-gradient(at 100% 0%, rgba(0, 0, 0, 0.08) 0px, transparent 70%),
                radial-gradient(at 0% 100%, rgba(0, 0, 0, 0.05) 0px, transparent 70%),
                radial-gradient(at 0% 0%, rgba(255, 255, 255, 0.4) 0px, transparent 50%),
                repeating-linear-gradient(0deg, rgba(0,0,0,0.03) 0px, rgba(0,0,0,0.03) 1px, transparent 1px, transparent 32px),
                repeating-linear-gradient(90deg, rgba(0,0,0,0.03) 0px, rgba(0,0,0,0.03) 1px, transparent 1px, transparent 32px)
              `,
            }}
          >
            {/* Top Illustration Area */}
            <div
              style={{
                flex: "1 1 auto",
                position: "relative",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                padding: "40px 32px 0", // More generous horizontal padding
                minHeight: 0, // Prevents flex children from overflowing bounds
              }}
            >
              <div
                style={{
                  width: "100%",
                  height: "100%",
                  position: "relative",
                  // Removed the aggressive mask that was cutting off the image
                }}
              >
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={slide.image}
                  alt={slide.headline}
                  style={{
                    width: "100%",
                    height: "100%",
                    objectFit: "contain",
                    mixBlendMode: "darken",
                    filter: "grayscale(100%) contrast(1.2) brightness(1.05)",
                  }}
                />
              </div>
            </div>

            {/* Bottom Content Area */}
            <div
              style={{
                flexShrink: 0, // Ensures this area never gets compressed or pushed out
                padding: "28px 28px 40px",
                display: "flex",
                flexDirection: "column",
              }}
            >
              <div style={{ marginBottom: 32 }}>
                {/* Badge */}
                <span
                  style={{
                    display: "inline-flex",
                    alignItems: "center",
                    alignSelf: "flex-start",
                    gap: 6,
                    fontSize: 12,
                    fontWeight: 500,
                    fontFamily: "var(--lp-sans)",
                    padding: "5px 12px",
                    borderRadius: 1584,
                    background: "rgb(252, 196, 25)",
                    color: "rgb(0, 0, 0)",
                    marginBottom: 16,
                    letterSpacing: "0.02em",
                    textTransform: "uppercase",
                  }}
                >
                  <span style={{ fontSize: 10 }}>&#10022;</span>
                  {slide.badge}
                </span>

                {/* Headline — Bold Serif */}
                <h2
                  style={{
                    fontFamily: "var(--lp-serif)",
                    fontSize: "clamp(24px, 2.5vw, 36px)",
                    fontWeight: 400,
                    lineHeight: 1.1,
                    letterSpacing: "-0.03em",
                    color: "rgb(0, 0, 0)",
                    marginBottom: 12,
                  }}
                >
                  {slide.headline}
                </h2>

                {/* Subtitle */}
                <p
                  style={{
                    fontFamily: "var(--lp-sans)",
                    fontSize: 15,
                    color: "rgba(0, 0, 0, 0.6)",
                    lineHeight: 1.5,
                  }}
                >
                  {slide.subtitle}
                </p>
              </div>

              {/* Conversion stat */}
              <div className="flex items-baseline gap-3">
                <span
                  style={{
                    fontFamily: "var(--lp-serif)",
                    fontSize: "clamp(36px, 3vw, 48px)",
                    fontWeight: 400,
                    letterSpacing: "-0.03em",
                    lineHeight: 1,
                    color: "rgb(0, 0, 0)",
                  }}
                >
                  {slide.stat}
                </span>
                <span
                  style={{
                    fontFamily: "var(--lp-sans)",
                    fontSize: 14,
                    color: "rgba(0, 0, 0, 0.55)",
                    lineHeight: 1.4,
                    maxWidth: 200,
                  }}
                >
                  {slide.statLabel}
                </span>
              </div>

              {/* Progress Bar (dots) */}
              <div className="flex items-center gap-2" style={{ marginTop: 24 }}>
                {slides.map((_, i) => (
                  <button
                    key={i}
                    onClick={() => setIndex(i)}
                    aria-label={`Go to slide ${i + 1}`}
                    style={{
                      width: i === index ? 24 : 8,
                      height: 8,
                      borderRadius: 4,
                      background: i === index ? "rgb(0, 0, 0)" : "rgba(0,0,0,0.2)",
                      border: "none",
                      /* 44px touch target via vertical padding */
                      padding: "18px 4px",
                      backgroundClip: "content-box",
                      cursor: "pointer",
                      transition: "width 300ms ease, background 300ms ease",
                      minHeight: 44,
                    }}
                  />
                ))}
              </div>
            </div>
          </motion.div>
        </AnimatePresence>
      </div>
    </section>
  );
}
