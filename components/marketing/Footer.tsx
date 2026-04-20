"use client"

import Link from "next/link"
import { Wordmark } from "@/components/ui/Wordmark"
import ThemeSwitch from "@/components/tremor/ThemeSwitch"
import { LANDING } from "@/content/landing"

const LINKS: { name: string; href: string }[] = [
  { name: "Pricing", href: "/pricing" },
  { name: "About", href: "/about" },
  { name: "Privacy", href: "/privacy" },
  { name: "Terms", href: "/terms" },
  { name: "Support", href: "mailto:support@buildinsocial.com" },
  { name: "Data partners", href: "/subprocessors" },
  { name: "Data residency", href: "/subprocessors#residency" },
]

export default function Footer() {
  return (
    <footer className="border-t border-[var(--border-default)]">
      <div className="mx-auto max-w-6xl px-4 py-6 sm:px-6 lg:px-8">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">

          {/* Left — brand + links */}
          <div className="flex flex-wrap items-center gap-x-6 gap-y-2">
            <Wordmark size={16} />
            {LINKS.map((item) => (
              <Link
                key={item.name}
                href={item.href}
                className="py-3 px-1 text-xs text-gray-600 dark:text-gray-300 transition-colors hover:text-[var(--text-primary)]"
              >
                {item.name}
              </Link>
            ))}
          </div>

          {/* Right — theme toggle */}
          <ThemeSwitch />
        </div>

        {LANDING.FOOTER.dataLine ? (
          <p className="mt-4 text-xs text-[var(--text-tertiary)]">
            {LANDING.FOOTER.dataLine}
          </p>
        ) : null}

        <p className="mt-2 text-xs text-[var(--text-tertiary)]">
          &copy; {new Date().getFullYear()} Build In Social. All rights reserved.
        </p>
      </div>
    </footer>
  )
}
