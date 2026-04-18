export default function PlanPreviewLoading() {
  return (
    <div className="flex min-h-screen items-center justify-center p-6">
      <div className="w-full max-w-2xl space-y-5">
        <div className="h-7 w-48 animate-pulse rounded-lg bg-gray-100 dark:bg-gray-900" />
        <div className="h-4 w-72 animate-pulse rounded bg-gray-100 dark:bg-gray-900" />
        <div className="mt-6 grid grid-cols-1 gap-3 sm:grid-cols-2">
          {[...Array(4)].map((_, i) => (
            <div key={i} className="h-28 animate-pulse rounded-lg bg-gray-100 dark:bg-gray-900" />
          ))}
        </div>
      </div>
    </div>
  )
}
