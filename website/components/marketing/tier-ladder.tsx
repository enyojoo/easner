"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import {
  BUSINESS_TIERS,
  PERSONAL_TIERS,
  TIER_FOOTNOTE,
} from "@/lib/marketing/shared-content"
import { MARKETING_HEADING_CAPS, MARKETING_SECTION_TITLE } from "@/lib/marketing/layout-constants"
import { cn } from "@/lib/utils"

interface TierLadderProps {
  variant: "personal" | "business"
}

export function TierLadder({ variant }: TierLadderProps) {
  const tiers = variant === "personal" ? PERSONAL_TIERS : BUSINESS_TIERS

  return (
    <section className="bg-white pb-16 pt-8 md:pb-24 md:pt-12">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <h2 className={cn("mb-12 text-center font-unbounded font-bold text-[#0F1110]", MARKETING_SECTION_TITLE, MARKETING_HEADING_CAPS)}>
          Tier availability
        </h2>
        <div className="grid grid-cols-1 gap-6 md:grid-cols-3">
          {tiers.map((tier, index) => (
            <Card
              key={tier.title}
              className="rounded-[1.5rem] border-[#E4DED1] bg-[#F8F6F0]/80 shadow-sm"
            >
              <CardHeader>
                <span className="text-xs font-semibold uppercase tracking-[0.12em] text-[#007ACC]">
                  Tier {index + 1}
                </span>
                <CardTitle className="text-base font-semibold text-[#0F1110] sm:text-lg">{tier.title}</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-sm leading-7 text-[#5F665F]">{tier.description}</p>
              </CardContent>
            </Card>
          ))}
        </div>
        <p className="mt-8 text-center text-sm italic leading-7 text-[#6F756F]">{TIER_FOOTNOTE}</p>
      </div>
    </section>
  )
}
