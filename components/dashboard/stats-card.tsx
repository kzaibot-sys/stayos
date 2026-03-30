import { Card, CardContent } from "@/components/ui/card"
import { LucideIcon, TrendingUp, TrendingDown, Minus } from "lucide-react"
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
  iconColor = "text-[#1b4332]",
  iconBg = "bg-[#1b4332]/10",
  trend,
}: StatsCardProps) {
  return (
    <Card>
      <CardContent className="pt-4">
        <div className="flex items-start justify-between">
          <div className="flex-1">
            <p className="text-sm text-muted-foreground font-medium">{title}</p>
            <p className="text-3xl font-bold text-foreground mt-1">{value}</p>
            {trend && (
              <div className="flex items-center gap-1 mt-1.5">
                {trend.value > 0 ? (
                  <>
                    <TrendingUp className="size-3.5 text-green-600" />
                    <p className="text-xs text-green-600 font-medium">
                      ↑ {trend.value}% {trend.label}
                    </p>
                  </>
                ) : trend.value < 0 ? (
                  <>
                    <TrendingDown className="size-3.5 text-red-500" />
                    <p className="text-xs text-red-500 font-medium">
                      ↓ {Math.abs(trend.value)}% {trend.label}
                    </p>
                  </>
                ) : (
                  <>
                    <Minus className="size-3.5 text-muted-foreground" />
                    <p className="text-xs text-muted-foreground font-medium">
                      → 0% {trend.label}
                    </p>
                  </>
                )}
              </div>
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
