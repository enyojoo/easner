import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import {
  BUSINESS_TIERS,
  PERSONAL_TIERS,
  TIER_FOOTNOTE,
} from "@/lib/marketing/shared-content"

interface TierLadderProps {
  variant: "personal" | "business"
}

export function TierLadder({ variant }: TierLadderProps) {
  const tiers = variant === "personal" ? PERSONAL_TIERS : BUSINESS_TIERS

  return (
    <section className="py-16 md:py-20 bg-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <h2 className="text-3xl sm:text-4xl font-bold text-gray-900 font-unbounded text-center mb-12">
          Tier availability
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {tiers.map((tier, index) => (
            <Card key={tier.title} className="rounded-2xl border-gray-200">
              <CardHeader>
                <span className="text-xs font-medium text-easner-primary uppercase tracking-wide">
                  Tier {index + 1}
                </span>
                <CardTitle className="text-lg text-gray-900">{tier.title}</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-gray-500 leading-relaxed">{tier.description}</p>
              </CardContent>
            </Card>
          ))}
        </div>
        <p className="mt-8 text-center text-sm text-gray-400 italic">{TIER_FOOTNOTE}</p>
      </div>
    </section>
  )
}
