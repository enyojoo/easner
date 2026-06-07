"use client"

import type { FeatureDescriptionPart } from "@/lib/marketing/currency-assets"
import { CurrencyBadge } from "./currency-badge"

interface FeatureDescriptionProps {
  parts: FeatureDescriptionPart[]
}

export function FeatureDescription({ parts }: FeatureDescriptionProps) {
  return (
    <>
      {parts.map((part, index) =>
        typeof part === "string" ? (
          <span key={index}>{part}</span>
        ) : (
          <CurrencyBadge key={index} code={part.badge} />
        )
      )}
    </>
  )
}
