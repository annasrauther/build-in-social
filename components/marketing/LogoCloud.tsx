/**
 * Landing-page social proof.
 *
 * `customerLogos` must remain empty until we have real, attributed customer
 * permission. The "Trusted by teams at" slot renders `null` when the array is
 * empty — we never ship fake logos. (T8 from AUDIT.md.)
 */
interface CustomerLogo {
  name: string
  src: string
  alt: string
  href?: string
}

// Populate only with logos we have written permission to display.
const customerLogos: CustomerLogo[] = []

const metrics = [
  { value: "4 platforms", label: "YouTube Shorts · Reels · LinkedIn · X — native format for each" },
  { value: "~92 videos/mo", label: "Studio plan ceiling" },
  { value: "14-day trial", label: "No credit card" },
  { value: "3 min to first plan", label: "From signup to preview" },
]

function TrustedByLogos() {
  if (customerLogos.length === 0) return null

  return (
    <div className="flex flex-col items-center gap-y-5">
      <p className="text-xs uppercase tracking-[0.2em] text-gray-500 dark:text-gray-400">
        Trusted by teams at
      </p>
      <ul
        role="list"
        className="flex flex-wrap items-center justify-center gap-x-10 gap-y-6 opacity-80"
      >
        {customerLogos.map((logo) => (
          <li key={logo.name}>
            {logo.href ? (
              <a
                href={logo.href}
                target="_blank"
                rel="noopener noreferrer"
                className="transition-opacity hover:opacity-100"
              >
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={logo.src}
                  alt={logo.alt}
                  className="h-6 w-auto grayscale dark:invert"
                  loading="lazy"
                />
              </a>
            ) : (
              /* eslint-disable-next-line @next/next/no-img-element */
              <img
                src={logo.src}
                alt={logo.alt}
                className="h-6 w-auto grayscale dark:invert"
                loading="lazy"
              />
            )}
          </li>
        ))}
      </ul>
    </div>
  )
}

export default function LogoCloud() {
  return (
    <section
      id="social-proof"
      aria-label="Social proof metrics"
      className="mt-16 flex animate-slide-up-fade [animation-duration:1500ms] flex-col items-center justify-center gap-y-8 text-center sm:mt-20"
    >
      <p className="text-lg font-medium tracking-tighter text-gray-800 dark:text-gray-200">
        Built for founders who ship constantly and never post about it
      </p>
      <div className="grid grid-cols-2 gap-x-6 gap-y-6 sm:gap-x-10 md:grid-cols-4 md:gap-x-20">
        {metrics.map((metric) => (
          <div key={metric.label} className="flex flex-col items-center">
            <span className="inline-block bg-gradient-to-t from-brand-900 to-brand-500 bg-clip-text text-3xl font-bold tracking-tight text-transparent sm:text-4xl dark:from-brand-700 dark:to-brand-400">
              {metric.value}
            </span>
            <span className="mt-1 text-sm text-gray-600 dark:text-gray-400">
              {metric.label}
            </span>
          </div>
        ))}
      </div>
      <TrustedByLogos />
    </section>
  )
}
