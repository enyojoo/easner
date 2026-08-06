"use client"

import { useState } from "react"
import { cn } from "@/lib/utils"
import { useDownloadPlatform } from "@/hooks/use-download-platform"
import { APP_LINK_URL, buildAppLinkUrl, isMobilePlatform } from "@/lib/download-routing"
import { posthog } from "@/lib/posthog"
import { DownloadAppDialog } from "./download-app-dialog"

function AppleIcon({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" aria-hidden className={className} fill="currentColor">
      <path d="M16.365 1.43c0 1.14-.493 2.096-1.316 2.915-.862.858-1.874 1.338-3.042 1.257-.126-1.106.413-2.14 1.122-2.886.862-.905 2.003-1.456 3.236-1.286zm1.37 4.968c-1.874-.108-3.465 1.066-4.356 1.066-.911 0-2.316-1.044-3.806-.998-1.96.042-3.765 1.14-4.773 2.902-2.037 3.534-.522 8.765 1.463 11.634 1.002 1.445 2.195 3.066 3.764 3.008 1.516-.063 2.086-.98 3.915-.98 1.829 0 2.336.98 3.915.95 1.618-.027 2.64-1.47 3.63-2.924 1.145-1.674 1.616-3.296 1.644-3.378-.036-.016-3.158-1.212-3.186-4.81-.021-3.012 2.465-4.45 2.577-4.522-1.403-2.055-3.587-2.334-4.353-2.376z" />
    </svg>
  )
}

function PlayIcon({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 28.99 31.99" aria-hidden className={className} xmlns="http://www.w3.org/2000/svg">
      <path fill="#EA4335" d="M13.54 15.28.12 29.34a3.66 3.66 0 0 0 5.33 2.16l15.1-8.6Z" />
      <path
        fill="#FBBC04"
        d="m27.11 12.89-6.53-3.74-7.35 6.45 7.38 7.28 6.48-3.7a3.54 3.54 0 0 0 1.5-4.79 3.62 3.62 0 0 0-1.5-1.5z"
      />
      <path fill="#4285F4" d="M.12 2.66a3.57 3.57 0 0 0-.12.92v24.84a3.57 3.57 0 0 0 .12.92L14 15.64Z" />
      <path
        fill="#34A853"
        d="m13.64 16 6.94-6.85L5.5.51A3.73 3.73 0 0 0 3.63 0 3.64 3.64 0 0 0 .12 2.65Z"
      />
    </svg>
  )
}

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
      const params = new URLSearchParams()
      if (src) params.set("src", src)
      const href = params.size > 0 ? buildAppLinkUrl(params) : APP_LINK_URL
      posthog.capture("download_click", {
        surface,
        platform,
        action: "redirect",
      })
      window.location.href = href
      return
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
        <span className="flex items-center gap-1.5" aria-hidden>
          <AppleIcon className="h-5 w-5" />
          <PlayIcon className="h-5 w-[1.15rem]" />
        </span>
        <span>Download the App</span>
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
