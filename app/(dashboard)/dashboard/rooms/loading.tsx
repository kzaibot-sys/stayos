import { Skeleton } from "@/components/ui/skeleton"

export default function RoomsLoading() {
  return (
    <div>
      {/* Page header skeleton */}
      <div className="flex items-center justify-between mb-6">
        <Skeleton className="h-8 w-32" />
        <Skeleton className="h-10 w-40 rounded-lg" />
      </div>

      {/* Room cards grid skeleton */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
        {Array.from({ length: 6 }).map((_, i) => (
          <div key={i} className="bg-card rounded-xl border border-border overflow-hidden">
            {/* Image placeholder */}
            <Skeleton className="h-40 w-full rounded-none" />
            <div className="p-4 space-y-3">
              <div className="flex items-start justify-between">
                <div className="space-y-1">
                  <Skeleton className="h-5 w-32" />
                  <Skeleton className="h-4 w-20" />
                </div>
                <Skeleton className="h-6 w-16 rounded-full" />
              </div>
              <div className="flex gap-3">
                <Skeleton className="h-4 w-16" />
                <Skeleton className="h-4 w-16" />
                <Skeleton className="h-4 w-20" />
              </div>
              <div className="flex items-center justify-between pt-1">
                <Skeleton className="h-5 w-28" />
                <Skeleton className="h-8 w-24 rounded-lg" />
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
