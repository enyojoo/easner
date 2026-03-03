"use client"

import { useState } from "react"
import { ChevronLeft, ChevronRight, Snowflake } from "lucide-react"
import { Button } from "@/components/ui/button"
import { type Card } from "@/lib/mock-data"

interface CardCarouselProps {
  cards: Card[]
  onCardChange?: (card: Card) => void
  frozenCardIds?: Set<string>
}

export function CardCarousel({ cards, onCardChange, frozenCardIds = new Set() }: CardCarouselProps) {
  const [currentIndex, setCurrentIndex] = useState(0)
  const currentCard = cards[currentIndex]

  const goToPrevious = () => {
    const newIndex = currentIndex === 0 ? cards.length - 1 : currentIndex - 1
    setCurrentIndex(newIndex)
    onCardChange?.(cards[newIndex])
  }

  const goToNext = () => {
    const newIndex = currentIndex === cards.length - 1 ? 0 : currentIndex + 1
    setCurrentIndex(newIndex)
    onCardChange?.(cards[newIndex])
  }

  const isActive = currentCard.status === "active"
  const isFrozen = frozenCardIds.has(currentCard.id)

  return (
    <div className="relative w-full max-w-md mx-auto">
      {/* Card Display */}
      <div
        className="relative overflow-hidden rounded-2xl shadow-xl transition-all duration-300 w-full"
        style={{
          background: isActive
            ? "linear-gradient(135deg, #0F172A 0%, #1E293B 50%, #334155 100%)"
            : "linear-gradient(135deg, #F9FAFB 0%, #F3F4F6 100%)",
          border: isActive ? "none" : "1px solid #E5E7EB",
          aspectRatio: "1.586",
        }}
      >
        <div className={`absolute inset-0 z-[1] ${isActive ? "opacity-10" : "opacity-5"}`}>
          <svg width="100%" height="100%" xmlns="http://www.w3.org/2000/svg">
            <defs>
              <pattern id={`dots-${currentCard.id}`} x="0" y="0" width="40" height="40" patternUnits="userSpaceOnUse">
                <circle cx="2" cy="2" r="1.5" fill={isActive ? "white" : "#6B7280"} />
              </pattern>
              <pattern id={`lines-${currentCard.id}`} x="0" y="0" width="60" height="60" patternUnits="userSpaceOnUse">
                <path d="M0 60 L60 0" stroke={isActive ? "white" : "#6B7280"} strokeWidth="0.5" />
              </pattern>
            </defs>
            <rect width="100%" height="100%" fill={`url(#dots-${currentCard.id})`} />
            <rect width="100%" height="100%" fill={`url(#lines-${currentCard.id})`} />
          </svg>
        </div>

        {isFrozen && (
          <div className="absolute inset-0 z-[5] flex items-center justify-center bg-black/50 backdrop-blur-sm">
            <div className="flex flex-col items-center gap-3 text-white">
              <Snowflake className="h-16 w-16" />
              <p className="text-xl font-semibold">Card Frozen</p>
            </div>
          </div>
        )}

        <div className="flex h-full flex-col justify-between p-6 sm:p-7 relative z-[2]">
          {/* Top section with chip and logo */}
          <div className="flex items-start justify-between">
            {/* EMV Chip */}
            <div
              className="h-10 w-12 rounded-md"
              style={{
                background: isActive
                  ? "linear-gradient(135deg, #FCD34D 0%, #F59E0B 100%)"
                  : "linear-gradient(135deg, #D1D5DB 0%, #9CA3AF 100%)",
              }}
            />

            {/* Mastercard Logo */}
            <svg width="56" height="36" viewBox="0 0 56 36" fill="none" xmlns="http://www.w3.org/2000/svg">
              <circle cx="20" cy="18" r="14" fill="#EB001B" opacity={isActive ? 1 : 0.6} />
              <circle cx="36" cy="18" r="14" fill="#F79E1B" opacity={isActive ? 1 : 0.6} />
            </svg>
          </div>

          {/* Card Number */}
          <div className="py-4">
            <p className={`font-mono text-2xl tracking-[0.3em] ${isActive ? "text-white" : "text-gray-700"}`}>
              •••• •••• •••• {currentCard.last4}
            </p>
          </div>

          {/* Bottom section with cardholder and expiry */}
          <div className="flex items-end justify-between">
            <div>
              <p
                className={`text-[10px] font-medium uppercase tracking-wider ${isActive ? "text-white/60" : "text-gray-500"}`}
              >
                Card Holder
              </p>
              <p
                className={`mt-1 text-sm font-semibold uppercase tracking-wide ${isActive ? "text-white" : "text-gray-900"}`}
              >
                {currentCard.cardholderName}
              </p>
            </div>
            <div className="text-right">
              <p
                className={`text-[10px] font-medium uppercase tracking-wider ${isActive ? "text-white/60" : "text-gray-500"}`}
              >
                Expires
              </p>
              <p className={`mt-1 text-sm font-semibold ${isActive ? "text-white" : "text-gray-900"}`}>
                {currentCard.expiryDate}
              </p>
            </div>
          </div>
        </div>
      </div>

      {cards.length > 1 && (
        <>
          <Button
            variant="ghost"
            size="icon"
            onClick={goToPrevious}
            className="absolute left-0 top-1/2 -translate-x-1/2 -translate-y-1/2 z-[20] rounded-full bg-white shadow-lg hover:bg-gray-50"
          >
            <ChevronLeft className="h-5 w-5" />
          </Button>
          <Button
            variant="ghost"
            size="icon"
            onClick={goToNext}
            className="absolute right-0 top-1/2 -translate-y-1/2 translate-x-1/2 z-[20] rounded-full bg-white shadow-lg hover:bg-gray-50"
          >
            <ChevronRight className="h-5 w-5" />
          </Button>
        </>
      )}

      {/* Dots Indicator */}
      {cards.length > 1 && (
        <div className="mt-4 flex justify-center gap-2">
          {cards.map((_, index) => (
            <button
              key={index}
              onClick={() => {
                setCurrentIndex(index)
                onCardChange?.(cards[index])
              }}
              className={`h-2 rounded-full transition-all ${
                index === currentIndex ? "w-6 bg-primary" : "w-2 bg-muted-foreground/30"
              }`}
            />
          ))}
        </div>
      )}
    </div>
  )
}
