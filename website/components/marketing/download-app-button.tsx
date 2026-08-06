"use client"

import { useState } from "react"
import { cn } from "@/lib/utils"
import { useDownloadPlatform } from "@/hooks/use-download-platform"
import { getDownloadDestination, isMobilePlatform } from "@/lib/download-routing"
import { posthog } from "@/lib/posthog"
import { DownloadAppDialog } from "./download-app-dialog"
import { StoreBadgeIcons } from "./store-icons"

interface DownloadAppButtonProps {
  className?: string
  variant?: "primary" | "dark" | "outline"
  src?: string
  surface?: string
  /** When true, always open the dialog (for use on /download desktop landing). */
  forceDialog?: boolean
}

export function DownloadAppButton({
  className,
  variant = "primary",
  src,
  surface = "cta",
  forceDialog = false,
}: DownloadAppButtonProps) {
  const platform = useDownloadPlatform()
  const [open, setOpen] = useState(false)

  function handleClick() {
    if (!forceDialog && isMobilePlatform(platform)) {
      const destination = getDownloadDestination(platform)
      if (destination) {
        posthog.capture("download_click", {
          surface,
          platform,
          action: "redirect",
        })
        window.location.href = destination
        return
      }
    }

    posthog.capture("download_click", {
      surface,
      platform,
      action: "open_dialog",
    })
    setOpen(true)
  }

  return (
    <>
      <button
        type="button"
        onClick={handleClick}
        className={cn(
          "inline-flex min-h-12 items-center justify-center gap-2.5 rounded-full px-5 py-3 text-sm font-semibold transition-colors sm:min-h-[3rem] sm:px-6 sm:text-[15px]",
          variant === "primary" &&
            "bg-[#007ACC] text-[#F6F3EB] hover:bg-[#0062A3]",
          variant === "dark" &&
            "border border-[#0F1110] bg-[#0F1110] text-white hover:opacity-90",
          variant === "outline" &&
            "border border-[#E9E4D8] bg-white text-[#0F1110] hover:border-[#007ACC]/30",
          className
        )}
      >
        <StoreBadgeIcons />
        <span>Download</span>
      </button>
      <DownloadAppDialog
        open={open}
        onOpenChange={setOpen}
        platform={platform}
        src={src}
        surface={surface}
      />
    </>
  )
}
