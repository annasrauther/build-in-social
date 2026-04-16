"use client"

import { TabNavigation, TabNavigationLink } from "@/components/tremor/TabNavigation"
import Link from "next/link"
import { usePathname } from "next/navigation"

const navigationSettings = [
  { name: "Profile", href: "/settings/profile" },
  { name: "Platforms", href: "/settings/platforms" },
  { name: "Voice", href: "/settings/voice" },
  { name: "Billing", href: "/settings/billing" },
]

export default function SettingsLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  const pathname = usePathname()
  return (
    <div className="p-4 sm:px-6 sm:pb-10 sm:pt-10 lg:px-10 lg:pt-7">
      <h1 className="text-lg font-semibold text-gray-900 sm:text-xl dark:text-gray-50">
        Settings
      </h1>
      <TabNavigation className="mt-4 sm:mt-6 lg:mt-10">
        {navigationSettings.map((item) => (
          <TabNavigationLink
            key={item.name}
            asChild
            active={pathname === item.href}
          >
            <Link href={item.href}>{item.name}</Link>
          </TabNavigationLink>
        ))}
      </TabNavigation>
      <div className="pt-6">{children}</div>
    </div>
  )
}
