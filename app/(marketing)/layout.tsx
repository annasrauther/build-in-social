import Footer from "@/components/marketing/Footer"
import { Navigation } from "@/components/marketing/Navbar"

export default function MarketingLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <>
      <Navigation />
      {children}
      <Footer />
    </>
  )
}
