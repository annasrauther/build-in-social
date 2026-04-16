export default function PastWeekPlanPage({
  params,
}: {
  params: { "week-id": string }
}) {
  return (
    <div className="p-4 sm:px-6 sm:pb-10 sm:pt-10 lg:px-10 lg:pt-7">
      <h1 className="text-lg font-semibold text-gray-900 dark:text-gray-50">
        Past Week Plan
      </h1>
      <p className="mt-2 text-sm text-gray-500">
        Week ID: {params["week-id"]}
      </p>
    </div>
  )
}
