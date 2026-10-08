/**
 * Shared pieces of the Easner app screens (design system: AppHome, AppSend, AppSendReview, AppMore).
 * Sizes are the app's own, in native px; ScaledScreen scales the whole screen.
 */
import type { CSSProperties, ReactNode } from "react"
import { Activity, ArrowDownLeft, ArrowLeft, ArrowUpRight, CreditCard, Delete, Grip, House } from "lucide-react"
import { Amount } from "@/components/ds/amount"
import { CurrencyFlag } from "@/components/ds/currency-flag"
import { StatusText } from "@/components/ds/status-badge"
import type { DemoTransaction } from "@/lib/marketing/demo-data"
import { cn } from "@/lib/utils"

/** Partner branding for the white-label illustration: overrides the app's blue on one screen. */
export interface AppBrand {
  name: string
  initial: string
  color: string
  colorEnd: string
  tint: string
  tintSubtle: string
}

export function brandStyle(brand?: AppBrand): CSSProperties | undefined {
  if (!brand) return undefined
  return {
    "--app-primary": brand.color,
    "--app-primary-text": brand.color,
    "--app-hero-start": brand.color,
    "--app-hero-end": brand.colorEnd,
    "--app-primary-tint": brand.tint,
    "--app-primary-tint-subtle": brand.tintSubtle,
  } as CSSProperties
}

export const PLATE = "bg-app-plate shadow-[inset_0_0_0_0.5px_var(--app-hairline),var(--app-shadow-xs)]"
export const CHROME =
  "grid size-10 shrink-0 place-items-center rounded-full bg-app-plate text-app-primary shadow-[inset_0_0_0_0.5px_var(--app-hairline)]"

export function AppScreen({ children, brand, className }: { children: ReactNode; brand?: AppBrand; className?: string }) {
  return (
    <div
      className={cn("relative flex h-full flex-col overflow-hidden bg-app-canvas font-sans text-app-text antialiased", className)}
      style={brandStyle(brand)}
    >
      <StatusBar />
      {children}
      <span className="absolute bottom-[7px] left-1/2 h-[5px] w-32 -translate-x-1/2 rounded-full bg-app-text" />
    </div>
  )
}

export function StatusBar() {
  return (
    <div className="flex h-[46px] shrink-0 items-end justify-between pb-1.5 pl-[34px] pr-7 text-[15px] font-semibold leading-5">
      <span>9:41</span>
      <span className="flex items-center gap-[5px]">
        <svg width="17" height="11" viewBox="0 0 17 11" aria-hidden="true">
          <rect y="7" width="3" height="4" rx="1" fill="currentColor" />
          <rect x="4.7" y="5" width="3" height="6" rx="1" fill="currentColor" />
          <rect x="9.4" y="2.6" width="3" height="8.4" rx="1" fill="currentColor" />
          <rect x="14" y="0" width="3" height="11" rx="1" fill="currentColor" />
        </svg>
        <svg width="15" height="11" viewBox="0 0 16 12" aria-hidden="true">
          <path
            d="M8 11.5 5.6 9a3.4 3.4 0 0 1 4.8 0zM3.5 6.9a6.4 6.4 0 0 1 9 0l-1.4 1.4a4.4 4.4 0 0 0-6.2 0zM1.3 4.7a9.5 9.5 0 0 1 13.4 0l-1.4 1.4a7.5 7.5 0 0 0-10.6 0z"
            fill="currentColor"
          />
        </svg>
        <svg width="25" height="12" viewBox="0 0 27 13" aria-hidden="true">
          <rect x=".5" y=".5" width="23" height="12" rx="3.8" fill="none" stroke="currentColor" opacity=".4" />
          <rect x="2" y="2" width="20" height="9" rx="2.5" fill="currentColor" />
        </svg>
      </span>
    </div>
  )
}

export function TabBar({ active = "Home" }: { active?: "Home" | "Cards" | "Transactions" | "More" }) {
  const tabs = [
    { label: "Home", Icon: House },
    { label: "Cards", Icon: CreditCard },
    { label: "Transactions", Icon: Activity },
    { label: "More", Icon: Grip },
  ] as const
  return (
    <div className="absolute inset-x-0 bottom-0 flex h-[92px] bg-app-plate px-0 pb-5 pt-1 shadow-[inset_0_0.5px_0_var(--app-hairline)]">
      {tabs.map(({ label, Icon }) => (
        <div
          key={label}
          className={cn(
            "grid flex-1 content-start justify-items-center gap-0.5 pt-1 text-[11px] font-medium leading-[14px]",
            label === active ? "text-app-primary" : "text-app-text-secondary",
          )}
        >
          <Icon className="size-[22px]" strokeWidth={label === active ? 2.25 : 1.75} aria-hidden="true" />
          <span>{label}</span>
        </div>
      ))}
    </div>
  )
}

export function BackHeader({ title }: { title: string }) {
  return (
    <div className="flex items-center gap-3 px-5 pb-3 pt-4">
      <span className={cn(CHROME, "size-11 shadow-[inset_0_0_0_0.5px_var(--app-hairline),var(--app-shadow-xs)]")}>
        <ArrowLeft className="size-6" strokeWidth={2} aria-hidden="true" />
      </span>
      <span className="text-2xl font-semibold leading-[30px]">{title}</span>
    </div>
  )
}

export function Overline({ children, className }: { children: ReactNode; className?: string }) {
  return (
    <div className={cn("text-[11px] font-semibold uppercase leading-[15px] tracking-[0.6px] text-app-text-secondary", className)}>
      {children}
    </div>
  )
}

/** Recent-transactions row (AppHome `.row`). */
export function TransactionRow({ tx, divider }: { tx: DemoTransaction; divider?: boolean }) {
  const incoming = tx.amount > 0
  const Icon = incoming ? ArrowDownLeft : ArrowUpRight
  return (
    <div className="relative flex min-h-16 items-center px-4 py-3.5">
      {divider && <span className="absolute inset-x-4 top-0 h-[0.5px] bg-app-hairline" />}
      <span className="mr-3 grid size-11 shrink-0 place-items-center rounded-full bg-app-primary-tint text-app-primary-text">
        <Icon className="size-4" strokeWidth={2.5} aria-hidden="true" />
      </span>
      <div className="min-w-0 flex-1">
        <div className="truncate text-sm font-semibold leading-[21px]">{tx.name}</div>
        <div className="text-xs leading-[18px] text-app-text-secondary">{tx.time}</div>
      </div>
      <div className="ml-2 grid justify-items-end gap-1">
        <Amount
          value={tx.amount}
          signed
          positiveClassName="text-app-primary"
          className="text-[15px] font-semibold leading-[22px]"
        />
        <StatusText status={tx.status} />
      </div>
    </div>
  )
}

/** Detail row on a review or details card (AppSendReview `.dt-row`). */
export function DetailRow({ label, children, divider = true }: { label: string; children: ReactNode; divider?: boolean }) {
  return (
    <div className="relative flex min-h-[46px] items-center justify-between gap-4 py-3">
      {divider && <span className="absolute inset-x-0 top-0 h-[0.5px] bg-app-hairline" />}
      <span className="text-xs leading-[18px] text-app-text-secondary">{label}</span>
      <span className="text-right text-[15px] leading-[22px]">{children}</span>
    </div>
  )
}

export function Keypad({ last = "." }: { last?: "." | "face" }) {
  const keys = ["1", "2", "3", "4", "5", "6", "7", "8", "9", last, "0", "del"]
  return (
    <div className="grid grid-cols-3 gap-2 px-5">
      {keys.map((key) => (
        <span
          key={key}
          className="grid h-[50px] place-items-center rounded-[20px] bg-app-plate text-[28px] font-semibold leading-[34px] tabular-nums shadow-[inset_0_0_0_0.5px_var(--app-hairline)]"
        >
          {key === "del" ? <Delete className="size-6" strokeWidth={2} aria-hidden="true" /> : key}
        </span>
      ))}
    </div>
  )
}

export function CtaPill({ children, className }: { children: ReactNode; className?: string }) {
  return (
    <div
      className={cn(
        "grid h-[52px] place-items-center rounded-full bg-[linear-gradient(90deg,var(--app-cta-start),var(--app-cta-end))] text-[17px] font-semibold text-white",
        className,
      )}
    >
      {children}
    </div>
  )
}

export function RecipientAvatar({ country, initials, size = 48 }: { country?: string; initials?: string; size?: number }) {
  if (country) return <CurrencyFlag code={country} size={size} />
  return (
    <span
      className="grid shrink-0 place-items-center rounded-full bg-app-primary-tint text-sm font-bold text-app-primary"
      style={{ width: size, height: size }}
    >
      {initials}
    </span>
  )
}
