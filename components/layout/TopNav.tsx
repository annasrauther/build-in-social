"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

const pageTitles: Record<string, string> = {
  "/dashboard": "Dashboard",
  "/plan/current": "This Week",
  "/videos": "Content Library",
  "/intelligence": "Intelligence",
  "/settings": "Settings",
  "/onboarding": "Get Started",
  "/waitlist": "Avatar Waitlist",
};

export function TopNav(): React.ReactElement {
  const pathname = usePathname();

  const title = Object.entries(pageTitles).find(([path]) =>
    pathname.startsWith(path)
  )?.[1] ?? "";

  return (
    <header
      className="fixed top-0 right-0 left-[64px] tablet-lg:left-[240px] z-40 flex items-center justify-between px-6 tablet-sm:px-8 tablet-lg:px-10"
      style={{
        height: 75,
        borderBottom: "1px solid var(--border-default)",
        backgroundColor: "var(--bg-page)",
      }}
    >
      <h1
        className="text-[var(--type-display-mobile)] tablet-sm:text-[var(--type-display-desktop)]"
        style={{ color: "var(--text-primary)", letterSpacing: "-0.02em", fontFamily: "var(--font-heading)", fontWeight: 400, lineHeight: 1.2 }}
      >
        {title}
      </h1>

      <div className="flex items-center gap-3">
        <Link
          href="/settings/profile"
          className="w-9 h-9 rounded-full flex items-center justify-center text-[13px] font-medium transition-opacity hover:opacity-80"
          style={{
            backgroundColor: "var(--bg-elevated)",
            color: "var(--text-secondary)",
          }}
          aria-label="Profile settings"
          title="Profile settings"
        >
          U
        </Link>
      </div>
    </header>
  );
}
