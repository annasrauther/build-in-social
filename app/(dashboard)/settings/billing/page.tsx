"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { Button } from "@/components/tremor/Button";
import { Divider } from "@/components/tremor/Divider";
import { Card } from "@/components/tremor/Card";
import { Badge } from "@/components/tremor/Badge";
import { APP } from "@/content/app";
import type { SubscriptionTier } from "@/lib/types/user";

interface ProfileLite {
  subscriptionTier: SubscriptionTier;
  trialEndsAt?: string;
  platforms?: string[];
}

const TIER_LABELS: Record<SubscriptionTier, { label: string; price: number }> = {
  trial: { label: "Trial", price: 0 },
  solo: { label: "Solo", price: 39 },
  creator: { label: "Creator", price: 79 },
  studio: { label: "Studio", price: 149 },
};

export default function BillingSettings() {
  const [profile, setProfile] = useState<ProfileLite | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [openingPortal, setOpeningPortal] = useState(false);
  const [switchingTo, setSwitchingTo] = useState<SubscriptionTier | null>(null);

  useEffect(() => {
    let cancelled = false;
    fetch("/api/user/profile")
      .then((r) => r.json())
      .then((j) => {
        if (cancelled) return;
        if (j.error) setError(j.error);
        else setProfile(j.data as ProfileLite);
      })
      .catch(() => {
        if (!cancelled) setError(APP.COMMON.errorGeneric);
      });
    return () => {
      cancelled = true;
    };
  }, []);

  async function switchPlan(packageId: Exclude<SubscriptionTier, "trial">) {
    setSwitchingTo(packageId);
    setError(null);
    try {
      const res = await fetch("/api/billing/checkout", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ packageId }),
      });
      const json = await res.json();
      if (!res.ok || !json.data?.sessionUrl) {
        setError(json.error ?? APP.COMMON.errorGeneric);
        return;
      }
      window.location.href = json.data.sessionUrl as string;
    } catch {
      setError(APP.COMMON.errorGeneric);
    } finally {
      setSwitchingTo(null);
    }
  }

  async function openBillingPortal() {
    setOpeningPortal(true);
    setError(null);
    try {
      const res = await fetch("/api/billing/portal", { method: "POST" });
      const json = await res.json();
      if (!res.ok || !json.data?.portalUrl) {
        setError(json.error ?? APP.COMMON.errorGeneric);
        return;
      }
      window.location.href = json.data.portalUrl as string;
    } catch {
      setError(APP.COMMON.errorGeneric);
    } finally {
      setOpeningPortal(false);
    }
  }

  if (!profile && !error) return <BillingSkeleton />;

  if (!profile) {
    return (
      <Card className="p-6">
        <p className="text-sm text-red-600 dark:text-red-400">{error}</p>
      </Card>
    );
  }

  const tier = TIER_LABELS[profile.subscriptionTier];
  const isTrial = profile.subscriptionTier === "trial";

  return (
    <>
      <div className="rounded-lg bg-gray-50 p-6 ring-1 ring-inset ring-gray-200 dark:bg-gray-400/10 dark:ring-gray-800">
        <div className="flex flex-col gap-2 tablet-sm:flex-row tablet-sm:items-center tablet-sm:justify-between">
          <div>
            <h4 className="text-sm font-medium text-gray-900 dark:text-gray-50">
              {APP.SETTINGS_BILLING.currentPlan}: {tier.label}
            </h4>
            <p className="mt-1 max-w-2xl text-sm leading-6 text-gray-500">
              {isTrial ? (
                APP.SETTINGS_BILLING.trialActive
              ) : (
                <>
                  Unlock more channels and higher video limits on the Creator
                  or Studio plan.{" "}
                  <Link
                    href="/pricing"
                    className="inline-flex items-center gap-1 text-brand-500 dark:text-brand-400"
                  >
                    Compare plans →
                  </Link>
                </>
              )}
            </p>
          </div>
          {isTrial ? (
            <Button asChild>
              <Link href="/pricing">{APP.SETTINGS_BILLING.upgrade}</Link>
            </Button>
          ) : (
            <Badge variant="success">${tier.price}{APP.SETTINGS_BILLING.perMonth}</Badge>
          )}
        </div>
        {isTrial && (
          <p className="mt-3 text-sm leading-6 text-gray-500">
            {APP.SETTINGS_BILLING.afterTrialNote}
          </p>
        )}
      </div>

      <div className="mt-6">
        <section aria-labelledby="usage-meter">
          <div className="grid grid-cols-1 gap-x-14 gap-y-8 md:grid-cols-3">
            <div>
              <h2
                id="usage-meter"
                className="scroll-mt-10 font-medium text-gray-900 dark:text-gray-50"
              >
                {APP.SETTINGS_BILLING.usageTitle}
              </h2>
              <p className="mt-1 text-sm leading-6 text-gray-500">
                {APP.SETTINGS_BILLING.usagePending}
              </p>
            </div>
            <div className="md:col-span-2">
              <Card className="p-4">
                <dl className="space-y-2 text-sm text-gray-700 dark:text-gray-300">
                  <div className="flex items-center justify-between">
                    <dt className="text-gray-500">
                      {APP.SETTINGS_BILLING.usageVideos(0, 40).replace(
                        /^0/,
                        "—"
                      )}
                    </dt>
                  </div>
                  <div className="flex items-center justify-between">
                    <dt className="text-gray-500">
                      {APP.SETTINGS_BILLING.usagePlatforms(
                        profile.platforms?.length ?? 0,
                        4
                      )}
                    </dt>
                  </div>
                  {profile.trialEndsAt && (
                    <div className="flex items-center justify-between">
                      <dt className="text-gray-500">
                        {APP.SETTINGS_BILLING.usageRenews(
                          new Date(profile.trialEndsAt).toLocaleDateString()
                        )}
                      </dt>
                    </div>
                  )}
                </dl>
              </Card>
            </div>
          </div>
        </section>
      </div>

      <div className="mt-6 space-y-10">
        <section aria-labelledby="payment-method">
          <div className="grid grid-cols-1 gap-x-14 gap-y-8 md:grid-cols-3">
            <div>
              <h2
                id="payment-method"
                className="scroll-mt-10 font-medium text-gray-900 dark:text-gray-50"
              >
                {APP.SETTINGS_BILLING.manageBilling}
              </h2>
              <p className="mt-1 text-sm leading-6 text-gray-500">
                {APP.SETTINGS_BILLING.manageBillingDescription}
              </p>
            </div>
            <div className="md:col-span-2">
              <Button
                variant="secondary"
                onClick={openBillingPortal}
                disabled={openingPortal || isTrial}
                title={
                  isTrial
                    ? "Available after activating a paid plan"
                    : undefined
                }
              >
                {openingPortal
                  ? "Opening..."
                  : APP.SETTINGS_BILLING.billingPortalCta}
              </Button>
              {error && (
                <p className="mt-2 text-sm text-red-600 dark:text-red-400">
                  {error}
                </p>
              )}
            </div>
          </div>
        </section>

        <Divider />

        <section aria-labelledby="cancellation-policy">
          <div className="grid grid-cols-1 gap-x-14 gap-y-8 md:grid-cols-3">
            <div>
              <h2
                id="cancellation-policy"
                className="scroll-mt-10 font-medium text-gray-900 dark:text-gray-50"
              >
                {APP.SETTINGS_BILLING.cancellationPolicyTitle}
              </h2>
            </div>
            <div className="md:col-span-2">
              <p className="text-sm leading-6 text-gray-500">
                {APP.SETTINGS_BILLING.cancellationPolicyBody}
              </p>
            </div>
          </div>
        </section>

        <Divider />

        <section aria-labelledby="change-plan">
          <div className="grid grid-cols-1 gap-x-14 gap-y-8 md:grid-cols-3">
            <div>
              <h2
                id="change-plan"
                className="scroll-mt-10 font-medium text-gray-900 dark:text-gray-50"
              >
                Change plan
              </h2>
              <p className="mt-1 text-sm leading-6 text-gray-500">
                Switch tiers anytime. Changes take effect at the next billing
                cycle.
              </p>
            </div>
            <div className="md:col-span-2 grid gap-3 tablet-sm:grid-cols-3">
              {(["solo", "creator", "studio"] as const).map((id) => {
                const t = TIER_LABELS[id];
                const isCurrent = profile.subscriptionTier === id;
                return (
                  <Card key={id} className="p-4 flex flex-col">
                    <p className="text-sm font-medium text-gray-900 dark:text-gray-50">
                      {t.label}
                    </p>
                    <p className="mt-1 text-2xl font-medium text-gray-900 dark:text-gray-50">
                      ${t.price}
                      <span className="ml-1 text-sm font-normal text-gray-500">
                        {APP.SETTINGS_BILLING.perMonth}
                      </span>
                    </p>
                    <div className="flex-1" />
                    <Button
                      variant={isCurrent ? "secondary" : "primary"}
                      disabled={isCurrent || switchingTo !== null}
                      onClick={() => switchPlan(id)}
                      className="mt-4"
                    >
                      {isCurrent
                        ? "Current"
                        : switchingTo === id
                          ? "Opening…"
                          : `Switch to ${t.label}`}
                    </Button>
                  </Card>
                );
              })}
            </div>
          </div>
        </section>

        <Divider />

        <section aria-labelledby="avatar-mode">
          <div className="grid grid-cols-1 gap-x-14 gap-y-8 md:grid-cols-3">
            <div>
              <h2
                id="avatar-mode"
                className="scroll-mt-10 font-medium text-gray-900 dark:text-gray-50"
              >
                {APP.SETTINGS_BILLING.avatarTitle}
                <Badge variant="default" className="ml-2">
                  {APP.SETTINGS_BILLING.avatarComingSoon}
                </Badge>
              </h2>
              <p className="mt-1 text-sm leading-6 text-gray-500">
                {APP.SETTINGS_BILLING.avatarDescription}
              </p>
            </div>
            <div className="md:col-span-2">
              <Button asChild variant="secondary">
                <Link href="/waitlist">{APP.SETTINGS_BILLING.avatarCta}</Link>
              </Button>
            </div>
          </div>
        </section>
      </div>
    </>
  );
}

function BillingSkeleton() {
  return (
    <div className="space-y-4">
      <div className="h-24 animate-pulse rounded-lg bg-gray-100 dark:bg-gray-900" />
      <div className="h-32 animate-pulse rounded-lg bg-gray-100 dark:bg-gray-900" />
    </div>
  );
}
