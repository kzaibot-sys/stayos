import { LayoutDashboard } from "lucide-react"

export default function DashboardPage() {
  return (
    <div className="flex flex-col items-center justify-center min-h-[60vh] text-center">
      <div className="flex items-center justify-center w-16 h-16 rounded-full bg-blue-50 mb-6">
        <LayoutDashboard className="size-8 text-[#1a56db]" />
      </div>
      <h1 className="font-heading text-2xl font-semibold text-gray-900 mb-2">
        Добро пожаловать в StayOS
      </h1>
      <p className="text-gray-500 text-base max-w-sm">
        Выберите раздел в меню слева
      </p>
    </div>
  )
}
