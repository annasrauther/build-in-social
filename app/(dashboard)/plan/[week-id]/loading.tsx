export default function WeekPlanLoading() {
  return (
    <div className="p-4 sm:px-6 sm:pb-10 sm:pt-10 lg:px-10 lg:pt-7">
      <div className="mb-6 space-y-2">
        <div className="h-6 w-40 animate-pulse rounded bg-gray-100 dark:bg-gray-900" />
        <div className="h-4 w-24 animate-pulse rounded bg-gray-100 dark:bg-gray-900" />
      </div>
      <div className="grid gap-3 tablet-sm:grid-cols-2 lg:grid-cols-3">
        {[...Array(6)].map((_, i) => (
          <div key={i} className="h-40 animate-pulse rounded-lg bg-gray-100 dark:bg-gray-900" />
        ))}
      </div>
    </div>
  );
}
