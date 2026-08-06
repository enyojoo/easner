"use client"

import { QRCodeSVG } from "qrcode.react"
import { cn } from "@/lib/utils"
import { APP_LINK_URL } from "@/lib/download-routing"

interface DownloadQrProps {
  className?: string
  size?: number
  value?: string
}

export function DownloadQr({ className, size = 180, value = APP_LINK_URL }: DownloadQrProps) {
  return (
    <div
      className={cn(
        "inline-flex items-center justify-center rounded-2xl border border-[#E9E4D8] bg-white p-3 shadow-[0_8px_24px_rgba(15,17,16,0.06)]",
        className
      )}
    >
      <QRCodeSVG
        value={value}
        size={size}
        level="M"
        bgColor="#FFFFFF"
        fgColor="#0F1110"
        aria-label="QR code to download the Easner app"
      />
    </div>
  )
}
