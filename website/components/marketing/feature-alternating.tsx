"use client"

import { SplitSection, TextOnlySection } from "./split-section"
import type { Feature } from "@/lib/marketing/types"
import { Headline } from "@/components/ds/headline"

interface FeatureAlternatingProps {
  features: Feature[]
  headline?: string
}

export function FeatureAlternating({ features, headline }: FeatureAlternatingProps) {
  return (
    <section className="bg-web-band">
      {headline && (
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-16 text-center">
          <Headline level="section">{headline}</Headline>
        </div>
      )}
      {features.map((feature, index) =>
        feature.visualSlot ? (
          <SplitSection
            key={feature.title}
            headline={feature.title}
            body={feature.description}
            visualSlot={feature.visualSlot}
            altText={feature.altText ?? feature.title}
            reverse={index % 2 === 1}
            variant="content"
          />
        ) : (
          <TextOnlySection key={feature.title} headline={feature.title} body={feature.description} />
        )
      )}
    </section>
  )
}
