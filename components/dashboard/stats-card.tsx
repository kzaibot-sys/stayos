import { Card, CardContent } from "@/components/ui/card"
import { LucideIcon } from "lucide-react"
import { cn } from "@/lib/utils"

interface StatsCardProps {
  title: string
  value: string | number
  icon: LucideIcon
  iconColor?: string
  iconBg?: string
  trend?: {
    value: number
    label: string
  }
}

export function StatsCard({
  title,
  value,
  icon: Icon,
  iconColor = "text-blue-600",
  iconBg = "bg-blue-100",
  trend,
}: StatsCardProps) {
  return (
    <Card>
      <CardContent className="pt-4">
        <div className="flex items-start justify-between">
          <div className="flex-1">
            <p className="text-sm text-muted-foreground font-medium">{title}</p>
            <p className="text-3xl font-bold text-gray-900 mt-1">{value}</p>
            {trend && (
              <p
                className={cn(
                  "text-xs mt-1",
                  trend.value >= 0 ? "text-green-600" : "text-red-500"
                )}
              >
                {trend.value >= 0 ? "+" : ""}
                {trend.value}% {trend.label}
              </p>
            )}
          </div>
          <div
            className={cn(
              "flex items-center justify-center w-11 h-11 rounded-full shrink-0",
              iconBg
            )}
          >
            <Icon className={cn("size-5", iconColor)} />
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
