"use client";

import Link from "next/link";
import { Button } from "baseui/button";

export default function NotFound() {
  return (
    <div
      className="min-h-screen flex flex-col items-center justify-center p-6 text-center"
      style={{ backgroundColor: "var(--bg-page)" }}
    >
      <div
        className="text-[64px] font-bold mb-6"
        style={{ color: "var(--text-disabled)", fontFamily: "var(--font-mono)" }}
      >
        404
      </div>
      <h1 className="text-[18px] mb-2" style={{ color: "var(--text-primary)" }}>
        Page not found
      </h1>
      <p className="text-[14px] max-w-xs mb-6" style={{ color: "var(--text-secondary)" }}>
        The page you&apos;re looking for doesn&apos;t exist or has been moved.
      </p>
      <Link href="/dashboard">
        <Button>
          Back to dashboard
        </Button>
      </Link>
    </div>
  );
}
