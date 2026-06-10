"use client"

import { useLayoutEffect, useRef } from "react"
import Link from "next/link"
import { cn } from "@/lib/utils"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { VisualSlot } from "./visual-slot"
import { scrollToProductsWithPaintRetries } from "./product-anchor"
import { MARKETING_HEADING_CAPS, MARKETING_SECTION_TITLE } from "@/lib/marketing/layout-constants"
import type { CardItem } from "@/lib/marketing/types"

interface ThreeColCardsProps {
  headline?: string
  subhead?: string
  headlineClassName?: string
  items: CardItem[]
  columns?: 2 | 3 | 4
  showIcons?: boolean
  id?: string
  className?: string
}

export function ThreeColCards({
  headline,
  subhead,
  headlineClassName,
  items,
  columns = 3,
  showIcons = false,
  id,
  className,
}: ThreeColCardsProps) {
  const sectionRef = useRef<HTMLElement>(null)
  const gridClass =
    columns === 4
      ? "grid grid-cols-1 gap-4 sm:grid-cols-2 sm:gap-5 lg:grid-cols-4 lg:gap-6"
      : columns === 2
        ? "mx-auto grid max-w-4xl grid-cols-1 gap-4 sm:gap-5 md:grid-cols-2 lg:gap-6"
        : "grid grid-cols-1 gap-4 sm:gap-5 md:grid-cols-3 lg:gap-6"

  useLayoutEffect(() => {
    if (!id) return

    const scrollToHash = () => {
      if (window.location.hash !== `#${id}`) return

      if (id === "products") {
        scrollToProductsWithPaintRetries()
        return
      }

      sectionRef.current?.scrollIntoView({ block: "start", behavior: "auto" })
    }

    scrollToHash()
    window.addEventListener("hashchange", scrollToHash)

    return () => window.removeEventListener("hashchange", scrollToHash)
  }, [id])

  return (
    <section
      ref={sectionRef}
      id={id}
      className={cn("bg-[#F6F3EB] scroll-mt-24 pb-14 pt-7 md:scroll-mt-28 md:pb-24 md:pt-12", className)}
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {headline && (
          <div className="mx-auto mb-9 max-w-3xl text-center sm:mb-12 lg:max-w-none">
            <h2
              className={cn("font-unbounded font-bold text-[#0F1110]", MARKETING_SECTION_TITLE, MARKETING_HEADING_CAPS, headlineClassName)}
            >
              {headline}
            </h2>
            {subhead && <p className="mx-auto mt-4 max-w-2xl text-base leading-7 text-[#5F665F] sm:text-lg sm:leading-8">{subhead}</p>}
          </div>
        )}
        <div className={gridClass}>
          {items.map((item) => {
            const content = (
              <Card className="group h-full overflow-hidden rounded-[1.25rem] border-[#E4DED1] bg-white/90 shadow-[0_12px_35px_rgba(15,17,16,0.05)] transition-all hover:-translate-y-1 hover:border-[#007ACC]/30 hover:shadow-[0_20px_55px_rgba(15,17,16,0.09)] sm:rounded-[1.5rem]">
                {showIcons && item.icon && (
                  <div className="px-5 pt-5 sm:px-6 sm:pt-6">
                    <VisualSlot assetId={item.icon} alt={item.title} aspect="square" className="h-14 w-14 !aspect-square rounded-2xl shadow-none sm:h-16 sm:w-16" />
                  </div>
                )}
                <CardHeader>
                  <CardTitle className="text-lg font-semibold leading-snug text-[#0F1110]">{item.title}</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-sm leading-7 text-[#5F665F]">{item.description}</p>
                </CardContent>
              </Card>
            )

            if (item.link) {
              return (
                <Link key={item.title} href={item.link} className="block h-full">
                  {content}
                </Link>
              )
            }

            return <div key={item.title}>{content}</div>
          })}
        </div>
      </div>
    </section>
  )
}
