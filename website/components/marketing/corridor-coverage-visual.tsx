import type { ComponentType } from "react"
import Link from "next/link"
import { ArrowRight, Globe2 } from "lucide-react"
import {
  IconBrazil,
  IconEurope,
  IconIndia,
  IconMexico,
  IconNigeria,
  IconPhilippines,
  IconUnitedKingdom,
  IconUnitedStates,
  type IconProps,
} from "nucleo-flags"
import { EASNER_CORRIDOR_VISUAL_ARIA_LABEL } from "@/lib/marketing/positioning"
import { cn } from "@/lib/utils"

type FlagIcon = ComponentType<IconProps>

/**
 * Each tile goes to that country's payout page; "More markets" goes to the hub that lists every country.
 */
const corridorMarkets: { label: string; Flag?: FlagIcon; href?: string }[] = [
  { label: "United States", Flag: IconUnitedStates, href: "/business/pay-contractors-in-the-united-states" },
  { label: "Europe", Flag: IconEurope, href: "/business/pay-contractors-in-europe" },
  { label: "United Kingdom", Flag: IconUnitedKingdom, href: "/business/pay-contractors-in-the-united-kingdom" },
  { label: "Nigeria", Flag: IconNigeria, href: "/business/pay-contractors-in-nigeria" },
  { label: "Mexico", Flag: IconMexico, href: "/business/pay-contractors-in-mexico" },
  { label: "Philippines", Flag: IconPhilippines, href: "/business/pay-contractors-in-the-philippines" },
  { label: "India", Flag: IconIndia, href: "/business/pay-contractors-in-india" },
  { label: "Brazil", Flag: IconBrazil, href: "/business/pay-contractors-in-brazil" },
  { label: "More markets", href: "/business/pay-overseas-suppliers" },
]

interface CorridorCoverageVisualProps {
  className?: string
  "aria-label"?: string
}

/**
 * Where money goes: the 80+ figure above neutral market tiles.
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
          {corridorMarkets.map((market) => {
            const tile = (
              <>
                <span className="flex size-9 items-center justify-center overflow-hidden rounded-[10px] sm:size-10">
                  {market.Flag ? (
                    <market.Flag className="size-7 sm:size-8" aria-hidden />
                  ) : (
                    <Globe2 className="size-5 text-brand-primary" aria-hidden />
                  )}
                </span>
                <span
                  className={cn(
                    "inline-flex items-center gap-1 text-[11px] font-semibold leading-tight sm:text-xs",
                    market.Flag ? "text-web-ink" : "text-web-meta",
                    market.href && !market.Flag && "group-hover:text-brand-primary",
                  )}
                >
                  {market.label}
                  {market.href && !market.Flag && <ArrowRight className="size-3" aria-hidden />}
                </span>
              </>
            )
            const tileClass = cn(
              "flex flex-col items-center gap-2 rounded-[16px] border bg-web-canvas px-2 py-3 text-center sm:px-3",
              market.Flag ? "border-web-hairline" : "border-dashed border-brand-stone",
            )
            return market.href ? (
              <Link
                key={market.label}
                href={market.href}
                className={cn(
                  tileClass,
                  "group transition-all hover:-translate-y-0.5 hover:border-brand-primary/40 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-primary",
                )}
              >
                {tile}
              </Link>
            ) : (
              <div key={market.label} className={tileClass}>
                {tile}
              </div>
            )
          })}
        </div>
      </div>
    </div>
  )
}
