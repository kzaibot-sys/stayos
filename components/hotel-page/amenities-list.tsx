import {
  Wifi,
  Car,
  Snowflake,
  Coffee,
  Bus,
  Tv,
  Wine,
  Mountain,
  Bath,
  Shirt,
  Check,
  type LucideIcon,
} from "lucide-react"

const amenityIcons: Record<string, LucideIcon> = {
  "WiFi": Wifi,
  "Wi-Fi": Wifi,
  "Парковка": Car,
  "Кондиционер": Snowflake,
  "Завтрак": Coffee,
  "Трансфер": Bus,
  "TV": Tv,
  "Телевизор": Tv,
  "Мини-бар": Wine,
  "Балкон": Mountain,
  "Ванна": Bath,
  "Халат": Shirt,
}

function getAmenityIcon(name: string): LucideIcon {
  return amenityIcons[name] ?? Check
}

interface AmenitiesListProps {
  amenities: string[]
}

export function AmenitiesList({ amenities }: AmenitiesListProps) {
  if (!amenities || amenities.length === 0) return null

  return (
    <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
      {amenities.map((amenity) => {
        const Icon = getAmenityIcon(amenity)
        return (
          <div
            key={amenity}
            className="flex items-center gap-3 p-4 rounded-xl bg-[#1b4332]/5 border border-[#1b4332]/10 hover:border-[#d4a373]/30 hover:bg-[#1b4332]/8 transition-all duration-200"
          >
            <div className="size-10 rounded-lg bg-[#1b4332]/10 flex items-center justify-center shrink-0">
              <Icon className="size-5 text-[#1b4332]" />
            </div>
            <span className="text-sm font-medium text-gray-700">{amenity}</span>
          </div>
        )
      })}
    </div>
  )
}
