"use client"

import { SplitSection, TextOnlySection } from "./split-section"
import type { Feature } from "@/lib/marketing/types"

interface FeatureAlternatingProps {
  features: Feature[]
  headline?: string
}

export function FeatureAlternating({ features, headline }: FeatureAlternatingProps) {
  return (
    <section className="bg-[#F6F3EB]">
      {headline && (
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-16 text-center">
          <h2 className="font-unbounded text-2xl font-semibold leading-tight text-[#0F1110] sm:text-4xl">{headline}</h2>
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
