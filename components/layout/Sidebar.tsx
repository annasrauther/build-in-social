"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { motion } from "framer-motion";
import { clsx } from "clsx";
import {
  LayoutDashboard,
  Calendar,
  Film,
  BarChart3,
  Settings,
  Lock,
  LogOut,
} from "lucide-react";
import { SignOutButton } from "@clerk/nextjs";
import { Badge } from "@/components/ui/Badge";
import { Wordmark } from "@/components/ui/Wordmark";
import { navPillTransition } from "@/lib/motion";

const hasClerk = !!process.env.NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY;

const navItems = [
  { href: "/dashboard", label: "Dashboard", icon: LayoutDashboard },
  { href: "/plan/current", label: "This week", icon: Calendar },
  { href: "/videos", label: "Content library", icon: Film },
  {
    href: "/intelligence",
    label: "Intelligence",
    icon: BarChart3,
    locked: true,
    lockedTitle: "Unlocks after 5 published videos",
  },
];

const platformItems = [
  { label: "YouTube Shorts", letter: "Y", connected: true },
  { label: "Instagram Reels", letter: "I", connected: true },
  { label: "LinkedIn", letter: "L", connected: false },
  { label: "X", letter: "X", connected: true },
];

export function Sidebar(): React.ReactElement {
  const pathname = usePathname();

  return (
    <aside
      className="hidden tablet-lg:flex fixed left-0 top-0 bottom-0 w-[240px] flex-col"
      style={{
        backgroundColor: "var(--bg-surface)",
        borderRight: "1px solid var(--border-subtle)",
      }}
    >
      {/* Logo */}
      <div className="px-4 py-5">
        <Link href="/" style={{ textDecoration: "none" }}>
          <Wordmark size={18} />
        </Link>
      </div>

      {/* Navigation */}
      <nav className="flex-1 px-3">
        <ul className="space-y-1">
          {navItems.map((item) => {
            const isActive = pathname.startsWith(item.href);
            return (
              <li key={item.href} className="relative">
                {isActive && (
                  <motion.div
                    layoutId="nav-pill"
                    className="absolute inset-0 rounded-[var(--radius-sm)]"
                    style={{ backgroundColor: "var(--bg-elevated)" }}
                    transition={navPillTransition}
                  />
                )}
                <Link
                  href={item.href}
                  title={item.locked ? item.lockedTitle : undefined}
                  className={clsx(
                    "relative z-10 flex items-center gap-2.5 px-2 py-2 rounded-[var(--radius-sm)] text-[13px] transition-colors",
                    isActive
                      ? "font-medium"
                      : "hover:bg-[var(--bg-elevated)]"
                  )}
                  style={{
                    color: isActive ? "var(--text-primary)" : "var(--text-secondary)",
                  }}
                >
                  <item.icon size={16} />
                  <span>{item.label}</span>
                  {item.locked && (
                    <Lock size={12} style={{ color: "var(--text-disabled)" }} className="ml-auto" />
                  )}
                </Link>
              </li>
            );
          })}
        </ul>

        {/* Platforms */}
        <div
          className="text-[var(--type-micro)] font-medium uppercase tracking-[0.07em] px-2 mb-2 mt-6"
          style={{ color: "var(--text-tertiary)" }}
        >
          Platforms
        </div>
        <ul className="space-y-0.5">
          {platformItems.map((item) => (
            <li key={item.label}>
              <div
                className="flex items-center gap-2.5 px-2 py-2.5 text-[13px]"
                style={{ color: "var(--text-secondary)", minHeight: 44 }}
              >
                <span
                  className="w-3.5 h-3.5 rounded-sm flex items-center justify-center text-[9px] font-medium"
                  style={{ backgroundColor: "var(--bg-elevated)", color: "var(--text-tertiary)" }}
                >
                  {item.letter}
                </span>
                <span>{item.label}</span>
                <span
                  className={clsx(
                    "ml-auto w-2 h-2 rounded-full",
                    item.connected && "platform-dot-connected"
                  )}
                  title={item.connected ? "Connected" : "Not connected"}
                  style={{
                    backgroundColor: item.connected ? "var(--success)" : "var(--text-disabled)",
                  }}
                />
              </div>
            </li>
          ))}
        </ul>
      </nav>

      {/* Bottom section */}
      <div className="px-3 pb-4 space-y-0.5">
        <div
          className="border-t mb-3"
          style={{ borderColor: "var(--border-subtle)" }}
        />
        <Link
          href="/settings"
          className="flex items-center gap-2.5 px-2 py-2 rounded-[var(--radius-sm)] text-[13px] transition-colors hover:bg-[var(--bg-elevated)]"
          style={{ color: "var(--text-secondary)" }}
        >
          <Settings size={16} />
          <span>Settings</span>
        </Link>
        <div className="px-2 mt-3">
          <Badge variant="accent">Creator Plan</Badge>
        </div>
        {hasClerk && (
          <SignOutButton redirectUrl="/">
            <button
              className="flex items-center gap-2.5 px-2 py-2 rounded-[var(--radius-sm)] text-[13px] transition-colors hover:bg-[var(--bg-elevated)] w-full mt-1"
              style={{ color: "var(--text-secondary)" }}
            >
              <LogOut size={16} />
              <span>Sign out</span>
            </button>
          </SignOutButton>
        )}
      </div>
    </aside>
  );
}
