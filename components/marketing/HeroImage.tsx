import ThemedImage from "./ThemedImage"
import { APP } from "@/content/app"

export default function HeroImage() {
  return (
    <section aria-label="Hero Image of the website" className="flow-root">
      <div className="rounded-2xl bg-slate-50/40 p-2 ring-1 ring-inset ring-slate-200/50 dark:bg-gray-900/70 dark:ring-white/10">
        <div className="rounded-xl bg-white ring-1 ring-slate-900/5 dark:bg-[#1C1B1A] dark:ring-white/15">
          <ThemedImage
            lightSrc="/images/hero-light.png"
            darkSrc="/images/hero-dark.png"
            alt={APP.A11Y.heroDashboardAlt}
            width={2400}
            height={1600}
            className="rounded-xl shadow-2xl dark:shadow-brand-500/10"
          />
        </div>
      </div>
    </section>
  )
}
