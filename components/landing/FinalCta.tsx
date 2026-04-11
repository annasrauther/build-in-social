"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import { Button, KIND, SIZE } from "baseui/button";
import { Container } from "@/components/ui/Container";
import { LANDING } from "@/content/landing";
import { ease } from "@/lib/motion";

const e = [...ease] as [number, number, number, number];

export function FinalCta() {
  return (
    <section
      className="py-16 tablet-sm:py-20 desktop-sm:py-24"
      style={{ backgroundColor: "var(--bg-dark-cta)" }}
    >
      <Container size="wide">
        <div className="flex flex-col items-center text-center">
          <motion.h2
            initial={{ opacity: 0, y: 16 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5, ease: e }}
            style={{
              fontFamily: "var(--font-heading)",
              fontWeight: 400,
              fontSize: "clamp(28px, 4vw, 40px)",
              letterSpacing: "-0.02em",
              color: "var(--text-inverse)",
              marginBottom: 16,
            }}
          >
            {LANDING.FINAL_CTA.headline}
          </motion.h2>

          <motion.p
            initial={{ opacity: 0, y: 12 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5, ease: e, delay: 0.1 }}
            style={{
              fontSize: "var(--type-body-desktop)",
              color: "rgba(255, 255, 255, 0.65)",
              marginBottom: 32,
              maxWidth: 480,
            }}
          >
            {LANDING.FINAL_CTA.subhead}
          </motion.p>

          <motion.div
            initial={{ opacity: 0, y: 12 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5, ease: e, delay: 0.2 }}
          >
            <Link href="/onboarding/start">
              <Button
                kind={KIND.secondary}
                overrides={{
                  BaseButton: {
                    style: {
                      width: "100%",
                      backgroundColor: "transparent",
                      color: "#FFFFFF",
                      borderWidth: "2px",
                      borderStyle: "solid",
                      borderColor: "#FFFFFF",
                      ":hover": {
                        backgroundColor: "#FFFFFF",
                        color: "rgb(36, 36, 36)",
                      },
                      "@media screen and (min-width: 640px)": {
                        width: "auto",
                      },
                    },
                  },
                }}
              >
                {LANDING.FINAL_CTA.ctaLabel}
              </Button>
            </Link>
          </motion.div>

          <motion.p
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5, delay: 0.3 }}
            className="mt-4"
            style={{
              fontSize: "var(--type-supporting-mobile)",
              color: "rgba(255, 255, 255, 0.5)",
            }}
          >
            {LANDING.FINAL_CTA.reassurance}
          </motion.p>
        </div>
      </Container>
    </section>
  );
}
