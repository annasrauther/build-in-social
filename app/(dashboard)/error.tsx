"use client";

import { useEffect } from "react";
import { StatusCard } from "@/components/ui/StatusCard";
import { APP } from "@/content/app";

export default function DashboardError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error("[dashboard error]", error);
  }, [error]);

  return (
    <div className="p-4 sm:px-6 sm:pb-10 sm:pt-10 lg:px-10 lg:pt-7">
      <StatusCard
        variant="error"
        title="Something went wrong"
        description={APP.COMMON.errorGeneric}
        cta={APP.COMMON.retry}
        onCta={() => reset()}
        secondaryCta="Back to dashboard"
        secondaryCtaHref="/dashboard"
      />
    </div>
  );
}
