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
  IN: (
    <>
      <rect width="22" height="22" fill="#fff" />
      <rect width="22" height="7.4" fill="#FF9933" />
      <rect y="14.6" width="22" height="7.4" fill="#138808" />
      <circle cx="11" cy="11" r="2.5" fill="none" stroke="#000080" strokeWidth="0.6" />
      <path d="M11 8.5v5M8.5 11h5M9.2 9.2l3.6 3.6M12.8 9.2l-3.6 3.6" stroke="#000080" strokeWidth="0.35" />
    </>
  ),
  PH: (
    <>
      <rect width="22" height="11" fill="#0038A8" />
      <rect y="11" width="22" height="11" fill="#CE1126" />
      <path d="M0 0v22l13-11z" fill="#fff" />
      <circle cx="4.2" cy="11" r="1.7" fill="#FCD116" />
    </>
  ),
  MX: (
    <>
      <rect width="22" height="22" fill="#fff" />
      <rect width="7.4" height="22" fill="#006847" />
      <rect x="14.6" width="7.4" height="22" fill="#CE1126" />
      <circle cx="11" cy="11" r="2.3" fill="#A97B2C" stroke="#006847" strokeWidth="0.5" />
    </>
  ),
  BR: (
    <>
      <rect width="22" height="22" fill="#009C3B" />
      <path d="M11 3.2 19.6 11 11 18.8 2.4 11z" fill="#FFDF00" />
      <circle cx="11" cy="11" r="4" fill="#002776" />
      <path d="M7.2 10.2q3.9-1.4 7.7 1.4" stroke="#fff" strokeWidth="0.8" fill="none" />
    </>
  ),
  ZA: (
    <>
      <rect width="22" height="11" fill="#E03C31" />
      <rect y="11" width="22" height="11" fill="#001489" />
      <path d="M0 0 11 11 0 22M11 11H22" stroke="#fff" strokeWidth="5.2" fill="none" />
      <path d="M0 0 11 11 0 22M11 11H22" stroke="#007749" strokeWidth="3" fill="none" />
      <path d="M0 3.4 6.6 11 0 18.6z" fill="#000" stroke="#FFB612" strokeWidth="0.8" />
    </>
  ),
  UG: (
    <>
      <rect width="22" height="22" fill="#000" />
      <rect y="7.3" width="22" height="3.7" fill="#FCDC04" />
      <rect y="11" width="22" height="3.7" fill="#D90000" />
      <rect y="14.7" width="22" height="3.7" fill="#FCDC04" />
      <rect y="18.4" width="22" height="3.6" fill="#D90000" />
      <circle cx="11" cy="11" r="3.4" fill="#fff" stroke="#000" strokeWidth="0.4" />
    </>
  ),
  RW: (
    <>
      <rect width="22" height="11" fill="#00A1DE" />
      <rect y="11" width="22" height="5.5" fill="#FAD201" />
      <rect y="16.5" width="22" height="5.5" fill="#20603D" />
      <circle cx="17" cy="5.5" r="2.1" fill="#FAD201" />
    </>
  ),
  CM: (
    <>
      <rect width="22" height="22" fill="#CE1126" />
      <rect width="7.4" height="22" fill="#007A5E" />
      <rect x="14.6" width="7.4" height="22" fill="#FCD116" />
      <path d="m11 7.6 1.02 3.13h3.29l-2.66 1.94 1.01 3.13L11 13.86l-2.66 1.94 1.01-3.13-2.66-1.94h3.29z" fill="#FCD116" />
    </>
  ),
  SN: (
    <>
      <rect width="22" height="22" fill="#FDEF42" />
      <rect width="7.4" height="22" fill="#00853F" />
      <rect x="14.6" width="7.4" height="22" fill="#E31B23" />
      <path d="m11 7.6 1.02 3.13h3.29l-2.66 1.94 1.01 3.13L11 13.86l-2.66 1.94 1.01-3.13-2.66-1.94h3.29z" fill="#00853F" />
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
