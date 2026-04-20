"use client"

import { useEffect, useState } from "react"
import { Button } from "@/components/tremor/Button"
import {
  Drawer,
  DrawerBody,
  DrawerClose,
  DrawerContent,
  DrawerHeader,
  DrawerTitle,
  DrawerTrigger,
} from "@/components/tremor/Drawer"
import { cx, focusRing } from "@/lib/utils"
import {
  RiHome2Line,
  RiCalendarLine,
  RiVideoLine,
  RiMoreLine,
  RiSettings5Line,
  RiQuestionLine,
  RiUser3Line,
} from "@remixicon/react"
import Link from "next/link"
import { usePathname } from "next/navigation"

// Primary navigation lives in BottomNav on mobile. This drawer is a secondary
// "more" menu — help, sign-out-adjacent links, and settings deep links.
const secondaryLinks = [
  { name: "Dashboard", href: "/dashboard", icon: RiHome2Line },
  { name: "This week", href: "/plan", icon: RiCalendarLine },
  { name: "Videos", href: "/videos", icon: RiVideoLine },
  { name: "Settings", href: "/settings/profile", icon: RiSettings5Line },
  { name: "Avatar Mode", href: "/waitlist", icon: RiUser3Line, comingSoon: true },
  { name: "Help", href: "https://buildinsocial.com", icon: RiQuestionLine },
] as const

export default function MobileSidebar() {
  const pathname = usePathname()
  const [open, setOpen] = useState(false)

  // P2-18: body-scroll-lock while drawer is open. Radix Dialog handles this
  // already, but we belt-and-suspenders on mobile to avoid iOS rubber-band
  // scroll leaks when content is short.
  useEffect(() => {
    if (!open) return
    const originalOverflow = document.body.style.overflow
    document.body.style.overflow = "hidden"
    return () => {
      document.body.style.overflow = originalOverflow
    }
  }, [open])

  const isActive = (itemHref: string) => {
    if (itemHref === "/settings/profile") {
      return pathname.startsWith("/settings")
    }
    if (itemHref === "/plan") {
      return pathname.startsWith("/plan")
    }
    return pathname === itemHref || pathname.startsWith(itemHref)
  }
  return (
    <>
      <Drawer open={open} onOpenChange={setOpen}>
        <DrawerTrigger asChild>
          <Button
            variant="ghost"
            aria-label="Open more menu"
            className="group flex items-center rounded-md p-2 text-sm font-medium hover:bg-gray-100 data-[state=open]:bg-gray-100 data-[state=open]:bg-gray-400/10 hover:dark:bg-gray-400/10"
          >
            <RiMoreLine
              className="size-6 shrink-0 sm:size-5"
              aria-hidden="true"
            />
          </Button>
        </DrawerTrigger>
        <DrawerContent className="sm:max-w-lg">
          <DrawerHeader>
            <DrawerTitle>More</DrawerTitle>
          </DrawerHeader>
          <DrawerBody>
            <nav
              aria-label="secondary mobile navigation links"
              className="flex flex-1 flex-col space-y-10"
            >
              <ul role="list" className="space-y-1.5">
                {secondaryLinks.map((item) => (
                  <li key={item.name}>
                    <DrawerClose asChild>
                      <Link
                        href={item.href}
                        className={cx(
                          isActive(item.href)
                            ? "text-brand-500 dark:text-brand-400"
                            : "text-gray-600 hover:text-gray-900 dark:text-gray-400 hover:dark:text-gray-50",
                          "flex items-center gap-x-2.5 rounded-md px-2 py-2.5 min-h-[44px] text-base font-medium transition hover:bg-gray-100 sm:py-1.5 sm:min-h-0 sm:text-sm hover:dark:bg-gray-900",
                          focusRing,
                        )}
                      >
                        <item.icon
                          className="size-5 shrink-0"
                          aria-hidden="true"
                        />
                        {item.name}
                        {"comingSoon" in item && item.comingSoon && (
                          <span className="ml-auto rounded-full bg-brand-100 px-2 py-0.5 text-[10px] font-semibold text-brand-600 dark:bg-brand-950/60 dark:text-brand-300">
                            Soon
                          </span>
                        )}
                      </Link>
                    </DrawerClose>
                  </li>
                ))}
              </ul>
            </nav>
          </DrawerBody>
        </DrawerContent>
      </Drawer>
    </>
  )
}
