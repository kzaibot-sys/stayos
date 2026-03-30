"use client"

import { useState, useEffect, useCallback } from "react"
import { Cloud, Sun, CloudRain, CloudSnow, Wind, Thermometer } from "lucide-react"

interface WeatherData {
  temp: number
  feels_like: number
  description: string
  weatherCode: number
  city: string
}

function WeatherIcon({ code, className }: { code: number; className?: string }) {
  // wttr.in weather codes
  if (code >= 200 && code < 300) return <CloudRain className={className} /> // thunderstorm
  if (code >= 300 && code < 600) return <CloudRain className={className} /> // drizzle/rain
  if (code >= 600 && code < 700) return <CloudSnow className={className} /> // snow
  if (code >= 700 && code < 800) return <Wind className={className} /> // atmosphere
  if (code === 800) return <Sun className={className} /> // clear
  if (code > 800) return <Cloud className={className} /> // clouds
  return <Thermometer className={className} />
}

interface WeatherWidgetProps {
  city?: string
}

export function WeatherWidget({ city = "Almaty" }: WeatherWidgetProps) {
  const [weather, setWeather] = useState<WeatherData | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(false)

  const fetchWeather = useCallback(async () => {
    try {
      setError(false)
      const res = await fetch(
        `https://wttr.in/${encodeURIComponent(city)}?format=j1`,
        { signal: AbortSignal.timeout(5000) }
      )
      if (!res.ok) throw new Error("Failed")
      const data = await res.json()

      const current = data.current_condition?.[0]
      if (!current) throw new Error("No data")

      setWeather({
        temp: parseInt(current.temp_C),
        feels_like: parseInt(current.FeelsLikeC),
        description: current.weatherDesc?.[0]?.value || "",
        weatherCode: parseInt(current.weatherCode),
        city,
      })
    } catch {
      setError(true)
    } finally {
      setLoading(false)
    }
  }, [city])

  useEffect(() => {
    fetchWeather()
    // Refresh every 30 minutes
    const interval = setInterval(fetchWeather, 30 * 60 * 1000)
    return () => clearInterval(interval)
  }, [fetchWeather])

  if (loading) {
    return (
      <div className="flex items-center gap-2 bg-white border border-gray-200 rounded-xl px-4 py-3 animate-pulse">
        <div className="size-8 bg-gray-200 rounded-full" />
        <div className="space-y-1">
          <div className="h-3 w-16 bg-gray-200 rounded" />
          <div className="h-2 w-12 bg-gray-200 rounded" />
        </div>
      </div>
    )
  }

  if (error || !weather) {
    return null
  }

  return (
    <div className="flex items-center gap-3 bg-gradient-to-r from-blue-50 to-sky-50 border border-blue-100 rounded-xl px-4 py-3">
      <WeatherIcon
        code={weather.weatherCode}
        className="size-7 text-blue-500 shrink-0"
      />
      <div className="min-w-0">
        <div className="flex items-baseline gap-1.5">
          <span className="text-xl font-bold text-gray-900">{weather.temp}°C</span>
          <span className="text-xs text-gray-500 hidden sm:inline">
            ощущается {weather.feels_like}°
          </span>
        </div>
        <p className="text-xs text-gray-500 truncate">{weather.city} · {weather.description}</p>
      </div>
    </div>
  )
}
