import Link from "next/link";
import type { Metadata } from "next";
import {
  Bell,
  Briefcase,
  Palette,
  Plug,
} from "lucide-react";

/**
 * Settings index — consolidated to 4 groups per F6 Phase 6 rule.
 * Individual sub-routes remain for deep-linking from anywhere in the app.
 */

export const metadata: Metadata = {
  title: "Settings",
  description: "Account, brand, connections, and automation settings.",
};

interface Group {
  href: string;
  title: string;
  description: string;
  icon: typeof Briefcase;
  items: readonly string[];
}

const GROUPS: readonly Group[] = [
  {
    href: "/settings/profile",
    title: "Account",
    description: "Profile, billing, and plan.",
    icon: Briefcase,
    items: ["Profile", "Billing"],
  },
  {
    href: "/settings/brand",
    title: "Brand",
    description: "Voice, avatar, and publishing defaults.",
    icon: Palette,
    items: ["Brand", "Voice", "Avatar", "Publishing"],
  },
  {
    href: "/settings/platforms",
    title: "Connections",
    description: "Platforms, webhooks, integrations.",
    icon: Plug,
    items: ["Platforms", "Webhooks"],
  },
  {
    href: "/settings/automation",
    title: "Automation",
    description: "Autopilot rules and notifications.",
    icon: Bell,
    items: ["Automation"],
  },
];

export default function SettingsIndex() {
  return (
    <div className="px-6 pt-6 pb-12 sm:px-8 max-w-3xl mx-auto">
      <header className="mb-6 flex flex-col gap-0.5">
        <h1 className="text-[20px] font-medium tracking-[-0.02em] leading-tight text-text">
          Settings
        </h1>
        <p className="text-[13px] leading-snug text-text-secondary">
          Four groups. Every sub-page is still reachable directly.
        </p>
      </header>

      <ul className="grid gap-3 sm:grid-cols-2">
        {GROUPS.map((g) => {
          const Icon = g.icon;
          return (
            <li key={g.href}>
              <Link
                href={g.href}
                prefetch
                className="group flex flex-col gap-2 p-4 rounded-[var(--radius-card)] border border-[color:var(--border)] bg-surface hover:bg-[color-mix(in_srgb,var(--gray-12)_3%,var(--surface))] transition-colors duration-fast ease-out-cubic focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:[outline-color:var(--focus-ring)]"
              >
                <span className="inline-flex h-7 w-7 items-center justify-center rounded-[var(--radius-input)] bg-elevated text-text-secondary">
                  <Icon size={14} strokeWidth={1.5} aria-hidden="true" />
                </span>
                <div className="flex flex-col gap-1">
                  <h2 className="text-[14px] font-medium leading-tight text-text">
                    {g.title}
                  </h2>
                  <p className="text-[13px] leading-snug text-text-secondary">
                    {g.description}
                  </p>
                </div>
                <p className="text-[11px] uppercase tracking-wider text-text-tertiary font-mono tabular-nums">
                  {g.items.join(" · ")}
                </p>
              </Link>
            </li>
          );
        })}
      </ul>
    </div>
  );
}
