import { Skeleton } from "@/components/ui/skeleton"

export default function ReportsLoading() {
  return (
    <div>
      {/* Page header skeleton */}
      <div className="flex items-center justify-between mb-6">
        <Skeleton className="h-8 w-52" />
      </div>

      {/* Period selector skeleton */}
      <Skeleton className="h-9 w-72 rounded-lg mb-6" />

      {/* Stats cards skeleton */}
      <div className="grid grid-cols-2 lg:grid-cols-3 gap-4 mb-6">
        {Array.from({ length: 6 }).map((_, i) => (
          <div key={i} className="bg-card rounded-xl border border-border p-4">
            <div className="flex items-center justify-between mb-2">
              <Skeleton className="h-4 w-28" />
              <Skeleton className="h-4 w-4" />
            </div>
            <Skeleton className="h-7 w-32" />
          </div>
        ))}
      </div>

      {/* Revenue chart skeleton */}
      <div className="bg-card rounded-xl border border-border p-5 mb-6">
        <Skeleton className="h-5 w-36 mb-4" />
        <Skeleton className="h-72 w-full rounded-lg" />
      </div>

      {/* Occupancy + Source charts skeleton */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-card rounded-xl border border-border p-5">
          <Skeleton className="h-5 w-36 mb-4" />
          <Skeleton className="h-60 w-full rounded-lg" />
        </div>
        <div className="bg-card rounded-xl border border-border p-5">
          <Skeleton className="h-5 w-32 mb-4" />
          <Skeleton className="h-60 w-full rounded-lg" />
        </div>
      </div>
    </div>
  )
}
