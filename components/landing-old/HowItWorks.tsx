"use client";

import { motion } from "framer-motion";
import { LANDING } from "@/content/landing";

const ease = [0.16, 1, 0.3, 1] as const;

/**
 * How it works — Medium sticky scroll layout.
 * Left: sticky section heading.
 * Right: steps scroll vertically.
 */
export function HowItWorks() {
  return (
    <section id="how-it-works" className="lp-section">
      <div className="lp-container">
        <div className="lp-sticky-section">
          {/* Left — sticky heading */}
          <div className="lp-sticky-heading">
            <motion.h2
              initial={{ opacity: 0, y: 24 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-100px" }}
              transition={{ duration: 0.6, ease }}
              style={{
                fontFamily: "var(--lp-serif)",
                fontSize: "clamp(40px, 5vw, 70px)",
                fontWeight: 400,
                lineHeight: 1.06,
                letterSpacing: "-0.05em",
                color: "rgb(0, 0, 0)",
              }}
            >
              {LANDING.HOW_IT_WORKS.headline}
            </motion.h2>
          </div>

          {/* Right — scrolling steps */}
          <div className="lp-sticky-content">
            {LANDING.HOW_IT_WORKS.steps.map((step, i) => (
              <motion.div
                key={step.num}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: "-60px" }}
                transition={{ duration: 0.5, ease, delay: i * 0.08 }}
              >
                <h3
                  style={{
                    fontFamily: "var(--lp-serif)",
                    fontSize: "clamp(28px, 3.5vw, 48px)",
                    fontWeight: 400,
                    lineHeight: 1.15,
                    letterSpacing: "-0.03em",
                    color: "rgb(0, 0, 0)",
                    marginBottom: 16,
                  }}
                >
                  {step.title}
                </h3>
                <p
                  style={{
                    fontFamily: "var(--lp-sans)",
                    fontSize: 20,
                    lineHeight: "32px",
                    color: "var(--lp-text-primary)",
                  }}
                >
                  {step.body}
                </p>
              </motion.div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
