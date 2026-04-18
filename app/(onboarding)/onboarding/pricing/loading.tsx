export default function OnboardingPricingLoading() {
  return (
    <div className="flex min-h-screen items-center justify-center p-6">
      <div className="w-full max-w-3xl space-y-6">
        <div className="h-8 w-56 animate-pulse rounded-lg bg-gray-100 dark:bg-gray-900" />
        <div className="mt-6 grid grid-cols-1 gap-4 sm:grid-cols-3">
          {[...Array(3)].map((_, i) => (
            <div key={i} className="h-64 animate-pulse rounded-xl bg-gray-100 dark:bg-gray-900" />
          ))}
        </div>
      </div>
    </div>
  )
}
