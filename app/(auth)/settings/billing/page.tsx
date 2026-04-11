"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import { ease, ELEMENT_ENTER } from "@/lib/motion";
import { PACKAGES } from "@/lib/types/billing";
import { APP } from "@/content/app";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/Card";
import { Badge } from "@/components/ui/Badge";
import { Button, KIND, SIZE } from "baseui/button";

const CURRENT_PLAN = "creator";

const OUTCOMES: Record<string, string> = {
  solo: "Ship consistently on 2 platforms. Build the habit before you scale.",
  creator: "Three platforms, full intelligence. Most founders hit their first 1,000 followers here.",
  studio: "All four platforms, every week. The ceiling is your audience, not your bandwidth.",
};

export default function BillingPage() {
  const packages = Object.values(PACKAGES);

  return (
    <div className="space-y-6 max-w-3xl">
      <div>
        <h2
          className="text-[var(--type-section-mobile)] tablet-sm:text-[var(--type-section-desktop)]"
          style={{ fontFamily: "var(--font-heading)", fontWeight: 400, color: "var(--text-primary)" }}
        >
          {APP.SETTINGS_BILLING.title}
        </h2>
        <p
          className="text-[var(--type-supporting-mobile)] tablet-sm:text-[var(--type-supporting-desktop)] mt-1"
          style={{ color: "var(--text-tertiary)" }}
        >
          {APP.SETTINGS_BILLING.currentPlan}:{" "}
          <strong style={{ color: "var(--text-primary)" }}>Creator</strong> ·{" "}
          {APP.SETTINGS_BILLING.trialActive}
        </p>
      </div>

      {/* Package cards */}
      <div className="grid grid-cols-1 tablet-sm:grid-cols-3 gap-3">
        {packages.map((pkg, i) => {
          const isCurrent = pkg.id === CURRENT_PLAN;
          return (
            <motion.div
              key={pkg.id}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.07, duration: ELEMENT_ENTER, ease: [...ease] }}
            >
              <Card
                className={`flex flex-col relative h-full ${
                  isCurrent ? "border-[var(--accent)] bg-[var(--accent-subtle)]" : ""
                }`}
              >
                {isCurrent && (
                  <Badge
                    variant="approved"
                    className="absolute -top-2.5 left-1/2 -translate-x-1/2 whitespace-nowrap"
                  >
                    {APP.SETTINGS_BILLING.currentPlan}
                  </Badge>
                )}

                <div className="mb-4">
                  <p
                    className="text-[var(--type-body-mobile)] tablet-sm:text-[var(--type-body-desktop)] font-medium mb-1"
                    style={{ color: "var(--text-primary)" }}
                  >
                    {pkg.name}
                  </p>
                  <div className="flex items-baseline gap-1">
                    <span
                      className="text-[var(--type-display-mobile)] tablet-sm:text-[var(--type-display-desktop)]"
                      style={{ fontFamily: "var(--font-mono)", fontWeight: 500, color: "var(--text-primary)" }}
                    >
                      ${pkg.price}
                    </span>
                    <span
                      className="text-[var(--type-supporting-mobile)] tablet-sm:text-[var(--type-supporting-desktop)]"
                      style={{ color: "var(--text-tertiary)" }}
                    >
                      {APP.SETTINGS_BILLING.perMonth}
                    </span>
                  </div>
                  <p
                    className="text-[var(--type-supporting-mobile)] tablet-sm:text-[var(--type-supporting-desktop)] mt-1.5 leading-[1.5]"
                    style={{ color: "var(--text-secondary)" }}
                  >
                    {OUTCOMES[pkg.id]}
                  </p>
                </div>

                <div className="space-y-2 mb-5 flex-1">
                  {pkg.features.map((f) => (
                    <div key={f} className="flex items-start gap-2">
                      <div
                        className="w-3.5 h-3.5 rounded-full flex items-center justify-center shrink-0 mt-0.5"
                        style={{ backgroundColor: isCurrent ? "var(--accent)" : "var(--text-tertiary)" }}
                      >
                        <svg width="7" height="5" viewBox="0 0 7 5" fill="none">
                          <path d="M1 2.5L2.5 4L6 1" stroke="var(--text-inverse)" strokeWidth="1.3" strokeLinecap="round" strokeLinejoin="round" />
                        </svg>
                      </div>
                      <span
                        className="text-[var(--type-supporting-mobile)] tablet-sm:text-[var(--type-supporting-desktop)] leading-[1.5]"
                        style={{ color: "var(--text-secondary)" }}
                      >
                        {f}
                      </span>
                    </div>
                  ))}
                </div>

                {isCurrent ? (
                  <Button
                    disabled
                    overrides={{ BaseButton: { style: { width: "100%" } } }}
                  >
                    {APP.SETTINGS_BILLING.currentPlan}
                  </Button>
                ) : (
                  <Button
                    kind={KIND.secondary}
                    overrides={{ BaseButton: { style: { width: "100%" } } }}
                  >
                    {pkg.price > 79 ? APP.SETTINGS_BILLING.upgrade : APP.SETTINGS_BILLING.downgrade}
                  </Button>
                )}
              </Card>
            </motion.div>
          );
        })}
      </div>

      {/* Manage billing */}
      <Card className="flex items-center justify-between">
        <div>
          <p
            className="text-[var(--type-body-mobile)] tablet-sm:text-[var(--type-body-desktop)] font-medium"
            style={{ color: "var(--text-primary)" }}
          >
            {APP.SETTINGS_BILLING.manageBilling}
          </p>
          <p
            className="text-[var(--type-supporting-mobile)] tablet-sm:text-[var(--type-supporting-desktop)] mt-0.5"
            style={{ color: "var(--text-tertiary)" }}
          >
            {APP.SETTINGS_BILLING.manageBillingDescription}
          </p>
        </div>
        <div className="shrink-0">
          <Button kind={KIND.secondary} size={SIZE.compact}>
            {APP.SETTINGS_BILLING.billingPortalCta}
          </Button>
        </div>
      </Card>

      {/* Avatar add-on */}
      <Card className="flex items-center gap-4">
        <div className="flex-1">
          <div className="flex items-center gap-2 mb-1">
            <p
              className="text-[var(--type-body-mobile)] tablet-sm:text-[var(--type-body-desktop)] font-medium"
              style={{ color: "var(--text-primary)" }}
            >
              {APP.SETTINGS_BILLING.avatarTitle}
            </p>
            <Badge variant="default">{APP.SETTINGS_BILLING.avatarComingSoon}</Badge>
          </div>
          <p
            className="text-[var(--type-supporting-mobile)] tablet-sm:text-[var(--type-supporting-desktop)]"
            style={{ color: "var(--text-secondary)" }}
          >
            {APP.SETTINGS_BILLING.avatarDescription}
          </p>
        </div>
        <Link href="/waitlist">
          <div className="shrink-0 whitespace-nowrap">
            <Button kind={KIND.secondary} size={SIZE.compact}>
              {APP.SETTINGS_BILLING.avatarCta}
            </Button>
          </div>
        </Link>
      </Card>
    </div>
  );
}
