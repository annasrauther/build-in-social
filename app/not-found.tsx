"use client";

import Link from "next/link";
import { Button } from "@/components/tremor/Button";

export default function NotFound() {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center p-6 text-center bg-white dark:bg-gray-950">
      <div className="text-[64px] font-bold mb-6 font-mono text-gray-300 dark:text-gray-700">
        404
      </div>
      <h1 className="text-lg font-semibold mb-2 text-gray-900 dark:text-gray-50">
        Page not found
      </h1>
      <p className="text-sm max-w-xs mb-6 text-gray-500 dark:text-gray-400">
        The page you&apos;re looking for doesn&apos;t exist or has been moved.
      </p>
      <Link href="/dashboard">
        <Button>Back to dashboard</Button>
      </Link>
    </div>
  );
}
