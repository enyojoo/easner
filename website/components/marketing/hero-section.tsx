"use client"

import { useLayoutEffect } from "react"
import { motion } from "framer-motion"
import { Button } from "@/components/ui/button"
import { VisualSlot } from "./visual-slot"
import { OpenAccountButton } from "./open-account-dialog"
import { PRODUCTS_HASH, scrollToProductsWithPaintRetries } from "./product-anchor"
import { SPLIT_VISUAL_CONTAINER } from "@/lib/marketing/layout-constants"
import { homeHero } from "@/lib/marketing/content/home"
import { cn } from "@/lib/utils"

export function HeroSection() {
  useLayoutEffect(() => {
    if (window.location.hash !== PRODUCTS_HASH) return

    scrollToProductsWithPaintRetries()
  }, [])

  const handleProductsClick = () => {
    window.history.pushState(null, "", PRODUCTS_HASH)
    window.dispatchEvent(new HashChangeEvent("hashchange"))
    scrollToProductsWithPaintRetries()
  }

  return (
    <section className="relative overflow-hidden px-4 pb-12 pt-8 sm:px-6 sm:pb-16 md:pt-14 lg:px-8 lg:pb-20">
      <div className="mx-auto max-w-7xl">
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="mx-auto max-w-7xl text-center"
        >
          <div className="space-y-5">
            <h1 className="mx-auto w-full font-unbounded text-[2rem] font-semibold leading-[1.08] text-[#0F1110] sm:text-4xl md:text-5xl lg:text-6xl">
              {homeHero.h1Lines.map((line, index) => (
                <span
                  key={line}
                  className={index === 1 ? "block text-[#007ACC] lg:whitespace-nowrap" : "block lg:whitespace-nowrap"}
                >
                  {line}
                </span>
              ))}
            </h1>
            <p className="mx-auto max-w-2xl text-base leading-7 text-[#5F665F] sm:text-lg">
              {homeHero.subhead}
            </p>
          </div>
          <div className="mt-8 flex flex-row flex-wrap items-center justify-center gap-3">
            <OpenAccountButton
              showArrow
              className="h-11 rounded-full bg-[#007ACC] px-5 text-sm text-white shadow-[0_12px_30px_rgba(0,122,204,0.22)] hover:bg-[#0062A3] sm:h-12 sm:px-6"
            />
            <Button
              size="lg"
              variant="outline"
              className="h-11 rounded-full border-[#D9D4C7] bg-white/75 px-5 text-sm text-[#0F1110] hover:bg-white sm:h-12 sm:px-6"
              onClick={handleProductsClick}
            >
              {homeHero.ctas[1].label}
            </Button>
          </div>
        </motion.div>
        <div className={cn("relative z-10 mx-auto mt-10 max-w-6xl sm:mt-12", SPLIT_VISUAL_CONTAINER)}>
          <VisualSlot
            assetId={homeHero.visualSlot}
            alt={homeHero.altText}
            aspect="hero"
            className="h-full rounded-none border-0 bg-transparent shadow-none"
            priority
          />
        </div>
      </div>
    </section>
  )
}
