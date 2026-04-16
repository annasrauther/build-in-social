export default function CurrentPlanLoading() {
  return (
    <div className="p-4 sm:px-6 sm:pb-10 sm:pt-10 lg:px-10 lg:pt-7">
      <div className="mb-6 space-y-2">
        <div className="h-5 w-32 animate-pulse rounded bg-gray-100 dark:bg-gray-900" />
        <div className="h-4 w-64 animate-pulse rounded bg-gray-100 dark:bg-gray-900" />
      </div>
      <div className="grid gap-3 tablet-sm:grid-cols-2">
        <div className="h-40 animate-pulse rounded-lg bg-gray-100 dark:bg-gray-900" />
        <div className="h-40 animate-pulse rounded-lg bg-gray-100 dark:bg-gray-900" />
      </div>
    </div>
  );
}
