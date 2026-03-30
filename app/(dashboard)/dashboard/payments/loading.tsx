import { Skeleton } from "@/components/ui/skeleton"

export default function PaymentsLoading() {
  return (
    <div>
      {/* Page header skeleton */}
      <div className="flex items-center justify-between mb-6">
        <Skeleton className="h-8 w-28" />
      </div>

      {/* Summary cards skeleton */}
      <div className="grid grid-cols-2 gap-4 mb-6">
        {Array.from({ length: 2 }).map((_, i) => (
          <div key={i} className="bg-card rounded-xl border border-border p-4">
            <Skeleton className="h-4 w-36 mb-2" />
            <Skeleton className="h-8 w-40" />
          </div>
        ))}
      </div>

      {/* Filters skeleton */}
      <div className="flex flex-wrap gap-3 mb-6">
        <Skeleton className="h-9 w-32 rounded-lg" />
        <Skeleton className="h-9 w-32 rounded-lg" />
        <Skeleton className="h-9 w-36 rounded-lg" />
        <Skeleton className="h-9 w-36 rounded-lg" />
        <Skeleton className="h-9 w-24 rounded-lg" />
      </div>

      {/* Table skeleton */}
      <div className="bg-card rounded-xl border border-border overflow-hidden">
        {/* Header */}
        <div className="flex gap-4 px-4 py-3 border-b border-border bg-muted">
          {[100, 100, 140, 100, 80, 80, 60].map((w, i) => (
            <Skeleton key={i} className="h-4 w-24" />
          ))}
        </div>
        {/* Rows */}
        <div className="divide-y divide-border">
          {Array.from({ length: 8 }).map((_, i) => (
            <div key={i} className="flex items-center gap-4 px-4 py-4">
              <Skeleton className="h-4 w-32" />
              <Skeleton className="h-4 w-24" />
              <Skeleton className="h-4 w-36" />
              <Skeleton className="h-4 w-24" />
              <Skeleton className="h-4 w-20" />
              <Skeleton className="h-6 w-20 rounded-full" />
              <Skeleton className="h-4 w-16" />
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
