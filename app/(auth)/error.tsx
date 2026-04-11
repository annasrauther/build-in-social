"use client";

import { useEffect } from "react";
import { Button, KIND } from "baseui/button";

export default function AuthError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error(error);
  }, [error]);

  return (
    <div className="flex flex-col items-center justify-center min-h-[60vh] p-6 text-center">
      <h1 className="text-[18px] mb-2" style={{ color: "var(--text-primary)" }}>
        Something went wrong
      </h1>
      <p className="text-[14px] max-w-xs mb-6" style={{ color: "var(--text-secondary)" }}>
        We hit an unexpected error. This has been logged.
      </p>
      <div className="flex gap-3">
        <Button onClick={reset}>Try again</Button>
        <Button kind={KIND.tertiary} onClick={() => window.location.href = "/dashboard"}>
          Go to dashboard
        </Button>
      </div>
    </div>
  );
}
