"use client"

import { useLayoutEffect } from "react"
import { motion, useReducedMotion } from "framer-motion"
import { Button } from "@/components/ui/button"
import { VisualSlot } from "./visual-slot"
import { OpenAccountButton } from "./open-account-dialog"
import { PRODUCTS_HASH, scrollToProductsWithPaintRetries } from "./product-anchor"
import { captureCtaClicked } from "@/lib/marketing/analytics"
import { MARKETING_BODY_TEXT } from "@/lib/marketing/layout-constants"
import { homeHero } from "@/lib/marketing/content/home"
import { cn } from "@/lib/utils"
import { Headline } from "@/components/ds/headline"

export function HeroSection() {
  const reducedMotion = useReducedMotion()
  useLayoutEffect(() => {
    if (window.location.hash !== PRODUCTS_HASH) return

    scrollToProductsWithPaintRetries()
  }, [])

  const handleProductsClick = () => {
    captureCtaClicked({
      cta_location: "homepage_hero_explore_products",
      cta_label: homeHero.ctas[1].label,
      destination: "#products",
      destination_type: "anchor",
    })
    window.history.pushState(null, "", PRODUCTS_HASH)
    window.dispatchEvent(new HashChangeEvent("hashchange"))
    scrollToProductsWithPaintRetries()
  }

  return (
    <section className="relative overflow-hidden px-4 pb-12 pt-8 sm:px-6 sm:pb-16 md:pt-14 lg:px-8 lg:pb-20">
      <div className="mx-auto max-w-7xl">
        <motion.div
          initial={false}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: reducedMotion ? 0 : 0.5 }}
          className="mx-auto max-w-7xl text-center"
        >
          <div className="space-y-5">
            <Headline level="hero" lines={homeHero.h1Lines} accentLine={1} className="mx-auto w-full" />
            <p className={cn("mx-auto max-w-2xl text-web-body", MARKETING_BODY_TEXT)}>
              {homeHero.subhead}
            </p>
          </div>
          <div className="mt-8 flex flex-row flex-wrap items-center justify-center gap-3">
            <OpenAccountButton
              ctaLocation="homepage_hero"
              showArrow
            />
            <Button
              variant="outline"
              pill
              onClick={handleProductsClick}
            >
              {homeHero.ctas[1].label}
            </Button>
          </div>
        </motion.div>
        <div className="relative z-10 mx-auto mt-10 max-w-6xl overflow-hidden rounded-[1.5rem] border border-web-hairline bg-web-band pt-6 sm:mt-12 sm:rounded-[1.75rem] sm:pt-0">
          <VisualSlot assetId={homeHero.visualSlot} alt={homeHero.altText} aspect="hero" priority />
        </div>
      </div>
    </section>
  )
}
