"use client"

import type { MouseEvent } from "react"
import Link from "next/link"
import { cn } from "@/lib/utils"
import { APP_STORE_URL, PLAY_STORE_URL } from "@/lib/marketing/constants"

function AppleIcon({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" aria-hidden className={className} fill="currentColor">
      <path d="M16.365 1.43c0 1.14-.493 2.096-1.316 2.915-.862.858-1.874 1.338-3.042 1.257-.126-1.106.413-2.14 1.122-2.886.862-.905 2.003-1.456 3.236-1.286zm1.37 4.968c-1.874-.108-3.465 1.066-4.356 1.066-.911 0-2.316-1.044-3.806-.998-1.96.042-3.765 1.14-4.773 2.902-2.037 3.534-.522 8.765 1.463 11.634 1.002 1.445 2.195 3.066 3.764 3.008 1.516-.063 2.086-.98 3.915-.98 1.829 0 2.336.98 3.915.95 1.618-.027 2.64-1.47 3.63-2.924 1.145-1.674 1.616-3.296 1.644-3.378-.036-.016-3.158-1.212-3.186-4.81-.021-3.012 2.465-4.45 2.577-4.522-1.403-2.055-3.587-2.334-4.353-2.376z" />
    </svg>
  )
}

function GooglePlayIcon({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 28.99 31.99" aria-hidden className={className} xmlns="http://www.w3.org/2000/svg">
      <path
        fill="#EA4335"
        d="M13.54 15.28.12 29.34a3.66 3.66 0 0 0 5.33 2.16l15.1-8.6Z"
      />
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

interface StoreDownloadButtonsProps {
  className?: string
  layout?: "row" | "column" | "grid"
}

const storeLinkClass =
  "inline-flex min-w-0 items-center justify-center gap-2.5 rounded-xl px-3 py-2.5 transition-opacity hover:opacity-90 sm:gap-3 sm:px-4"

function storeLinkProps(href: string) {
  const placeholder = href === "#"
  return {
    href,
    onClick: placeholder ? (event: MouseEvent) => event.preventDefault() : undefined,
    target: placeholder ? undefined : ("_blank" as const),
    rel: placeholder ? undefined : "noopener noreferrer",
    "aria-disabled": placeholder ? true : undefined,
  }
}

export function StoreDownloadButtons({ className, layout = "row" }: StoreDownloadButtonsProps) {
  return (
    <div
      className={cn(
        "gap-2.5 sm:gap-3",
        layout === "grid"
          ? "grid grid-cols-2"
          : layout === "row"
            ? "flex flex-row flex-wrap"
            : "flex flex-col",
        className
      )}
    >
      <Link
        {...storeLinkProps(APP_STORE_URL)}
        className={cn(
          storeLinkClass,
          "border border-[#0F1110] bg-[#0F1110] text-white",
          layout === "grid" ? "w-full" : "min-w-[9.75rem] sm:min-w-[10.5rem]",
          APP_STORE_URL === "#" && "cursor-default"
        )}
      >
        <AppleIcon className="h-6 w-6 flex-shrink-0 sm:h-7 sm:w-7" />
        <span className="text-left leading-tight">
          <span className="block text-[10px] font-medium uppercase tracking-wide text-white/75">Download on</span>
          <span className="block text-sm font-semibold">App Store</span>
        </span>
      </Link>
      <Link
        {...storeLinkProps(PLAY_STORE_URL)}
        className={cn(
          storeLinkClass,
          "border border-[#E4DED1] bg-white text-[#0F1110] hover:border-[#007ACC]/30",
          layout === "grid" ? "w-full" : "min-w-[9.75rem] sm:min-w-[10.5rem]",
          PLAY_STORE_URL === "#" && "cursor-default"
        )}
      >
        <GooglePlayIcon className="h-6 w-[1.35rem] flex-shrink-0 sm:h-7 sm:w-[1.55rem]" />
        <span className="text-left leading-tight">
          <span className="block text-[10px] font-medium uppercase tracking-wide text-[#6F756F]">Get it on</span>
          <span className="block text-sm font-semibold">Google Play</span>
        </span>
      </Link>
    </div>
  )
}
