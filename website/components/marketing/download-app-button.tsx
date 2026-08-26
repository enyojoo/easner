"use client"

import { useState } from "react"
import { cn } from "@/lib/utils"
import { useDownloadPlatform } from "@/hooks/use-download-platform"
import { getDownloadDestination, detectPlatform, isMobilePlatform } from "@/lib/download-routing"
import { posthog } from "@/lib/posthog"
import { captureCtaClicked } from "@/lib/marketing/analytics"
import { DownloadAppDialog } from "./download-app-dialog"
import { StoreBadgeIcons } from "./store-icons"

interface DownloadAppButtonProps {
  className?: string
  variant?: "primary" | "dark" | "outline"
  src?: string
  surface?: string
  compact?: boolean
  /** When true, always open the dialog instead of redirecting on mobile. */
  forceDialog?: boolean
}

export function DownloadAppButton({
  className,
  variant = "primary",
  src,
  surface = "cta",
  compact = false,
  forceDialog = false,
}: DownloadAppButtonProps) {
  const [open, setOpen] = useState(false)
  const dialogPlatform = useDownloadPlatform()

  function handleClick() {
    const platform = detectPlatform(typeof navigator !== "undefined" ? navigator.userAgent : null)

    if (!forceDialog && isMobilePlatform(platform)) {
      const destination = getDownloadDestination(platform)
      if (destination) {
        posthog.capture("download_click", {
          surface,
          platform,
          action: "redirect",
        })
        captureCtaClicked({
          cta_location: surface,
          cta_label: "Download",
          destination,
          destination_type: "download",
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
    captureCtaClicked({
      cta_location: surface,
      cta_label: "Download",
      destination: "download_dialog",
      destination_type: "dialog",
    })
    setOpen(true)
  }

  return (
    <>
      <button
        type="button"
        onClick={handleClick}
        className={cn(
          "inline-flex shrink-0 items-center justify-center whitespace-nowrap rounded-full font-semibold transition-colors",
          compact
            ? "min-h-10 gap-1.5 px-3.5 py-2 text-[13px] sm:text-sm"
            : "min-h-12 gap-2.5 px-5 py-3 text-sm sm:min-h-[3rem] sm:px-6 sm:text-[15px]",
          variant === "primary" &&
            "bg-[#007ACC] text-[#F6F3EB] hover:bg-[#0062A3]",
          variant === "dark" &&
            "border border-[#0F1110] bg-[#0F1110] text-white hover:opacity-90",
          variant === "outline" &&
            "border border-[#E9E4D8] bg-white text-[#0F1110] hover:border-[#007ACC]/30",
          className
        )}
      >
        <StoreBadgeIcons className={compact ? "h-[1.2rem] scale-90" : undefined} />
        <span className="whitespace-nowrap">Download</span>
      </button>
      <DownloadAppDialog
        open={open}
        onOpenChange={setOpen}
        platform={dialogPlatform}
        src={src}
        surface={surface}
      />
    </>
  )
}
