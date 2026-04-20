"use client"
import React from "react"
import Link from "next/link"
import { RiCheckLine } from "@remixicon/react"
import { Button } from "@/components/tremor/Button"
import { ArrowAnimated } from "@/components/marketing/ArrowAnimated"
import { LANDING } from "@/content/landing"
import { cx } from "@/lib/utils"

export default function Pricing() {
  const [billingFrequency, setBillingFrequency] = React.useState<
    "monthly" | "annually"
  >("monthly")

  return (
    <section
      id="pricing"
      aria-labelledby="pricing-section-title"
      className="mx-auto mt-20 w-full max-w-6xl px-4 sm:mt-32 sm:px-6"
    >
      <h2
        id="pricing-section-title"
        className="text-center text-3xl font-bold tracking-tighter text-gray-900 dark:text-gray-50 md:text-4xl font-serif"
      >
        {LANDING.PRICING.headline}
      </h2>
      <p className="mt-3 text-center text-gray-600 dark:text-gray-400">
        {LANDING.PRICING.subhead}
      </p>

      {/* Billing toggle */}
      <div className="mt-6 flex items-center justify-center gap-3 text-sm">
        <button
          type="button"
          onClick={() => setBillingFrequency("monthly")}
          className={cx(
            "rounded-md px-3 py-1.5 font-medium transition-colors",
            billingFrequency === "monthly"
              ? "bg-gray-900 text-white dark:bg-gray-50 dark:text-gray-900"
              : "text-gray-600 hover:text-gray-900 dark:text-gray-400 dark:hover:text-gray-50",
          )}
          aria-pressed={billingFrequency === "monthly"}
        >
          Monthly
        </button>
        <button
          type="button"
          onClick={() => setBillingFrequency("annually")}
          className={cx(
            "rounded-md px-3 py-1.5 font-medium transition-colors",
            billingFrequency === "annually"
              ? "bg-gray-900 text-white dark:bg-gray-50 dark:text-gray-900"
              : "text-gray-600 hover:text-gray-900 dark:text-gray-400 dark:hover:text-gray-50",
          )}
          aria-pressed={billingFrequency === "annually"}
        >
          Yearly <span className="text-brand-500">-20%</span>
        </button>
      </div>

      <div className="mt-8 grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
        {LANDING.PRICING.plans.map((plan) => (
          <div
            key={plan.id}
            className={cx(
              "relative rounded-2xl border p-6 flex flex-col",
              plan.popular
                ? "border-brand-300 bg-brand-50/50 shadow-md dark:border-brand-700/60 dark:bg-brand-950/30"
                : "border-gray-200 bg-white dark:border-gray-800 dark:bg-gray-900/40",
            )}
          >
            {plan.popular && (
              <span className="absolute -top-3 left-1/2 -translate-x-1/2 inline-flex items-center rounded-full bg-brand-500 px-3 py-0.5 text-xs font-semibold text-white">
                Most popular
              </span>
            )}
            <h3 className="text-base font-semibold text-gray-900 dark:text-gray-50 font-serif">
              {plan.name}
            </h3>
            <div className="mt-3 flex items-end gap-1">
              <span className="text-4xl font-bold tabular-nums text-gray-900 dark:text-gray-50">
                ${billingFrequency === "annually" ? plan.annualPrice : plan.price}
              </span>
              <span className="mb-1 text-sm text-gray-500 dark:text-gray-400">/ mo</span>
            </div>
            <p className="mt-2 text-xs text-gray-500 dark:text-gray-400">
              {plan.description}
            </p>
            <ul className="mt-4 flex-1 space-y-2">
              {plan.bullets.map((bullet) => (
                <li key={bullet} className="flex items-start gap-2 text-sm text-gray-600 dark:text-gray-400">
                  <RiCheckLine
                    className="mt-0.5 size-4 shrink-0 text-brand-500 dark:text-brand-400"
                    aria-hidden="true"
                  />
                  {bullet}
                </li>
              ))}
            </ul>
            <div className="mt-6">
              <Button
                asChild
                variant={plan.popular ? "primary" : "secondary"}
                className="group w-full justify-center"
              >
                <Link href="/signup">
                  {plan.ctaLabel}
                  <ArrowAnimated />
                </Link>
              </Button>
            </div>
          </div>
        ))}
      </div>
    </section>
  )
}
