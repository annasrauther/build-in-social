"use client"

import { RiArrowRightUpLine } from "@remixicon/react"
import Link from "next/link"
import { Wordmark } from "@/components/ui/Wordmark"
import ThemeSwitch from "@/components/tremor/ThemeSwitch"

const NAV = [
  { name: "How it works", href: "#how-it-works" },
  { name: "Pricing", href: "/pricing" },
  { name: "Changelog", href: "/changelog" },
  { name: "Docs", href: "/docs" },
  { name: "About", href: "/about" },
  { name: "Privacy", href: "/privacy" },
  { name: "Terms", href: "/terms" },
]

const SOCIAL = [
  { name: "X / Twitter", href: "https://x.com/buildinsocial" },
]

export default function Footer() {
  return (
    <footer id="footer" className="border-t border-gray-200 dark:border-gray-800">
      <div className="mx-auto max-w-6xl px-4 py-12 sm:px-6 lg:px-8">
        <div className="flex flex-col gap-10 sm:flex-row sm:items-start sm:justify-between">

          {/* Brand */}
          <div className="flex flex-col gap-5">
            <Wordmark size={17} />
            <p className="max-w-xs text-sm leading-relaxed text-gray-500 dark:text-gray-400">
              Social media distribution for indie developers and SaaS founders.
              Platform-native video for YouTube, Instagram, LinkedIn, and X.
            </p>
            <ThemeSwitch />
          </div>

          {/* Nav links — two columns */}
          <div className="grid grid-cols-2 gap-x-16 gap-y-3 sm:gap-x-20">
            {NAV.map((item) => (
              <Link
                key={item.name}
                href={item.href}
                className="w-fit text-sm text-gray-500 transition-colors hover:text-gray-900 dark:text-gray-400 dark:hover:text-gray-50"
              >
                {item.name}
              </Link>
            ))}
            {SOCIAL.map((item) => (
              <a
                key={item.name}
                href={item.href}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex w-fit items-center gap-1 text-sm text-gray-500 transition-colors hover:text-gray-900 dark:text-gray-400 dark:hover:text-gray-50"
              >
                {item.name}
                <RiArrowRightUpLine className="size-3 opacity-60" aria-hidden="true" />
              </a>
            ))}
          </div>
        </div>

        {/* Bottom bar */}
        <div className="mt-12 flex flex-col items-start justify-between gap-4 border-t border-gray-200 pt-8 sm:flex-row sm:items-center dark:border-gray-800">
          <p className="text-xs text-gray-400 dark:text-gray-500">
            &copy; {new Date().getFullYear()} Build In Social. All rights reserved.
          </p>
          <div className="flex min-h-[44px] items-center gap-1.5 rounded-full border border-gray-200 px-3 py-2.5 dark:border-gray-800">
            <span className="relative flex size-2">
              <span className="absolute inline-flex size-full animate-ping rounded-full bg-emerald-400 opacity-60" />
              <span className="relative inline-flex size-2 rounded-full bg-emerald-500" />
            </span>
            <span className="text-xs text-gray-600 dark:text-gray-400">All systems operational</span>
          </div>
        </div>
      </div>
    </footer>
  )
}
