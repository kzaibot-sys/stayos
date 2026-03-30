import { prisma } from "@/lib/prisma"
import { format } from "date-fns"
import { ru } from "date-fns/locale"

const statusConfig: Record<
  string,
  { label: string; className: string }
> = {
  CONFIRMED: {
    label: "Подтверждено",
    className: "bg-blue-100 text-blue-700",
  },
  CHECKED_IN: {
    label: "Заселён",
    className: "bg-green-100 text-green-700",
  },
  PENDING: {
    label: "Ожидает",
    className: "bg-yellow-100 text-yellow-700",
  },
  CANCELLED: {
    label: "Отменено",
    className: "bg-red-100 text-red-700",
  },
  CHECKED_OUT: {
    label: "Выехал",
    className: "bg-gray-100 text-gray-700",
  },
  NO_SHOW: {
    label: "Не явился",
    className: "bg-orange-100 text-orange-700",
  },
}

interface RecentBookingsProps {
  hotelId: string
}

export async function RecentBookings({ hotelId }: RecentBookingsProps) {
  const today = new Date()
  today.setHours(0, 0, 0, 0)

  const bookings = await prisma.booking.findMany({
    where: {
      hotelId,
      checkIn: { gte: today },
      status: { notIn: ["CANCELLED", "NO_SHOW"] },
    },
    orderBy: { checkIn: "asc" },
    take: 5,
    include: {
      room: { select: { name: true, roomNumber: true } },
    },
  })

  return (
    <div className="mt-8">
      <h2 className="text-lg font-semibold text-gray-900 mb-4">
        Ближайшие брони
      </h2>

      {bookings.length === 0 ? (
        <div className="rounded-xl border border-dashed border-gray-200 bg-white p-8 text-center">
          <p className="text-sm text-muted-foreground">
            Нет предстоящих броней
          </p>
        </div>
      ) : (
        <div className="rounded-xl border border-gray-200 bg-white overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-gray-100 bg-gray-50">
                  <th className="text-left px-4 py-3 font-medium text-gray-500">
                    Гость
                  </th>
                  <th className="text-left px-4 py-3 font-medium text-gray-500">
                    Номер
                  </th>
                  <th className="text-left px-4 py-3 font-medium text-gray-500">
                    Заезд
                  </th>
                  <th className="text-left px-4 py-3 font-medium text-gray-500">
                    Выезд
                  </th>
                  <th className="text-left px-4 py-3 font-medium text-gray-500">
                    Статус
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {bookings.map((booking) => {
                  const config =
                    statusConfig[booking.status] ?? statusConfig["PENDING"]
                  return (
                    <tr key={booking.id} className="hover:bg-gray-50 transition-colors">
                      <td className="px-4 py-3 font-medium text-gray-900">
                        {booking.guestFirstName} {booking.guestLastName}
                      </td>
                      <td className="px-4 py-3 text-gray-600">
                        {booking.room.name}
                        {booking.room.roomNumber
                          ? ` (${booking.room.roomNumber})`
                          : ""}
                      </td>
                      <td className="px-4 py-3 text-gray-600">
                        {format(new Date(booking.checkIn), "d MMM", {
                          locale: ru,
                        })}
                      </td>
                      <td className="px-4 py-3 text-gray-600">
                        {format(new Date(booking.checkOut), "d MMM", {
                          locale: ru,
                        })}
                      </td>
                      <td className="px-4 py-3">
                        <span
                          className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${config.className}`}
                        >
                          {config.label}
                        </span>
                      </td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  )
}
