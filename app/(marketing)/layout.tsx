import Footer from "@/components/marketing/Footer"
import { Navigation } from "@/components/marketing/Navbar"
import { APP } from "@/content/app"

export default function MarketingLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <>
      <a
        href="#main-content"
        className="sr-only focus:not-sr-only focus:absolute focus:z-50 focus:p-4 focus:bg-white focus:text-gray-900 dark:focus:bg-gray-900 dark:focus:text-gray-50"
      >
        {APP.A11Y.skipToContent}
      </a>
      <Navigation />
      {children}
      <Footer />
    </>
  )
}
