"use client"

import Link from "next/link"
import { Monitor } from "lucide-react"
import { PERSONAL_WEB_APP_URL } from "@/lib/marketing/constants"
import { posthog } from "@/lib/posthog"
import { cn } from "@/lib/utils"

interface UseWebAppButtonProps {
  className?: string
  surface?: string
}

export function UseWebAppButton({ className, surface = "cta" }: UseWebAppButtonProps) {
  function handleClick() {
    posthog.capture("web_app_click", { surface })
  }

  return (
    <Link
      href={PERSONAL_WEB_APP_URL}
      onClick={handleClick}
      className={cn(
        "inline-flex min-h-12 items-center justify-center gap-2.5 rounded-full border border-[#E9E4D8] bg-white px-5 py-3 text-sm font-semibold text-[#0F1110] transition-colors hover:border-[#007ACC]/30 sm:min-h-[3rem] sm:px-6 sm:text-[15px]",
        className
      )}
    >
      <Monitor className="size-[1.15rem] shrink-0" strokeWidth={2} aria-hidden />
      <span>Use Web App</span>
    </Link>
  )
}
