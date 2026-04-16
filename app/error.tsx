"use client";

import { useEffect } from "react";
import Link from "next/link";
import { Button } from "@/components/tremor/Button";

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
    <div className="min-h-screen flex flex-col items-center justify-center p-6 text-center bg-white dark:bg-gray-950">
      <h1 className="text-lg font-semibold mb-2 text-gray-900 dark:text-gray-50">
        Something went wrong
      </h1>
      <p className="text-sm max-w-xs mb-6 text-gray-500 dark:text-gray-400">
        We hit an unexpected error. This has been logged.
      </p>
      <div className="flex gap-3">
        <Button onClick={reset}>Try again</Button>
        <Link href="/dashboard">
          <Button variant="secondary">Go to dashboard</Button>
        </Link>
      </div>
    </div>
  );
}
