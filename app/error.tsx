"use client";

import { useEffect } from "react";
import Link from "next/link";
import { Button, KIND } from "baseui/button";

export default function GlobalError({
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
    <div
      className="min-h-screen flex flex-col items-center justify-center p-6 text-center"
      style={{ backgroundColor: "var(--bg-page)" }}
    >
      <h1 className="text-[18px] mb-2" style={{ color: "var(--text-primary)" }}>
        Something went wrong
      </h1>
      <p className="text-[14px] max-w-xs mb-6" style={{ color: "var(--text-secondary)" }}>
        We hit an unexpected error. This has been logged.
      </p>
      <div className="flex gap-3">
        <Button onClick={reset}>
          Try again
        </Button>
        <Link href="/dashboard">
          <Button kind={KIND.secondary}>
            Go to dashboard
          </Button>
        </Link>
      </div>
    </div>
  );
}
