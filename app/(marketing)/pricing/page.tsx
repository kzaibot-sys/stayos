import { PricingCards } from "@/components/marketing/pricing-cards"

export const metadata = {
  title: "Тарифы — StayOS",
  description: "Выберите план, который подходит вашему отелю",
}

export default function PricingPage() {
  return (
    <section className="py-20">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="mb-12 text-center">
          <h1 className="font-heading text-4xl font-bold text-gray-900">
            Тарифы
          </h1>
          <p className="mt-4 text-lg text-gray-600">
            Выберите план, который подходит вашему отелю
          </p>
        </div>

        <PricingCards />
      </div>
    </section>
  )
}
