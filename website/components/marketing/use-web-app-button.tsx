"use client"

import { Monitor } from "lucide-react"
import { PersonalAppLink } from "./personal-app-link"
import { cn } from "@/lib/utils"

interface UseWebAppButtonProps {
  className?: string
  surface?: string
  compact?: boolean
}

export function UseWebAppButton({ className, surface = "cta", compact = false }: UseWebAppButtonProps) {
  return (
    <PersonalAppLink
      campaign={surface}
      ctaLabel="Web App"
      className={cn(
        "inline-flex shrink-0 items-center justify-center whitespace-nowrap rounded-full border border-[#E9E4D8] bg-white font-semibold text-[#0F1110] transition-colors hover:border-[#007ACC]/30",
        compact
          ? "min-h-10 gap-1.5 px-3.5 py-2 text-[13px] sm:text-sm"
          : "min-h-12 gap-2.5 px-5 py-3 text-sm sm:min-h-[3rem] sm:px-6 sm:text-[15px]",
        className
      )}
    >
      <Monitor
        className={cn("shrink-0", compact ? "size-4" : "size-[1.15rem]")}
        strokeWidth={2}
        aria-hidden
      />
      <span className="whitespace-nowrap">Web App</span>
    </PersonalAppLink>
  )
}
