import Hero from "@/components/marketing/Hero"
import LogoCloud from "@/components/marketing/LogoCloud"
import GlobalDatabaseClient from "@/components/marketing/GlobalDatabaseClient"
import CodeExample from "@/components/marketing/CodeExample"
import Features from "@/components/marketing/Features"
import Cta from "@/components/marketing/Cta"
import PartnerCallout from "@/components/marketing/PartnerCallout"

export default function Home() {
  return (
    <main id="main-content" className="flex flex-col overflow-hidden">
      <Hero />
      <LogoCloud />
      <GlobalDatabaseClient />
      <CodeExample />
      <Features />
      <PartnerCallout />
      <Cta />
    </main>
  )
}
