"use client"

import type { ReactNode } from "react"
import { openMarketingSupport } from "@/lib/intercom-messenger"
import { cn } from "@/lib/utils"

type SupportChatTriggerProps = {
  children: ReactNode
  className?: string
  variant?: "button" | "link"
}

export function SupportChatTrigger({
  children,
  className,
  variant = "button",
}: SupportChatTriggerProps) {
  return (
    <button
      type="button"
      onClick={openMarketingSupport}
      className={cn(
        variant === "button" &&
          "inline-flex min-h-11 items-center justify-center rounded-full bg-[#007ACC] px-6 py-2.5 text-sm font-semibold text-white shadow-[0_10px_25px_rgba(0,122,204,0.2)] transition-all duration-200 hover:bg-[#0062A3] hover:shadow-[0_14px_32px_rgba(0,122,204,0.22)]",
        variant === "link" && "font-semibold text-[#007ACC] hover:underline",
        className
      )}
    >
      {children}
    </button>
  )
}
