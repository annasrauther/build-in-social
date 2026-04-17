"use client"
import { cx, focusRing } from "@/lib/utils"
import {
  RiHome2Line,
  RiCalendarLine,
  RiVideoLine,
  RiSettings5Line,
  RiQuestionLine,
} from "@remixicon/react"
import { Wordmark } from "@/components/ui/Wordmark"
import Link from "next/link"
import { usePathname } from "next/navigation"
import MobileSidebar from "./MobileSidebar"
import { UserProfileDesktop, UserProfileMobile } from "./UserProfile"

const navigation = [
  { name: "Dashboard", href: "/dashboard", icon: RiHome2Line },
  { name: "This week", href: "/plan", icon: RiCalendarLine },
  { name: "Videos", href: "/videos", icon: RiVideoLine },
  { name: "Settings", href: "/settings/profile", icon: RiSettings5Line },
] as const

export function Sidebar() {
  const pathname = usePathname()
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
      {/* sidebar (lg+) */}
      <nav className="hidden lg:fixed lg:inset-y-0 lg:z-50 lg:flex lg:w-72 lg:flex-col">
        <aside className="flex grow flex-col gap-y-6 overflow-y-auto p-4 border-r border-[color:var(--border-default)] bg-[color:var(--bg-surface)]">
          <Link href="/dashboard" className="flex items-center px-2 py-1">
            <Wordmark size={20} />
          </Link>
          <nav
            aria-label="core navigation links"
            className="flex flex-1 flex-col space-y-10"
          >
            <ul role="list" className="space-y-0.5">
              {navigation.map((item) => (
                <li key={item.name}>
                  <Link
                    href={item.href}
                    className={cx(
                      isActive(item.href)
                        ? "text-brand-500 dark:text-brand-400"
                        : "text-gray-700 hover:text-gray-900 dark:text-gray-400 hover:dark:text-gray-50",
                      "flex items-center gap-x-2.5 rounded-md px-2 py-1.5 text-sm font-medium transition hover:bg-gray-100 hover:dark:bg-gray-900",
                      focusRing,
                    )}
                  >
                    <item.icon className="size-4 shrink-0" aria-hidden="true" />
                    {item.name}
                  </Link>
                </li>
              ))}
            </ul>
            <div>
              <span className="text-xs font-medium leading-6 text-gray-500">
                Quick links
              </span>
              <ul aria-label="quick links" role="list" className="space-y-0.5">
                <li>
                  <a
                    href="https://buildinsocial.com"
                    target="_blank"
                    rel="noopener noreferrer"
                    className={cx(
                      "text-gray-700 hover:text-gray-900 dark:text-gray-400 hover:dark:text-gray-50",
                      "flex items-center gap-x-2.5 rounded-md px-2 py-1.5 text-sm font-medium transition hover:bg-gray-100 hover:dark:bg-gray-900",
                      focusRing,
                    )}
                  >
                    <RiQuestionLine className="size-4 shrink-0" aria-hidden="true" />
                    Help
                  </a>
                </li>
              </ul>
            </div>
          </nav>
          <div className="mt-auto">
            <UserProfileDesktop />
          </div>
        </aside>
      </nav>
      {/* top navbar (xs-lg) */}
      <div className="sticky top-0 z-40 flex h-16 shrink-0 items-center justify-between px-2 shadow-sm sm:gap-x-6 sm:px-4 lg:hidden border-b border-[color:var(--border-default)] bg-[color:var(--bg-surface)]">
        <Link href="/dashboard" className="flex items-center">
          <Wordmark size={20} />
        </Link>
        <div className="flex items-center gap-1 sm:gap-2">
          <UserProfileMobile />
          <MobileSidebar />
        </div>
      </div>
    </>
  )
}
