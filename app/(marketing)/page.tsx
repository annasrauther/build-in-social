import Hero from "@/components/marketing/Hero"
import LogoCloud from "@/components/marketing/LogoCloud"
import GlobalDatabaseClient from "@/components/marketing/GlobalDatabaseClient"
import CodeExample from "@/components/marketing/CodeExample"
import Features from "@/components/marketing/Features"
import Benefits from "@/components/marketing/Benefits"
import Testimonial from "@/components/marketing/Testimonial"
import { Faqs } from "@/components/marketing/Faqs"
import Pricing from "@/components/marketing/Pricing"
import PartnerCallout from "@/components/marketing/PartnerCallout"
import Cta from "@/components/marketing/Cta"

export default function Home() {
  return (
    <main id="main-content" className="flex flex-col overflow-hidden">
      <Hero />
      <LogoCloud />
      <GlobalDatabaseClient />
      <CodeExample />
      <Features />
      <section className="mx-auto w-full max-w-6xl px-4 sm:px-6">
        <Benefits />
      </section>
      <section
        id="testimonial"
        className="mx-auto mt-20 w-full max-w-3xl px-4 sm:mt-32 sm:px-6"
        aria-label="Testimonial"
      >
        <Testimonial />
      </section>
      <Pricing />
      <section className="mx-auto mt-20 w-full max-w-6xl px-4 sm:mt-32 sm:px-6">
        <Faqs />
      </section>
      <PartnerCallout />
      <Cta />
    </main>
  )
}
