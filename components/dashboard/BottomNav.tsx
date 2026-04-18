"use client"

import { cx, focusRing } from "@/lib/utils"
import {
  RiCalendarLine,
  RiDashboardLine,
  RiPlayListLine,
  RiSettings3Line,
} from "@remixicon/react"
import Link from "next/link"
import { usePathname } from "next/navigation"
import { motion } from "framer-motion"
import { APP } from "@/content/app"

type Tab = {
  name: string
  href: string
  base: string
  icon: typeof RiDashboardLine
}

const TABS: readonly Tab[] = [
  {
    name: APP.DASHBOARD_NAV.dashboardLabel,
    href: "/dashboard",
    base: "/dashboard",
    icon: RiDashboardLine,
  },
  {
    name: APP.DASHBOARD_NAV.planLabel,
    href: "/plan/current",
    base: "/plan",
    icon: RiCalendarLine,
  },
  {
    name: APP.DASHBOARD_NAV.videosLabel,
    href: "/videos",
    base: "/videos",
    icon: RiPlayListLine,
  },
  {
    name: APP.DASHBOARD_NAV.settingsLabel,
    href: "/settings",
    base: "/settings",
    icon: RiSettings3Line,
  },
] as const

export function BottomNav() {
  const pathname = usePathname()

  const isActive = (base: string) =>
    pathname === base || pathname.startsWith(`${base}/`)

  return (
    <nav
      aria-label="Primary"
      className={cx(
        "fixed inset-x-0 bottom-0 z-50 lg:hidden",
        "border-t border-[color:var(--border-default)] bg-[color:var(--bg-surface)]",
        "pb-[env(safe-area-inset-bottom)]",
      )}
    >
      <ul role="list" className="flex items-stretch">
        {TABS.map((tab) => {
          const active = isActive(tab.base)
          return (
            <li key={tab.name} className="flex-1">
              <Link
                href={tab.href}
                aria-current={active ? "page" : undefined}
                className={cx(
                  "relative flex min-h-[56px] flex-col items-center justify-center gap-0.5 px-2 py-2 text-xs font-medium transition-colors",
                  active
                    ? "text-brand-500 dark:text-brand-400"
                    : "text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-200",
                  focusRing,
                )}
              >
                {active && (
                  <motion.span
                    layoutId="bottom-nav-active"
                    aria-hidden="true"
                    className="absolute inset-x-4 top-0 h-0.5 rounded-full bg-brand-500 dark:bg-brand-400"
                    transition={{ type: "spring", stiffness: 500, damping: 40 }}
                  />
                )}
                <tab.icon className="size-5 shrink-0" aria-hidden="true" />
                <span>{tab.name}</span>
              </Link>
            </li>
          )
        })}
      </ul>
    </nav>
  )
}

export default BottomNav
