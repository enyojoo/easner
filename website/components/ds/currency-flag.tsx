import type { ReactNode } from "react"
import { cn } from "@/lib/utils"

/**
 * Round flags for the currencies and payout countries shown in product screens (design system: CurrencyFlag,
 * round as in AccountCard and the app). Drawn on a 22-unit square and clipped round by the wrapper.
 */
/* eslint-disable no-restricted-syntax -- flag colours are fixed national colours, not brand tokens */
const FLAGS: Record<string, ReactNode> = {
  US: (
    <>
      <rect width="22" height="22" fill="#fff" />
      {[0, 3.4, 6.8, 10.2, 13.6, 17, 20.4].map((y) => (
        <rect key={y} y={y} width="22" height="1.7" fill="#B22234" />
      ))}
      <rect width="10" height="10.2" fill="#3C3B6E" />
    </>
  ),
  EU: (
    <>
      <rect width="22" height="22" fill="#003399" />
      {Array.from({ length: 12 }, (_, i) => {
        const a = (i / 12) * Math.PI * 2
        return <circle key={i} cx={(11 + Math.cos(a) * 6).toFixed(2)} cy={(11 + Math.sin(a) * 6).toFixed(2)} r="0.95" fill="#FFCC00" />
      })}
    </>
  ),
  GB: (
    <>
      <rect width="22" height="22" fill="#012169" />
      <path d="M0 0 22 22M22 0 0 22" stroke="#fff" strokeWidth="4.4" />
      <path d="M0 0 22 22M22 0 0 22" stroke="#C8102E" strokeWidth="1.5" />
      <path d="M11 0v22M0 11h22" stroke="#fff" strokeWidth="6" />
      <path d="M11 0v22M0 11h22" stroke="#C8102E" strokeWidth="3.4" />
    </>
  ),
  GH: (
    <>
      <rect width="22" height="7.4" fill="#CE1126" />
      <rect y="7.3" width="22" height="7.4" fill="#FCD116" />
      <rect y="14.6" width="22" height="7.4" fill="#006B3F" />
      <path d="m11 7.6 1.02 3.13h3.29l-2.66 1.94 1.01 3.13L11 13.86l-2.66 1.94 1.01-3.13-2.66-1.94h3.29z" fill="#000" />
    </>
  ),
  NG: (
    <>
      <rect width="22" height="22" fill="#fff" />
      <rect width="7.4" height="22" fill="#008751" />
      <rect x="14.6" width="7.4" height="22" fill="#008751" />
    </>
  ),
  KE: (
    <>
      <rect width="22" height="22" fill="#fff" />
      <rect width="22" height="6.6" fill="#000" />
      <rect y="7.7" width="22" height="6.6" fill="#BB0000" />
      <rect y="15.4" width="22" height="6.6" fill="#006600" />
      <ellipse cx="11" cy="11" rx="2.6" ry="5.4" fill="#BB0000" stroke="#000" strokeWidth="0.6" />
    </>
  ),
}
/* eslint-enable no-restricted-syntax */

const ALIASES: Record<string, string> = { USD: "US", EUR: "EU", GBP: "GB", GHS: "GH", NGN: "NG", KES: "KE" }

export function CurrencyFlag({ code, size = 20, className }: { code: string; size?: number; className?: string }) {
  const key = ALIASES[code.toUpperCase()] ?? code.toUpperCase()
  return (
    <span
      aria-hidden="true"
      className={cn(
        "inline-block shrink-0 overflow-hidden rounded-full bg-muted shadow-[0_0_0_0.5px_var(--web-hairline)]",
        className,
      )}
      style={{ width: size, height: size }}
    >
      {FLAGS[key] && (
        <svg viewBox="0 0 22 22" width={size} height={size} preserveAspectRatio="none" className="block">
          {FLAGS[key]}
        </svg>
      )}
    </span>
  )
}
