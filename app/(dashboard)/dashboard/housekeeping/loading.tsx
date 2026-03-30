export default function HousekeepingLoading() {
  return (
    <div className="space-y-6 animate-pulse">
      {/* Header skeleton */}
      <div className="flex items-center justify-between">
        <div className="space-y-2">
          <div className="h-7 w-40 bg-gray-200 rounded-lg" />
          <div className="h-4 w-64 bg-gray-100 rounded-lg" />
        </div>
        <div className="flex gap-2">
          <div className="h-9 w-28 bg-gray-200 rounded-lg" />
          <div className="h-9 w-36 bg-gray-200 rounded-lg" />
        </div>
      </div>

      {/* Room grid skeleton */}
      <div>
        <div className="h-4 w-28 bg-gray-200 rounded mb-3" />
        <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-6 gap-3">
          {Array.from({ length: 12 }).map((_, i) => (
            <div key={i} className="h-20 rounded-xl bg-gray-100" />
          ))}
        </div>
      </div>

      {/* Filter tabs skeleton */}
      <div className="flex gap-4 border-b border-gray-200 pb-2">
        {Array.from({ length: 4 }).map((_, i) => (
          <div key={i} className="h-5 w-16 bg-gray-200 rounded" />
        ))}
      </div>

      {/* Task list skeleton */}
      <div className="space-y-2">
        {Array.from({ length: 5 }).map((_, i) => (
          <div key={i} className="h-14 bg-gray-100 rounded-xl" />
        ))}
      </div>
    </div>
  )
}
