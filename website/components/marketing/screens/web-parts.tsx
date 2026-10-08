/**
 * Product web kit for Easner Business screens on the website (design system: AppShell, Card, Button,
 * Field, DetailList, CopyField). Drawn at native size inside `.surface-product`, so the product's ivory
 * canvas, stone borders and graphite text apply.
 */
import type { CSSProperties, ReactNode } from "react"
import Image from "next/image"
import {
  ArrowDownLeft,
  ArrowUpRight,
  ArrowUpDown,
  Building2,
  ChevronDown,
  ChevronRight,
  CircleDollarSign,
  Copy,
  CreditCard,
  FileText,
  Inbox,
  LayoutGrid,
  Link2,
  List,
  MessageCircle,
  ReceiptText,
  Send,
  Smartphone,
  User,
  Users,
  Wallet,
} from "lucide-react"
import { Amount } from "@/components/ds/amount"
import { CurrencyFlag } from "@/components/ds/currency-flag"
import { StatusBadge, type StatusKey } from "@/components/ds/status-badge"
import { DEMO_BUSINESS } from "@/lib/marketing/demo-data"
import { cn } from "@/lib/utils"

/** Root for any product web fragment: restores the product's semantic colours and type. */
export function ProductSurface({
  children,
  className,
  style,
}: {
  children: ReactNode
  className?: string
  style?: CSSProperties
}) {
  return (
    <div className={cn("surface-product bg-background font-sans text-foreground antialiased", className)} style={style}>
      {children}
    </div>
  )
}

/** Wrap a product fragment placed on a canvas (transparent, so the slot's ivory band shows around it). */
export function surface(node: ReactNode) {
  return <ProductSurface className="h-full bg-transparent">{node}</ProductSurface>
}

/* ---------------------------------------------------------------- Shell (AppShell) */

type NavKey = "Home" | "Send" | "Cards" | "Payroll" | "Invoices" | "Links" | "Terminal" | "Transactions" | "Accounts" | "Settings"

const SPENDING: NavKey[] = ["Send", "Cards", "Payroll"]
const COLLECTIONS: NavKey[] = ["Invoices", "Links", "Terminal"]

const NAV_ICON: Record<string, typeof LayoutGrid> = {
  Home: LayoutGrid,
  Spending: CircleDollarSign,
  Collections: Inbox,
  Transactions: List,
  Accounts: Wallet,
  Send: Send,
  Cards: CreditCard,
  Payroll: Users,
  Invoices: ReceiptText,
  Links: Link2,
  Terminal: Smartphone,
}

function NavItem({
  label,
  active,
  child,
  group,
  open,
}: {
  label: string
  active?: boolean
  child?: boolean
  group?: boolean
  open?: boolean
}) {
  const Icon = NAV_ICON[label] ?? FileText
  return (
    <span
      className={cn(
        "flex min-h-11 items-center gap-3 rounded-[28px] px-4 text-sm",
        active
          ? "border border-border/70 bg-card font-semibold text-foreground shadow-card"
          : "font-medium text-muted-foreground",
        child && "ml-2",
      )}
    >
      <Icon className={cn("size-[18px]", (active || open) && "text-primary")} strokeWidth={1.5} aria-hidden="true" />
      <span className={cn("flex-1", open && "text-foreground")}>{label}</span>
      {group &&
        (open ? (
          <ChevronDown className="size-4 text-primary" strokeWidth={1.75} aria-hidden="true" />
        ) : (
          <ChevronRight className="size-4" strokeWidth={1.75} aria-hidden="true" />
        ))}
    </span>
  )
}

/** Easner Business shell: 256 sidebar (Home · Spending · Collections · Transactions · Accounts) and 64 header. */
export function BizShell({
  active = "Home",
  width = 1200,
  height = 820,
  children,
}: {
  active?: NavKey
  width?: number
  height?: number
  children: ReactNode
}) {
  const spendingOpen = SPENDING.includes(active)
  const collectionsOpen = COLLECTIONS.includes(active)
  return (
    <ProductSurface className="flex" style={{ width, height }}>
      <aside className="flex w-64 shrink-0 flex-col border-r border-sidebar-border bg-sidebar">
        <div className="flex h-16 items-center gap-3 border-b border-sidebar-border px-5">
          <span className="grid size-9 place-items-center rounded-[28px] bg-card text-primary shadow-soft">
            <Building2 className="size-[18px]" strokeWidth={1.75} aria-hidden="true" />
          </span>
          <span className="min-w-0">
            <span className="block truncate text-sm font-semibold leading-5">{DEMO_BUSINESS.name}</span>
            <span className="inline-block rounded-full bg-success px-1.5 text-[11px] font-medium leading-4 text-success-foreground">
              Verified
            </span>
          </span>
        </div>
        <nav className="grid gap-1 px-3 pt-5">
          <NavItem label="Home" active={active === "Home"} />
          <NavItem label="Spending" group open={spendingOpen} />
          {spendingOpen && (
            <div className="ml-5 grid gap-1 border-l border-sidebar-border pl-2">
              {SPENDING.map((key) => (
                <NavItem key={key} label={key} active={active === key} child />
              ))}
            </div>
          )}
          <NavItem label="Collections" group open={collectionsOpen} />
          {collectionsOpen && (
            <div className="ml-5 grid gap-1 border-l border-sidebar-border pl-2">
              {COLLECTIONS.map((key) => (
                <NavItem key={key} label={key} active={active === key} child />
              ))}
            </div>
          )}
          <NavItem label="Transactions" active={active === "Transactions"} />
          <NavItem label="Accounts" active={active === "Accounts"} />
        </nav>
        <div className="mt-auto grid h-14 place-items-center border-t border-sidebar-border">
          <Image src="/easner-business-lockup.svg" alt="" width={165} height={24} />
        </div>
      </aside>
      <div className="flex min-w-0 flex-1 flex-col">
        <header className="flex h-16 shrink-0 items-center justify-end gap-3 border-b border-border/60 bg-background/80 px-8">
          <span className="grid size-9 place-items-center rounded-full border-2 border-border text-primary">
            <MessageCircle className="size-5" strokeWidth={1.75} aria-hidden="true" />
          </span>
          <span className="flex items-center gap-1.5">
            <span className="grid size-9 place-items-center rounded-full bg-surface-tint text-primary">
              <User className="size-[18px]" strokeWidth={1.75} aria-hidden="true" />
            </span>
            <ChevronDown className="size-4 text-muted-foreground" strokeWidth={1.75} aria-hidden="true" />
          </span>
        </header>
        <main className="min-h-0 flex-1 overflow-hidden px-8 pt-6">{children}</main>
      </div>
    </ProductSurface>
  )
}

/* ---------------------------------------------------------------- Building blocks */

export function PCard({ children, className, padded = true }: { children: ReactNode; className?: string; padded?: boolean }) {
  return (
    <div className={cn("rounded-[24px] border border-border/60 bg-card shadow-soft", padded && "p-6", className)}>{children}</div>
  )
}

export function PageHeader({ title, subtitle, action }: { title: string; subtitle?: string; action?: ReactNode }) {
  return (
    <div className="mb-5 flex items-start justify-between gap-4">
      <div>
        <h3 className="text-2xl font-semibold leading-8">{title}</h3>
        {subtitle && <p className="mt-1 text-sm text-muted-foreground">{subtitle}</p>}
      </div>
      {action}
    </div>
  )
}

/** Product button: blue primary (16px corners), outline pill for secondary actions. */
export function PButton({
  children,
  variant = "primary",
  size = "default",
  icon: Icon,
  className,
}: {
  children: ReactNode
  variant?: "primary" | "outline" | "graphite"
  size?: "default" | "lg" | "sm"
  icon?: typeof Send
  className?: string
}) {
  return (
    <span
      className={cn(
        "inline-flex items-center justify-center gap-2 whitespace-nowrap text-sm font-medium",
        size === "lg" && "h-12 rounded-[16px] px-6 text-[15px]",
        size === "default" && "h-10 rounded-[16px] px-5",
        size === "sm" && "h-9 rounded-full px-3.5",
        variant === "primary" && "bg-primary text-primary-foreground",
        variant === "graphite" && "bg-foreground text-background",
        variant === "outline" && "rounded-full border border-input/60 bg-card",
        className,
      )}
    >
      {Icon && <Icon className="size-4" strokeWidth={2} aria-hidden="true" />}
      {children}
    </span>
  )
}

export function FieldLabel({ children, aside }: { children: ReactNode; aside?: ReactNode }) {
  return (
    <div className="mb-2 flex items-center justify-between">
      <span className="text-sm font-medium leading-5">{children}</span>
      {aside}
    </div>
  )
}

export function PField({ children, className, select }: { children: ReactNode; className?: string; select?: boolean }) {
  return (
    <div
      className={cn("flex min-h-12 items-center gap-3 rounded-[16px] border border-input bg-card px-4 text-[15px]", className)}
    >
      <span className="min-w-0 flex-1">{children}</span>
      {select && <ChevronDown className="size-4 text-muted-foreground" strokeWidth={2} aria-hidden="true" />}
    </div>
  )
}

/** "Sending: $450 • Rate: $1 = ₵12.25" chip above amount fields. */
export function RateChip({ children }: { children: ReactNode }) {
  return (
    <span className="inline-flex h-8 items-center gap-1.5 rounded-full bg-surface-tint px-3 text-[13px] font-medium text-primary-text">
      <ArrowUpDown className="size-3.5" strokeWidth={2.25} aria-hidden="true" />
      {children}
    </span>
  )
}

export function DetailRows({ rows, className }: { rows: [ReactNode, ReactNode][]; className?: string }) {
  return (
    <div className={className}>
      {rows.map(([label, value], index) => (
        <div
          key={index}
          className={cn(
            "flex min-h-12 items-center justify-between gap-4 py-3 text-sm",
            index > 0 && "border-t border-border/60",
          )}
        >
          <span className="text-muted-foreground">{label}</span>
          <span className="text-right font-medium">{value}</span>
        </div>
      ))}
    </div>
  )
}

/** CopyField: label, a muted box with the value and a copy icon. */
export function CopyValue({ label, value, mono }: { label: string; value: string; mono?: boolean }) {
  return (
    <div>
      <div className="mb-1.5 text-[13px] font-medium text-muted-foreground">{label}</div>
      <div className="flex min-h-12 items-center justify-between gap-3 rounded-[16px] bg-muted/70 px-3.5 py-3">
        <span className={cn("text-sm", mono && "font-mono")}>{value}</span>
        <Copy className="size-4 text-muted-foreground" strokeWidth={2} aria-hidden="true" />
      </div>
    </div>
  )
}

export function Overline({ children, className }: { children: ReactNode; className?: string }) {
  return (
    <div className={cn("text-[11px] font-medium uppercase tracking-[0.08em] text-muted-foreground", className)}>{children}</div>
  )
}

export function Avatar({ initials, className }: { initials: string; className?: string }) {
  return (
    <span className={cn("grid size-10 shrink-0 place-items-center rounded-full bg-muted text-sm font-medium", className)}>
      {initials}
    </span>
  )
}

/** Money row: direction icon, name and detail, optional status, signed amount (money in is blue with +). */
export function MoneyRow({
  name,
  detail,
  amount,
  currency = "USD",
  status,
  date,
  meta,
  divider = true,
}: {
  name: ReactNode
  detail?: ReactNode
  amount: number
  currency?: string
  status?: StatusKey
  date?: string
  meta?: ReactNode
  divider?: boolean
}) {
  const incoming = amount > 0
  return (
    <div className={cn("flex h-14 items-center gap-3 px-4 text-sm", divider && "border-t border-border/60")}>
      {date && <span className="w-14 shrink-0 text-muted-foreground">{date}</span>}
      <span className="grid size-8 shrink-0 place-items-center rounded-full border border-border text-muted-foreground">
        {incoming ? (
          <ArrowDownLeft className="size-4 text-primary" strokeWidth={2} aria-hidden="true" />
        ) : (
          <ArrowUpRight className="size-4" strokeWidth={2} aria-hidden="true" />
        )}
      </span>
      <span className="min-w-0 flex-1">
        <span className="block truncate font-medium leading-5">{name}</span>
        {detail && <span className="block truncate text-xs leading-4 text-muted-foreground">{detail}</span>}
      </span>
      {meta && <span className="shrink-0 text-muted-foreground">{meta}</span>}
      {status && <StatusBadge status={status} />}
      <span className="w-28 shrink-0 text-right font-semibold">
        <Amount value={amount} currency={currency} signed />
      </span>
    </div>
  )
}

export function BalanceChip({ currency = "USD", label = "USD Balance" }: { currency?: string; label?: string }) {
  return (
    <PField select className="rounded-full">
      <span className="flex items-center gap-2.5 font-medium">
        <CurrencyFlag code={currency} size={24} />
        {label}
      </span>
    </PField>
  )
}

/** A table header row (`table-head`). */
export function TableHead({ columns, template }: { columns: string[]; template: string }) {
  return (
    <div
      className="grid h-10 items-center border-b border-border/60 bg-muted/60 px-4 text-[11px] font-medium uppercase tracking-[0.08em] text-muted-foreground"
      style={{ gridTemplateColumns: template }}
    >
      {columns.map((column, index) => (
        <span key={column} className={index === columns.length - 1 ? "text-right" : undefined}>
          {column}
        </span>
      ))}
    </div>
  )
}

export function TableRow({ cells, template, divider = true }: { cells: ReactNode[]; template: string; divider?: boolean }) {
  return (
    <div
      className={cn("grid h-14 items-center px-4 text-sm", divider && "border-t border-border/60")}
      style={{ gridTemplateColumns: template }}
    >
      {cells.map((cell, index) => (
        <span key={index} className={cn("min-w-0 truncate", index === cells.length - 1 && "text-right")}>
          {cell}
        </span>
      ))}
    </div>
  )
}
