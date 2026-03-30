export default function HousekeepingLoading() {
  return (
    <div className="space-y-6 animate-pulse">
      {/* Header skeleton */}
      <div className="flex items-center justify-between">
        <div className="space-y-2">
          <div className="h-7 w-40 bg-muted rounded-lg" />
          <div className="h-4 w-64 bg-muted rounded-lg" />
        </div>
        <div className="flex gap-2">
          <div className="h-9 w-28 bg-muted rounded-lg" />
          <div className="h-9 w-36 bg-muted rounded-lg" />
        </div>
      </div>

      {/* Room grid skeleton */}
      <div>
        <div className="h-4 w-28 bg-muted rounded mb-3" />
        <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-6 gap-3">
          {Array.from({ length: 12 }).map((_, i) => (
            <div key={i} className="h-20 rounded-xl bg-muted" />
          ))}
        </div>
      </div>

      {/* Filter tabs skeleton */}
      <div className="flex gap-4 border-b border-border pb-2">
        {Array.from({ length: 4 }).map((_, i) => (
          <div key={i} className="h-5 w-16 bg-muted rounded" />
        ))}
      </div>

      {/* Task list skeleton */}
      <div className="space-y-2">
        {Array.from({ length: 5 }).map((_, i) => (
          <div key={i} className="h-14 bg-muted rounded-xl" />
        ))}
      </div>
    </div>
  )
}
