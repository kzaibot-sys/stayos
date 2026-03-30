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
      <h2 className="text-lg font-semibold text-foreground mb-4">
        Ближайшие брони
      </h2>

      {bookings.length === 0 ? (
        <div className="rounded-xl border border-dashed border-border bg-card p-8 text-center">
          <p className="text-sm text-muted-foreground">
            Нет предстоящих броней
          </p>
        </div>
      ) : (
        <div className="rounded-xl border border-border bg-card overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-border bg-muted">
                  <th className="text-left px-4 py-3 font-medium text-muted-foreground">
                    Гость
                  </th>
                  <th className="text-left px-4 py-3 font-medium text-muted-foreground">
                    Номер
                  </th>
                  <th className="text-left px-4 py-3 font-medium text-muted-foreground">
                    Заезд
                  </th>
                  <th className="text-left px-4 py-3 font-medium text-muted-foreground">
                    Выезд
                  </th>
                  <th className="text-left px-4 py-3 font-medium text-muted-foreground">
                    Статус
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {bookings.map((booking) => {
                  const config =
                    statusConfig[booking.status] ?? statusConfig["PENDING"]
                  return (
                    <tr key={booking.id} className="hover:bg-muted transition-colors">
                      <td className="px-4 py-3 font-medium text-foreground">
                        {booking.guestFirstName} {booking.guestLastName}
                      </td>
                      <td className="px-4 py-3 text-muted-foreground">
                        {booking.room.name}
                        {booking.room.roomNumber
                          ? ` (${booking.room.roomNumber})`
                          : ""}
                      </td>
                      <td className="px-4 py-3 text-muted-foreground">
                        {format(new Date(booking.checkIn), "d MMM", {
                          locale: ru,
                        })}
                      </td>
                      <td className="px-4 py-3 text-muted-foreground">
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
