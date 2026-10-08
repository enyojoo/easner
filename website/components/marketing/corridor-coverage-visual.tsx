import type { ComponentType } from "react"
import { ArrowRight, Globe2 } from "lucide-react"
import {
  IconChina,
  IconEurope,
  IconIndia,
  IconMexico,
  IconNigeria,
  IconPhilippines,
  IconUnitedKingdom,
  IconUnitedStates,
  type IconProps,
} from "nucleo-flags"
import { CurrencyFlag } from "@/components/ds/currency-flag"
import { formatMoney, formatRate } from "@/lib/marketing/format-money"
import { EASNER_CORRIDOR_VISUAL_ARIA_LABEL } from "@/lib/marketing/positioning"
import { cn } from "@/lib/utils"

type FlagIcon = ComponentType<IconProps>

const corridorMarkets: { label: string; Flag?: FlagIcon }[] = [
  { label: "United States", Flag: IconUnitedStates },
  { label: "Europe", Flag: IconEurope },
  { label: "United Kingdom", Flag: IconUnitedKingdom },
  { label: "Nigeria", Flag: IconNigeria },
  { label: "Mexico", Flag: IconMexico },
  { label: "Philippines", Flag: IconPhilippines },
  { label: "India", Flag: IconIndia },
  { label: "China", Flag: IconChina },
  { label: "More markets" },
]

interface CorridorCoverageVisualProps {
  className?: string
  "aria-label"?: string
}

/**
 * Where money goes: neutral market tiles, the 80+ figure, and one example payout in the rate format
 * ("$1 = ₦1,359"). The rate is illustrative and labelled as such.
 */
export function CorridorCoverageVisual({ className, "aria-label": ariaLabel }: CorridorCoverageVisualProps) {
  return (
    <div
      className={cn("relative overflow-hidden rounded-[1.75rem] border border-web-hairline bg-web-plate shadow-showcase", className)}
      aria-label={ariaLabel ?? EASNER_CORRIDOR_VISUAL_ARIA_LABEL}
    >
      <div className="relative flex h-full flex-col justify-center gap-4 p-5 sm:p-6">
        <div className="flex items-end justify-between">
          <span>
            <span className="block text-4xl font-semibold leading-none tracking-[-0.03em] text-web-ink sm:text-5xl">80+</span>
            <span className="mt-1 block text-sm text-web-meta">countries for payouts</span>
          </span>
        </div>
        <div className="grid grid-cols-3 gap-2.5 sm:gap-3">
          {corridorMarkets.map((market) => (
            <div
              key={market.label}
              className={cn(
                "flex flex-col items-center gap-2 rounded-[16px] border bg-web-canvas px-2 py-3 text-center sm:px-3",
                market.Flag ? "border-web-hairline" : "border-dashed border-brand-stone",
              )}
            >
              <span className="flex size-9 items-center justify-center overflow-hidden rounded-[10px] sm:size-10">
                {market.Flag ? (
                  <market.Flag className="size-7 sm:size-8" aria-hidden />
                ) : (
                  <Globe2 className="size-5 text-brand-primary" aria-hidden />
                )}
              </span>
              <span className={cn("text-[11px] font-semibold leading-tight sm:text-xs", market.Flag ? "text-web-ink" : "text-web-meta")}>
                {market.label}
              </span>
            </div>
          ))}
        </div>
        <div className="flex items-center gap-3 rounded-[16px] border border-web-hairline bg-web-canvas px-4 py-3 text-sm">
          <CurrencyFlag code="US" size={24} />
          <ArrowRight className="size-4 text-web-meta" aria-hidden="true" />
          <CurrencyFlag code="NG" size={24} />
          <span className="flex-1 font-medium text-web-ink">
            {formatMoney(450, "USD")} → {formatMoney(611550, "NGN")}
          </span>
          <span className="text-web-meta">{formatRate("USD", "NGN", 1359)} · Example</span>
        </div>
      </div>
    </div>
  )
}
