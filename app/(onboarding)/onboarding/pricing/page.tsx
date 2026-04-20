"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";

/**
 * Pricing is no longer a required onboarding step (users pick a tier after
 * the first-batch render). Anyone landing here mid-flow is redirected to the
 * activation step. The public /pricing marketing page remains the source
 * of truth for tier comparison.
 */
export default function PricingRedirectPage() {
  const router = useRouter();

  useEffect(() => {
    router.replace("/onboarding/activation");
  }, [router]);

  return null;
}
