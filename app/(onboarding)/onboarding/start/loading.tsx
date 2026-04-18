export default function OnboardingStartLoading() {
  return (
    <div className="flex min-h-screen items-center justify-center p-6">
      <div className="w-full max-w-2xl space-y-6">
        <div className="h-8 w-64 animate-pulse rounded-lg bg-gray-100 dark:bg-gray-900" />
        <div className="h-5 w-80 animate-pulse rounded bg-gray-100 dark:bg-gray-900" />
        <div className="h-12 w-full animate-pulse rounded-lg bg-gray-100 dark:bg-gray-900" />
      </div>
    </div>
  )
}
