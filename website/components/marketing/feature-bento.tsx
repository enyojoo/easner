"use client"

import { VisualSlot } from "./visual-slot"
import { FeatureDescription } from "./feature-description"
import type { Feature } from "@/lib/marketing/types"
import { BENTO_VISUAL_HEIGHT, MARKETING_BODY_TEXT } from "@/lib/marketing/layout-constants"
import { cn } from "@/lib/utils"
import { Headline } from "@/components/ds/headline"

interface FeatureBentoProps {
  features: Feature[]
  headline?: string
  subhead?: string
  className?: string
  id?: string
}

export function FeatureBento({ features, headline, subhead, className, id }: FeatureBentoProps) {
  return (
    <section id={id} className={cn("scroll-mt-24 bg-web-band pb-14 pt-7 md:pb-24 md:pt-12", className)}>
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        {(headline || subhead) && (
          <div className="mx-auto mb-10 max-w-3xl text-center md:mb-12 lg:max-w-none lg:text-left">
            {headline && (
              <Headline level="section">
                {headline}
              </Headline>
            )}
            {subhead && <p className={cn("mt-4 text-web-body", MARKETING_BODY_TEXT)}>{subhead}</p>}
          </div>
        )}
        <div className="grid grid-cols-1 gap-4 sm:gap-5 md:grid-cols-2 md:gap-8">
          {features.map((feature) => (
            <article
              key={feature.title}
              className="flex h-full flex-col overflow-hidden rounded-[1.25rem] border border-web-hairline bg-white/90 shadow-[0_12px_35px_rgba(15,17,16,0.05)] sm:rounded-[1.75rem]"
            >
              {feature.visualSlot && (
                <div className={cn("relative w-full shrink-0 overflow-hidden", BENTO_VISUAL_HEIGHT)}>
                  <VisualSlot
                    assetId={feature.visualSlot}
                    alt={feature.altText ?? feature.title}
                    aspect="card"
                    className="h-full rounded-none border-0 shadow-none"
                  />
                </div>
              )}
              <div className="flex flex-1 flex-col p-5 sm:p-7">
                <Headline level="sub">
                  {feature.title}
                </Headline>
                <p className="mt-3 flex-1 text-base leading-7 text-web-body">
                  {feature.descriptionParts ? (
                    <FeatureDescription parts={feature.descriptionParts} />
                  ) : (
                    feature.description
                  )}
                </p>
              </div>
            </article>
          ))}
        </div>
      </div>
    </section>
  )
}
