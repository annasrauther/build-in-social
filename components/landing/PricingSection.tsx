"use client";

import { useState } from "react";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";
import { Card, CardContent } from "@/components/ui/Card";
import { Button, KIND, SIZE } from "baseui/button";
import { Container } from "@/components/ui/Container";
import { LANDING } from "@/content/landing";
import { ease } from "@/lib/motion";

const e = [...ease] as [number, number, number, number];

export function PricingSection() {
  const { headline, subhead, plans, faqs } = LANDING.PRICING;
  const [annual, setAnnual] = useState(false);
  const [openFaq, setOpenFaq] = useState<number | null>(null);

  return (
    <section id="pricing" className="py-16 tablet-sm:py-24 desktop-sm:py-32">
      <Container size="wide">
        {/* Heading */}
        <div className="text-center mb-10">
          <h2
            className="mb-3"
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
          <p
            style={{
              fontSize: "var(--type-body-desktop)",
              color: "var(--text-secondary)",
            }}
          >
            {subhead}
          </p>
        </div>

        {/* Billing toggle */}
        <div className="flex items-center justify-center gap-3 mb-10">
          <span
            style={{
              fontSize: "var(--type-body-mobile)",
              color: !annual ? "var(--text-primary)" : "var(--text-tertiary)",
              fontWeight: !annual ? 500 : 400,
            }}
          >
            Monthly
          </span>
          <button
            type="button"
            onClick={() => setAnnual(!annual)}
            className="relative flex items-center"
            style={{
              width: 44,
              height: 24,
              borderRadius: 12,
              backgroundColor: annual ? "var(--accent)" : "rgba(0,0,0,0.15)",
              border: "none",
              cursor: "pointer",
              padding: 0,
              transition: "background-color 200ms ease",
            }}
          >
            <motion.div
              className="rounded-full"
              style={{
                width: 18,
                height: 18,
                backgroundColor: "#ffffff",
                position: "absolute",
              }}
              animate={{ left: annual ? 23 : 3 }}
              transition={{ duration: 0.2 }}
            />
          </button>
          <span
            style={{
              fontSize: "var(--type-body-mobile)",
              color: annual ? "var(--text-primary)" : "var(--text-tertiary)",
              fontWeight: annual ? 500 : 400,
            }}
          >
            Annual
          </span>
          {annual && (
            <span
              className="font-medium"
              style={{ fontSize: "var(--type-supporting-mobile)", color: "var(--success)" }}
            >
              Save 16%
            </span>
          )}
        </div>

        {/* Pricing cards */}
        <div className="grid grid-cols-1 tablet-sm:grid-cols-2 desktop-sm:grid-cols-3 gap-6 mb-20">
          {plans.map((plan, i) => {
            const price = annual ? plan.annualPrice : plan.price;
            return (
              <motion.div
                key={plan.id}
                initial={{ opacity: 0, y: 14 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: "-60px" }}
                transition={{ duration: 0.28, ease: e, delay: i * 0.08 }}
              >
                <Card
                  className={`relative flex flex-col h-full ${plan.popular ? "bg-[var(--accent-subtle)]" : ""}`}
                >
                  {/* Popular badge */}
                  {plan.popular && (
                    <span
                      className="absolute font-medium rounded-full"
                      style={{
                        top: -12,
                        left: 24,
                        fontSize: "var(--type-supporting-mobile)",
                        padding: "4px 14px",
                        backgroundColor: "var(--accent)",
                        color: "var(--text-inverse)",
                      }}
                    >
                      Most popular
                    </span>
                  )}

                  <CardContent className="flex flex-col h-full">
                    {/* Plan name */}
                    <h3
                      className="font-semibold mb-3"
                      style={{
                        fontFamily: "var(--font-heading)",
                        fontSize: 28,
                        fontWeight: 400,
                        letterSpacing: "-0.02em",
                        color: "var(--text-primary)",
                      }}
                    >
                      {plan.name}
                    </h3>

                    {/* Price */}
                    <div className="flex items-baseline gap-2 mb-2">
                      <span
                        style={{
                          fontFamily: "var(--font-heading)",
                          fontSize: 36,
                          fontWeight: 400,
                          letterSpacing: "-0.03em",
                          color: "var(--text-primary)",
                        }}
                      >
                        ${price}
                      </span>
                      <span
                        style={{
                          fontSize: "var(--type-body-mobile)",
                          color: "var(--text-tertiary)",
                        }}
                      >
                        / month
                      </span>
                      {annual && (
                        <span
                          className="line-through"
                          style={{
                            fontSize: "var(--type-body-mobile)",
                            color: "var(--text-disabled)",
                          }}
                        >
                          ${plan.price}
                        </span>
                      )}
                    </div>

                    {/* Description */}
                    <p
                      className="mb-6"
                      style={{
                        fontSize: "var(--type-body-mobile)",
                        color: "var(--text-secondary)",
                        lineHeight: 1.5,
                      }}
                    >
                      {plan.description}
                    </p>

                    {/* Divider */}
                    <div
                      className="mb-6"
                      style={{ height: 1, backgroundColor: "var(--border-default)" }}
                    />

                    {/* Features */}
                    <ul className="space-y-3 mb-8 flex-1">
                      {plan.bullets.map((bullet) => (
                        <li key={bullet} className="flex items-start gap-3">
                          <svg
                            width="16"
                            height="16"
                            viewBox="0 0 16 16"
                            fill="none"
                            className="shrink-0 mt-0.5"
                          >
                            <path
                              d="M3 8l3.5 3.5L13 5"
                              stroke="var(--success)"
                              strokeWidth="1.5"
                              strokeLinecap="round"
                              strokeLinejoin="round"
                            />
                          </svg>
                          <span
                            style={{
                              fontSize: "var(--type-body-mobile)",
                              color: "var(--text-primary)",
                              lineHeight: 1.5,
                            }}
                          >
                            {bullet}
                          </span>
                        </li>
                      ))}
                    </ul>

                    {/* CTA */}
                    <Link href="/onboarding/start" className="block">
                      <Button
                        kind={plan.popular ? KIND.primary : KIND.secondary}
                        overrides={{
                          BaseButton: {
                            style: { width: "100%" },
                          },
                        }}
                      >
                        {plan.ctaLabel}
                      </Button>
                    </Link>
                  </CardContent>
                </Card>
              </motion.div>
            );
          })}
        </div>

        {/* FAQ */}
        <div className="max-w-2xl mx-auto">
          <h3
            className="mb-8"
            style={{
              fontFamily: "var(--font-heading)",
              fontWeight: 400,
              fontSize: "clamp(24px, 3vw, 32px)",
              letterSpacing: "-0.02em",
              color: "var(--text-primary)",
            }}
          >
            Frequently asked questions
          </h3>

          <div>
            {faqs.map((faq, i) => (
              <div
                key={faq.q}
                style={{
                  borderBottom: i < faqs.length - 1 ? "1px solid var(--border-default)" : "none",
                }}
              >
                <button
                  type="button"
                  onClick={() => setOpenFaq(openFaq === i ? null : i)}
                  className="w-full flex items-center justify-between text-left"
                  style={{
                    padding: "20px 0",
                    fontSize: 16,
                    fontWeight: 500,
                    color: "var(--text-primary)",
                    background: "none",
                    border: "none",
                    cursor: "pointer",
                    minHeight: 52,
                  }}
                >
                  {faq.q}
                  <svg
                    width="16"
                    height="16"
                    viewBox="0 0 16 16"
                    fill="none"
                    style={{
                      transform: openFaq === i ? "rotate(180deg)" : "rotate(0deg)",
                      transition: "transform 200ms ease",
                      flexShrink: 0,
                      marginLeft: 16,
                    }}
                  >
                    <path
                      d="M4 6l4 4 4-4"
                      stroke="var(--text-secondary)"
                      strokeWidth="1.5"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    />
                  </svg>
                </button>
                <AnimatePresence>
                  {openFaq === i && (
                    <motion.div
                      initial={{ height: 0, opacity: 0 }}
                      animate={{ height: "auto", opacity: 1 }}
                      exit={{ height: 0, opacity: 0 }}
                      transition={{ duration: 0.25, ease: e }}
                      className="overflow-hidden"
                    >
                      <p
                        className="pb-5"
                        style={{
                          fontSize: "var(--type-body-mobile)",
                          color: "var(--text-secondary)",
                          lineHeight: 1.7,
                          maxWidth: "90%",
                        }}
                      >
                        {faq.a}
                      </p>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            ))}
          </div>
        </div>
      </Container>
    </section>
  );
}
