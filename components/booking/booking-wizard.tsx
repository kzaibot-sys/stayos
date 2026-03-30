"use client"

import { useState } from "react"
import Link from "next/link"
import { Check, BedDouble } from "lucide-react"
import { StepDates } from "./step-dates"
import { StepGuest } from "./step-guest"
import { StepPayment } from "./step-payment"

interface Room {
  id: string
  name: string
  type: string
  capacity: number
  bedType?: string | null
  pricePerNight: number
  weekendPrice?: number | null
  amenities: string[]
  photos: string[]
  description?: string | null
}

interface Hotel {
  id: string
  name: string
  slug: string
  checkInTime: string
  checkOutTime: string
  phone?: string | null
  email?: string | null
  address?: string | null
  rooms: Room[]
}

interface BookingData {
  // Step 1
  checkIn: string
  checkOut: string
  roomId: string
  room: Room | null
  adults: number
  children: number
  // Step 2
  firstName: string
  lastName: string
  email: string
  phone: string
  specialRequests: string
}

const steps = [
  { label: "Даты и номер" },
  { label: "Данные гостя" },
  { label: "Подтверждение" },
]

export function BookingWizard({ hotel, slug }: { hotel: Hotel; slug: string }) {
  const [currentStep, setCurrentStep] = useState(1)
  const [bookingData, setBookingData] = useState<BookingData>({
    checkIn: "",
    checkOut: "",
    roomId: "",
    room: null,
    adults: 2,
    children: 0,
    firstName: "",
    lastName: "",
    email: "",
    phone: "",
    specialRequests: "",
  })

  function handleStep1Next(data: {
    checkIn: string
    checkOut: string
    roomId: string
    room: Room
    adults: number
    children: number
  }) {
    setBookingData((prev) => ({ ...prev, ...data }))
    setCurrentStep(2)
  }

  function handleStep2Next(data: {
    firstName: string
    lastName: string
    email: string
    phone: string
    specialRequests: string
  }) {
    setBookingData((prev) => ({ ...prev, ...data }))
    setCurrentStep(3)
  }

  return (
    <div className="min-h-screen flex flex-col bg-gray-50">
      {/* Header */}
      <header className="bg-white border-b border-gray-200 px-4 py-4">
        <div className="max-w-2xl mx-auto flex items-center justify-between">
          <Link
            href={`/${slug}`}
            className="flex items-center gap-2 text-sm text-gray-500 hover:text-gray-700 transition-colors"
          >
            ← Вернуться
          </Link>
          <Link
            href={`/${slug}`}
            className="flex items-center gap-1.5 font-semibold text-[#1a56db]"
          >
            <BedDouble className="size-5" />
            {hotel.name}
          </Link>
          <div className="w-20" /> {/* spacer */}
        </div>
      </header>

      <main className="flex-1 py-8 px-4">
        <div className="max-w-2xl mx-auto space-y-8">
          {/* Step indicator */}
          <div className="flex items-center justify-center">
            {steps.map((step, index) => {
              const stepNum = index + 1
              const isCompleted = currentStep > stepNum
              const isActive = currentStep === stepNum

              return (
                <div key={stepNum} className="flex items-center">
                  {/* Circle */}
                  <div className="flex flex-col items-center">
                    <div
                      className={`size-9 rounded-full flex items-center justify-center text-sm font-semibold border-2 transition-all ${
                        isCompleted
                          ? "bg-green-500 border-green-500 text-white"
                          : isActive
                          ? "bg-[#1a56db] border-[#1a56db] text-white"
                          : "bg-white border-gray-300 text-gray-400"
                      }`}
                    >
                      {isCompleted ? (
                        <Check className="size-4" />
                      ) : (
                        stepNum
                      )}
                    </div>
                    <span
                      className={`mt-1.5 text-xs font-medium whitespace-nowrap ${
                        isActive
                          ? "text-[#1a56db]"
                          : isCompleted
                          ? "text-green-600"
                          : "text-gray-400"
                      }`}
                    >
                      {step.label}
                    </span>
                  </div>

                  {/* Connector line */}
                  {index < steps.length - 1 && (
                    <div
                      className={`h-0.5 w-16 sm:w-24 mx-2 mb-5 rounded-full transition-all ${
                        currentStep > stepNum ? "bg-green-400" : "bg-gray-200"
                      }`}
                    />
                  )}
                </div>
              )
            })}
          </div>

          {/* Step content */}
          {currentStep === 1 && (
            <StepDates
              slug={slug}
              initialCheckIn={bookingData.checkIn}
              initialCheckOut={bookingData.checkOut}
              initialAdults={bookingData.adults}
              initialChildren={bookingData.children}
              initialRoomId={bookingData.roomId}
              onNext={handleStep1Next}
            />
          )}

          {currentStep === 2 && (
            <StepGuest
              initialData={{
                firstName: bookingData.firstName,
                lastName: bookingData.lastName,
                email: bookingData.email,
                phone: bookingData.phone,
                specialRequests: bookingData.specialRequests,
              }}
              onNext={handleStep2Next}
              onBack={() => setCurrentStep(1)}
            />
          )}

          {currentStep === 3 && bookingData.room && (
            <StepPayment
              bookingData={{
                hotelId: hotel.id,
                checkIn: bookingData.checkIn,
                checkOut: bookingData.checkOut,
                roomId: bookingData.roomId,
                room: bookingData.room,
                adults: bookingData.adults,
                children: bookingData.children,
                firstName: bookingData.firstName,
                lastName: bookingData.lastName,
                email: bookingData.email,
                phone: bookingData.phone,
                specialRequests: bookingData.specialRequests,
              }}
              slug={slug}
              onBack={() => setCurrentStep(2)}
            />
          )}
        </div>
      </main>

      {/* Footer */}
      <footer className="border-t border-gray-200 bg-white py-4">
        <div className="max-w-2xl mx-auto px-4 flex items-center justify-center gap-2 text-sm text-gray-400">
          <span>Powered by</span>
          <Link
            href="/"
            className="flex items-center gap-1 font-semibold text-[#1a56db] hover:underline"
          >
            <BedDouble className="size-4" />
            StayOS
          </Link>
        </div>
      </footer>
    </div>
  )
}
