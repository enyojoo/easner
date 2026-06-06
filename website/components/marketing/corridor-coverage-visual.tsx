import type { ComponentType } from "react"
import { Globe2 } from "lucide-react"
import {
  IconEurope,
  IconGhana,
  IconKenya,
  IconNigeria,
  IconRwanda,
  IconSouthAfrica,
  IconUnitedKingdom,
  IconUnitedStates,
  type IconProps,
} from "nucleo-flags"
import { cn } from "@/lib/utils"

type FlagIcon = ComponentType<IconProps>

type MarketBadge =
  | { label: string; Flag: FlagIcon; accent: string; soon?: false }
  | { label: string; soon: true; accent: string }

const corridorMarkets: MarketBadge[] = [
  { label: "United States", Flag: IconUnitedStates, accent: "from-[#EAF5FD] to-white" },
  { label: "Europe", Flag: IconEurope, accent: "from-[#EEF0FF] to-white" },
  { label: "United Kingdom", Flag: IconUnitedKingdom, accent: "from-[#F3F0E8] to-white" },
  { label: "Nigeria", Flag: IconNigeria, accent: "from-[#E8F7F0] to-white" },
  { label: "Ghana", Flag: IconGhana, accent: "from-[#FFF8E8] to-white" },
  { label: "Kenya", Flag: IconKenya, accent: "from-[#FFF4E8] to-white" },
  { label: "Rwanda", Flag: IconRwanda, accent: "from-[#FCEEF3] to-white" },
  { label: "South Africa", Flag: IconSouthAfrica, accent: "from-[#EEF6FF] to-white" },
  { label: "More markets", soon: true, accent: "from-[#F8F6F0] to-white" },
]

interface CorridorCoverageVisualProps {
  className?: string
}

export function CorridorCoverageVisual({ className }: CorridorCoverageVisualProps) {
  return (
    <div
      className={cn(
        "relative overflow-hidden rounded-[1.75rem] border border-[#E4DED1] bg-[#F8F6F0] shadow-[0_24px_80px_rgba(15,17,16,0.12)]",
        className
      )}
      aria-label="Supported corridor markets across the United States, Europe, United Kingdom, Nigeria, Ghana, Kenya, Rwanda, South Africa, and more to come"
    >
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_18%_12%,rgba(0,122,204,0.12),transparent_34%),radial-gradient(circle_at_82%_88%,rgba(15,138,95,0.10),transparent_32%)]" />
      <div className="relative p-5 sm:p-6">
        <div className="relative overflow-hidden rounded-2xl border border-[#E9E4D8] bg-white/75 p-4 shadow-inner sm:p-5">
          <div className="pointer-events-none absolute inset-0 opacity-60">
            <div className="absolute left-[14%] top-[22%] h-2 w-2 rounded-full bg-[#007ACC]" />
            <div className="absolute right-[18%] bottom-[20%] h-2 w-2 rounded-full bg-[#0F8A5F]" />
            <div className="absolute left-[18%] top-[24%] h-px w-[58%] rotate-[14deg] bg-gradient-to-r from-[#007ACC]/45 via-[#007ACC]/15 to-[#0F8A5F]/45" />
          </div>

          <div className="relative grid grid-cols-3 gap-2.5 sm:gap-3">
            {corridorMarkets.map((market) => (
              <div
                key={market.label}
                className={cn(
                  "group flex flex-col items-center gap-2 rounded-2xl border bg-gradient-to-br px-2 py-3 text-center shadow-sm transition-all duration-200 sm:px-3 sm:py-3.5",
                  market.soon
                    ? "border-dashed border-[#D9D4C7] hover:border-[#007ACC]/30"
                    : "border-[#E4DED1] hover:-translate-y-0.5 hover:border-[#007ACC]/35 hover:shadow-md",
                  market.accent
                )}
              >
                <span
                  className={cn(
                    "flex size-10 items-center justify-center overflow-hidden rounded-xl bg-white sm:size-11",
                    market.soon ? "ring-1 ring-dashed ring-[#D9D4C7]" : "ring-1 ring-[#E4DED1]"
                  )}
                >
                  {market.soon ? (
                    <Globe2 className="size-5 text-[#007ACC]" aria-hidden />
                  ) : (
                    <market.Flag className="size-7 sm:size-8" aria-hidden />
                  )}
                </span>
                <span
                  className={cn(
                    "text-[11px] font-semibold leading-tight sm:text-xs",
                    market.soon ? "text-[#6F756F]" : "text-[#0F1110]"
                  )}
                >
                  {market.label}
                </span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}
