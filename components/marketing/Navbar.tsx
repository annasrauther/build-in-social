"use client"

import { siteConfig } from "@/app/siteConfig"
import useScroll from "@/lib/hooks/use-scroll"
import { cx } from "@/lib/utils"
import { RiCloseLine, RiMenuLine } from "@remixicon/react"
import Link from "next/link"
import React from "react"
import { Wordmark } from "@/components/ui/Wordmark"
import { Button } from "@/components/tremor/Button"
import { ArrowAnimated } from "@/components/marketing/ArrowAnimated"
import { LANDING } from "@/content/landing"

// Focus-trap: returns all focusable elements within a container
function getFocusable(container: HTMLElement): HTMLElement[] {
  return Array.from(
    container.querySelectorAll<HTMLElement>(
      'a[href], button:not([disabled]), input:not([disabled]), select:not([disabled]), textarea:not([disabled]), [tabindex]:not([tabindex="-1"])',
    ),
  )
}

export function Navigation() {
  const scrolled = useScroll(15)
  const [open, setOpen] = React.useState(false)
  const toggleRef = React.useRef<HTMLButtonElement>(null)
  const drawerRef = React.useRef<HTMLElement>(null)

  React.useEffect(() => {
    const mediaQuery: MediaQueryList = window.matchMedia("(min-width: 768px)")
    const handleMediaQueryChange = () => {
      setOpen(false)
    }

    mediaQuery.addEventListener("change", handleMediaQueryChange)
    handleMediaQueryChange()

    return () => {
      mediaQuery.removeEventListener("change", handleMediaQueryChange)
    }
  }, [])

  // Body-scroll-lock when mobile drawer is open, restore previous value on close/unmount.
  React.useEffect(() => {
    if (typeof document === "undefined") return
    const previous = document.body.style.overflow
    if (open) {
      document.body.style.overflow = "hidden"
    } else {
      document.body.style.overflow = previous || ""
    }
    return () => {
      document.body.style.overflow = previous || ""
    }
  }, [open])

  // Focus trap + Escape key handler for the mobile drawer
  React.useEffect(() => {
    if (!open) return

    function handleKeyDown(e: KeyboardEvent) {
      if (e.key === "Escape") {
        setOpen(false)
        toggleRef.current?.focus()
        return
      }

      if (e.key !== "Tab") return

      const container = drawerRef.current
      if (!container) return
      const focusable = getFocusable(container)
      if (focusable.length === 0) return

      const first = focusable[0]
      const last = focusable[focusable.length - 1]

      if (e.shiftKey) {
        if (document.activeElement === first) {
          e.preventDefault()
          last.focus()
        }
      } else {
        if (document.activeElement === last) {
          e.preventDefault()
          first.focus()
        }
      }
    }

    document.addEventListener("keydown", handleKeyDown)
    return () => document.removeEventListener("keydown", handleKeyDown)
  }, [open])

  return (
    <header
      className={cx(
        "fixed inset-x-3 top-4 z-50 mx-auto flex max-w-6xl transform-gpu animate-slide-down-fade justify-center overflow-hidden rounded-xl border border-transparent px-3 py-3 pt-[max(0.75rem,env(safe-area-inset-top))] transition-all duration-300 ease-[cubic-bezier(0.16,1,0.3,1.03)] will-change-transform",
        open === true ? "h-[100dvh]" : "h-16",
        scrolled || open === true
          ? "backdrop-blur-nav max-w-3xl border-[color:var(--border)] bg-[color-mix(in_srgb,var(--surface)_80%,transparent)]"
          : "bg-transparent",
      )}
    >
      <div className="w-full md:my-auto">
        <div className="relative flex items-center justify-between">
          <Link href={siteConfig.baseLinks.home} aria-label="Home">
            <Wordmark size={20} />
          </Link>
          <nav className="hidden md:absolute md:left-1/2 md:top-1/2 md:block md:-translate-x-1/2 md:-translate-y-1/2 md:transform">
            <div className="flex items-center gap-10 font-medium">
              {LANDING.NAV.mainLinks.map((item) => (
                <Link
                  key={item.label}
                  className="inline-flex min-h-[44px] items-center px-3 py-2.5 text-text-secondary transition-colors duration-fast ease-out-cubic hover:text-text focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:[outline-color:var(--focus-ring)] rounded-sm"
                  href={item.href}
                >
                  {item.label}
                </Link>
              ))}
            </div>
          </nav>
          <div className="hidden items-center gap-x-3 md:flex">
            <Button asChild className="group h-10 font-semibold">
              <Link href="/signup" className="flex items-center">
                {LANDING.NAV.ctaLabel}
                <ArrowAnimated />
              </Link>
            </Button>
          </div>
          <div className="flex gap-x-2 md:hidden">
            <Button asChild className="group">
              <Link href="/signup" className="flex items-center">
                {LANDING.NAV.ctaLabel}
                <ArrowAnimated />
              </Link>
            </Button>
            <Button
              ref={toggleRef}
              onClick={() => setOpen(!open)}
              variant="light"
              className="aspect-square min-h-11 min-w-11 p-2"
              aria-label="Toggle navigation menu"
              aria-expanded={open}
              aria-controls="mobile-nav"
            >
              {open ? (
                <RiCloseLine aria-hidden="true" className="size-5" />
              ) : (
                <RiMenuLine aria-hidden="true" className="size-5" />
              )}
            </Button>
          </div>
        </div>
        <nav
          id="mobile-nav"
          ref={drawerRef}
          role="dialog"
          aria-modal="true"
          aria-label="Mobile navigation"
          className={cx(
            "my-6 flex text-lg ease-in-out will-change-transform md:hidden",
            open ? "" : "hidden",
          )}
        >
          <ul className="space-y-4 font-medium">
            {LANDING.NAV.mainLinks.map((item) => (
              <li key={item.label}>
                <Link
                  href={item.href}
                  onClick={() => {
                    setOpen(false)
                    toggleRef.current?.focus()
                  }}
                  className="inline-flex min-h-[44px] items-center transition-colors duration-150 hover:text-gray-900 dark:hover:text-gray-50 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand-500 rounded-sm"
                >
                  {item.label}
                </Link>
              </li>
            ))}
          </ul>
        </nav>
      </div>
    </header>
  )
}
