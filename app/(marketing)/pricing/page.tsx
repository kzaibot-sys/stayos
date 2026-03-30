import { Navbar } from "@/components/marketing/navbar"
import { Footer } from "@/components/marketing/footer"
import { PricingCards } from "@/components/marketing/pricing-cards"

export const metadata = {
  title: "Тарифы — StayOS",
  description: "Выберите план, который подходит вашему отелю",
}

export default function PricingPage() {
  return (
    <div className="min-h-screen flex flex-col bg-white">
      <Navbar />
      <main className="flex-1">
        <section className="pt-32 pb-24">
          <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
            <div className="mb-16 text-center">
              <div className="inline-flex items-center gap-2 bg-[#1b4332]/5 border border-[#1b4332]/10 rounded-full px-4 py-1.5 mb-6">
                <span className="text-sm font-semibold text-[#1b4332]">Тарифы</span>
              </div>
              <h1 className="text-4xl sm:text-5xl font-bold text-[#1b4332] tracking-tight mb-4">
                Прозрачные цены для любого отеля
              </h1>
              <p className="text-lg text-gray-500 max-w-xl mx-auto">
                Начните бесплатно. Масштабируйтесь по мере роста.
              </p>
            </div>

            <PricingCards />

            {/* FAQ note */}
            <div className="mt-16 text-center">
              <p className="text-sm text-gray-400">
                Все цены указаны без НДС. Есть вопросы?{" "}
                <a href="mailto:sales@stayos.app" className="text-[#1b4332] font-medium hover:underline">
                  Напишите нам
                </a>
              </p>
            </div>
          </div>
        </section>
      </main>
      <Footer />
    </div>
  )
}
