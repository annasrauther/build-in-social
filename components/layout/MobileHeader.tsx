"use client";

import Link from "next/link";
import { Wordmark } from "@/components/ui/Wordmark";

export function MobileHeader(): React.ReactElement {
  return (
    <header
      className="fixed top-0 left-0 right-0 z-50 flex items-center justify-between px-4 tablet-sm:hidden"
      style={{
        height: 56,
        backgroundColor: "var(--bg-page)",
        borderBottom: "1px solid var(--border-default)",
      }}
    >
      <Link href="/" style={{ textDecoration: "none" }}>
        <Wordmark size={18} />
      </Link>

      <Link
        href="/settings/profile"
        className="w-9 h-9 rounded-full flex items-center justify-center text-[13px] font-medium transition-opacity hover:opacity-80"
        style={{
          backgroundColor: "var(--bg-elevated)",
          color: "var(--text-secondary)",
        }}
        aria-label="Profile settings"
      >
        U
      </Link>
    </header>
  );
}
