"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import { Button, KIND, SIZE } from "baseui/button";
import { Container } from "@/components/ui/Container";
import { LANDING } from "@/content/landing";
import { ease, ELEMENT_ENTER } from "@/lib/motion";

const e = [...ease] as [number, number, number, number];

const fadeUp = (delay: number) => ({
  initial: { opacity: 0, y: 20 },
  animate: { opacity: 1, y: 0 },
  transition: { duration: 0.6, ease: e, delay },
});

export function Hero() {
  return (
    <section className="py-20 tablet-sm:py-28 desktop-sm:py-32">
      <Container size="wide">
        <div className="flex flex-col tablet-lg:flex-row tablet-lg:items-center gap-12 tablet-lg:gap-16">
          {/* Left: text */}
          <div className="flex-1 tablet-lg:max-w-[55%]">
            <motion.h1
              {...fadeUp(0)}
              style={{
                fontFamily: "var(--font-heading)",
                fontWeight: 400,
                letterSpacing: "-0.03em",
                lineHeight: 1.1,
                color: "var(--text-primary)",
                fontSize: "clamp(32px, 5vw, 56px)",
              }}
              className="mb-4"
            >
              {LANDING.HERO.headline}
            </motion.h1>

            <motion.p
              {...fadeUp(0.1)}
              style={{
                fontSize: "clamp(16px, 2vw, 20px)",
                lineHeight: 1.6,
                color: "var(--text-secondary)",
                maxWidth: 520,
              }}
              className="mb-8"
            >
              {LANDING.HERO.subhead}
            </motion.p>

            <motion.div {...fadeUp(0.2)}>
              <Link href="/onboarding/start">
                <Button
                  overrides={{
                    BaseButton: {
                      style: {
                        width: "100%",
                        "@media screen and (min-width: 640px)": {
                          width: "auto",
                        },
                      },
                    },
                  }}
                >
                  {LANDING.HERO.primaryCta}
                </Button>
              </Link>
            </motion.div>
          </div>

          {/* Right: product mockup */}
          <motion.div
            className="flex-1 tablet-lg:max-w-[45%]"
            initial={{ opacity: 0, y: 24 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, ease: e, delay: 0.3 }}
          >
            <div
              className="rounded-[var(--radius-lg)] overflow-hidden"
              style={{
                backgroundColor: "var(--bg-elevated)",
                boxShadow: "var(--shadow-mockup)",
                aspectRatio: "4 / 3",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
              }}
            >
              <p
                className="text-[var(--type-supporting-mobile)]"
                style={{ color: "var(--text-tertiary)" }}
              >
                Dashboard preview
              </p>
            </div>
          </motion.div>
        </div>
      </Container>
    </section>
  );
}
