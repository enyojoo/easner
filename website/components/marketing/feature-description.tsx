"use client"

import type { FeatureDescriptionPart } from "@/lib/marketing/currency-assets"
import { CurrencyBadge } from "./currency-badge"
import { LinkedText } from "./linked-text"

interface FeatureDescriptionProps {
  parts: FeatureDescriptionPart[]
}

export function FeatureDescription({ parts }: FeatureDescriptionProps) {
  return (
    <>
      {parts.map((part, index) =>
        typeof part === "string" ? (
          <LinkedText key={index} text={part} analyticsLocation="feature_inline_url" />
        ) : (
          <CurrencyBadge key={index} code={part.badge} />
        )
      )}
    </>
  )
}
