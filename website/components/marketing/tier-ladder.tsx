"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import {
  BUSINESS_TIERS,
  PERSONAL_TIERS,
  TIER_FOOTNOTE,
} from "@/lib/marketing/shared-content"
import { Headline } from "@/components/ds/headline"

interface TierLadderProps {
  variant: "personal" | "business"
}

export function TierLadder({ variant }: TierLadderProps) {
  const tiers = variant === "personal" ? PERSONAL_TIERS : BUSINESS_TIERS

  return (
    <section className="bg-white pb-16 pt-8 md:pb-24 md:pt-12">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <Headline level="section" className="mb-12 text-center">
          Tier availability
        </Headline>
        <div className="grid grid-cols-1 gap-6 md:grid-cols-3">
          {tiers.map((tier, index) => (
            <Card
              key={tier.title}
              className="rounded-[1.5rem] border-web-hairline bg-web-plate/80 shadow-sm"
            >
              <CardHeader>
                <span className="text-xs font-semibold uppercase tracking-[0.12em] text-brand-primary">
                  Tier {index + 1}
                </span>
                <CardTitle className="text-base font-semibold text-web-ink sm:text-lg">{tier.title}</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-sm leading-7 text-web-body">{tier.description}</p>
              </CardContent>
            </Card>
          ))}
        </div>
        <p className="mt-8 text-center text-sm italic leading-7 text-web-meta">{TIER_FOOTNOTE}</p>
      </div>
    </section>
  )
}
