"use client"

import Link from "next/link"
import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import { PersonalBankingCtas } from "./personal-banking-ctas"
import { MarketingLink } from "./marketing-link"
import type { Cta } from "@/lib/marketing/types"

interface PersonaCtasProps {
  ctas: Cta[]
  className?: string
  storeLayout?: "row" | "column" | "grid"
  surface?: string
  description?: string | false
  compact?: boolean
  align?: "start" | "center" | "responsive"
}

export function PersonaCtas({
  ctas,
  className,
  surface = "persona",
  description,
  compact = false,
  align,
}: PersonaCtasProps) {
  const hasStoreCtas = ctas.some((cta) => cta.store)

  if (hasStoreCtas) {
    return (
      <PersonalBankingCtas
        className={className}
        surface={ctas.find((cta) => cta.analyticsLocation)?.analyticsLocation ?? surface}
        description={description}
        compact={compact}
        align={align}
      />
    )
  }

  return (
    <div className={cn("flex flex-row flex-wrap gap-3", className)}>
      {ctas.map((cta, i) => (
        <Button
          key={cta.label}
          asChild
          variant={i === 0 ? "primary" : "outline"}
          pill
        >
          <MarketingLink
            href={cta.href}
            external={cta.external}
            analyticsLocation={cta.analyticsLocation}
            ctaLabel={cta.label}
          >
            {cta.label}
          </MarketingLink>
        </Button>
      ))}
    </div>
  )
}
