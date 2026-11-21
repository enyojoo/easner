/**
 * Easner Connect page screens (design system: ConnectSheet, AppEarningsConnect, AppEarnings, BizConnectOverview,
 * BizConnectPayees). Kora Music is a fictional music distributor; Ada Obi is the person it pays.
 */
import type { ReactNode } from "react"
import Image from "next/image"
import { ArrowLeft, Check, CircleAlert, ChevronRight, Clock, Link2, Lock, SendHorizontal, Shield, ShieldCheck, TriangleAlert, X } from "lucide-react"
import { DEMO_CONNECT_PLATFORM } from "@/lib/marketing/demo-data"
import { formatMoney } from "@/lib/marketing/format-money"
import { cn } from "@/lib/utils"
import { AppScreen, CHROME, PLATE } from "../app-parts"
import { at, panel, phoneCard, type Canvas } from "../canvas"
import { BrowserFrame, PhoneFrame } from "../frames"
import { Avatar, PCard, surface, TableHead, TableRow } from "../web-parts"

const kora = DEMO_CONNECT_PLATFORM
const money = (value: number) => formatMoney(value, "USD", { cents: "always" })

/** Platform mark: the platform's own accent colour, never Easner blue. */
function KoraMark({ size, radius, className }: { size: number; radius: number; className?: string }) {
  return (
    <span
      className={cn("grid shrink-0 place-items-center font-bold text-white", className)}
      style={{ width: size, height: size, borderRadius: radius, background: kora.color, fontSize: size * 0.42 }}
    >
      {kora.initial}
    </span>
  )
}

/** A static QR-like block: three finder squares and a fixed pattern, so it renders the same on server and client. */
function QrBlock({ size }: { size: number }) {
  const n = 25
  const cells: string[] = []
  let seed = 7
  const origins = [
    [0, 0],
    [n - 7, 0],
    [0, n - 7],
  ]
  for (let y = 0; y < n; y++) {
    for (let x = 0; x < n; x++) {
      seed = (seed * 1103515245 + 12345) & 0x7fffffff
      let on = (seed >> 16) % 2 === 0
      for (const [ox, oy] of origins) {
        const lx = x - ox
        const ly = y - oy
        if (lx >= -1 && lx <= 7 && ly >= -1 && ly <= 7) {
          on = lx >= 0 && lx <= 6 && ly >= 0 && ly <= 6 && (lx === 0 || lx === 6 || ly === 0 || ly === 6 || (lx >= 2 && lx <= 4 && ly >= 2 && ly <= 4))
        }
      }
      if (on) cells.push(`M${x} ${y}h1v1h-1z`)
    }
  }
  return (
    <svg width={size} height={size} viewBox={`0 0 ${n} ${n}`} shapeRendering="crispEdges" className="text-foreground" aria-hidden="true">
      <path d={cells.join("")} fill="currentColor" />
    </svg>
  )
}

function PoweredBy() {
  return (
    <div className="flex items-center justify-center gap-1.5 text-xs leading-4 text-muted-foreground">
      Powered by
      <Image src="/easner-logo.svg" alt="" width={74} height={16} />
    </div>
  )
}

function SheetHeader() {
  return (
    <div className="flex items-center gap-2.5">
      <div className="flex min-w-0 flex-1 items-center gap-2">
        <KoraMark size={30} radius={8} />
        <span className="truncate text-[15px] font-semibold leading-5">{kora.name}</span>
      </div>
      <span className="grid size-8 place-items-center rounded-full text-muted-foreground shadow-[inset_0_0_0_1px_var(--border)]">
        <X className="size-[18px]" strokeWidth={2} aria-hidden="true" />
      </span>
    </div>
  )
}

function SheetCard({ children }: { children: ReactNode }) {
  return (
    <div className="grid w-[440px] gap-3.5 rounded-[24px] bg-card px-6 pb-[18px] pt-[22px] shadow-lift">{children}</div>
  )
}

/** ConnectSheet, state 1: scan the code to connect (Easner-origin sheet over the platform's own page). */
function ConnectSheetConnect() {
  return (
    <SheetCard>
      <SheetHeader />
      <div>
        <div className="text-[22px] font-bold leading-7 tracking-[-0.01em]">Get paid with Easner</div>
        <div className="mt-1.5 text-sm leading-[21px] text-muted-foreground">
          {kora.name} pays you through Easner. Keep it in dollars, or move it on from your Easner account.
        </div>
      </div>
      <div className="flex items-center gap-2.5 rounded-[14px] bg-surface-tint px-3.5 py-2.5 text-sm font-medium leading-5">
        You have {money(kora.waiting)} waiting from {kora.name}
      </div>
      <div className="grid grid-cols-[auto_1fr] items-center gap-4">
        <span className="rounded-[16px] bg-card p-2.5 leading-[0] shadow-[inset_0_0_0_1px_var(--border)]">
          <QrBlock size={125} />
        </span>
        <div>
          <div className="text-[15px] font-semibold leading-[22px]">Scan with your phone camera</div>
          <div className="mt-1 text-[13px] leading-[19px] text-muted-foreground">
            No Easner app yet? Your phone opens the app store, and you’ll come back here after.
          </div>
          <span className="mt-2 inline-flex items-center gap-2 rounded-[10px] bg-muted px-2.5 py-1.5 text-[15px] font-semibold leading-5 tracking-[0.14em] tabular-nums">
            {kora.code[0]}
            <span className="text-muted-foreground">–</span>
            {kora.code[1]}
          </span>
        </div>
      </div>
      <PoweredBy />
    </SheetCard>
  )
}

/** ConnectSheet, the Withdrawn frame: the money is in the person's Easner account. */
function ConnectSheetWithdrawn() {
  return (
    <SheetCard>
      <SheetHeader />
      <div className="grid justify-items-center gap-2 py-1.5 text-center">
        <span className="grid size-16 place-items-center rounded-full bg-success-surface text-success-text">
          <Check className="size-8" strokeWidth={2.25} aria-hidden="true" />
        </span>
        <div className="text-xl font-bold leading-[26px]">{money(kora.waiting)} is in your Easner account</div>
        <div className="max-w-[340px] text-sm leading-[21px] text-muted-foreground">From {kora.name}.</div>
      </div>
      <span className="grid h-12 min-w-[200px] place-items-center justify-self-center rounded-[24px] bg-foreground px-8 text-[15px] font-semibold text-background shadow-soft">
        Done
      </span>
      <PoweredBy />
    </SheetCard>
  )
}

/** The platform's own withdraw page behind the sheet (draws the page, not Easner). */
function KoraWithdrawPage({ amount }: { amount: number }) {
  return (
    <div className="grid h-full content-start gap-3.5 bg-card px-7 py-6">
      <div className="flex items-center gap-3">
        <KoraMark size={32} radius={16} />
        <span className="text-base font-bold leading-5">{kora.name}</span>
      </div>
      <div className="h-3 w-3/5 rounded-md bg-muted" />
      <div className="h-3 w-1/3 rounded-md bg-muted" />
      <div>
        <div className="text-[13px] font-medium leading-[18px] text-muted-foreground">Available to withdraw</div>
        <div className="text-[30px] font-bold leading-9 tracking-[-0.02em] tabular-nums">{money(amount)}</div>
      </div>
      <span className="grid h-10 w-[170px] place-items-center rounded-[20px] bg-foreground text-sm font-semibold text-background">
        Withdraw funds
      </span>
      <div className="h-3 w-3/5 rounded-md bg-muted" />
    </div>
  )
}

/* ---------------------------------------------------------------- Easner app screens */

function ScreenHeader({ title, sub }: { title: string; sub?: string }) {
  return (
    <div className="flex shrink-0 items-center gap-3 px-5 py-4">
      <span className={cn(CHROME, "size-11 shadow-[inset_0_0_0_0.5px_var(--app-hairline),var(--app-shadow-xs)]")}>
        <ArrowLeft className="size-6" strokeWidth={2} aria-hidden="true" />
      </span>
      <span className="grid min-w-0">
        <span className="whitespace-nowrap text-2xl font-semibold leading-[30px]">{title}</span>
        {sub && <span className="mt-0.5 text-xs leading-[18px] text-app-text-secondary">{sub}</span>}
      </span>
    </div>
  )
}

/** AppEarningsConnect, frame 1: "Kora Music wants to pay you". */
function AppConnectScreen() {
  const shares = ["Your verified name", "Whether your tax form is on file", "The payments it sends you"]
  return (
    <AppScreen>
      <ScreenHeader title="Connect" />
      <div className="grid min-h-0 flex-1 content-start gap-2 px-5">
        <div className="grid justify-items-center gap-1.5 px-3 pb-2 pt-4 text-center">
          <KoraMark size={64} radius={18} />
          <div className="flex items-center gap-1.5 text-[22px] font-bold leading-7">
            {kora.name}
            <ShieldCheck className="size-5 text-app-success-text" strokeWidth={2} aria-hidden="true" />
          </div>
          <div className="inline-flex items-center gap-1.5 text-sm font-medium leading-5 text-app-text-secondary">
            <Lock className="size-3.5" strokeWidth={2} aria-hidden="true" />
            {kora.domain}
          </div>
          <div className="mt-1.5 text-[17px] font-semibold leading-6">{kora.name} wants to pay you</div>
        </div>
        <div className={cn(PLATE, "overflow-hidden rounded-[20px]")}>
          <div className="flex items-center gap-2 px-4 pb-1.5 pt-2.5 text-[15px] font-semibold leading-5">
            <Shield className="size-[18px] text-app-primary" strokeWidth={2} aria-hidden="true" />
            What {kora.name} will see
          </div>
          {shares.map((label, index) => (
            <div key={label} className="relative flex items-center gap-2.5 px-4 py-2 text-sm leading-5">
              {index > 0 && <span className="absolute inset-x-4 top-0 h-[0.5px] bg-app-hairline" />}
              <span className="grid size-[22px] shrink-0 place-items-center rounded-full bg-app-success-surface text-app-success-text">
                <Check className="size-3.5" strokeWidth={2.5} aria-hidden="true" />
              </span>
              {label}
            </div>
          ))}
          <div className="px-4 pb-3.5 pt-1 text-xs leading-[18px] text-app-text-secondary">
            Identity documents are never shared. You can disconnect at any time.
          </div>
        </div>
        <div className="flex items-start gap-2.5 rounded-[14px] bg-app-warning-surface px-3.5 py-3 text-[13px] leading-[19px] text-app-warning-text">
          <TriangleAlert className="mt-0.5 size-4 shrink-0" strokeWidth={2} aria-hidden="true" />
          <div>
            Only continue if you started this on <b className="font-semibold">{kora.domain}</b>.
          </div>
        </div>
      </div>
      <div className="grid shrink-0 gap-2 bg-app-canvas px-5 pb-[38px] pt-3 shadow-[inset_0_0.5px_0_var(--app-hairline)]">
        <span className="grid h-[52px] place-items-center rounded-full bg-app-primary text-[15px] font-semibold text-white">Connect</span>
        <span className="grid h-[52px] place-items-center rounded-full bg-app-plate text-[15px] font-semibold shadow-[inset_0_0_0_1px_var(--app-hairline)]">
          This wasn’t me
        </span>
      </div>
    </AppScreen>
  )
}

const COMPANIES: { name: string; mark: string; markClass: string; paid: number; last: string; lastAmount: number }[] = [
  { name: "Kora Music", mark: "K", markClass: "", paid: 1240, last: "Oct 30", lastAmount: 412.5 },
  { name: "Brightwork", mark: "B", markClass: "bg-app-success-surface text-app-success-text", paid: 3150, last: "Oct 22", lastAmount: 850 },
  { name: "Lumen Learn", mark: "L", markClass: "bg-app-warning-surface text-app-warning-text", paid: 520, last: "Sep 15", lastAmount: 260 },
]

function CompanyMark({ mark, className }: { mark: string; className: string }) {
  if (mark === "K") return <KoraMark size={40} radius={11} />
  return <span className={cn("grid size-10 shrink-0 place-items-center rounded-[11px] text-[15px] font-bold", className)}>{mark}</span>
}

/** AppEarnings, frame 1: Paid this year, who pays you, recent payments. */
function AppEarningsScreen() {
  const bars = [6, 6, 12, 24, 18, 30, 26, 38, 62, 100]
  const months = ["J", "F", "M", "A", "M", "J", "J", "A", "S", "O"]
  const recent = [
    { name: "Kora Music", mark: "K", cls: "", date: "Nov 5, 2026", amount: 412.5 },
    { name: "Brightwork", mark: "B", cls: "bg-app-success-surface text-app-success-text", date: "Oct 22, 2026", amount: 850 },
  ]
  return (
    <AppScreen>
      <ScreenHeader title="Earnings" sub="Money from apps and sites that pay you" />
      <div className="grid min-h-0 flex-1 content-start gap-3 overflow-hidden px-5 [mask-image:linear-gradient(#000_calc(100%-60px),transparent)]">
        <div className={cn(PLATE, "grid gap-2.5 rounded-[20px] p-4")}>
          <div className="flex items-center justify-between">
            <span className="text-[15px] font-semibold leading-5">Paid this year</span>
            <span className="text-xs leading-[18px] text-app-text-secondary">Jan – Oct 2026</span>
          </div>
          <div>
            <div className="text-[28px] font-bold leading-[34px] tracking-[-0.4px] tabular-nums">{money(4910)}</div>
            <div className="text-xs leading-[18px] text-app-text-secondary">14 payments from 3 companies</div>
          </div>
          <div className="mt-1 flex h-14 items-end gap-1.5">
            {bars.map((height, index) => (
              <i
                key={index}
                className={cn("min-h-1 flex-1 rounded-t-md rounded-b-[3px]", index >= 2 ? "bg-app-primary" : "bg-app-primary-tint")}
                style={{ height: `${height}%` }}
              />
            ))}
          </div>
          <div className="flex gap-1.5 text-[10px] font-medium leading-[14px] text-app-text-secondary">
            {months.map((month, index) => (
              <span key={index} className="flex-1 text-center">
                {month}
              </span>
            ))}
          </div>
        </div>
        <div className="flex items-center justify-between px-1 pt-1">
          <span className="text-[15px] font-semibold leading-5">Who pays you</span>
          <span className="grid h-[22px] min-w-[22px] place-items-center rounded-[11px] bg-app-primary-tint-subtle px-[7px] text-xs font-semibold text-app-primary-text">
            3
          </span>
        </div>
        <div className={cn(PLATE, "overflow-hidden rounded-[20px]")}>
          {COMPANIES.map((company, index) => (
            <div key={company.name} className="relative flex items-center gap-3 px-4 py-3">
              {index > 0 && <span className="absolute inset-x-4 top-0 h-[0.5px] bg-app-hairline" />}
              <CompanyMark mark={company.mark} className={company.markClass} />
              <div className="min-w-0 flex-1">
                <div className="text-[15px] font-semibold leading-5">{company.name}</div>
                <div className="text-xs leading-4 text-app-text-secondary">Last payment {company.last}</div>
              </div>
              <div className="text-right">
                <div className="text-[15px] font-semibold leading-5 tabular-nums">{money(company.paid)}</div>
                <div className="text-xs leading-4 text-app-text-secondary">this year</div>
              </div>
              <ChevronRight className="size-4 text-app-text-tertiary" strokeWidth={2} aria-hidden="true" />
            </div>
          ))}
        </div>
        <div className="px-1 pt-1 text-[15px] font-semibold leading-5">Recent payments</div>
        <div className={cn(PLATE, "overflow-hidden rounded-[20px]")}>
          {recent.map((payment, index) => (
            <div key={payment.date} className="relative flex items-center gap-3 px-4 py-3">
              {index > 0 && <span className="absolute inset-x-4 top-0 h-[0.5px] bg-app-hairline" />}
              <CompanyMark mark={payment.mark} className={payment.cls} />
              <div className="min-w-0 flex-1">
                <div className="text-[15px] font-semibold leading-5">{payment.name}</div>
                <div className="text-[13px] leading-[18px] text-app-text-secondary">{payment.date}</div>
              </div>
              <div className="grid justify-items-end gap-1">
                <span className="text-[15px] font-bold leading-5 tabular-nums">{money(payment.amount)}</span>
                <span className="inline-flex h-[22px] items-center rounded-[11px] bg-app-success-surface px-2 text-xs font-semibold text-app-success-text">
                  Completed
                </span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </AppScreen>
  )
}

/* ---------------------------------------------------------------- Easner Business (Console) */

function Tile({
  icon: Icon,
  tone,
  label,
  value,
  sub,
  children,
}: {
  icon: typeof Clock
  tone: string
  label: string
  value: string
  sub: string
  children: ReactNode
}) {
  return (
    <PCard padded={false} className="grid content-start gap-2 px-6 py-4">
      <div className="flex items-center gap-2.5 text-[13px] font-medium leading-[18px] text-muted-foreground">
        <span className={cn("grid size-7 place-items-center rounded-full", tone)}>
          <Icon className="size-3.5" strokeWidth={2} aria-hidden="true" />
        </span>
        {label}
      </div>
      <div className="text-[28px] font-semibold leading-[34px] tracking-[-0.015em] tabular-nums">{value}</div>
      {sub && <div className="-mt-1.5 text-[13px] leading-[18px] text-muted-foreground">{sub}</div>}
      {children}
    </PCard>
  )
}

function Line({ label, value, warn }: { label: string; value: string; warn?: boolean }) {
  return (
    <div className="flex items-center justify-between border-t border-border/60 py-1.5 text-[13px] leading-[18px]">
      <span className="text-muted-foreground">{label}</span>
      <span className={cn("font-medium tabular-nums", warn && "text-warning-text")}>{value}</span>
    </div>
  )
}

function TestDataChip() {
  return (
    <span className="inline-flex h-6 items-center gap-1.5 rounded-full bg-warning-surface px-2.5 text-xs font-medium text-warning-text">
      <span className="size-1.5 rounded-full bg-warning" aria-hidden="true" />
      Test data
    </span>
  )
}

/** BizConnectOverview: the four questions as a 2 × 2 grid (test figures). */
function ConnectOverview() {
  const funnel: [string, number, string][] = [
    ["Invited", 100, "48"],
    ["Opened", 85, "41"],
    ["Verified", 75, "36"],
    ["Connected", 65, "31"],
  ]
  return (
    <div className="grid gap-3">
      <div className="flex items-center justify-between">
        <span className="text-2xl font-semibold leading-8">Overview</span>
        <TestDataChip />
      </div>
      <div className="grid grid-cols-2 gap-4">
        <Tile icon={SendHorizontal} tone="bg-success-surface text-success-text" label="Went out · last 30 days" value={money(4862.4)} sub="128 payments to 31 payees">
          <div className="mt-0.5">
            <Line label="Completed" value="125" />
            <Line label="Failed" value="3" />
          </div>
        </Tile>
        <Tile icon={Clock} tone="bg-warning-surface text-warning-text" label="Waiting" value={money(612.8)} sub="Held for payees and on hold">
          <div className="mt-0.5">
            <Line label="Not connected yet" value="17 · $374.30" />
            <Line label="Waiting for a tax form" value="2 · $238.50" warn />
          </div>
        </Tile>
        <Tile icon={CircleAlert} tone="bg-destructive-surface text-destructive-text" label="Needs attention" value="5" sub="Open the item to act on it">
          <div className="mt-0.5">
            <Line label="Payments on hold" value="2" warn />
            <Line label="Missing tax forms" value="2" />
          </div>
        </Tile>
        <Tile icon={Link2} tone="bg-surface-tint text-primary-text" label="Connecting" value="31 of 48" sub="">
          <div className="grid gap-1.5">
            {funnel.map(([label, width, count]) => (
              <div key={label} className="grid grid-cols-[84px_minmax(0,1fr)_32px] items-center gap-3 text-[13px] leading-4">
                <span>{label}</span>
                <span className="h-2 overflow-hidden rounded bg-muted">
                  <i className="block h-full rounded bg-primary" style={{ width: `${width}%` }} />
                </span>
                <span className="text-right font-medium tabular-nums">{count}</span>
              </div>
            ))}
          </div>
        </Tile>
      </div>
    </div>
  )
}

type Connection = "connected" | "invited"
type TaxForm = "done" | "missing" | "expiring"

function ConnectionBadge({ value }: { value: Connection }) {
  return value === "connected" ? (
    <span className="inline-flex h-6 items-center rounded-full bg-success-surface px-2.5 text-xs font-medium text-success-text">Connected</span>
  ) : (
    <span className="inline-flex h-6 items-center rounded-full bg-muted px-2.5 text-xs font-medium text-muted-foreground">Invited</span>
  )
}

function TaxBadge({ value }: { value: TaxForm }) {
  const label = { done: "Done", missing: "Missing", expiring: "Expiring" }[value]
  return (
    <span
      className={cn(
        "inline-flex h-6 items-center rounded-full px-2.5 text-xs font-medium",
        value === "done" ? "bg-success-surface text-success-text" : "bg-warning-surface text-warning-text",
      )}
    >
      {label}
    </span>
  )
}

/** BizConnectPayees: filter pills and the payee table (no Balance column: this platform doesn't hold balances here). */
function PayeesTable() {
  const template = "1.7fr 1fr 0.8fr 0.9fr"
  const filters: [string, number, boolean?][] = [
    ["All", 48, true],
    ["Not connected", 17],
    ["Tax form missing", 2],
    ["Held", 2],
  ]
  const rows: { initials: string; name: string; ref: string; connection: Connection; tax: TaxForm; last: string }[] = [
    { initials: "AO", name: "Ada Obi", ref: "PAY-10482", connection: "connected", tax: "done", last: "Oct 31" },
    { initials: "TB", name: "Tunde Bakare", ref: "PAY-10517", connection: "connected", tax: "missing", last: "Oct 31" },
    { initials: "KM", name: "Kofi Mensah", ref: "PAY-10601", connection: "invited", tax: "missing", last: "—" },
    { initials: "AN", name: "Amara Nwosu", ref: "PAY-10533", connection: "connected", tax: "expiring", last: "Oct 31" },
    { initials: "SN", name: "Sipho Ndlovu", ref: "PAY-10810", connection: "connected", tax: "done", last: "Oct 24" },
  ]
  return (
    <div className="grid gap-4">
      <div className="flex items-center gap-2">
        {filters.map(([label, count, active]) => (
          <span
            key={label}
            className={cn(
              "inline-flex h-9 items-center gap-2 rounded-full px-3.5 text-[13px] font-medium",
              active ? "bg-surface-tint text-primary-text" : "border border-border/70 bg-card text-foreground",
            )}
          >
            {label}
            <span className={cn("tabular-nums", active ? "text-primary-text" : "text-muted-foreground")}>{count}</span>
          </span>
        ))}
        <span className="ml-auto">
          <TestDataChip />
        </span>
      </div>
      <PCard padded={false} className="overflow-hidden">
        <TableHead columns={["Payee", "Connection", "Tax form", "Last payment"]} template={template} />
        {rows.map((row, index) => (
          <div key={row.ref} className={cn(row.connection === "invited" && "opacity-60")}>
            <TableRow
              divider={index > 0}
              template={template}
              cells={[
                <span key="p" className="flex items-center gap-3">
                  <Avatar initials={row.initials} className="size-9 text-xs" />
                  <span className="min-w-0">
                    <span className="block truncate font-medium leading-5">{row.name}</span>
                    <span className="block text-xs leading-4 text-muted-foreground">{row.ref}</span>
                  </span>
                </span>,
                <ConnectionBadge key="c" value={row.connection} />,
                <TaxBadge key="t" value={row.tax} />,
                <span key="l" className="text-muted-foreground">
                  {row.last}
                </span>,
              ]}
            />
          </div>
        ))}
      </PCard>
    </div>
  )
}

/* ---------------------------------------------------------------- Slots */

function PageWithSheet({ children }: { children: ReactNode }) {
  return (
    <div className="relative h-full overflow-hidden">
      <KoraWithdrawPage amount={kora.waiting} />
      <div className="absolute inset-0 bg-app-scrim" />
      <div className="absolute left-1/2 top-9 -translate-x-1/2">{children}</div>
    </div>
  )
}

/** Hero: the platform's withdraw page with the Connect sheet over it, and the Easner app beside it. */
function heroRender() {
  return surface(
    <>
      {at(
        0,
        14,
        <div className="h-[572px] w-[610px] rounded-[20px] shadow-showcase">
          <BrowserFrame url={`${kora.domain}/withdraw`}>
            <PageWithSheet>
              <ConnectSheetConnect />
            </PageWithSheet>
          </BrowserFrame>
        </div>,
      )}
      {at(
        548,
        0,
        <div className="h-[600px] w-[312px]">
          <div style={{ width: 400, height: 800, transform: "scale(0.75)", transformOrigin: "top left" }}>
            <PhoneFrame>
              <AppConnectScreen />
            </PhoneFrame>
          </div>
        </div>,
        2,
      )}
    </>,
  )
}

export const CONNECT_SLOTS: Record<string, Canvas> = {
  "mkt-hero-connect-01": {
    width: 860,
    height: 600,
    render: heroRender,
    mobile: panel(440, 400, surface(<ConnectSheetConnect />), 20),
  },
  "mkt-ui-connect-app": phoneCard(<AppEarningsScreen />, 640),
  "mkt-ui-connect-console": panel(580, 456, surface(<ConnectOverview />)),
  "mkt-ui-connect-sheet": panel(
    500,
    430,
    <div className="h-full overflow-hidden rounded-[24px] shadow-soft">
      <div className="relative h-full">
        <KoraWithdrawPage amount={0} />
        <div className="absolute inset-0 bg-app-scrim" />
        <div className="absolute left-1/2 top-[36px] -translate-x-1/2 scale-[0.98]">
          <ConnectSheetWithdrawn />
        </div>
      </div>
    </div>,
  ),
  "mkt-ui-connect-payees": panel(600, 400, surface(<PayeesTable />)),
}
