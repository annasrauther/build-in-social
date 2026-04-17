const metrics = [
  { value: "12,400+", label: "Videos posted for founders" },
  { value: "$39/mo", label: "vs. $3,000/mo for a hire" },
  { value: "92", label: "Videos per month on Studio" },
  { value: "3 min", label: "From signup to first batch" },
]

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
      <div className="grid grid-cols-2 gap-x-12 gap-y-6 md:grid-cols-4 md:gap-x-20">
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
    </section>
  )
}
