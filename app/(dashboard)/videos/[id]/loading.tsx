export default function VideoDetailLoading() {
  return (
    <div className="p-4 sm:px-6 sm:pb-10 sm:pt-10 lg:px-10 lg:pt-7">
      <div className="h-4 w-32 animate-pulse rounded bg-gray-100 dark:bg-gray-900" />
      <div className="mt-4 mb-6 space-y-2">
        <div className="flex gap-2">
          <div className="h-5 w-20 animate-pulse rounded bg-gray-100 dark:bg-gray-900" />
          <div className="h-5 w-16 animate-pulse rounded bg-gray-100 dark:bg-gray-900" />
        </div>
        <div className="h-7 w-3/5 animate-pulse rounded bg-gray-100 dark:bg-gray-900" />
      </div>
      <div className="grid gap-4 lg:grid-cols-3">
        <div className="lg:col-span-2 space-y-4">
          <div className="h-64 animate-pulse rounded-lg bg-gray-100 dark:bg-gray-900" />
          <div className="h-48 animate-pulse rounded-lg bg-gray-100 dark:bg-gray-900" />
        </div>
        <div className="space-y-4">
          <div className="h-32 animate-pulse rounded-lg bg-gray-100 dark:bg-gray-900" />
        </div>
      </div>
    </div>
  );
}
