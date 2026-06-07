"use client"

import Image from "next/image"
import {
  FIAT_FLAG,
  TOKEN_LOGO,
  type CurrencyBadgeCode,
} from "@/lib/marketing/currency-assets"
import { cn } from "@/lib/utils"

const currencyIconSrc: Record<CurrencyBadgeCode, string> = {
  USD: FIAT_FLAG.USD,
  EUR: FIAT_FLAG.EUR,
  USDC: TOKEN_LOGO.USDC,
  EURC: TOKEN_LOGO.EURC,
}

interface CurrencyBadgeProps {
  code: CurrencyBadgeCode
  className?: string
  iconClassName?: string
  labelClassName?: string
  showLabel?: boolean
}

export function CurrencyBadge({
  code,
  className,
  iconClassName,
  labelClassName,
  showLabel = true,
}: CurrencyBadgeProps) {
  return (
    <span className={cn("inline-flex items-center gap-1.5 align-middle", className)}>
      <span
        className={cn(
          "relative inline-flex size-[1.125rem] shrink-0 overflow-hidden rounded-full sm:size-5",
          iconClassName
        )}
      >
        <Image
          src={currencyIconSrc[code]}
          alt=""
          fill
          sizes="20px"
          className="object-cover"
          aria-hidden
        />
      </span>
      {showLabel && (
        <span className={cn("text-sm font-semibold leading-none text-[#0F1110]", labelClassName)}>{code}</span>
      )}
    </span>
  )
}
