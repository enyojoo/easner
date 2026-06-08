"use client"

import type { MouseEvent } from "react"
import Link from "next/link"
import { cn } from "@/lib/utils"
import { ANDROID_APK_URL, TESTFLIGHT_URL } from "@/lib/marketing/constants"

function AppleIcon({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" aria-hidden className={className} fill="currentColor">
      <path d="M16.365 1.43c0 1.14-.493 2.096-1.316 2.915-.862.858-1.874 1.338-3.042 1.257-.126-1.106.413-2.14 1.122-2.886.862-.905 2.003-1.456 3.236-1.286zm1.37 4.968c-1.874-.108-3.465 1.066-4.356 1.066-.911 0-2.316-1.044-3.806-.998-1.96.042-3.765 1.14-4.773 2.902-2.037 3.534-.522 8.765 1.463 11.634 1.002 1.445 2.195 3.066 3.764 3.008 1.516-.063 2.086-.98 3.915-.98 1.829 0 2.336.98 3.915.95 1.618-.027 2.64-1.47 3.63-2.924 1.145-1.674 1.616-3.296 1.644-3.378-.036-.016-3.158-1.212-3.186-4.81-.021-3.012 2.465-4.45 2.577-4.522-1.403-2.055-3.587-2.334-4.353-2.376z" />
    </svg>
  )
}

function AndroidIcon({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" aria-hidden className={className} xmlns="http://www.w3.org/2000/svg">
      <path
        fill="#3DDC84"
        d="M17.6 9.48l1.84-3.18a.5.5 0 0 0-.18-.68.5.5 0 0 0-.68.18l-1.87 3.24a7.02 7.02 0 0 0-7.42 0L6.32 5.8a.5.5 0 0 0-.68-.18.5.5 0 0 0-.18.68L7.4 9.48A6.97 6.97 0 0 0 4 14.5h16a6.97 6.97 0 0 0-3.4-5.02zM8.5 13.25a.75.75 0 1 1 0-1.5.75.75 0 0 1 0 1.5zm7 0a.75.75 0 1 1 0-1.5.75.75 0 0 1 0 1.5z"
      />
      <path
        fill="#3DDC84"
        d="M4 15.5v2.75A2.75 2.75 0 0 0 6.75 21h.5v2.25a1.25 1.25 0 0 0 2.5 0V21h4.5v2.25a1.25 1.25 0 0 0 2.5 0V21h.5A2.75 2.75 0 0 0 20 18.25V15.5H4z"
      />
    </svg>
  )
}

interface BetaDownloadButtonsProps {
  className?: string
  layout?: "row" | "column" | "grid"
}

const betaLinkClass =
  "inline-flex min-h-12 min-w-0 w-full items-center justify-center gap-2.5 rounded-xl px-3 py-3 transition-opacity hover:opacity-90 sm:min-h-0 sm:gap-3 sm:px-4 sm:py-2.5"

function betaLinkProps(href: string, { newTab = true }: { newTab?: boolean } = {}) {
  const placeholder = href === "#"
  const external = !placeholder && newTab
  return {
    href,
    onClick: placeholder ? (event: MouseEvent) => event.preventDefault() : undefined,
    target: external ? ("_blank" as const) : undefined,
    rel: external ? "noopener noreferrer" : undefined,
    "aria-disabled": placeholder ? true : undefined,
  }
}

export function BetaDownloadButtons({ className, layout = "row" }: BetaDownloadButtonsProps) {
  return (
    <div
      className={cn(
        "gap-2.5 sm:gap-3",
        layout === "grid"
          ? "grid grid-cols-1 sm:grid-cols-2"
          : layout === "row"
            ? "grid grid-cols-2 sm:flex sm:flex-row sm:flex-wrap"
            : "flex flex-col",
        className
      )}
    >
      <Link
        {...betaLinkProps(TESTFLIGHT_URL)}
        className={cn(
          betaLinkClass,
          "border border-[#0F1110] bg-[#0F1110] text-white",
          layout === "grid" ? "w-full" : "w-full sm:min-w-[10.5rem] sm:w-auto",
          TESTFLIGHT_URL === "#" && "cursor-default"
        )}
      >
        <AppleIcon className="h-6 w-6 flex-shrink-0 sm:h-7 sm:w-7" />
        <span className="min-w-0 text-left leading-tight">
          <span className="block text-[10px] font-medium uppercase tracking-wide text-white/75 sm:text-[10px]">
            Join beta on
          </span>
          <span className="block text-sm font-semibold sm:text-sm">TestFlight</span>
        </span>
      </Link>
      <Link
        {...betaLinkProps(ANDROID_APK_URL, { newTab: false })}
        className={cn(
          betaLinkClass,
          "border border-[#E4DED1] bg-white text-[#0F1110] hover:border-[#007ACC]/30",
          layout === "grid" ? "w-full" : "w-full sm:min-w-[10.5rem] sm:w-auto",
          ANDROID_APK_URL === "#" && "cursor-default"
        )}
      >
        <AndroidIcon className="h-6 w-6 flex-shrink-0 sm:h-7 sm:w-7" />
        <span className="min-w-0 text-left leading-tight">
          <span className="block text-[10px] font-medium uppercase tracking-wide text-[#6F756F] sm:text-[10px]">
            Download
          </span>
          <span className="block text-sm font-semibold sm:text-sm">Android APK</span>
        </span>
      </Link>
    </div>
  )
}
