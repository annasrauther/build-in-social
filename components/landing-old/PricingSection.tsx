"use client";

import { useState } from "react";
import Link from "next/link";
import { motion } from "framer-motion";
import { LANDING } from "@/content/landing";

const ease = [0.16, 1, 0.3, 1] as const;

/**
 * Pricing — Medium-style layout.
 * 70px serif heading, two-tier card layout, FAQ accordion.
 */
export function PricingSection() {
  const [annual, setAnnual] = useState(false);
  const [openFaq, setOpenFaq] = useState<number | null>(null);

  return (
    <section id="pricing" className="lp-section">
      <div className="lp-container">
        {/* Section heading — 70px serif like all other sections */}
        <motion.div
          initial={{ opacity: 0, y: 24 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-100px" }}
          transition={{ duration: 0.6, ease }}
          style={{ marginBottom: 64 }}
        >
          <h2
            style={{
              fontFamily: "var(--lp-serif)",
              fontSize: "clamp(40px, 5vw, 70px)",
              fontWeight: 400,
              lineHeight: 1.06,
              letterSpacing: "-0.05em",
              color: "rgb(0, 0, 0)",
              marginBottom: 20,
            }}
          >
            {LANDING.PRICING.headline}
          </h2>
          <p
            style={{
              fontFamily: "var(--lp-sans)",
              fontSize: 20,
              lineHeight: "28px",
              color: "var(--lp-text-secondary)",
              marginBottom: 32,
            }}
          >
            {LANDING.PRICING.subhead}
          </p>

          {/* Billing toggle */}
          <div className="flex items-center gap-3">
            <span
              style={{
                fontFamily: "var(--lp-sans)",
                fontSize: 15,
                fontWeight: 500,
                color: !annual ? "rgb(0, 0, 0)" : "var(--lp-text-secondary)",
              }}
            >
              Monthly
            </span>
            <button
              onClick={() => setAnnual(!annual)}
              aria-label={annual ? "Switch to monthly billing" : "Switch to annual billing"}
              style={{
                width: 44,
                height: 44,
                borderRadius: 12,
                background: "transparent",
                border: "none",
                cursor: "pointer",
                position: "relative",
                padding: "10px 0",
              }}
            >
              <div
                style={{
                  width: 44,
                  height: 24,
                  borderRadius: 12,
                  background: annual ? "rgb(0, 0, 0)" : "rgba(0,0,0,0.15)",
                  transition: "background 200ms ease",
                  position: "relative",
                }}
              >
                <div
                  style={{
                    width: 18,
                    height: 18,
                    borderRadius: "50%",
                    background: "white",
                    position: "absolute",
                    top: 3,
                    left: annual ? 23 : 3,
                    transition: "left 200ms ease",
                  }}
                />
              </div>
            </button>
            <span
              style={{
                fontFamily: "var(--lp-sans)",
                fontSize: 15,
                fontWeight: 500,
                color: annual ? "rgb(0, 0, 0)" : "var(--lp-text-secondary)",
              }}
            >
              Annual{" "}
              <span style={{ color: "rgb(26, 137, 23)", fontSize: 13 }}>
                save 16%
              </span>
            </span>
          </div>
        </motion.div>

        {/* Plan cards */}
        <div
          className="grid grid-cols-1 tablet-sm:grid-cols-2 tablet-lg:grid-cols-3"
          style={{
            gap: 24,
            marginBottom: 100,
          }}
        >
          {LANDING.PRICING.plans.map((plan, i) => {
            const price = annual ? plan.annualPrice : plan.price;

            return (
              <motion.div
                key={plan.id}
                className="lp-pricing-card"
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: "-60px" }}
                transition={{ duration: 0.5, ease, delay: i * 0.08 }}
                style={{
                  background: "white",
                  border: plan.popular
                    ? "2px solid rgb(0, 0, 0)"
                    : "1px solid rgba(0,0,0,0.1)",
                  borderRadius: 8,
                  padding: "36px 32px",
                  position: "relative",
                }}
              >
                {plan.popular && (
                  <span
                    style={{
                      position: "absolute",
                      top: -12,
                      left: 24,
                      fontSize: 13,
                      fontWeight: 500,
                      fontFamily: "var(--lp-sans)",
                      padding: "4px 14px",
                      borderRadius: 1584,
                      background: "rgb(0, 0, 0)",
                      color: "white",
                    }}
                  >
                    Most popular
                  </span>
                )}

                <h3
                  style={{
                    fontFamily: "var(--lp-serif)",
                    fontSize: 28,
                    fontWeight: 400,
                    letterSpacing: "-0.02em",
                    marginBottom: 12,
                    color: "rgb(0, 0, 0)",
                  }}
                >
                  {plan.name}
                </h3>

                <div className="flex items-baseline gap-2" style={{ marginBottom: 8 }}>
                  <span
                    style={{
                      fontFamily: "var(--lp-serif)",
                      fontSize: 48,
                      fontWeight: 400,
                      letterSpacing: "-0.03em",
                      color: "rgb(0, 0, 0)",
                    }}
                  >
                    ${price}
                  </span>
                  <span
                    style={{
                      fontFamily: "var(--lp-sans)",
                      fontSize: 16,
                      color: "var(--lp-text-secondary)",
                    }}
                  >
                    /month
                  </span>
                  {annual && (
                    <span
                      style={{
                        fontFamily: "var(--lp-sans)",
                        fontSize: 16,
                        color: "var(--lp-text-secondary)",
                        textDecoration: "line-through",
                      }}
                    >
                      ${plan.price}
                    </span>
                  )}
                </div>

                <p
                  style={{
                    fontFamily: "var(--lp-sans)",
                    fontSize: 16,
                    lineHeight: "24px",
                    color: "var(--lp-text-secondary)",
                    marginBottom: 24,
                  }}
                >
                  {plan.description}
                </p>

                <div
                  style={{
                    height: 1,
                    background: "rgba(0,0,0,0.08)",
                    marginBottom: 24,
                  }}
                />

                <ul style={{ listStyle: "none", padding: 0, margin: "0 0 28px" }}>
                  {plan.bullets.map((b) => (
                    <li
                      key={b}
                      className="flex items-start gap-3"
                      style={{ marginBottom: 12 }}
                    >
                      <svg
                        width="16"
                        height="16"
                        viewBox="0 0 16 16"
                        fill="none"
                        style={{ flexShrink: 0, marginTop: 3 }}
                        aria-hidden="true"
                      >
                        <path
                          d="M5 8L7 10L11 6"
                          stroke="rgb(26, 137, 23)"
                          strokeWidth="1.5"
                          strokeLinecap="round"
                          strokeLinejoin="round"
                        />
                      </svg>
                      <span
                        style={{
                          fontFamily: "var(--lp-sans)",
                          fontSize: 15,
                          color: "var(--lp-text-primary)",
                          lineHeight: 1.5,
                        }}
                      >
                        {b}
                      </span>
                    </li>
                  ))}
                </ul>

                <Link
                  href="/onboarding/hook"
                  className={plan.popular ? "lp-btn-primary" : "lp-btn-ghost"}
                  style={{
                    display: "flex",
                    justifyContent: "center",
                    width: "100%",
                  }}
                >
                  {plan.ctaLabel}
                </Link>
              </motion.div>
            );
          })}
        </div>

        {/* FAQ - Styled like HowItWorks (Three Steps) */}
        <div className="lp-sticky-section" style={{ marginTop: 100 }}>
          {/* Left — sticky heading */}
          <div className="lp-sticky-heading">
            <motion.h3
              initial={{ opacity: 0, y: 16 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-100px" }}
              transition={{ duration: 0.5, ease }}
              style={{
                fontFamily: "var(--lp-serif)",
                fontSize: "clamp(28px, 3.5vw, 48px)",
                fontWeight: 400,
                lineHeight: 1.15,
                letterSpacing: "-0.03em",
                color: "rgb(0, 0, 0)",
              }}
            >
              Frequently asked
              <br />
              questions
            </motion.h3>
          </div>

          {/* Right — accordion list */}
          <div className="lp-sticky-content" style={{ gap: 0 }}>
            {LANDING.PRICING.faqs.map((faq, i) => {
              const isOpen = openFaq === i;
              return (
                <motion.div
                  key={faq.q}
                  initial={{ opacity: 0 }}
                  whileInView={{ opacity: 1 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.3, delay: i * 0.05 }}
                  style={{
                    borderBottom: "1px solid rgba(0,0,0,0.08)",
                  }}
                >
                  <button
                    onClick={() => setOpenFaq(isOpen ? null : i)}
                    className="flex items-center justify-between w-full"
                    style={{
                      padding: "20px 0",
                      fontFamily: "var(--lp-sans)",
                      fontSize: 17,
                      fontWeight: 500,
                      color: "rgb(0, 0, 0)",
                      background: "none",
                      border: "none",
                      cursor: "pointer",
                      textAlign: "left",
                      minHeight: 52,
                    }}
                  >
                    <span style={{ flex: 1, paddingRight: 24 }}>{faq.q}</span>
                    <svg
                      width="16"
                      height="16"
                      viewBox="0 0 16 16"
                      fill="none"
                      style={{
                        flexShrink: 0,
                        transform: isOpen ? "rotate(180deg)" : "rotate(0deg)",
                        transition: "transform 200ms ease",
                      }}
                      aria-hidden="true"
                    >
                      <path
                        d="M4 6L8 10L12 6"
                        stroke="var(--lp-text-secondary)"
                        strokeWidth="1.5"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                      />
                    </svg>
                  </button>

                  <motion.div
                    initial={false}
                    animate={{ height: isOpen ? "auto" : 0 }}
                    transition={{ duration: 0.25, ease }}
                    style={{ overflow: "hidden" }}
                  >
                    <p
                      style={{
                        fontFamily: "var(--lp-sans)",
                        fontSize: 16,
                        color: "var(--lp-text-secondary)",
                        lineHeight: 1.7,
                        paddingBottom: 20,
                        maxWidth: "90%",
                      }}
                    >
                      {faq.a}
                    </p>
                  </motion.div>
                </motion.div>
              );
            })}
          </div>
        </div>
      </div>
    </section>
  );
}
