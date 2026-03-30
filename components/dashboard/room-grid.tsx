"use client"

import { useState } from "react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import {
  MoreVertical,
  Pencil,
  Trash2,
  BedDouble,
  Users,
  Banknote,
} from "lucide-react"
import { EmptyState } from "@/components/shared/empty-state"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { toast } from "sonner"

const statusConfig: Record<
  string,
  { label: string; className: string }
> = {
  AVAILABLE: {
    label: "Свободен",
    className: "bg-green-100 text-green-700",
  },
  OCCUPIED: {
    label: "Занят",
    className: "bg-[#1b4332]/10 text-[#1b4332]",
  },
  MAINTENANCE: {
    label: "Тех. обслуживание",
    className: "bg-muted text-foreground",
  },
  BLOCKED: {
    label: "Заблокирован",
    className: "bg-red-100 text-red-700",
  },
}

const typeLabels: Record<string, string> = {
  STANDARD: "Стандарт",
  DELUXE: "Делюкс",
  SUITE: "Люкс",
  APARTMENT: "Апартаменты",
  DORMITORY: "Общая комната",
  VILLA: "Вилла",
}

interface Room {
  id: string
  name: string
  roomNumber: string | null
  type: string
  status: string
  floor: number | null
  capacity: number
  bedCount: number
  bedType: string | null
  pricePerNight: number
  weekendPrice: number | null
  amenities: string[]
  photos: string[]
}

interface RoomGridProps {
  rooms: Room[]
}

export function RoomGrid({ rooms }: RoomGridProps) {
  const router = useRouter()
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false)
  const [roomToDelete, setRoomToDelete] = useState<Room | null>(null)
  const [isDeleting, setIsDeleting] = useState(false)

  const formatPrice = (price: number) =>
    new Intl.NumberFormat("ru-KZ", {
      style: "currency",
      currency: "KZT",
      maximumFractionDigits: 0,
    }).format(price)

  const handleDeleteClick = (room: Room) => {
    setRoomToDelete(room)
    setDeleteDialogOpen(true)
  }

  const handleDeleteConfirm = async () => {
    if (!roomToDelete) return
    setIsDeleting(true)

    try {
      const res = await fetch(`/api/rooms/${roomToDelete.id}`, {
        method: "DELETE",
      })

      if (!res.ok) {
        throw new Error("Не удалось удалить номер")
      }

      toast.success("Номер удалён")
      setDeleteDialogOpen(false)
      setRoomToDelete(null)
      router.refresh()
    } catch {
      toast.error("Ошибка при удалении номера")
    } finally {
      setIsDeleting(false)
    }
  }

  if (rooms.length === 0) {
    return (
      <EmptyState
        icon={<BedDouble className="size-12" />}
        title="Номеров пока нет"
        description="Добавьте первый номер, чтобы начать принимать брони"
        action={{ label: "Добавить номер", href: "/dashboard/rooms/new" }}
      />
    )
  }

  return (
    <>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {rooms.map((room) => {
          const statusCfg =
            statusConfig[room.status] ?? statusConfig["AVAILABLE"]
          const typeLabel = typeLabels[room.type] ?? room.type

          return (
            <div
              key={room.id}
              className="group relative bg-card rounded-xl border border-border overflow-hidden hover:shadow-md transition-shadow"
            >
              {/* Photo placeholder */}
              <div className="h-40 bg-muted flex items-center justify-center">
                <BedDouble className="size-10 text-muted-foreground/40" />
              </div>

              {/* Status badge overlay */}
              <div className="absolute top-3 left-3">
                <span
                  className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${statusCfg.className}`}
                >
                  {statusCfg.label}
                </span>
              </div>

              {/* Actions dropdown */}
              <div className="absolute top-3 right-3">
                <DropdownMenu>
                  <DropdownMenuTrigger className="flex items-center justify-center w-8 h-8 rounded-full bg-card/90 text-muted-foreground hover:bg-card hover:text-foreground shadow-sm transition-colors">
                    <MoreVertical className="size-4" />
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end">
                    <DropdownMenuItem
                      onClick={() =>
                        router.push(`/dashboard/rooms/${room.id}`)
                      }
                    >
                      <Pencil className="size-4 mr-2" />
                      Редактировать
                    </DropdownMenuItem>
                    <DropdownMenuItem
                      variant="destructive"
                      onClick={() => handleDeleteClick(room)}
                    >
                      <Trash2 className="size-4 mr-2" />
                      Удалить
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </div>

              {/* Card content */}
              <div className="p-4">
                <div className="flex items-start justify-between gap-2 mb-2">
                  <div>
                    <h3 className="font-semibold text-foreground leading-tight">
                      {room.name}
                      {room.roomNumber && (
                        <span className="text-muted-foreground font-normal ml-1 text-sm">
                          #{room.roomNumber}
                        </span>
                      )}
                    </h3>
                    <span className="inline-flex items-center mt-1 px-2 py-0.5 rounded bg-muted text-muted-foreground text-xs font-medium">
                      {typeLabel}
                    </span>
                  </div>
                </div>

                <div className="flex items-center gap-4 mt-3 text-sm text-muted-foreground">
                  <span className="flex items-center gap-1">
                    <Users className="size-3.5" />
                    {room.capacity} гостей
                  </span>
                  {room.floor && (
                    <span>{room.floor} этаж</span>
                  )}
                </div>

                <div className="mt-3 pt-3 border-t border-border flex items-center justify-between">
                  <span className="flex items-center gap-1 text-sm font-semibold text-foreground">
                    <Banknote className="size-4 text-muted-foreground" />
                    {formatPrice(room.pricePerNight)}
                    <span className="text-xs text-muted-foreground font-normal">
                      /ночь
                    </span>
                  </span>
                  <Link
                    href={`/dashboard/rooms/${room.id}`}
                    className="text-xs text-[#2d6a4f] hover:text-[#1b4332] font-medium"
                  >
                    Изменить
                  </Link>
                </div>
              </div>
            </div>
          )
        })}
      </div>

      {/* Delete confirmation dialog */}
      <Dialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Удалить номер?</DialogTitle>
            <DialogDescription>
              {roomToDelete && (
                <>
                  Вы уверены, что хотите удалить номер{" "}
                  <strong>{roomToDelete.name}</strong>? Это действие нельзя
                  отменить.
                </>
              )}
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setDeleteDialogOpen(false)}
              disabled={isDeleting}
            >
              Отмена
            </Button>
            <Button
              variant="destructive"
              onClick={handleDeleteConfirm}
              disabled={isDeleting}
            >
              {isDeleting ? "Удаление..." : "Удалить"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  )
}
