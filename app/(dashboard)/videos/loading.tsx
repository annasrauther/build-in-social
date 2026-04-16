export default function Loading() {
  return (
    <div className="animate-pulse p-4 sm:px-6 sm:pb-10 sm:pt-10 lg:px-10 lg:pt-7">
      <div className="h-8 w-48 rounded bg-gray-200 dark:bg-gray-800" />
      <div className="mt-6 grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
        {[...Array(3)].map((_, i) => (
          <div key={i} className="h-32 rounded-lg bg-gray-200 dark:bg-gray-800" />
        ))}
      </div>
    </div>
  )
}
