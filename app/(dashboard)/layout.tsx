import { redirect } from "next/navigation"
import { auth } from "@/lib/auth"
import { prisma } from "@/lib/prisma"
import { DashboardShell } from "@/components/dashboard/dashboard-shell"

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const session = await auth()

  if (!session) {
    redirect("/login")
  }

  const hotel = await prisma.hotel.findFirst({
    where: { ownerId: (session.user as any).id },
  })

  if (!hotel) {
    redirect("/register")
  }

  const user = {
    name: session.user?.name ?? "User",
    email: session.user?.email ?? "",
  }

  return (
    <DashboardShell user={user} hotelName={hotel.name}>
      {children}
    </DashboardShell>
  )
}
