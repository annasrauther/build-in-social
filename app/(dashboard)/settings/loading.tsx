export default function SettingsLoading() {
  return (
    <div className="p-4 sm:px-6 sm:pb-10 sm:pt-10 lg:px-10 lg:pt-7">
      <div className="mb-4 h-7 w-24 animate-pulse rounded bg-gray-100 dark:bg-gray-900" />
      <div className="mt-4 flex gap-4 sm:mt-6 lg:mt-10">
        {[...Array(4)].map((_, i) => (
          <div key={i} className="h-9 w-20 animate-pulse rounded bg-gray-100 dark:bg-gray-900" />
        ))}
      </div>
      <div className="pt-6 space-y-6">
        <div className="h-32 animate-pulse rounded-lg bg-gray-100 dark:bg-gray-900" />
        <div className="h-32 animate-pulse rounded-lg bg-gray-100 dark:bg-gray-900" />
      </div>
    </div>
  );
}
