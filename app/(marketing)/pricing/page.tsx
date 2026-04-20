"use client"
import { Button } from "@/components/tremor/Button"
import { Label } from "@/components/tremor/Label"
import { Switch } from "@/components/tremor/Switch"
import { Tooltip } from "@/components/tremor/Tooltip"
import { ArrowAnimated } from "@/components/marketing/ArrowAnimated"
import { Faqs } from "@/components/marketing/Faqs"
import Testimonial from "@/components/marketing/Testimonial"
import { cx } from "@/lib/utils"
import {
  RiCheckLine,
  RiCloudLine,
  RiInformationLine,
  RiSubtractLine,
  RiUserLine,
} from "@remixicon/react"
import Link from "next/link"
import React, { Fragment } from "react"
import { LANDING } from "@/content/landing"

type FixedPrice = string

interface VariablePrice {
  monthly: string
  annually: string
}

interface Plan {
  name: string
  price: FixedPrice | VariablePrice
  description: string
  capacity: string[]
  features: string[]
  isStarter: boolean
  isRecommended: boolean
  buttonText: string
  buttonLink: string
}

const CAPACITY_BY_ID: Record<"starter" | "solo" | "creator" | "studio", string[]> = {
  starter: ["15 videos per month (hard cap)", "1 platform"],
  solo: ["40 videos per month (hard cap)", "Up to 2 platforms"],
  creator: ["65 videos per month (hard cap)", "Up to 3 platforms"],
  studio: ["92 videos per month (hard cap)", "All 4 platforms"],
}

const EXTRA_FEATURES_BY_ID: Record<"starter" | "solo" | "creator" | "studio", string[]> = {
  starter: ["Hard cap \u2014 no surprise charges"],
  solo: ["Everything in Starter, plus:", "pSEO page per video", "Distribution intelligence from week 4"],
  creator: [
    "Everything in Solo, plus:",
    "Voice cloning",
    "One-click weekly plan approval",
    "Best-performing pattern insights",
  ],
  studio: [
    "Everything in Creator, plus:",
    "Autopilot scheduling",
    "Priority rendering",
    "Avatar Mode add-on available",
  ],
}

const plans: Plan[] = LANDING.PRICING.plans.map((plan) => ({
  name: plan.name,
  price: {
    monthly: `$${plan.price}`,
    annually: `$${plan.annualPrice}`,
  },
  description: plan.description,
  capacity: CAPACITY_BY_ID[plan.id],
  features: [...plan.bullets, ...EXTRA_FEATURES_BY_ID[plan.id]],
  isStarter: plan.id === "starter",
  isRecommended: Boolean(plan.popular),
  buttonText: plan.ctaLabel,
  buttonLink: "/signup",
}))

interface Feature {
  name: string
  plans: Record<string, boolean | string>
  tooltip?: string
}

interface Section {
  name: string
  features: Feature[]
}

const sections: Section[] = [
  {
    name: "Content Generation",
    features: [
      {
        name: "Weekly content batches",
        plans: { Starter: true, Solo: true, Creator: true, Studio: true },
      },
      {
        name: "Manual mode (quality gate)",
        plans: { Starter: true, Solo: true, Creator: true, Studio: true },
      },
      {
        name: "Autopilot mode",
        plans: { Starter: true, Solo: true, Creator: true, Studio: true },
      },
      {
        name: "Formatted for each platform",
        plans: { Starter: "1 platform", Solo: "2 platforms", Creator: "3 platforms", Studio: "All 4 platforms" },
      },
      {
        name: "Videos per month (hard cap)",
        plans: { Starter: "15", Solo: "40", Creator: "65", Studio: "92" },
      },
    ],
  },
  {
    name: "Voice & Personalization",
    features: [
      {
        name: "Library voices (6 curated)",
        plans: { Starter: true, Solo: true, Creator: true, Studio: true },
      },
      {
        name: "Voice cloning",
        plans: { Creator: true, Studio: true },
      },
      {
        name: "Hook variant suggestions",
        plans: { Creator: true, Studio: true },
      },
      {
        name: "Content tone customization",
        plans: { Starter: true, Solo: true, Creator: true, Studio: true },
      },
    ],
  },
  {
    name: "Distribution & SEO",
    features: [
      {
        name: "Search article per video",
        plans: { Solo: true, Creator: true, Studio: true },
      },
      {
        name: "Google indexing",
        plans: { Solo: true, Creator: true, Studio: true },
      },
      {
        name: "Autopilot scheduling",
        plans: { Studio: true },
      },
      {
        name: "Priority rendering",
        plans: { Studio: true },
      },
    ],
  },
  {
    name: "Intelligence",
    features: [
      {
        name: "Distribution intelligence",
        plans: { Solo: "From week 4", Creator: "From week 4", Studio: "Full panel" },
      },
      {
        name: "Performance pattern insights",
        plans: { Creator: true, Studio: true },
      },
      {
        name: "Week-over-week comparison",
        plans: { Studio: true },
      },
    ],
  },
  {
    name: "Support",
    features: [
      {
        name: "Email support",
        plans: { Starter: "Standard", Solo: "Standard", Creator: "Priority", Studio: "Priority" },
      },
      {
        name: "Onboarding help",
        plans: { Starter: true, Solo: true, Creator: true, Studio: true },
      },
    ],
  },
]

const isVariablePrice = (
  price: FixedPrice | VariablePrice,
): price is VariablePrice => {
  return (price as VariablePrice).monthly !== undefined
}

export default function Pricing() {
  const [billingFrequency, setBillingFrequency] = React.useState<
    "monthly" | "annually"
  >("monthly")
  return (
    <div className="px-3">
      <section
        aria-labelledby="pricing-title"
        className="animate-slide-up-fade [animation-duration:600ms] [animation-fill-mode:backwards]"
      >
        <h1 className="mt-2 inline-block bg-brand-gradient bg-clip-text py-2 text-4xl font-bold tracking-tighter text-transparent sm:text-6xl md:text-6xl dark:bg-brand-gradient-dark">
          {LANDING.PRICING.headline}
        </h1>
        <p className="mt-6 max-w-2xl text-lg text-gray-700 dark:text-gray-400">
          {LANDING.PRICING.subhead}
        </p>
      </section>
      <section
        id="pricing-overview"
        className="mt-20 animate-slide-up-fade [animation-duration:600ms] [animation-delay:200ms] [animation-fill-mode:backwards]"
        aria-labelledby="pricing-overview"
      >
        <div className="flex items-center justify-center gap-2">
          <Label
            htmlFor="switch"
            className="text-base font-medium sm:text-sm dark:text-gray-400"
          >
            Monthly
          </Label>
          <Switch
            id="switch"
            checked={billingFrequency === "annually"}
            onCheckedChange={() =>
              setBillingFrequency(
                billingFrequency === "monthly" ? "annually" : "monthly",
              )
            }
          />
          <Label
            htmlFor="switch"
            className="text-base font-medium sm:text-sm text-gray-700 dark:text-gray-400"
          >
            Yearly (-20%)
          </Label>
        </div>
        <div className="grid grid-cols-1 gap-x-6 gap-y-8 tablet-sm:grid-cols-2 lg:grid-cols-4">
          {plans.map((plan, planIdx) => (
            <div key={planIdx} className="mt-6">
              {plan.isRecommended ? (
                <div className="flex h-8 items-center justify-center">
                  <span className="inline-flex items-center rounded-full bg-brand-500 px-3 py-1 text-xs font-semibold text-white dark:bg-brand-400 dark:text-gray-950">
                    Most popular
                  </span>
                </div>
              ) : (
                <div className="flex h-8 items-center">
                  <div className="h-px w-full bg-gray-200 dark:bg-gray-800" />
                </div>
              )}
              <div className="mx-auto max-w-md">
                <h2 className="mt-6 text-sm font-semibold text-gray-900 dark:text-gray-50">
                  {plan.name}
                </h2>
                <div className="mt-3 flex items-center gap-x-3">
                  <span className="text-5xl font-semibold tabular-nums text-gray-900 dark:text-gray-50">
                    {isVariablePrice(plan.price)
                      ? billingFrequency === "monthly"
                        ? plan.price.monthly
                        : plan.price.annually
                      : plan.price}
                  </span>
                  <div className="text-xs text-gray-600 dark:text-gray-400">
                    per month
                  </div>
                </div>
                <div className="mt-6 flex flex-col justify-between">
                  <p className="text-sm leading-6 text-gray-600 dark:text-gray-400">
                    {plan.description}
                  </p>
                  <div className="mt-6">
                    {plan.isStarter ? (
                      <Button variant="secondary" asChild className="group">
                        <Link href={plan.buttonLink}>
                          {plan.buttonText}
                          <ArrowAnimated />
                        </Link>
                      </Button>
                    ) : (
                      <Button asChild className="group">
                        <Link href={plan.buttonLink}>
                          {plan.buttonText}
                          <ArrowAnimated />
                        </Link>
                      </Button>
                    )}
                  </div>
                </div>
                <ul
                  role="list"
                  className="mt-8 text-sm text-gray-700 dark:text-gray-400"
                >
                  {plan.capacity.map((feature, index) => (
                    <li
                      key={feature}
                      className="flex items-center gap-x-3 py-1.5"
                    >
                      {index === 0 && (
                        <RiUserLine
                          className="size-4 shrink-0 text-gray-500"
                          aria-hidden="true"
                        />
                      )}
                      {index === 1 && (
                        <RiCloudLine
                          className="size-4 shrink-0 text-gray-500"
                          aria-hidden="true"
                        />
                      )}
                      <span>{feature}</span>
                    </li>
                  ))}
                </ul>
                <ul
                  role="list"
                  className="mt-4 text-sm text-gray-700 dark:text-gray-400"
                >
                  {plan.features.map((feature) => (
                    <li
                      key={feature}
                      className="flex items-center gap-x-3 py-1.5"
                    >
                      <RiCheckLine
                        className="size-4 shrink-0 text-brand-500 dark:text-brand-400"
                        aria-hidden="true"
                      />
                      <span>{feature}</span>
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          ))}
        </div>
      </section>

      <section
        id="testimonial"
        className="mx-auto mt-20 max-w-xl sm:mt-32 lg:max-w-6xl"
        aria-labelledby="testimonial"
      >
        <Testimonial />
      </section>

      {/* plan details (xs-lg)*/}
      <section
        id="pricing-details"
        className="mt-20 sm:mt-36"
        aria-labelledby="pricing-details"
      >
        <div className="mx-auto space-y-8 sm:max-w-md lg:hidden">
          {plans.map((plan) => (
            <div key={plan.name}>
              <div className="rounded-xl bg-gray-400/5 p-6 ring-1 ring-inset ring-gray-200 dark:ring-gray-800">
                <h2
                  id={plan.name}
                  className="text-base font-semibold leading-6 text-gray-900 dark:text-gray-50"
                >
                  {plan.name}
                </h2>
                <p className="text-sm font-normal text-gray-600 dark:text-gray-400">
                  {isVariablePrice(plan.price)
                    ? `${
                        billingFrequency === "monthly"
                          ? plan.price.monthly
                          : plan.price.annually
                      } / mo`
                    : plan.price}
                </p>
              </div>
              <ul
                role="list"
                className="mt-10 space-y-10 text-sm leading-6 text-gray-900 dark:text-gray-50"
              >
                {sections.map((section) => (
                  <li key={section.name}>
                    <h3 className="font-semibold">{section.name}</h3>
                    <ul
                      role="list"
                      className="mt-2 divide-y divide-gray-200 dark:divide-gray-800"
                    >
                      {section.features.map((feature) =>
                        feature.plans[plan.name] ? (
                          <li
                            key={feature.name}
                            className="flex gap-x-3 py-2.5"
                          >
                            <RiCheckLine
                              className="size-5 flex-none text-brand-500 dark:text-brand-400"
                              aria-hidden="true"
                            />
                            <span>
                              {feature.name}{" "}
                              {typeof feature.plans[plan.name] === "string" ? (
                                <span className="text-sm leading-6 text-gray-600 dark:text-gray-400">
                                  ({feature.plans[plan.name]})
                                </span>
                              ) : null}
                            </span>
                          </li>
                        ) : null,
                      )}
                    </ul>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
      </section>

      {/* plan details (lg+) */}
      <section className="mx-auto mt-20 hidden lg:block">
        {/* Section label */}
        <div className="mb-8 flex items-end justify-between border-b border-gray-200 pb-6 dark:border-gray-800">
          <div>
            <h2 className="text-xl font-semibold text-gray-900 dark:text-gray-50">
              Compare plans
            </h2>
            <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
              14-day free trial on every plan · No credit card required
            </p>
          </div>
        </div>

        <div className="relative overflow-hidden rounded-2xl border border-gray-200 dark:border-gray-800">
          <table className="w-full table-fixed border-separate border-spacing-0 text-left">
            <caption className="sr-only">Pricing plan comparison</caption>
            <colgroup>
              <col className="w-1/3" />
              <col className="w-[16.67%]" />
              <col className="w-[16.67%]" />
              <col className="w-[16.67%]" />
              <col className="w-[16.67%]" />
            </colgroup>

            {/* Sticky header */}
            <thead className="sticky top-0 z-20">
              <tr>
                <th
                  scope="col"
                  className="border-b border-gray-200 bg-white/95 px-6 py-5 backdrop-blur-sm dark:border-gray-800 dark:bg-gray-950/95"
                >
                  <span className="sr-only">Feature</span>
                </th>
                {plans.map((plan) => (
                  <th
                    key={plan.name}
                    scope="col"
                    className={cx(
                      "border-b px-6 py-5 backdrop-blur-sm lg:px-8",
                      plan.isRecommended
                        ? "border-brand-200/60 bg-brand-50/60 dark:border-brand-800/40 dark:bg-brand-950/40"
                        : "border-gray-200 bg-white/95 dark:border-gray-800 dark:bg-gray-950/95",
                    )}
                  >
                    {/* Top accent bar for recommended */}
                    {plan.isRecommended && (
                      <div className="absolute inset-x-0 top-0 h-0.5 bg-gradient-to-r from-brand-400 to-brand-600" />
                    )}
                    <div
                      className={cx(
                        "text-sm font-semibold",
                        plan.isRecommended
                          ? "text-brand-600 dark:text-brand-400"
                          : "text-gray-900 dark:text-gray-50",
                      )}
                    >
                      {plan.name}
                      {plan.isRecommended && (
                        <span className="ml-2 inline-flex items-center rounded-full bg-brand-100 px-2 py-0.5 text-[10px] font-medium text-brand-700 dark:bg-brand-900/60 dark:text-brand-300">
                          Popular
                        </span>
                      )}
                    </div>
                    <div className="mt-1 text-xl font-semibold tabular-nums text-gray-900 dark:text-gray-50">
                      {isVariablePrice(plan.price)
                        ? billingFrequency === "monthly"
                          ? plan.price.monthly
                          : plan.price.annually
                        : plan.price}
                      <span className="ml-1 text-xs font-normal text-gray-400 dark:text-gray-500">/ mo</span>
                    </div>
                    <div className="mt-3">
                      <Button
                        variant={plan.isRecommended ? "primary" : "secondary"}
                        asChild
                        className="group w-full justify-center text-xs"
                      >
                        <Link href={plan.buttonLink}>
                          {plan.buttonText}
                          <ArrowAnimated />
                        </Link>
                      </Button>
                    </div>
                  </th>
                ))}
              </tr>
            </thead>

            <tbody>
              {sections.map((section, sectionIdx) => (
                <Fragment key={section.name}>
                  {/* Section header */}
                  <tr>
                    <th
                      scope="colgroup"
                      colSpan={5}
                      className={cx(
                        sectionIdx === 0 ? "pt-8" : "pt-6",
                        "pb-3 pl-6 text-xs font-semibold uppercase tracking-wider text-gray-400 dark:text-gray-500",
                      )}
                    >
                      {section.name}
                    </th>
                  </tr>

                  {section.features.map((feature, featureIdx) => {
                    const isLast = featureIdx === section.features.length - 1
                    return (
                      <tr
                        key={feature.name}
                        className="group/row transition-colors hover:bg-gray-50/80 dark:hover:bg-gray-800/30"
                      >
                        <th
                          scope="row"
                          className={cx(
                            "flex items-center gap-2 px-6 py-3.5 text-sm font-normal text-gray-700 dark:text-gray-300",
                            !isLast && "border-b border-gray-100 dark:border-gray-800/60",
                          )}
                        >
                          <span>{feature.name}</span>
                          {feature.tooltip && (
                            <Tooltip side="right" content={feature.tooltip}>
                              <RiInformationLine
                                className="size-3.5 shrink-0 text-gray-400 dark:text-gray-500"
                                aria-hidden="true"
                              />
                            </Tooltip>
                          )}
                        </th>
                        {plans.map((plan) => (
                          <td
                            key={plan.name}
                            className={cx(
                              "px-6 py-3.5 lg:px-8",
                              !isLast && "border-b border-gray-100 dark:border-gray-800/60",
                              plan.isRecommended &&
                                "bg-brand-50/40 dark:bg-brand-950/30",
                            )}
                          >
                            {typeof feature.plans[plan.name] === "string" ? (
                              <span
                                className={cx(
                                  "text-sm",
                                  plan.isRecommended
                                    ? "font-medium text-brand-600 dark:text-brand-400"
                                    : "text-gray-600 dark:text-gray-400",
                                )}
                              >
                                {feature.plans[plan.name]}
                              </span>
                            ) : feature.plans[plan.name] === true ? (
                              <>
                                <RiCheckLine
                                  className={cx(
                                    "h-5 w-5",
                                    plan.isRecommended
                                      ? "text-brand-500 dark:text-brand-400"
                                      : "text-gray-400 dark:text-gray-500",
                                  )}
                                  aria-hidden="true"
                                />
                                <span className="sr-only">Included in {plan.name}</span>
                              </>
                            ) : (
                              <>
                                <RiSubtractLine
                                  className="h-4 w-4 text-gray-200 dark:text-gray-700"
                                  aria-hidden="true"
                                />
                                <span className="sr-only">Not included in {plan.name}</span>
                              </>
                            )}
                          </td>
                        ))}
                      </tr>
                    )
                  })}
                </Fragment>
              ))}

              {/* Bottom CTA row */}
              <tr className="border-t border-gray-200 dark:border-gray-800">
                <td className="px-6 py-6" />
                {plans.map((plan) => (
                  <td
                    key={plan.name}
                    className={cx(
                      "px-6 py-6 lg:px-8",
                      plan.isRecommended && "bg-brand-50/40 dark:bg-brand-950/30",
                    )}
                  >
                    <Button
                      variant={plan.isRecommended ? "primary" : "secondary"}
                      asChild
                      className="group w-full justify-center text-xs"
                    >
                      <Link href={plan.buttonLink}>
                        {plan.buttonText}
                        <ArrowAnimated />
                      </Link>
                    </Button>
                  </td>
                ))}
              </tr>
            </tbody>
          </table>
        </div>
      </section>
      <Faqs />
    </div>
  )
}
