"use client";

import { motion } from "framer-motion";
import { LANDING } from "@/content/landing";

const ease = [0.16, 1, 0.3, 1] as const;

/**
 * "Why Build In Social?" — Medium's "Why membership?" exact layout.
 * Left: sticky section heading (~38% width).
 * Right: value props scroll vertically with large spacing.
 */
export function ValueProps() {
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
              {LANDING.VALUE_PROPS.headline}
            </motion.h2>
          </div>

          {/* Right — scrolling items */}
          <div className="lp-sticky-content">
            {LANDING.VALUE_PROPS.items.map((item, i) => (
              <motion.div
                key={item.title}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: "-60px" }}
                transition={{ duration: 0.5, ease, delay: i * 0.05 }}
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
                  {item.title}
                </h3>
                <p
                  style={{
                    fontFamily: "var(--lp-sans)",
                    fontSize: 20,
                    lineHeight: "32px",
                    color: "var(--lp-text-primary)",
                  }}
                >
                  {item.body}
                </p>
              </motion.div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
