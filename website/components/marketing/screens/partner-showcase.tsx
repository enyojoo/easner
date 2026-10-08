/**
 * Easner for Partners (Agency Model) illustration (design system: WebPartnerShowcase).
 * The same Easner app under a fictional partner's brand, and what the partner sets. A website
 * illustration, not a product screen: only the logo, name and accent colour change.
 */
import type { ReactNode } from "react"
import { CurrencyFlag } from "@/components/ds/currency-flag"
import { DEMO_PARTNER } from "@/lib/marketing/demo-data"
import { cn } from "@/lib/utils"
import { AppHomeScreen } from "./app-screens"
import { PhoneFrame } from "./frames"
import type { AppBrand } from "./app-parts"

export const PARTNER_BRAND: AppBrand = {
  name: DEMO_PARTNER.name,
  initial: DEMO_PARTNER.initial,
  color: DEMO_PARTNER.color,
  colorEnd: DEMO_PARTNER.colorEnd,
  tint: DEMO_PARTNER.tint,
  tintSubtle: DEMO_PARTNER.tintSubtle,
}

/** Native size of the compact showcase (phone + brand panel) used in the homepage tab. */
export const PARTNER_SHOWCASE_SIZE = { width: 860, height: 800 }

export function PartnerPhone() {
  return (
    <PhoneFrame>
      <AppHomeScreen
        brand={PARTNER_BRAND}
        balance={DEMO_PARTNER.balance}
        transactions={DEMO_PARTNER.transactions}
        footnote="Powered by Easner"
      />
    </PhoneFrame>
  )
}

export function PartnerBrandPanel({ className }: { className?: string }) {
  const rows: [string, ReactNode][] = [
    ["App name", DEMO_PARTNER.name],
    [
      "Logo",
      <span key="logo" className="inline-flex items-center gap-2">
        <span
          className="grid size-6 place-items-center rounded-[7px] text-xs font-bold text-white"
          style={{ background: DEMO_PARTNER.color }}
        >
          {DEMO_PARTNER.initial}
        </span>
        harbor-mark.svg
      </span>,
    ],
    [
      "Brand colour",
      <span key="colour" className="inline-flex items-center gap-2">
        <span
          className="size-5 rounded-[6px] shadow-[inset_0_0_0_1px_rgba(0,0,0,0.08)]"
          style={{ background: DEMO_PARTNER.color }}
        />
        <span className="font-mono text-[13px] font-medium">{DEMO_PARTNER.color}</span>
      </span>,
    ],
    [
      "Corridors",
      <span key="corridors" className="inline-flex items-center gap-2">
        <CurrencyFlag code="GH" size={20} />
        <CurrencyFlag code="NG" size={20} />
        US → GH, NG
      </span>,
    ],
    ["Support", DEMO_PARTNER.supportEmail],
  ]
  return (
    <div
      className={cn(
        "grid gap-1 rounded-[28px] border border-web-hairline bg-web-plate p-6 font-sans text-web-ink shadow-showcase",
        className,
      )}
    >
      <p className="text-base font-semibold leading-6">Your brand</p>
      <p className="mb-3 text-sm leading-[22px] text-web-body">What you set. Everything else is the Easner app.</p>
      {rows.map(([label, value]) => (
        <div key={label} className="flex min-h-[52px] items-center justify-between gap-4 border-t border-web-hairline text-sm">
          <span className="text-web-meta">{label}</span>
          <span className="text-right font-semibold">{value}</span>
        </div>
      ))}
      <div className="mt-3 grid gap-1.5 rounded-[16px] border border-web-hairline bg-web-canvas px-4 py-3.5">
        <span className="text-[11px] font-semibold uppercase leading-4 tracking-[0.12em] text-web-meta">Run by Easner</span>
        <span className="text-sm leading-[22px] text-web-body">
          Accounts, payouts, verification, screening and limits – on Easner infrastructure, with operational support.
        </span>
      </div>
    </div>
  )
}

/** Compact showcase at native size: the partner phone with the brand panel beside it. */
export function PartnerShowcase() {
  return (
    <div
      className="relative flex items-center gap-6"
      style={{ width: PARTNER_SHOWCASE_SIZE.width, height: PARTNER_SHOWCASE_SIZE.height }}
    >
      <PartnerPhone />
      <PartnerBrandPanel className="w-[420px]" />
    </div>
  )
}
