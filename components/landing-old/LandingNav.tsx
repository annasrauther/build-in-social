"use client";

import Link from "next/link";
import { LANDING } from "@/content/landing";
import { PageHeader } from "@/components/ui/PageHeader";

/**
 * Landing nav — uses shared PageHeader, no border.
 */
export function LandingNav() {
  return (
    <PageHeader
      right={
        <Link
          href="/onboarding/hook"
          className="lp-btn-primary"
          style={{ fontSize: 14, height: 44, padding: "0 24px" }}
        >
          {LANDING.NAV.ctaLabel}
        </Link>
      }
    />
  );
}
