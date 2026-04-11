"use client";

import { motion } from "framer-motion";
import { Container } from "@/components/ui/Container";
import { LANDING } from "@/content/landing";
import { ease } from "@/lib/motion";

const e = [...ease] as [number, number, number, number];

export function HowItWorks() {
  const { headline, steps } = LANDING.HOW_IT_WORKS;

  return (
    <section id="how-it-works" className="py-16 tablet-sm:py-24 desktop-sm:py-32">
      <Container size="wide">
        {/* Heading */}
        <h2
          className="text-center mb-12 tablet-sm:mb-16"
          style={{
            fontFamily: "var(--font-heading)",
            fontWeight: 400,
            fontSize: "clamp(28px, 4vw, 40px)",
            letterSpacing: "-0.02em",
            color: "var(--text-primary)",
          }}
        >
          {headline}
        </h2>

        {/* Steps */}
        <div className="flex flex-col tablet-lg:flex-row tablet-lg:items-start gap-8 tablet-lg:gap-4">
          {steps.map((step, i) => (
            <motion.div
              key={step.num}
              className="flex-1 flex flex-col items-center text-center relative"
              initial={{ opacity: 0, y: 14 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-60px" }}
              transition={{ duration: 0.28, ease: e, delay: i * 0.08 }}
            >
              {/* Connector line — between steps on desktop */}
              {i < steps.length - 1 && (
                <div
                  className="hidden tablet-lg:block absolute top-5 left-[calc(50%+28px)] right-[-50%]"
                  style={{
                    height: 1,
                    backgroundColor: "var(--border-default)",
                  }}
                />
              )}

              {/* Number circle */}
              <div
                className="w-10 h-10 rounded-full flex items-center justify-center font-semibold mb-4 relative z-10"
                style={{
                  backgroundColor: "var(--accent)",
                  color: "var(--text-inverse)",
                  fontSize: 16,
                }}
              >
                {step.num}
              </div>

              {/* Title */}
              <h3
                className="font-semibold mb-2"
                style={{
                  fontSize: 18,
                  color: "var(--text-primary)",
                }}
              >
                {step.title}
              </h3>

              {/* Description */}
              <p
                style={{
                  fontSize: "var(--type-body-mobile)",
                  color: "var(--text-secondary)",
                  lineHeight: 1.6,
                  maxWidth: 280,
                }}
              >
                {step.body}
              </p>
            </motion.div>
          ))}
        </div>
      </Container>
    </section>
  );
}
