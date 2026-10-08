"use client"

import type { ReactNode } from "react"
import { openMarketingSupport } from "@/lib/intercom-messenger"
import { captureSupportChatOpened } from "@/lib/marketing/analytics"
import { cn } from "@/lib/utils"

type SupportChatTriggerProps = {
  children: ReactNode
  className?: string
  variant?: "button" | "link"
  analyticsLocation?: string
}

export function SupportChatTrigger({
  children,
  className,
  variant = "button",
  analyticsLocation = "support_chat",
}: SupportChatTriggerProps) {
  return (
    <button
      type="button"
      onClick={() => {
        captureSupportChatOpened(analyticsLocation)
        openMarketingSupport()
      }}
      className={cn(
        variant === "button" &&
          "inline-flex min-h-11 items-center justify-center rounded-full bg-brand-primary px-6 py-2.5 text-sm font-semibold text-white shadow-cta transition-colors duration-200 hover:bg-primary-hover",
        variant === "link" && "font-semibold text-brand-primary hover:underline",
        className
      )}
    >
      {children}
    </button>
  )
}
