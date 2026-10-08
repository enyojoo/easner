"use client"

import { useLayoutEffect, useRef } from "react"
import Link from "next/link"
import { ArrowRight } from "lucide-react"
import { cn } from "@/lib/utils"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { VisualSlot } from "./visual-slot"
import { MarketingLink } from "./marketing-link"
import { scrollToProductsWithPaintRetries } from "./product-anchor"
import { captureCtaClicked } from "@/lib/marketing/analytics"
import { MARKETING_BODY_TEXT } from "@/lib/marketing/layout-constants"
import type { CardItem } from "@/lib/marketing/types"
import { Headline } from "@/components/ds/headline"

interface ThreeColCardsProps {
  headline?: string
  subhead?: string
  headlineClassName?: string
  items: CardItem[]
  columns?: 2 | 3 | 4
  showIcons?: boolean
  id?: string
  className?: string
  analyticsSection?: string
  /** Inline links under the grid, for related jobs that have their own page. */
  footerLinks?: { label: string; href: string }[]
}

export function ThreeColCards({
  headline,
  subhead,
  headlineClassName,
  footerLinks,
  items,
  columns = 3,
  showIcons = false,
  id,
  className,
  analyticsSection,
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
      className={cn("bg-web-band scroll-mt-24 pb-14 pt-7 md:scroll-mt-28 md:pb-24 md:pt-12", className)}
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {headline && (
          <div className="mx-auto mb-9 max-w-3xl text-center sm:mb-12 lg:max-w-none">
            <Headline level="section" className={cn(headlineClassName)}>
              {headline}
            </Headline>
            {subhead && <p className={cn("mx-auto mt-4 max-w-2xl text-web-body", MARKETING_BODY_TEXT)}>{subhead}</p>}
          </div>
        )}
        <div className={gridClass}>
          {items.map((item) => {
            const content = (
              <Card className="group h-full overflow-hidden rounded-[1.25rem] border-web-hairline bg-web-canvas/90 shadow-soft transition-all hover:-translate-y-1 hover:border-brand-primary/30 hover:shadow-lift sm:rounded-[1.5rem]">
                {showIcons && item.icon && (
                  <div className="px-5 pt-5 sm:px-6 sm:pt-6">
                    <VisualSlot assetId={item.icon} alt={item.title} aspect="square" className="h-14 w-14 !aspect-square rounded-[16px] shadow-none sm:h-16 sm:w-16" />
                  </div>
                )}
                <CardHeader>
                  <CardTitle className="text-base font-semibold leading-snug text-web-ink sm:text-lg">
                    {item.title}
                    {item.link && (
                      <ArrowRight
                        className="ml-1.5 inline-block size-4 -translate-y-px align-middle text-brand-primary transition-transform duration-150 group-hover:translate-x-1"
                        aria-hidden="true"
                      />
                    )}
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-[15px] leading-6 text-web-body">{item.description}</p>
                </CardContent>
              </Card>
            )

            const link = item.link
            if (link) {
              const analyticsLocation = analyticsSection
                ? `${analyticsSection}_${link.replace(/^\//, "").replace(/\//g, "_") || "home"}`
                : undefined

              return (
                <Link
                  key={item.title}
                  href={link}
                  className="block h-full"
                  onClick={() => {
                    if (!analyticsLocation) return
                    captureCtaClicked({
                      cta_location: analyticsLocation,
                      cta_label: item.title,
                      destination: link,
                      destination_type: "internal",
                    })
                  }}
                >
                  {content}
                </Link>
              )
            }

            return <div key={item.title}>{content}</div>
          })}
        </div>
        {footerLinks && footerLinks.length > 0 && (
          <div className="mt-8 flex flex-wrap items-center justify-center gap-x-8 gap-y-3">
            {footerLinks.map((link) => (
              <MarketingLink
                key={link.href}
                href={link.href}
                analyticsLocation={`${analyticsSection ?? "use_cases"}_${link.href.replace(/^\//, "")}`}
                ctaLabel={link.label}
                className="group inline-flex items-center gap-1.5 text-[15px] font-semibold text-web-link hover:underline"
              >
                {link.label}
                <ArrowRight className="size-4 transition-transform duration-150 group-hover:translate-x-0.5" aria-hidden="true" />
              </MarketingLink>
            ))}
          </div>
        )}
      </div>
    </section>
  )
}
