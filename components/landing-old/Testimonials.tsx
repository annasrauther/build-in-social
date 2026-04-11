"use client";

import { motion } from "framer-motion";
import { LANDING } from "@/content/landing";

const ease = [0.16, 1, 0.3, 1] as const;

/**
 * "What founders are saying" — testimonial cards with real founder details,
 * optional metric callouts, and varied visual hierarchy.
 */
export function Testimonials() {
  return (
    <section className="lp-section">
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
              {LANDING.TESTIMONIALS.headline}
            </motion.h2>
          </div>

          {/* Right — scrolling testimonials */}
          <div className="lp-sticky-content">
            {LANDING.TESTIMONIALS.testimonials.map((t, i) => (
              <motion.blockquote
                key={t.handle}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: "-60px" }}
                transition={{ duration: 0.5, ease, delay: i * 0.06 }}
                style={{ margin: 0, padding: 0 }}
              >
                {/* Quote — serif */}
                <p
                  style={{
                    fontFamily: "var(--lp-serif)",
                    fontSize: "clamp(18px, 2vw, 21px)",
                    lineHeight: "32px",
                    fontStyle: "normal",
                    color: "var(--lp-text-primary)",
                    marginBottom: 20,
                  }}
                >
                  &ldquo;{t.quote}&rdquo;
                </p>

                {/* Metric callout */}
                {t.metric && (
                  <motion.div
                    initial={{ opacity: 0, x: -8 }}
                    whileInView={{ opacity: 1, x: 0 }}
                    viewport={{ once: true }}
                    transition={{ duration: 0.4, ease, delay: 0.15 }}
                    className="flex items-baseline gap-2 mb-4"
                  >
                    <span
                      style={{
                        fontFamily: "var(--lp-serif)",
                        fontSize: 32,
                        fontWeight: 400,
                        letterSpacing: "-0.03em",
                        color: "rgb(0, 0, 0)",
                        lineHeight: 1,
                      }}
                    >
                      {t.metric}
                    </span>
                    <span
                      style={{
                        fontFamily: "var(--lp-sans)",
                        fontSize: 14,
                        color: "var(--lp-text-secondary)",
                      }}
                    >
                      {t.metricLabel}
                    </span>
                  </motion.div>
                )}

                {/* Attribution */}
                <footer className="flex items-center gap-3">
                  {/* Avatar — initials from full name */}
                  <div
                    style={{
                      width: 44,
                      height: 44,
                      borderRadius: "50%",
                      background: "rgba(0,0,0,0.06)",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      fontSize: 15,
                      fontWeight: 600,
                      fontFamily: "var(--lp-sans)",
                      color: "var(--lp-text-secondary)",
                      flexShrink: 0,
                      letterSpacing: "0.02em",
                    }}
                  >
                    {t.name
                      .split(" ")
                      .map((w) => w[0])
                      .join("")
                      .slice(0, 2)}
                  </div>
                  <div>
                    <p
                      style={{
                        fontSize: 15,
                        fontWeight: 600,
                        fontFamily: "var(--lp-sans)",
                        color: "rgb(0, 0, 0)",
                        marginBottom: 1,
                      }}
                    >
                      {t.name}
                    </p>
                    <p
                      style={{
                        fontSize: 13,
                        fontFamily: "var(--lp-sans)",
                        color: "var(--lp-text-secondary)",
                      }}
                    >
                      {t.role}, {t.product}
                    </p>
                  </div>
                </footer>
              </motion.blockquote>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
